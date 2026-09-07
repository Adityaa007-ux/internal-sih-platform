// Server-only human-verification helpers. The answer is never sent to the browser.

async function sign(payload: string): Promise<string> {
  const secret = process.env["HUMAN_CHECK_SECRET"] ?? process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "internal-sih";
  const bytes = new TextEncoder().encode(`${payload}:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function rand(max: number): number {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return (b[0] ?? 0) % max;
}

export async function issueChallenge(): Promise<{ question: string; token: string }> {
  const a = 3 + rand(12);
  const b = 2 + rand(9);
  const plus = rand(2) === 0;
  const answer = plus ? a + b : a * b;
  const expiresAt = Date.now() + 10 * 60_000;
  const token = `${expiresAt}.${await sign(`${answer}:${expiresAt}`)}`;
  return { question: plus ? `What is ${a} + ${b}?` : `What is ${a} × ${b}?`, token };
}

export async function verifyHumanAnswer(token: string, answer: string): Promise<boolean> {
  const [expRaw, sig] = token.split(".");
  const expiresAt = Number(expRaw);
  if (!expiresAt || !sig || Date.now() > expiresAt) return false;
  const value = Number(String(answer).trim());
  if (!Number.isFinite(value)) return false;
  return (await sign(`${value}:${expiresAt}`)) === sig;
}
