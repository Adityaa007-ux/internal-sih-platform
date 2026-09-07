import { createServerFn } from "@tanstack/react-start";

export interface HumanChallenge {
  question: string;
  token: string;
}

/** Issues a fresh, signed, time-limited human-verification challenge. */
export const newHumanChallenge = createServerFn({ method: "GET" }).handler(async (): Promise<HumanChallenge> => {
  const { issueChallenge } = await import("./human-check.server");
  return issueChallenge();
});
