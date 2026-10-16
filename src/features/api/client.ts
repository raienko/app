import {
  create,
  isAxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

import env from "@/constants/env";
import { createEventBus } from "@/features/event-bus";
import logger from "@/features/logger";

import { ApiError, toApiError } from "./errors";

/** Long enough for a slow mobile network, short enough that a hung request fails. */
const TIMEOUT = 15_000;

declare module "axios" {
  interface AxiosRequestConfig {
    /** Send without the `Authorization` header — sign-in, public endpoints. */
    skipAuth?: boolean;
    /** Keep this request out of the log — anything carrying a password. */
    skipLog?: boolean;
  }
  interface InternalAxiosRequestConfig {
    /** When the request left, for the duration in the log. */
    startedAt?: number;
    /** Whether it went to our own API, and so carried the session. */
    toOwnApi?: boolean;
  }
}

type Headers = Record<string, string>;
type MaybePromise<T> = T | Promise<T>;

/** Where the access token comes from. The auth feature sets this. */
let tokenProvider: () => MaybePromise<string | undefined> = () => undefined;
/** Extra headers, from anywhere that owns one (the locale, a feature flag). */
const headerProviders = new Set<() => Headers>();
/** Shapes what callers get back. Identity on `response.data` for now. */
let formatResponse: (response: AxiosResponse) => unknown = (response) =>
  response.data;
/** Which failures mean the session is no longer valid. */
let shouldForceLogout: (error: ApiError) => boolean = (error) =>
  error.status === 401;

type ApiEvents = {
  /** The server rejected the session; auth listens and signs the user out. */
  forceLogout: ApiError;
};

/**
 * Events the client raises for the rest of the app. Auth subscribes to
 * `forceLogout` instead of the client knowing anything about sign-out, so
 * this layer stays free of auth logic.
 */
export const apiEvents = createEventBus<ApiEvents>();

/**
 * The few things other features plug into the client. Each setter replaces
 * the previous one, except headers, which add up.
 */
export const configureApi = {
  /** Supplies the access token sent as `Authorization: Bearer …`. */
  setTokenProvider(provider: () => MaybePromise<string | undefined>) {
    tokenProvider = provider;
  },
  /** Adds headers to every request; returns a function that removes them again. */
  addHeaders(provider: () => Headers) {
    headerProviders.add(provider);
    return () => {
      headerProviders.delete(provider);
    };
  },
  /** Reshapes every successful response, e.g. unwrapping `{ data, meta }`. */
  setResponseFormatter(formatter: (response: AxiosResponse) => unknown) {
    formatResponse = formatter;
  },
  /** Decides which failures sign the user out. Defaults to any 401. */
  setForceLogoutRule(rule: (error: ApiError) => boolean) {
    shouldForceLogout = rule;
  },
};

/** What every request says about the app, whoever sends it. */
function baseHeaders(): Headers {
  return {
    Accept: "application/json",
    "X-App-Version": Constants.expoConfig?.version ?? "unknown",
    "X-Platform": Platform.OS,
  };
}

function describe(config: AxiosRequestConfig): string {
  return `${(config.method ?? "get").toUpperCase()} ${config.url ?? ""}`;
}

/** `https://host:port` of an absolute URL, lower-cased; `undefined` for a path. */
function originOf(url: string | undefined): string | undefined {
  // A regex rather than `new URL()`, whose React Native implementation
  // doesn't support every getter.
  return /^([a-z][a-z\d+.-]*:\/\/[^/?#]+)/i.exec(url ?? "")?.[1]?.toLowerCase();
}

/**
 * Whether a request goes to our own API. A path (`users/1`, `/users/1`) is
 * joined to `baseURL`, so it does; an absolute URL is used as it is, so it
 * only does when it names the same origin. Anything else is a third party,
 * which must never see the user's token.
 */
function isOwnApi(config: InternalAxiosRequestConfig): boolean {
  const target = originOf(config.url);
  return target === undefined || target === originOf(config.baseURL);
}

/** The axios instance itself, for the rare call the helpers below don't cover. */
// The app's own headers are instance defaults, so they replace axios's
// (its default `Accept` included) and a caller's `headers` still win.
export const http = create({
  baseURL: env.apiUrl,
  timeout: TIMEOUT,
  headers: baseHeaders(),
});

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const extra = [...headerProviders].reduce<Headers>(
    (all, provider) => ({ ...all, ...provider() }),
    {},
  );
  // Caller headers win over provided ones.
  for (const [name, value] of Object.entries(extra)) {
    if (!config.headers.has(name)) config.headers.set(name, value);
  }
  config.toOwnApi = isOwnApi(config);
  if (!config.skipAuth && config.toOwnApi) {
    const token = await tokenProvider();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }

  config.startedAt = Date.now();
  if (!config.skipLog) {
    logger.out(describe(config), {
      ...(config.params ? { params: config.params } : null),
      ...(config.data !== undefined ? { body: config.data } : null),
    });
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    const { config } = response;
    if (!config.skipLog) {
      const took = config.startedAt ? Date.now() - config.startedAt : 0;
      logger.in(
        `${response.status} ${describe(config)} (${took}ms)`,
        response.data,
      );
    }
    return response;
  },
  (error: unknown) => {
    const apiError = toApiError(error);
    const config = isAxiosError(error) ? error.config : undefined;

    if (!apiError.isCancelled && !config?.skipLog) {
      const took = config?.startedAt ? Date.now() - config.startedAt : 0;
      logger.failed(
        `${apiError.status ?? "—"} ${config ? describe(config) : "request"} (${took}ms): ${apiError.message}`,
        apiError.data,
      );
    }
    // Only a request that carried the session can have it rejected: not one
    // sent with `skipAuth`, and not a third party's 401 about its own auth.
    if (config?.toOwnApi && !config.skipAuth && shouldForceLogout(apiError)) {
      apiEvents.emit("forceLogout", apiError);
    }
    return Promise.reject(apiError);
  },
);

async function send<T>(config: AxiosRequestConfig): Promise<T> {
  return formatResponse(await http.request(config)) as T;
}

/**
 * The app's one way to talk to the backend. A path (`"users/1"`) goes to
 * the brand's `apiUrl`; an absolute URL (`"https://…"`) is used as it is,
 * and only gets the token if it's on that same origin. Resolves with the formatted
 * body; rejects with an `ApiError`. Takes an `AbortSignal` (TanStack Query
 * passes one) through `config.signal`.
 *
 * @example
 * const user = await api.get<User>("/me");
 * await api.post("/posts", { title }, { skipLog: true });
 * useQuery({ queryKey: ["me"], queryFn: ({ signal }) => api.get<User>("/me", { signal }) });
 */
export const api = {
  request: send,
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    send<T>({ ...config, method: "get", url }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    send<T>({ ...config, method: "delete", url }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    send<T>({ ...config, method: "post", url, data }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    send<T>({ ...config, method: "put", url, data }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    send<T>({ ...config, method: "patch", url, data }),
};
