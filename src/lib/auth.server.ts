// Server-only auth helpers for the JGI-SIH prototype.
// No secrets are ever returned to the client from here.

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_SECONDS = 30;

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(value.replace(/[\s-]/g, "").replace(/^(\+91|91|0)/, ""));
}

export function normalizeMobile(value: string): string {
  return value.replace(/[\s-]/g, "").replace(/^(\+91|91|0)/, "");
}

export function normalizePrn(value: string): string {
  return value.trim().toUpperCase();
}

/** True when no real email/SMS provider credentials are configured. */
export function isDemoDelivery(): boolean {
  return !(
    process.env["RESEND_API_KEY"] ||
    process.env["SENDGRID_API_KEY"] ||
    process.env["TWILIO_AUTH_TOKEN"] ||
    process.env["MSG91_AUTH_KEY"]
  );
}

export function generateOtp(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(100000 + ((bytes[0] ?? 0) % 900000));
}

export async function hashOtp(code: string, contact: string): Promise<string> {
  const pepper = process.env["OTP_PEPPER"] ?? process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "jgi-sih";
  const data = new TextEncoder().encode(`${contact}:${code}:${pepper}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Auth email used for the account. Mobile-only signups get a deterministic internal address. */
export function authEmailFor(channel: "email" | "mobile", contact: string, prn: string): string {
  return channel === "email" ? contact.trim().toLowerCase() : `prn-${prn.toLowerCase()}@mobile.jgi-sih.local`;
}
