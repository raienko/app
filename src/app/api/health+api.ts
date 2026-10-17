import Constants from "expo-constants";

/**
 * `GET /api/health` — the app's own server answering. Runs on the server
 * (the Expo dev server in development, the hosting runtime in production),
 * never in the app bundle, so it can read server-only env vars and secrets.
 *
 * @example
 * curl http://localhost:8081/api/health
 * // { "status": "ok", "version": "1.0.0", "time": "2026-10-17T…" }
 */
export function GET() {
  return Response.json({
    status: "ok",
    version: Constants.expoConfig?.version ?? "unknown",
    time: new Date().toISOString(),
  });
}
