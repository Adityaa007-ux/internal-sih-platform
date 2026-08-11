import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  question: z.string().trim().min(1).max(1200),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(12)
    .default([]),
});

const SYSTEM_PROMPT = `You are the JGI-SIH AI Assistant for the JSPM Group Internal Smart India Hackathon (Internal SIH 2026) portal.
You help students and administrators with: choosing problem statements, writing and improving proposals, understanding AI proposal scores and similarity risk, deadlines, mentors and faculty, submission guidelines, results, and how to use the portal.
Portal facts you may rely on:
- Stages: Registration → Problem Selection → Proposal Submission → AI Analysis → Faculty Review → Shortlist → Offline Presentation → Final Result.
- AI modules: Proposal Analyzer, Idea Similarity Checker, Problem Recommender, this Assistant.
- Teams have 4-6 members; membership locks after registration.
- Final selection is made by the faculty panel in the offline presentation round.
Answer in a concise, friendly, practical style. Use short paragraphs and **bold** for key terms. Never invent specific dates or results; point users to the Deadlines and Results pages instead.`;

export const chatAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }): Promise<{ answer: string | null }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { answer: null };

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...data.history,
            { role: "user", content: data.question },
          ],
        }),
      });
      if (!res.ok) return { answer: null };
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const answer = json.choices?.[0]?.message?.content?.trim();
      return { answer: answer && answer.length > 0 ? answer : null };
    } catch {
      return { answer: null };
    }
  });
