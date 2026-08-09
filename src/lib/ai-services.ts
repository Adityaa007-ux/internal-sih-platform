// ---------------------------------------------------------------------------
// JGI-SIH — AI service layer (DEMO implementation).
//
// Every AI capability in the portal goes through this module. The functions
// below are deliberately async and return the same shapes a real service would
// return, so each one can later be swapped for a call to the real AI backend
// (FastAPI + sentence-transformers + FAISS + Gemini) without touching any UI.
//
//   analyzeProposal()      -> POST /ai/proposal/analyze
//   detectSimilarity()     -> POST /ai/similarity/check
//   recommendProblems()    -> POST /ai/recommend/problems
//   askAssistant()         -> POST /ai/assistant/chat
// ---------------------------------------------------------------------------

import {
  AI_CRITERIA,
  PROBLEMS,
  type AiAnalysis,
  type Problem,
  type Proposal,
  type SimilarityMatch,
  type SimilarityResult,
  type SimilarityRisk,
  type Team,
} from "./demo-data";

export const AI_ENGINE = {
  analyzer: "jgi-proposal-analyzer v0.9 (demo)",
  similarity: "all-MiniLM-L6-v2 + FAISS (demo)",
  recommender: "jgi-skill-match v0.7 (demo)",
  assistant: "jgi-assistant (demo rules engine)",
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STOP = new Set(
  "a an and the for with that this from into their they them our your are was were will can could should would have has had not but all any use using based on of to in it is as by at be or we us more most such which when where each other than then there these those it's its our own same so too very".split(
    " ",
  ),
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((w) => {
    if (b.has(w)) inter += 1;
  });
  return inter / (a.size + b.size - inter);
}

function proposalText(p: Proposal): string {
  return [
    p.title,
    p.solution,
    p.innovation,
    p.technicalApproach,
    p.techStack,
    p.targetUsers,
    p.impact,
    p.scalability,
    p.implementation,
  ].join(" ");
}

// --------------------------- Proposal Analyzer -----------------------------

export interface AnalysisProgressStep {
  label: string;
  ms: number;
}

export const ANALYSIS_STEPS: AnalysisProgressStep[] = [
  { label: "Parsing proposal sections", ms: 700 },
  { label: "Extracting problem understanding signals", ms: 800 },
  { label: "Scoring innovation and feasibility", ms: 900 },
  { label: "Evaluating technical approach and stack", ms: 800 },
  { label: "Checking impact, scalability and clarity", ms: 800 },
  { label: "Generating strengths, gaps and recommendations", ms: 900 },
];

const SECTION_WEIGHTS: { key: keyof Proposal; label: string; criteria: string[] }[] = [
  { key: "solution", label: "Proposed solution", criteria: ["Problem Understanding", "Clarity"] },
  { key: "innovation", label: "Innovation", criteria: ["Innovation"] },
  { key: "technicalApproach", label: "Technical approach", criteria: ["Technical Strength", "Feasibility"] },
  { key: "techStack", label: "Technology stack", criteria: ["Technical Strength"] },
  { key: "targetUsers", label: "Target users", criteria: ["Impact"] },
  { key: "impact", label: "Expected impact", criteria: ["Impact"] },
  { key: "scalability", label: "Scalability", criteria: ["Scalability"] },
  { key: "implementation", label: "Implementation plan", criteria: ["Feasibility"] },
];

function sectionScore(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  const depth = Math.min(1, words / 65);
  const hasNumbers = /\d/.test(text) ? 0.12 : 0;
  const hasSpecifics = /(%|₹|week|api|model|dataset|latency|offline|users|reduce|accuracy)/i.test(text) ? 0.1 : 0;
  return Math.min(1, 0.45 + depth * 0.45 + hasNumbers + hasSpecifics);
}

export async function analyzeProposal(
  proposal: Proposal,
  problem: Problem | null,
  onStep?: (index: number, step: AnalysisProgressStep) => void,
): Promise<AiAnalysis> {
  for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
    onStep?.(i, ANALYSIS_STEPS[i]!);
    await wait(ANALYSIS_STEPS[i]!.ms);
  }

  const perCriterion: Record<string, number[]> = {};
  AI_CRITERIA.forEach((c) => (perCriterion[c] = []));

  for (const sec of SECTION_WEIGHTS) {
    const s = sectionScore(String(proposal[sec.key] ?? ""));
    sec.criteria.forEach((c) => perCriterion[c]!.push(s));
  }

  const full = proposalText(proposal);
  const tokens = tokenize(full);
  const richness = Math.min(1, new Set(tokens).size / 140);
  perCriterion["Clarity"]!.push(richness);
  perCriterion["Innovation"]!.push(/(novel|first|unlike|instead of|differentiat|unique|offline|on-device|hybrid)/i.test(full) ? 0.9 : 0.6);
  perCriterion["Impact"]!.push(/(\d+\s*%|₹|lakh|crore|farmers|citizens|patients|students)/i.test(full) ? 0.9 : 0.6);

  const breakdown = AI_CRITERIA.map((label) => {
    const arr = perCriterion[label] ?? [];
    const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0.5;
    return { label, score: Math.round(Math.max(35, Math.min(97, avg * 100))) };
  });

  const overall = Math.round(breakdown.reduce((a, b) => a + b.score, 0) / breakdown.length);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  const missing: string[] = [];

  for (const sec of SECTION_WEIGHTS) {
    const text = String(proposal[sec.key] ?? "").trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    if (words === 0) {
      missing.push(`${sec.label} — this section is empty`);
    } else if (words < 20) {
      weaknesses.push(`${sec.label} is too brief (${words} words) to be evaluated meaningfully.`);
      recommendations.push(`Expand "${sec.label}" with concrete details — what, how and why, not just the choice.`);
    } else if (words > 45) {
      strengths.push(`${sec.label} is developed in depth and gives reviewers something concrete to assess.`);
    }
  }

  if (!/\d/.test(proposal.impact)) {
    missing.push("Quantified impact metric (numbers, %, cost or beneficiary count)");
    recommendations.push("Add at least one measurable impact figure — faculty consistently rate quantified impact higher.");
  }
  if (!/(risk|mitigat|fallback|failure)/i.test(full)) {
    missing.push("Risk and mitigation discussion");
  }
  if (!/(week|day|month|phase|sprint)/i.test(proposal.implementation)) {
    missing.push("Time-phased implementation timeline");
  }
  if (problem && !tokenize(problem.title).some((t) => tokens.includes(t))) {
    weaknesses.push(
      `The proposal text does not visibly connect back to the selected problem statement (${problem.id}). Reviewers look for that alignment explicitly.`,
    );
    recommendations.push(`Restate the ${problem.id} requirement in your own words and show how each part is addressed.`);
  }
  if (proposal.techStack.split(/[,/]/).filter((s) => s.trim()).length >= 4) {
    strengths.push("Technology stack is specific and complete enough to judge feasibility.");
  } else {
    recommendations.push("List the full stack including database, deployment and AI components.");
  }

  if (!strengths.length) strengths.push("The proposal covers the required structure and can be improved section by section.");
  if (!weaknesses.length) weaknesses.push("No major structural weakness detected; refine depth and evidence further.");
  if (!recommendations.length) recommendations.push("Add a short demo plan describing exactly what you will show to the panel.");

  const verdict =
    overall >= 85
      ? "This is a strong submission that is competitive for shortlisting."
      : overall >= 70
        ? "This is a solid submission that will benefit from targeted strengthening before faculty review."
        : "This submission needs substantial strengthening before it will compete well in faculty review.";

  return {
    overall,
    breakdown,
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    recommendations: recommendations.slice(0, 5),
    missing: missing.slice(0, 6),
    summary: `${verdict} The analyzer scored problem understanding at ${breakdown[0]!.score}, innovation at ${breakdown[1]!.score} and feasibility at ${breakdown[2]!.score}. ${
      missing.length ? `The most valuable next step is closing ${missing.length} missing element(s) listed above.` : "All expected sections are present."
    } This is a decision-support score — the final selection is made by the faculty panel in the offline round.`,
    analyzedAt: new Date().toISOString(),
  };
}

// --------------------------- Similarity Detection --------------------------

export const SIMILARITY_STEPS: AnalysisProgressStep[] = [
  { label: "Embedding proposal text (sentence transformer)", ms: 900 },
  { label: "Searching submitted-idea vector index", ms: 900 },
  { label: "Computing pairwise cosine similarity", ms: 800 },
  { label: "Extracting matching concepts and keywords", ms: 800 },
  { label: "Classifying duplication risk", ms: 600 },
];

export function classifyRisk(score: number): SimilarityRisk {
  if (score >= 78) return "Potential Duplicate";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  return "Low";
}

export async function detectSimilarity(
  team: Team,
  cohort: Team[],
  onStep?: (index: number, step: AnalysisProgressStep) => void,
): Promise<SimilarityResult> {
  for (let i = 0; i < SIMILARITY_STEPS.length; i++) {
    onStep?.(i, SIMILARITY_STEPS[i]!);
    await wait(SIMILARITY_STEPS[i]!.ms);
  }

  if (!team.proposal) {
    return {
      score: 0,
      risk: "Low",
      matches: [],
      keywords: [],
      explanation: "No proposal text available to compare.",
      analyzedAt: new Date().toISOString(),
    };
  }

  const mine = new Set(tokenize(proposalText(team.proposal)));
  const matches: SimilarityMatch[] = [];

  for (const other of cohort) {
    if (other.id === team.id || !other.proposal) continue;
    const theirs = new Set(tokenize(proposalText(other.proposal)));
    const base = jaccard(mine, theirs) * 100;
    const sameProblem = other.problemId && other.problemId === team.problemId;
    const score = Math.round(Math.min(96, base * 2.1 + (sameProblem ? 26 : 0)));
    if (score < 15) continue;
    const shared: string[] = [];
    mine.forEach((w) => {
      if (theirs.has(w) && shared.length < 6) shared.push(w);
    });
    matches.push({
      teamName: other.name,
      problemId: other.problemId ?? "—",
      score,
      concepts: shared,
      reason: sameProblem
        ? `Both teams selected problem statement ${other.problemId} and their proposals share ${shared.length} key concepts including ${shared.slice(0, 3).join(", ")}. Overlap of the core user workflow is the main driver of this score.`
        : `Different problem statements, but the proposals reuse similar techniques (${shared.slice(0, 3).join(", ")}). Technique reuse is normal and is not treated as duplication.`,
    });
  }

  matches.sort((a, b) => b.score - a.score);
  const top = matches.slice(0, 4);
  const score = top.length ? top[0]!.score : 8;
  const risk = classifyRisk(score);

  const keywords = Array.from(mine).slice(0, 8);

  const explanation =
    risk === "Potential Duplicate"
      ? `The submitted idea is highly similar to "${top[0]!.teamName}". The overlapping elements are not just the domain but the actual solution workflow. Faculty attention is required: one of the teams should meaningfully differentiate its approach.`
      : risk === "High"
        ? `Substantial overlap detected with "${top[0]!.teamName}". The teams should be compared side by side during faculty review.`
        : risk === "Moderate"
          ? `Moderate overlap, mostly explained by shared problem domain${top[0] ? ` with "${top[0].teamName}"` : ""}. Strengthening your differentiator will improve your evaluation.`
          : "No significant duplication found across the current cohort of submitted ideas. Your concept reads as distinct.";

  return { score, risk, matches: top, keywords, explanation, analyzedAt: new Date().toISOString() };
}

// ------------------------- Problem Recommendation --------------------------

export interface Recommendation {
  problem: Problem;
  match: number;
  reason: string;
  matchedSkills: string[];
}

export interface RecommendInput {
  skills: string[];
  interests: string[];
  difficulty: string;
}

export const RECOMMEND_SKILLS = [
  "AI/ML",
  "Computer Vision",
  "NLP",
  "Full Stack",
  "React",
  "Python",
  "IoT",
  "Embedded",
  "Blockchain",
  "Data Science",
  "Mobile",
  "Security",
  "UI/UX",
  "Cloud/DevOps",
];

export const RECOMMEND_INTERESTS = [
  "Agriculture, FoodTech & Rural Development",
  "MedTech / BioTech / HealthTech",
  "Smart Education",
  "Clean & Green Technology",
  "Disaster Management",
  "Blockchain & Cybersecurity",
  "Smart Vehicles & Transportation",
  "Heritage & Culture",
];

export async function recommendProblems(input: RecommendInput): Promise<Recommendation[]> {
  await wait(1600);
  const skillSet = input.skills.map((s) => s.toLowerCase());

  const scored = PROBLEMS.map((problem) => {
    const tagText = problem.tags.join(" ").toLowerCase() + " " + problem.title.toLowerCase();
    const matchedSkills = input.skills.filter((s) => {
      const k = s.toLowerCase();
      if (tagText.includes(k)) return true;
      if (k === "full stack" && /react|dashboard|full stack|portal/.test(tagText)) return true;
      if (k === "cloud/devops" && /docker|deploy|dashboard/.test(tagText)) return true;
      if (k === "python" && /ai\/ml|data science|computer vision|nlp/.test(tagText)) return true;
      if (k === "ai/ml" && /ai\/ml|computer vision|nlp|recommendation|forecasting/.test(tagText)) return true;
      return false;
    });

    const skillScore = skillSet.length ? matchedSkills.length / Math.max(2, skillSet.length) : 0.3;
    const interestScore = input.interests.includes(problem.theme) ? 1 : 0.25;
    const diffScore = input.difficulty === "Any" || input.difficulty === problem.difficulty ? 1 : 0.55;

    const match = Math.round(Math.min(97, 40 + skillScore * 34 + interestScore * 18 + diffScore * 8));

    const bits: string[] = [];
    if (matchedSkills.length)
      bits.push(`your team already works with ${matchedSkills.slice(0, 3).join(", ")}`);
    if (input.interests.includes(problem.theme)) bits.push(`the theme matches your stated interest in ${problem.theme}`);
    if (input.difficulty !== "Any" && input.difficulty === problem.difficulty)
      bits.push(`the difficulty level is the ${problem.difficulty.toLowerCase()} band you selected`);
    if (!bits.length) bits.push("it is a broadly accessible statement that fits a mixed-skill team");

    return {
      problem,
      match,
      reason: `Recommended because ${bits.join(", and ")}.`,
      matchedSkills,
    };
  });

  return scored.sort((a, b) => b.match - a.match).slice(0, 6);
}

// ------------------------------ AI Assistant -------------------------------

export const ASSISTANT_SUGGESTIONS = [
  "How do I improve my proposal score?",
  "What does a High similarity risk mean?",
  "Explain the Internal SIH selection process",
  "Suggest an innovation angle for crop disease detection",
  "What should my technical approach section contain?",
  "When is the offline presentation?",
];

interface Rule {
  test: RegExp;
  answer: string;
}

const RULES: Rule[] = [
  {
    test: /(improve|increase|better).*(score|proposal)|proposal.*(improve|better)/i,
    answer:
      "The analyzer rewards four things consistently:\n\n1. **Quantified impact** — replace 'helps farmers' with 'reduces crop loss by ~20% for a two-acre holding'.\n2. **A named differentiator** — one sentence stating what your solution does that no other team's does.\n3. **A time-phased plan** — Week 1 / Week 2 / Week 3 / Week 4 with a deliverable each.\n4. **Risk and mitigation** — naming your biggest risk raises credibility rather than lowering it.\n\nRun the analyzer again after editing; the score updates live.",
  },
  {
    test: /(similarity|duplicate|plagiar|copied)/i,
    answer:
      "Similarity is computed by embedding your proposal and comparing it against every other submitted idea in the cohort.\n\n• **Low (<40%)** — distinct idea, nothing to do.\n• **Moderate (40-59%)** — usually shared problem domain; sharpen your differentiator.\n• **High (60-77%)** — faculty will compare you directly with the matching team.\n• **Potential Duplicate (78%+)** — the actual solution workflow overlaps, not just the domain. Change one meaningful dimension: the user, the channel, the technique or the deployment model.\n\nSimilarity never disqualifies a team automatically — it flags cases for faculty attention.",
  },
  {
    test: /(process|workflow|stage|selection|how does .*work|round)/i,
    answer:
      "The Internal SIH flow is:\n\n**Registration → Problem Selection → Proposal Submission → AI Analysis → Faculty Review → Shortlist → Offline Presentation → Final Result**\n\nThe portal handles everything up to the shortlist automatically. The **final selection is made by the faculty panel in an offline presentation round** — the AI scores are decision support for faculty, not the decision itself. After the presentation, faculty record the result and the admin publishes it on the Results page.",
  },
  {
    test: /(presentation|offline round|venue|slot|panel)/i,
    answer:
      "The offline faculty presentation for Internal SIH 2026 is on **18 August 2026 at Seminar Hall A, RSCOE**. Each shortlisted team gets 8 minutes plus 4 minutes of Q&A before a three-member panel. Your exact slot is on the Presentation page.\n\nBring: working demo, architecture slide, and one slide on impact numbers. Panels consistently probe feasibility and 'what did you actually build' — lead with the demo.",
  },
  {
    test: /(technical approach|architecture|tech stack|technology)/i,
    answer:
      "A strong technical approach section answers five questions:\n\n1. What is the **input** and where does it come from?\n2. What **model / algorithm / component** processes it, and why that one over alternatives?\n3. What is the **data flow** end to end?\n4. What are the **non-functional constraints** — latency, offline, cost, device?\n5. What is the **deployment** shape?\n\nName concrete technologies with versions or model names. 'We use AI' scores far lower than 'EfficientNet-B0, quantised to 6.8 MB, running via TFLite on-device'.",
  },
  {
    test: /(innovation|idea|unique|novel|angle)/i,
    answer:
      "To make an idea unique, change one of these dimensions rather than adding features:\n\n• **User** — serve the person everyone else ignores (the ANM, not the doctor).\n• **Channel** — reach users by IVR or SMS, not only an app.\n• **Constraint** — make it work offline, or under ₹6,000 of hardware.\n• **Technique** — on-device inference instead of cloud inference.\n• **Evidence** — a real pilot with 20 users beats a bigger feature list.\n\nFor crop disease detection specifically: offline on-device diagnosis with a vernacular voice output and a village-level outbreak heat map is a much stronger angle than another cloud classifier.",
  },
  {
    test: /(register|registration|team|member|lock)/i,
    answer:
      "Team registration takes 4 to 6 members, one of whom is the leader. Go to **Team Registration**, fill campus, department and contact details, add each member with PRN and skills, then submit.\n\nOn submission the portal generates your Team ID and Registration Number automatically. **Team membership is locked after registration** — this mirrors the real JSPM process and prevents last-minute reshuffling.",
  },
  {
    test: /(deadline|last date|when.*(submit|due))/i,
    answer:
      "Key dates for Internal SIH 2026:\n\n• Team registration closed — 22 July\n• Problem selection — 25 July\n• Proposal submission — 29 July\n• Faculty review window — closed 3 August\n• Shortlist published — 5 August\n• **Offline presentation — 18 August**\n• Final results — 20 August\n\nAll deadlines are visible on your dashboard.",
  },
  {
    test: /(problem statement|which problem|choose|recommend)/i,
    answer:
      "Use **Problem Explorer** to browse all statements with search, theme, category and difficulty filters. If you are unsure which to pick, open **AI Recommendations**, enter your team's skills and interests, and the recommender ranks statements by match percentage with a reason for each.\n\nPractical advice: pick a statement where your team already holds two of the three critical skills. Teams that pick on enthusiasm alone usually stall in week two.",
  },
  {
    test: /(navigat|where.*find|how.*use.*portal|sidebar)/i,
    answer:
      "Quick map of the portal:\n\n• **Dashboard** — your status and the selection pipeline\n• **Team Registration / My Team** — team details and lock status\n• **Problem Explorer** — browse and select a statement\n• **Proposal Submission** — draft and submit\n• **AI Proposal Analyzer** — quality score and feedback\n• **Similarity Detection** — duplicate-idea check\n• **AI Recommendations** — matched problem statements\n• **Faculty Review / Shortlist / Presentation / Results** — evaluation stages\n• **Analytics** — cohort-wide statistics\n\nUse the role switcher in the top bar to see the faculty, mentor and admin views.",
  },
  {
    test: /(score|scoring|marks|criteria|evaluat)/i,
    answer:
      "Two scores exist and they are kept separate on purpose:\n\n**AI Proposal Score (0-100)** — seven criteria: problem understanding, innovation, feasibility, technical strength, impact, scalability and clarity. This is decision support.\n\n**Faculty Score (0-60)** — six criteria scored 0-10 each by a reviewer: problem understanding, innovation, feasibility, technical approach, impact and presentation readiness.\n\nThe shortlist combines both plus your similarity risk. The final decision comes from the offline panel.",
  },
  {
    test: /(hello|hi|hey|namaste|good (morning|evening|afternoon))/i,
    answer:
      "Hello! I'm the JGI-SIH AI Assistant. I can help with problem statements, proposal writing, similarity concerns, scoring criteria, deadlines and how the selection process works. What would you like help with?",
  },
  {
    test: /(thank|thanks|great|awesome)/i,
    answer: "Happy to help. Ask me anything else about your proposal, the AI scores or the presentation round.",
  },
];

export async function askAssistant(question: string, onTyping?: () => void): Promise<string> {
  onTyping?.();
  await wait(700 + Math.min(1400, question.length * 18));

  const hit = RULES.find((r) => r.test.test(question));
  if (hit) return hit.answer;

  return `I don't have a specific stored answer for that yet, but here is how I'd approach it.\n\nFor "${question.trim().slice(0, 120)}", the most useful next steps in this portal are:\n\n1. Check **Problem Explorer** if the question relates to scope or requirements.\n2. Run the **AI Proposal Analyzer** — it usually surfaces exactly what a reviewer would ask.\n3. Run **Similarity Detection** to confirm your idea is distinct.\n4. Ask your assigned mentor through the review comments.\n\nYou can also try one of the suggested prompts below. (This assistant runs on demo logic; connecting the real AI service will let it answer open-ended questions directly.)`;
}
