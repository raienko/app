/**
 * The wire format both platforms speak, and the checks that decide whether
 * a message is ours and whether it came from somewhere we trust.
 *
 * Pure and separate from either implementation, because it is the security
 * boundary: everything arriving here was written by a page we do not
 * control, and the rules for rejecting it are worth testing on their own
 * rather than through a rendered `WebView`.
 */

/**
 * Stamped on every message so ours can be told apart from whatever else is
 * already using `postMessage` on the page — analytics, embeds, a framework's
 * own dev tooling. Anything without it is not for us and is dropped, rather
 * than being handed to a listener that would have to guess.
 */
export const BRIDGE_CHANNEL = "app-web-view/v1";

/**
 * The origin of a document with no origin of its own: `srcdoc` in a
 * browser, `about:blank` behind an `html` source on native. Both platforms
 * end up reporting this for a document the app wrote itself, which is what
 * lets one rule cover both — and it still won't match a real site, so an
 * `html` document that navigates to one stops being listened to.
 */
export const OPAQUE_ORIGIN = "null";

/** The name the page-side API is published under — `window.AppBridge`. */
export const BRIDGE_GLOBAL = "AppBridge";

/**
 * A ceiling on what we will parse, in characters of JSON.
 *
 * The page chooses this string, so without a limit it chooses how much
 * memory we spend parsing it. 64k is far more than an event payload needs
 * and far less than a page can use to hurt us; anything bigger belongs in a
 * fetch the app makes itself, not in a message.
 */
export const MAX_MESSAGE_LENGTH = 64 * 1024;

/** One event crossing the boundary, in either direction. */
export type BridgeMessage = {
  /** What happened — `"checkout.complete"`, `"height"`, `"ready"`. */
  type: string;
  /** Whatever came with it. JSON only: functions and cycles don't cross. */
  payload?: unknown;
};

type Envelope = BridgeMessage & { channel: string };

export function encodeMessage(message: BridgeMessage): string {
  const envelope: Envelope = {
    channel: BRIDGE_CHANNEL,
    type: message.type,
    ...(message.payload === undefined ? null : { payload: message.payload }),
  };
  return JSON.stringify(envelope);
}

/**
 * A message if this is one of ours, `null` for everything else.
 *
 * `null` rather than a throw: a page posting something we don't recognise
 * is the normal case, not an error — most pages that use `postMessage` at
 * all are talking to something else.
 *
 * Accepts a string (what native's `onMessage` delivers, always) or an
 * already-parsed object (what the web's `message` event can carry, since
 * the browser structured-clones it).
 */
export function decodeMessage(raw: unknown): BridgeMessage | null {
  const envelope = toEnvelope(raw);
  if (envelope === null) return null;

  if (envelope.channel !== BRIDGE_CHANNEL) return null;
  if (typeof envelope.type !== "string" || envelope.type === "") return null;

  return envelope.payload === undefined
    ? { type: envelope.type }
    : { type: envelope.type, payload: envelope.payload };
}

function toEnvelope(raw: unknown): Partial<Envelope> | null {
  if (typeof raw === "string") {
    if (raw.length > MAX_MESSAGE_LENGTH) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return isPlainObject(parsed) ? (parsed as Partial<Envelope>) : null;
    } catch {
      // Not JSON at all, which a page is perfectly entitled to post.
      return null;
    }
  }

  return isPlainObject(raw) ? (raw as Partial<Envelope>) : null;
}

function isPlainObject(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * The scheme-and-authority of a URL, lowercased — `"https://example.com"`
 * for anything under that site.
 *
 * Hand-parsed rather than through `URL`, the same choice
 * `features/deep-links/url.ts` makes and for the same reason: the runtimes
 * this ships to disagree about how complete their `URL` is, and the answer
 * needed here is the first two components and nothing else.
 */
export function originOf(url: string): string | null {
  const match = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)/i.exec(url.trim());
  if (match === null) return null;

  const [, scheme, authority] = match;
  if (authority === "") return null;

  // Credentials are not part of an origin, and leaving them in would make
  // `https://user@example.com` fail to match `https://example.com`.
  const host = authority.slice(authority.lastIndexOf("@") + 1);
  return `${scheme.toLowerCase()}://${host.toLowerCase()}`;
}

/**
 * Whether a message that arrived from `origin` should be listened to.
 *
 * Exact origins only — no wildcard hosts. `https://example.com` does not
 * cover `https://pay.example.com`, because a subdomain is frequently not
 * under the same control as its parent and "roughly the right site" is not
 * a security boundary. List the ones you mean.
 *
 * `"null"` is the origin a browser reports for a `srcdoc` document, which
 * is how the web implementation renders an `html` source. It matches only
 * when it is named explicitly, which the component does for exactly that
 * case — see ./index.web.tsx.
 */
export function isAllowedOrigin(
  origin: string,
  allowed: readonly string[],
): boolean {
  const candidate = origin.trim().toLowerCase();
  if (candidate === "") return false;

  return allowed.some((entry) => {
    const normalized = entry.trim().toLowerCase();
    return normalized === candidate || originOf(normalized) === candidate;
  });
}
