// Server-only helpers for the login-session registry.
// A session record is keyed by a salted hash of the Supabase session id, so the
// raw session identifier is never stored or returned to the browser.

export async function hashSessionId(sessionId: string): Promise<string> {
  const pepper = process.env["SESSION_PEPPER"] ?? process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "internal-sih";
  const data = new TextEncoder().encode(`session:${sessionId}:${pepper}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function deviceLabel(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  const os = ua.includes("android")
    ? "Android"
    : ua.includes("iphone") || ua.includes("ipad")
      ? "iOS"
      : ua.includes("mac os")
        ? "macOS"
        : ua.includes("windows")
          ? "Windows"
          : ua.includes("linux")
            ? "Linux"
            : "Unknown OS";
  const browser = ua.includes("edg/")
    ? "Edge"
    : ua.includes("chrome")
      ? "Chrome"
      : ua.includes("safari")
        ? "Safari"
        : ua.includes("firefox")
          ? "Firefox"
          : "Browser";
  const kind = ua.includes("mobile") ? "Mobile" : "Desktop";
  return `${browser} on ${os} · ${kind}`;
}
