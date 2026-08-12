// Server-only auth helpers for the JGI-SIH portal.
// No secrets are ever returned to the client from here.

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_SECONDS = 30;
/** How long a verified OTP ticket stays usable for password creation. */
export const SIGNUP_TICKET_MINUTES = 20;

export type PortalRole = "student" | "faculty" | "mentor" | "admin";

export function isEmail(value: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value.trim());
}

/** Exactly 10 digits, nothing else. */
export function isMobile(value: string): boolean {
  return /^\d{10}$/.test(value.trim());
}

export function normalizeMobile(value: string): string {
  return value.replace(/[\s-()]/g, "").replace(/^(\+91|91|0)/, "");
}

export function normalizePrn(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validatePassword(value: string): string | null {
  if (value.length < 8) return "Password must be at least 8 characters long.";
  if (!/[A-Za-z]/.test(value)) return "Password must contain at least one letter.";
  if (!/\d/.test(value)) return "Password must contain at least one number.";
  return null;
}

/** Demo delivery: no real email/SMS provider is configured, so the OTP is shown on screen. */
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

/** Roles that must be approved by Faculty/Admin before they can sign in. */
export function needsApproval(role: PortalRole): boolean {
  return role === "mentor" || role === "admin";
}

export function teamCode(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return `JGI-T${String(1000 + ((bytes[0] ?? 0) % 9000))}`;
}
