// ---------------------------------------------------------------------------
// JGI-SIH — Demo / sample dataset.
// All data here is clearly marked DEMO data and is used to make the prototype
// fully interactive without a backend. Replace with real API reads later.
// ---------------------------------------------------------------------------

export type Role = "student" | "faculty" | "mentor" | "admin";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: string;
  title: string;
  description: string;
  organization: string;
  category: string;
  theme: string;
  difficulty: Difficulty;
  tags: string[];
}

export interface TeamMember {
  name: string;
  prn: string;
  department: string;
  year: string;
  skills: string;
}

export type TeamStage =
  | "Registration"
  | "Problem Selection"
  | "Proposal Submission"
  | "AI Analysis"
  | "Faculty Review"
  | "Shortlist"
  | "Offline Presentation"
  | "Final Result";

export const STAGES: TeamStage[] = [
  "Registration",
  "Problem Selection",
  "Proposal Submission",
  "AI Analysis",
  "Faculty Review",
  "Shortlist",
  "Offline Presentation",
  "Final Result",
];

export type ProposalStatus =
  | "Not Started"
  | "Draft"
  | "Submitted"
  | "Under AI Analysis"
  | "Under Faculty Review"
  | "Shortlisted"
  | "Presentation"
  | "Selected"
  | "Not Selected";

export type SimilarityRisk = "Low" | "Moderate" | "High" | "Potential Duplicate";

export interface Proposal {
  title: string;
  solution: string;
  innovation: string;
  technicalApproach: string;
  techStack: string;
  targetUsers: string;
  impact: string;
  scalability: string;
  implementation: string;
}

export interface AiAnalysis {
  overall: number;
  breakdown: { label: string; score: number }[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  missing: string[];
  summary: string;
  analyzedAt: string;
}

export interface SimilarityMatch {
  teamName: string;
  problemId: string;
  score: number;
  concepts: string[];
  reason: string;
}

export interface SimilarityResult {
  score: number;
  risk: SimilarityRisk;
  matches: SimilarityMatch[];
  keywords: string[];
  explanation: string;
  analyzedAt: string;
}

export interface FacultyReview {
  scores: Record<string, number>;
  total: number;
  comments: string;
  reviewer: string;
  reviewedAt: string;
}

export type ShortlistStatus = "Under Review" | "Shortlisted" | "Not Shortlisted";

export interface Presentation {
  date: string;
  time: string;
  venue: string;
  panel: string;
  status: "Scheduled" | "Completed" | "Not Scheduled";
  remarks: string;
  finalResult?: "Selected" | "Not Selected";
  finalScore?: number;
}

export interface Team {
  id: string;
  regId: string;
  name: string;
  leader: string;
  email: string;
  phone: string;
  campus: string;
  department: string;
  members: TeamMember[];
  problemId: string | null;
  locked: boolean;
  stage: TeamStage;
  proposalStatus: ProposalStatus;
  proposal: Proposal | null;
  ai: AiAnalysis | null;
  similarity: SimilarityResult | null;
  review: FacultyReview | null;
  shortlist: ShortlistStatus;
  presentation: Presentation | null;
  mentor: string | null;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  type: "deadline" | "info" | "result" | "ai";
  audience: "All" | "Students" | "Faculty";
}

export const CAMPUSES = [
  "JSPM RSCOE, Tathawade",
  "JSPM JSCOE, Hadapsar",
  "JSPM ICOER, Wagholi",
  "JSPM BSIOTR, Wagholi",
];

export const DEPARTMENTS = [
  "Computer Engineering",
  "Information Technology",
  "AI & Data Science",
  "Electronics & Telecom",
  "Mechanical Engineering",
  "Civil Engineering",
];

export const FACULTY_CRITERIA = [
  "Problem Understanding",
  "Innovation",
  "Feasibility",
  "Technical Approach",
  "Impact",
  "Presentation Readiness",
];

export const AI_CRITERIA = [
  "Problem Understanding",
  "Innovation",
  "Feasibility",
  "Technical Strength",
  "Impact",
  "Scalability",
  "Clarity",
];

export const PROBLEMS: Problem[] = [
  {
    id: "SIH1601",
    title: "AI-based Crop Disease Detection for Small Farmers",
    description:
      "Develop a mobile-first solution that lets farmers photograph a crop leaf and instantly receive a disease diagnosis, severity estimate and locally available remedy suggestions in regional languages, working reliably in low-connectivity rural areas.",
    organization: "Ministry of Agriculture & Farmers Welfare",
    category: "Software",
    theme: "Agriculture, FoodTech & Rural Development",
    difficulty: "Medium",
    tags: ["AI/ML", "Computer Vision", "Mobile", "Offline-first"],
  },
  {
    id: "SIH1477",
    title: "Smart Waste Segregation and Municipal Tracking System",
    description:
      "Build an IoT + vision based system to classify waste at collection points, track municipal vehicle routes and generate ward-level analytics for cleanliness scoring under Swachh Bharat.",
    organization: "Ministry of Housing and Urban Affairs",
    category: "Hardware",
    theme: "Clean & Green Technology",
    difficulty: "Hard",
    tags: ["IoT", "Computer Vision", "Dashboard", "Embedded"],
  },
  {
    id: "SIH1288",
    title: "Unified Digital Health Record for Rural PHCs",
    description:
      "Design a lightweight, ABDM-compliant electronic health record for Primary Health Centres that works offline, syncs when connectivity returns, and supports Aadhaar-linked patient identity with strict consent management.",
    organization: "Ministry of Health and Family Welfare",
    category: "Software",
    theme: "MedTech / BioTech / HealthTech",
    difficulty: "Hard",
    tags: ["Healthcare", "Offline Sync", "Security", "Full Stack"],
  },
  {
    id: "SIH1355",
    title: "AI Career and Skill Guidance Platform for Students",
    description:
      "Create a recommendation engine that maps student skills, academic performance and interests to career paths, skill gaps and curated learning roadmaps, with counsellor dashboards for institutes.",
    organization: "Ministry of Education",
    category: "Software",
    theme: "Smart Education",
    difficulty: "Easy",
    tags: ["AI/ML", "Recommendation", "React", "Analytics"],
  },
  {
    id: "SIH1512",
    title: "Real-time Flood Early Warning using Sensor Fusion",
    description:
      "Combine river-level sensors, rainfall data and satellite imagery to predict flash floods at the taluka level, and disseminate multilingual alerts via SMS, IVR and app notifications.",
    organization: "National Disaster Management Authority",
    category: "Software",
    theme: "Disaster Management",
    difficulty: "Hard",
    tags: ["Data Science", "Geospatial", "Alerts", "Python"],
  },
  {
    id: "SIH1623",
    title: "Blockchain-backed Academic Credential Verification",
    description:
      "Enable universities to issue tamper-proof digital degrees and enable instant employer verification through a public verification portal with QR based validation.",
    organization: "AICTE",
    category: "Software",
    theme: "Blockchain & Cybersecurity",
    difficulty: "Medium",
    tags: ["Blockchain", "Web3", "Security", "Full Stack"],
  },
  {
    id: "SIH1709",
    title: "Assistive Navigation Device for the Visually Impaired",
    description:
      "Develop a wearable that uses depth sensing and on-device audio feedback to help visually impaired users navigate Indian footpaths, detect obstacles and read signboards.",
    organization: "Department of Empowerment of Persons with Disabilities",
    category: "Hardware",
    theme: "MedTech / BioTech / HealthTech",
    difficulty: "Hard",
    tags: ["Embedded", "Computer Vision", "Accessibility", "Edge AI"],
  },
  {
    id: "SIH1802",
    title: "Smart Traffic Signal Optimisation for Tier-2 Cities",
    description:
      "Use camera feeds and reinforcement learning to adapt signal timings dynamically at congested junctions, with a control-room dashboard and emergency-vehicle priority handling.",
    organization: "Ministry of Road Transport and Highways",
    category: "Software",
    theme: "Smart Vehicles & Transportation",
    difficulty: "Medium",
    tags: ["AI/ML", "Computer Vision", "Simulation", "Dashboard"],
  },
  {
    id: "SIH1866",
    title: "Digital Marketplace for Tribal Artisans",
    description:
      "Build a low-bandwidth marketplace with vernacular onboarding, AI product photography enhancement, logistics integration and fair-price analytics for tribal artisan cooperatives.",
    organization: "Ministry of Tribal Affairs",
    category: "Software",
    theme: "Heritage & Culture",
    difficulty: "Easy",
    tags: ["E-commerce", "React", "Payments", "Vernacular"],
  },
  {
    id: "SIH1934",
    title: "Cyber Fraud Detection for UPI Micro-transactions",
    description:
      "Detect anomalous UPI transaction patterns in real time using streaming analytics and graph based fraud-ring detection, with an investigator console for banks.",
    organization: "Ministry of Home Affairs",
    category: "Software",
    theme: "Blockchain & Cybersecurity",
    difficulty: "Hard",
    tags: ["Data Science", "Fraud Detection", "Streaming", "Graph"],
  },
  {
    id: "SIH1990",
    title: "Renewable Energy Monitoring for Campus Microgrids",
    description:
      "Monitor rooftop solar generation, storage and consumption across campus buildings, forecast generation and recommend load shifting to reduce grid dependency.",
    organization: "Ministry of New and Renewable Energy",
    category: "Software",
    theme: "Clean & Green Technology",
    difficulty: "Medium",
    tags: ["IoT", "Forecasting", "Dashboard", "Sustainability"],
  },
  {
    id: "SIH2044",
    title: "Vernacular Voice Assistant for Government Schemes",
    description:
      "Create a speech-first assistant that answers citizen queries about central and state welfare schemes in Marathi, Hindi and English, including eligibility checks and application guidance.",
    organization: "Ministry of Electronics and IT",
    category: "Software",
    theme: "Smart Education",
    difficulty: "Medium",
    tags: ["NLP", "Speech", "LLM", "Accessibility"],
  },
];

const ts = (d: string) => new Date(d).toISOString();

function mkAi(
  overall: number,
  scores: number[],
  strengths: string[],
  weaknesses: string[],
  recs: string[],
  missing: string[],
  summary: string,
): AiAnalysis {
  return {
    overall,
    breakdown: AI_CRITERIA.map((label, i) => ({ label, score: scores[i] ?? 0 })),
    strengths,
    weaknesses,
    recommendations: recs,
    missing,
    summary,
    analyzedAt: ts("2026-07-28T10:20:00"),
  };
}

export const DEMO_TEAMS: Team[] = [
  {
    id: "T-001",
    regId: "JGI-SIH-2026-0001",
    name: "Team Innovexa",
    leader: "Aarav Deshmukh",
    email: "aarav.deshmukh@jspm.edu.in",
    phone: "+91 98220 41155",
    campus: "JSPM RSCOE, Tathawade",
    department: "Computer Engineering",
    members: [
      {
        name: "Aarav Deshmukh",
        prn: "72201234A",
        department: "Computer Engineering",
        year: "TE",
        skills: "React, Node.js, PostgreSQL",
      },
      {
        name: "Sanya Kulkarni",
        prn: "72201235B",
        department: "AI & Data Science",
        year: "TE",
        skills: "Python, TensorFlow, NLP",
      },
      {
        name: "Rohit Pawar",
        prn: "72201236C",
        department: "Computer Engineering",
        year: "BE",
        skills: "FastAPI, Docker, AWS",
      },
      {
        name: "Isha Jadhav",
        prn: "72201237D",
        department: "Information Technology",
        year: "TE",
        skills: "UI/UX, Figma, Tailwind",
      },
      {
        name: "Kabir Shaikh",
        prn: "72201238E",
        department: "AI & Data Science",
        year: "SE",
        skills: "Computer Vision, PyTorch",
      },
      {
        name: "Meera Patil",
        prn: "72201239F",
        department: "Computer Engineering",
        year: "TE",
        skills: "Flutter, Firebase",
      },
    ],
    problemId: "SIH1601",
    locked: true,
    stage: "AI Analysis",
    proposalStatus: "Under AI Analysis",
    proposal: {
      title: "KrishiScan — Offline AI Crop Disease Diagnosis",
      solution:
        "A mobile-first Android application that lets a farmer photograph an affected leaf and receive an on-device disease diagnosis within two seconds, along with severity grading and locally available remedies priced in INR. The model runs fully offline via a quantised TFLite model, and syncs anonymised diagnoses to a central dashboard when connectivity is available.",
      innovation:
        "On-device quantised vision transformer tuned for Indian crop varieties, combined with a Marathi/Hindi voice output layer so that low-literacy farmers can use the app without reading. A crowd-sourced outbreak heat-map warns neighbouring villages of spreading infections.",
      technicalApproach:
        "EfficientNet-B0 backbone fine-tuned on PlantVillage plus a locally collected dataset of 14,000 images from Pune district. Quantisation aware training reduces model size to 6.8 MB. Flutter front end, FastAPI sync service, PostgreSQL + PostGIS for outbreak clustering.",
      techStack: "Flutter, TensorFlow Lite, FastAPI, PostgreSQL/PostGIS, Docker, Firebase Cloud Messaging",
      targetUsers: "Small and marginal farmers, Krishi Vigyan Kendra officers, agri-input retailers",
      impact:
        "Reduces crop loss from delayed diagnosis by an estimated 18-25% and cuts unnecessary pesticide expenditure for a typical two-acre holding.",
      scalability:
        "Model registry allows adding new crops without releasing a new app version. Sync service is stateless and horizontally scalable; outbreak clustering runs as a scheduled job.",
      implementation:
        "Week 1-2 dataset and model, Week 3 mobile app, Week 4 sync backend and dashboard, Week 5 field pilot with 30 farmers in Tathawade region.",
    },
    ai: mkAi(
      86,
      [90, 84, 88, 87, 89, 82, 84],
      [
        "Clear articulation of the offline-first constraint and a concrete technical answer to it (quantised 6.8 MB model).",
        "Strong dataset strategy — locally collected Pune-district images meaningfully differentiate this from generic PlantVillage solutions.",
        "Measurable impact claim tied to a specific farm size rather than vague social benefit.",
      ],
      [
        "Model accuracy figures for the locally collected dataset are not reported.",
        "Voice output layer is described but no language coverage or TTS approach is specified.",
        "No discussion of what happens when the model is uncertain — false diagnosis risk is unaddressed.",
      ],
      [
        "Add a confidence threshold with a 'consult KVK officer' fallback for low-confidence predictions.",
        "Report top-1 / top-5 accuracy and confusion between visually similar diseases.",
        "Include a cost-of-deployment estimate per 1,000 farmers to strengthen the scalability section.",
      ],
      ["Model accuracy metrics", "Risk & mitigation table", "Data privacy note for uploaded farm images"],
      "A technically credible and well-scoped agricultural AI proposal with a genuine differentiator in offline on-device inference. The main gap is evaluation rigour — the team should quantify model performance and address misdiagnosis risk before the presentation round.",
    ),
    similarity: {
      score: 34,
      risk: "Low",
      matches: [
        {
          teamName: "Team AgriMinds",
          problemId: "SIH1601",
          score: 34,
          concepts: ["leaf image classification", "farmer mobile app"],
          reason:
            "Both teams target the same problem statement and use image classification, but AgriMinds is cloud-inference based with no offline capability and focuses on advisory chat rather than diagnosis.",
        },
      ],
      keywords: ["crop disease", "leaf image", "TFLite", "farmer advisory"],
      explanation:
        "Concept overlap is limited to the shared problem domain. Architecture, differentiator and target workflow diverge substantially. No action required.",
      analyzedAt: ts("2026-07-28T10:31:00"),
    },
    review: {
      scores: {
        "Problem Understanding": 9,
        Innovation: 8,
        Feasibility: 9,
        "Technical Approach": 9,
        Impact: 8,
        "Presentation Readiness": 7,
      },
      total: 50,
      comments:
        "Strong team with clear division of work. Offline inference is the right call for the target user. Ask them to show live latency on a low-end device during the presentation.",
      reviewer: "Prof. S. R. Kulkarni",
      reviewedAt: ts("2026-08-01T11:00:00"),
    },
    shortlist: "Shortlisted",
    presentation: {
      date: "2026-08-18",
      time: "10:00 AM",
      venue: "Seminar Hall A, RSCOE",
      panel: "Prof. S. R. Kulkarni, Dr. A. M. Bhosale, Prof. N. Rane",
      status: "Scheduled",
      remarks: "",
    },
    mentor: "Prof. N. Rane",
    createdAt: ts("2026-07-14T09:00:00"),
  },
  {
    id: "T-002",
    regId: "JGI-SIH-2026-0002",
    name: "Team CodeSankalp",
    leader: "Priya Naik",
    email: "priya.naik@jspm.edu.in",
    phone: "+91 90280 33421",
    campus: "JSPM JSCOE, Hadapsar",
    department: "Information Technology",
    members: [
      {
        name: "Priya Naik",
        prn: "72301101A",
        department: "Information Technology",
        year: "BE",
        skills: "React, TypeScript, GraphQL",
      },
      {
        name: "Ved Chavan",
        prn: "72301102B",
        department: "Computer Engineering",
        year: "TE",
        skills: "Node.js, MongoDB",
      },
      {
        name: "Nikita Sawant",
        prn: "72301103C",
        department: "Information Technology",
        year: "TE",
        skills: "Solidity, Hardhat",
      },
      {
        name: "Om Kale",
        prn: "72301104D",
        department: "Electronics & Telecom",
        year: "SE",
        skills: "IoT, C++",
      },
      { name: "Tanvi Rane", prn: "72301105E", department: "Information Technology", year: "TE", skills: "UI/UX" },
    ],
    problemId: "SIH1623",
    locked: true,
    stage: "Faculty Review",
    proposalStatus: "Under Faculty Review",
    proposal: {
      title: "PramanChain — Verifiable Academic Credentials",
      solution:
        "A permissioned blockchain network where universities issue W3C Verifiable Credentials for degrees. Employers verify a degree instantly by scanning a QR code, with no dependence on university staff availability.",
      innovation:
        "Selective disclosure lets a graduate reveal only the fields an employer needs (degree and year) while hiding marks. Revocation registry handles disciplinary cases without rewriting history.",
      technicalApproach:
        "Hyperledger Fabric permissioned network, DID based identity, IPFS for credential artefacts, React verification portal, Node.js issuer service integrated with the existing ERP via REST.",
      techStack: "Hyperledger Fabric, Node.js, React, IPFS, PostgreSQL",
      targetUsers: "Universities, graduates, employers, background verification agencies",
      impact:
        "Cuts employer verification turnaround from 2-3 weeks to under a minute and eliminates forged degree circulation.",
      scalability:
        "New universities join as network members without schema changes. Verification portal is read-only and CDN cacheable.",
      implementation: "Week 1 network setup, Week 2 issuer service, Week 3 portal, Week 4 ERP integration and pilot.",
    },
    ai: mkAi(
      78,
      [82, 80, 72, 79, 80, 76, 77],
      [
        "Selective disclosure is a genuinely thoughtful privacy feature rather than a buzzword.",
        "Integration path through the existing ERP shows awareness of institutional realities.",
      ],
      [
        "Hyperledger Fabric is operationally heavy for a student team in a 13-day build window.",
        "No answer for how universities are onboarded as network members in practice.",
        "The problem could arguably be solved with signed PDFs — the blockchain necessity is not defended.",
      ],
      [
        "Justify why a distributed ledger is required over a simpler signed-credential registry.",
        "Consider a lighter stack (e.g. Polygon testnet or a signed VC registry) to de-risk the demo.",
        "Add a governance model describing who admits new member institutions.",
      ],
      ["Governance model", "Cost of running the network", "Fallback if a member node goes offline"],
      "A polished proposal on a well-understood problem. The main risk is over-engineering: the team must defend why a ledger is necessary and de-risk the operational complexity before the offline round.",
    ),
    similarity: {
      score: 61,
      risk: "Moderate",
      matches: [
        {
          teamName: "Team ChainVerify",
          problemId: "SIH1623",
          score: 61,
          concepts: ["QR verification", "degree issuance", "revocation registry"],
          reason:
            "Same problem statement and a very similar issuance-plus-QR-verification architecture. PramanChain adds selective disclosure, which ChainVerify does not have.",
        },
        {
          teamName: "Team TrustEd",
          problemId: "SIH1623",
          score: 44,
          concepts: ["credential verification portal"],
          reason: "Overlapping verification portal concept but a centralised database rather than a ledger.",
        },
      ],
      keywords: ["verifiable credential", "QR", "revocation", "degree"],
      explanation:
        "Moderate overlap driven by two teams choosing near-identical architectures for the same problem statement. Faculty should compare these two teams side by side during review.",
      analyzedAt: ts("2026-07-29T15:02:00"),
    },
    review: null,
    shortlist: "Under Review",
    presentation: null,
    mentor: "Dr. A. M. Bhosale",
    createdAt: ts("2026-07-15T10:30:00"),
  },
  {
    id: "T-003",
    regId: "JGI-SIH-2026-0003",
    name: "Team NeuralNexus",
    leader: "Siddharth Joshi",
    email: "siddharth.joshi@jspm.edu.in",
    phone: "+91 99700 12844",
    campus: "JSPM RSCOE, Tathawade",
    department: "AI & Data Science",
    members: [
      { name: "Siddharth Joshi", prn: "72401201A", department: "AI & Data Science", year: "BE", skills: "PyTorch, LLMs" },
      { name: "Anaya Gokhale", prn: "72401202B", department: "AI & Data Science", year: "TE", skills: "NLP, spaCy" },
      { name: "Harsh Mane", prn: "72401203C", department: "Computer Engineering", year: "TE", skills: "React, Next.js" },
      { name: "Riya Bhosale", prn: "72401204D", department: "Computer Engineering", year: "SE", skills: "Python, FastAPI" },
      { name: "Aditya Salunkhe", prn: "72401205E", department: "AI & Data Science", year: "TE", skills: "MLOps, Docker" },
      { name: "Neha Kadam", prn: "72401206F", department: "Information Technology", year: "TE", skills: "Testing, QA" },
    ],
    problemId: "SIH2044",
    locked: true,
    stage: "Shortlist",
    proposalStatus: "Shortlisted",
    proposal: {
      title: "YojanaMitra — Vernacular Voice Assistant for Welfare Schemes",
      solution:
        "A speech-first assistant reachable by app and by toll-free IVR that answers citizen questions about central and Maharashtra state welfare schemes in Marathi, Hindi and English, checks eligibility through a guided dialogue and generates a pre-filled application checklist.",
      innovation:
        "Retrieval grounded on the official scheme corpus so answers cite the exact clause, preventing hallucinated eligibility advice. Works over a plain feature-phone call, which covers the users who need it most.",
      technicalApproach:
        "Whisper-small fine-tuned for Marathi ASR, an embedding index over 480 scheme documents using multilingual sentence transformers, an LLM answer layer constrained to retrieved passages, and Asterisk for IVR.",
      techStack: "Python, FastAPI, Whisper, sentence-transformers, FAISS, Asterisk, React",
      targetUsers: "Rural citizens, Gram Panchayat operators, CSC centre staff",
      impact:
        "Removes the middleman-agent dependency that currently costs applicants ₹200-500 per scheme application.",
      scalability:
        "Adding a new state means indexing new documents, not retraining. IVR capacity scales by adding Asterisk nodes behind a SIP load balancer.",
      implementation:
        "Week 1 corpus and index, Week 2 ASR tuning, Week 3 answer layer with citations, Week 4 IVR and pilot at one Gram Panchayat.",
    },
    ai: mkAi(
      91,
      [93, 92, 88, 92, 94, 89, 90],
      [
        "Grounded retrieval with clause citation directly addresses the biggest risk in scheme advisory — wrong eligibility information.",
        "IVR channel is a standout inclusion; it reaches users a smartphone app cannot.",
        "Quantified the real-world cost the solution removes (agent fees), which is far stronger than generic impact claims.",
      ],
      [
        "Marathi ASR accuracy on noisy rural phone audio will be materially worse than benchmark numbers suggest.",
        "Scheme corpus freshness has no stated update mechanism.",
      ],
      [
        "Add a corpus refresh pipeline with a last-updated stamp shown to the user.",
        "Report word error rate on telephone-quality audio, not just clean audio.",
        "Add an escalation path to a human CSC operator for unresolved queries.",
      ],
      ["ASR evaluation on telephony audio", "Corpus update cadence"],
      "One of the strongest proposals in this cohort. The combination of grounded retrieval, vernacular ASR and an IVR channel demonstrates unusual maturity in thinking about the actual user. Recommended for shortlisting.",
    ),
    similarity: {
      score: 22,
      risk: "Low",
      matches: [
        {
          teamName: "Team VaaniAI",
          problemId: "SIH1355",
          score: 22,
          concepts: ["speech interface"],
          reason: "Shares only the speech-interface concept; different problem statement and domain.",
        },
      ],
      keywords: ["vernacular", "IVR", "retrieval", "welfare scheme"],
      explanation: "Distinct concept with minimal overlap across the cohort.",
      analyzedAt: ts("2026-07-29T09:12:00"),
    },
    review: {
      scores: {
        "Problem Understanding": 10,
        Innovation: 9,
        Feasibility: 8,
        "Technical Approach": 10,
        Impact: 10,
        "Presentation Readiness": 9,
      },
      total: 56,
      comments:
        "Excellent grasp of the problem and the user. IVR demo must work live — arrange a phone line for the offline round.",
      reviewer: "Dr. A. M. Bhosale",
      reviewedAt: ts("2026-08-01T12:40:00"),
    },
    shortlist: "Shortlisted",
    presentation: {
      date: "2026-08-18",
      time: "11:00 AM",
      venue: "Seminar Hall A, RSCOE",
      panel: "Prof. S. R. Kulkarni, Dr. A. M. Bhosale, Prof. N. Rane",
      status: "Scheduled",
      remarks: "",
    },
    mentor: "Prof. N. Rane",
    createdAt: ts("2026-07-15T14:10:00"),
  },
  {
    id: "T-004",
    regId: "JGI-SIH-2026-0004",
    name: "Team AgriMinds",
    leader: "Rutuja Shinde",
    email: "rutuja.shinde@jspm.edu.in",
    phone: "+91 96570 88210",
    campus: "JSPM ICOER, Wagholi",
    department: "Computer Engineering",
    members: [
      { name: "Rutuja Shinde", prn: "72501301A", department: "Computer Engineering", year: "TE", skills: "Python, Django" },
      { name: "Yash Gaikwad", prn: "72501302B", department: "Computer Engineering", year: "TE", skills: "React Native" },
      { name: "Sneha More", prn: "72501303C", department: "AI & Data Science", year: "SE", skills: "Keras, OpenCV" },
      { name: "Atharva Nikam", prn: "72501304D", department: "Mechanical Engineering", year: "TE", skills: "CAD, IoT" },
    ],
    problemId: "SIH1601",
    locked: true,
    stage: "Faculty Review",
    proposalStatus: "Under Faculty Review",
    proposal: {
      title: "FasalSathi — Cloud Crop Advisory",
      solution:
        "A React Native app where farmers upload a crop photo, the server classifies the disease and a chat advisor answers follow-up questions about treatment and dosage.",
      innovation: "Chat-based advisory follow-up after the diagnosis, plus weather-linked spraying reminders.",
      technicalApproach: "ResNet-50 served through a Django REST API, chat advisory over an LLM, PostgreSQL storage.",
      techStack: "React Native, Django, PyTorch, PostgreSQL",
      targetUsers: "Farmers with smartphones",
      impact: "Faster access to treatment advice.",
      scalability: "Server can be scaled vertically.",
      implementation: "Model, then app, then advisory chat.",
    },
    ai: mkAi(
      64,
      [70, 58, 68, 62, 64, 55, 68],
      [
        "Chat follow-up after diagnosis is a sensible addition to a plain classifier.",
        "Weather-linked spraying reminders show some thought about the farming calendar.",
      ],
      [
        "Requires constant connectivity, which conflicts with the stated rural context of the problem statement.",
        "ResNet-50 served from a single server is not a scalability story.",
        "Impact and scalability sections are one line each and carry no evidence.",
      ],
      [
        "Address the low-connectivity requirement explicitly — it is central to the problem statement.",
        "Expand impact with a quantified estimate rather than a general statement.",
        "Describe how the advisory LLM is prevented from giving unsafe pesticide dosage advice.",
      ],
      ["Offline strategy", "Model accuracy", "Safety guardrails for dosage advice", "Cost analysis"],
      "A workable but under-developed proposal. The core gap is that it does not answer the low-connectivity constraint that defines the problem statement, and several sections are too thin to evaluate.",
    ),
    similarity: {
      score: 58,
      risk: "Moderate",
      matches: [
        {
          teamName: "Team Innovexa",
          problemId: "SIH1601",
          score: 58,
          concepts: ["leaf photo diagnosis", "treatment advisory", "farmer app"],
          reason:
            "Same problem statement, same core interaction (photograph a leaf, get a diagnosis). Innovexa differentiates through offline on-device inference; FasalSathi is cloud-only.",
        },
      ],
      keywords: ["crop disease", "diagnosis", "advisory", "farmer app"],
      explanation:
        "Moderate similarity within the same problem statement. Not a duplicate, but faculty should compare the two teams directly since the user-facing product is close.",
      analyzedAt: ts("2026-07-30T08:45:00"),
    },
    review: null,
    shortlist: "Under Review",
    presentation: null,
    mentor: "Prof. V. Deshpande",
    createdAt: ts("2026-07-16T11:05:00"),
  },
  {
    id: "T-005",
    regId: "JGI-SIH-2026-0005",
    name: "Team ChainVerify",
    leader: "Manish Bhandari",
    email: "manish.bhandari@jspm.edu.in",
    phone: "+91 88880 45512",
    campus: "JSPM BSIOTR, Wagholi",
    department: "Information Technology",
    members: [
      { name: "Manish Bhandari", prn: "72601401A", department: "Information Technology", year: "BE", skills: "Solidity, Node" },
      { name: "Pooja Thorat", prn: "72601402B", department: "Information Technology", year: "TE", skills: "React" },
      { name: "Sahil Attar", prn: "72601403C", department: "Computer Engineering", year: "TE", skills: "Web3.js" },
      { name: "Gauri Lokhande", prn: "72601404D", department: "Computer Engineering", year: "SE", skills: "MongoDB" },
    ],
    problemId: "SIH1623",
    locked: true,
    stage: "Faculty Review",
    proposalStatus: "Under Faculty Review",
    proposal: {
      title: "DegreeChain — Blockchain Degree Verification",
      solution:
        "Universities upload degree records; the system anchors a hash on chain and generates a QR code printed on the degree. Employers scan the QR on a public portal to verify authenticity.",
      innovation: "QR based instant verification with an on-chain revocation list.",
      technicalApproach: "Ethereum testnet smart contract for hash anchoring, Node.js issuer API, React verification portal.",
      techStack: "Solidity, Ethereum, Node.js, React, MongoDB",
      targetUsers: "Universities, employers, students",
      impact: "Prevents degree forgery and speeds up verification.",
      scalability: "Batch anchoring reduces gas cost as volume grows.",
      implementation: "Contract, issuer API, portal, pilot.",
    },
    ai: mkAi(
      71,
      [74, 66, 76, 72, 70, 68, 73],
      [
        "Batch anchoring is a practical cost-control decision.",
        "Scope is realistic for the available build window.",
      ],
      [
        "Very close in concept to another team working the same problem statement.",
        "No privacy handling — hashing alone does not address selective disclosure of marks.",
      ],
      [
        "Differentiate clearly from the other credential team, or consider merging strengths.",
        "Add a privacy section covering what an employer can and cannot see.",
      ],
      ["Privacy model", "Differentiation statement", "Gas cost estimate at scale"],
      "Competent and buildable, but currently the weaker of two near-identical credential-verification proposals. Differentiation is the deciding factor.",
    ),
    similarity: {
      score: 82,
      risk: "Potential Duplicate",
      matches: [
        {
          teamName: "Team CodeSankalp",
          problemId: "SIH1623",
          score: 82,
          concepts: [
            "hash anchoring of degrees",
            "QR verification portal",
            "on-chain revocation registry",
            "employer verification flow",
          ],
          reason:
            "Both proposals describe the same end-to-end flow: university issues, hash/credential is anchored, QR is printed, employer scans a public portal to verify, revocation handled on chain. Wording of the verification workflow is near-identical and no differentiating feature separates them apart from CodeSankalp's selective disclosure.",
        },
        {
          teamName: "Team TrustEd",
          problemId: "SIH1623",
          score: 47,
          concepts: ["verification portal", "degree records"],
          reason: "Similar portal concept without the ledger component.",
        },
      ],
      keywords: ["degree", "QR verification", "hash anchoring", "revocation", "employer"],
      explanation:
        "High conceptual overlap with Team CodeSankalp on the same problem statement. Faculty attention required — either one team should differentiate its approach or the panel should treat these as competing submissions of one idea.",
      analyzedAt: ts("2026-07-30T09:30:00"),
    },
    review: null,
    shortlist: "Under Review",
    presentation: null,
    mentor: "Prof. V. Deshpande",
    createdAt: ts("2026-07-16T16:25:00"),
  },
  {
    id: "T-006",
    regId: "JGI-SIH-2026-0006",
    name: "Team UrbanFlow",
    leader: "Ananya Kulkarni",
    email: "ananya.kulkarni@jspm.edu.in",
    phone: "+91 97640 22190",
    campus: "JSPM JSCOE, Hadapsar",
    department: "Electronics & Telecom",
    members: [
      { name: "Ananya Kulkarni", prn: "72701501A", department: "Electronics & Telecom", year: "BE", skills: "Embedded C, RL" },
      { name: "Devansh Rao", prn: "72701502B", department: "Computer Engineering", year: "TE", skills: "Python, OpenCV" },
      { name: "Sarthak Pathak", prn: "72701503C", department: "Electronics & Telecom", year: "TE", skills: "PCB, IoT" },
      { name: "Ira Menon", prn: "72701504D", department: "Information Technology", year: "TE", skills: "React, D3" },
      { name: "Kunal Wagh", prn: "72701505E", department: "Computer Engineering", year: "SE", skills: "SUMO simulation" },
    ],
    problemId: "SIH1802",
    locked: true,
    stage: "Shortlist",
    proposalStatus: "Shortlisted",
    proposal: {
      title: "SignalSense — Adaptive Traffic Control for Tier-2 Cities",
      solution:
        "Camera-based vehicle density estimation at each approach of a junction feeds a reinforcement-learning controller that adjusts green times in real time, with a control-room dashboard and automatic green corridor for emergency vehicles.",
      innovation:
        "Trained entirely in a SUMO digital twin of a real Pune junction before hardware deployment, so the policy is validated safely. Emergency preemption is triggered by ambulance siren audio detection, not a costly transponder.",
      technicalApproach:
        "YOLOv8n on a Jetson Nano at the junction, PPO policy trained in SUMO, MQTT to the controller, React + D3 control-room dashboard.",
      techStack: "Python, YOLOv8, SUMO, PyTorch, Jetson Nano, MQTT, React",
      targetUsers: "Municipal traffic departments, commuters, emergency services",
      impact:
        "Simulation shows 21% reduction in average junction wait time at peak hours on the modelled Wakad junction.",
      scalability:
        "Each junction is an independent edge node; a city-level coordinator can later optimise corridors of junctions.",
      implementation:
        "Week 1 digital twin, Week 2 detection model, Week 3 RL policy, Week 4 hardware-in-loop demo and dashboard.",
    },
    ai: mkAi(
      88,
      [89, 90, 84, 91, 88, 85, 87],
      [
        "Digital-twin-first methodology is the correct and safe way to approach traffic RL, and it is clearly explained.",
        "Siren-audio emergency preemption is a genuinely clever low-cost substitute for transponders.",
        "The 21% figure is tied to a specific modelled junction rather than being a generic claim.",
      ],
      [
        "Sim-to-real transfer risk is acknowledged only implicitly.",
        "Night-time and monsoon camera performance is not discussed.",
      ],
      [
        "Add a sim-to-real gap mitigation plan such as domain randomisation.",
        "Report detection performance under low light and rain.",
        "State the failure mode: what the signal does if the edge node crashes.",
      ],
      ["Sim-to-real plan", "Adverse weather performance", "Safe fallback behaviour"],
      "A rigorous and well-engineered proposal with an unusually mature methodology for a student team. Strongly suited to the offline presentation round provided the hardware-in-loop demo is ready.",
    ),
    similarity: {
      score: 27,
      risk: "Low",
      matches: [
        {
          teamName: "Team NeuralNexus",
          problemId: "SIH2044",
          score: 27,
          concepts: ["edge inference"],
          reason: "Only a shared edge-inference technique; entirely different problem and domain.",
        },
      ],
      keywords: ["traffic signal", "reinforcement learning", "SUMO", "emergency preemption"],
      explanation: "Unique concept within this cohort.",
      analyzedAt: ts("2026-07-30T10:10:00"),
    },
    review: {
      scores: {
        "Problem Understanding": 9,
        Innovation: 10,
        Feasibility: 8,
        "Technical Approach": 10,
        Impact: 9,
        "Presentation Readiness": 8,
      },
      total: 54,
      comments: "Very strong engineering. Bring the Jetson setup to the presentation for a live hardware demo.",
      reviewer: "Prof. S. R. Kulkarni",
      reviewedAt: ts("2026-08-02T10:15:00"),
    },
    shortlist: "Shortlisted",
    presentation: {
      date: "2026-08-18",
      time: "12:00 PM",
      venue: "Seminar Hall A, RSCOE",
      panel: "Prof. S. R. Kulkarni, Dr. A. M. Bhosale, Prof. N. Rane",
      status: "Scheduled",
      remarks: "",
    },
    mentor: "Prof. N. Rane",
    createdAt: ts("2026-07-17T09:45:00"),
  },
  {
    id: "T-007",
    regId: "JGI-SIH-2026-0007",
    name: "Team MediSync",
    leader: "Vaishnavi Patil",
    email: "vaishnavi.patil@jspm.edu.in",
    phone: "+91 93710 55420",
    campus: "JSPM RSCOE, Tathawade",
    department: "Computer Engineering",
    members: [
      { name: "Vaishnavi Patil", prn: "72801601A", department: "Computer Engineering", year: "BE", skills: "Java, Spring" },
      { name: "Arjun Mhatre", prn: "72801602B", department: "Computer Engineering", year: "TE", skills: "React, PWA" },
      { name: "Shreya Dixit", prn: "72801603C", department: "Information Technology", year: "TE", skills: "SQLite, sync" },
      { name: "Parth Kulthe", prn: "72801604D", department: "AI & Data Science", year: "SE", skills: "Python" },
      { name: "Aniket Jagtap", prn: "72801605E", department: "Computer Engineering", year: "TE", skills: "Security, OAuth" },
    ],
    problemId: "SIH1288",
    locked: true,
    stage: "Faculty Review",
    proposalStatus: "Under Faculty Review",
    proposal: {
      title: "ArogyaSync — Offline-first PHC Health Records",
      solution:
        "A progressive web app for PHC staff that records patient visits offline in an encrypted local store and performs conflict-aware synchronisation with an ABDM-compliant server when connectivity returns.",
      innovation:
        "CRDT-based conflict resolution so two PHC terminals editing the same patient record never lose data, plus consent artefacts recorded per data-sharing event.",
      technicalApproach:
        "React PWA with encrypted IndexedDB, Automerge CRDT sync layer, Spring Boot FHIR-compatible backend, Aadhaar-based ABHA linkage.",
      techStack: "React, IndexedDB, Automerge, Spring Boot, PostgreSQL, FHIR",
      targetUsers: "PHC medical officers, ANMs, district health administrators",
      impact: "Eliminates the paper register duplication that currently delays district health reporting by weeks.",
      scalability: "Stateless sync service; district-level sharding of the record store.",
      implementation: "Week 1 offline store, Week 2 sync, Week 3 FHIR mapping, Week 4 consent and pilot.",
    },
    ai: mkAi(
      83,
      [88, 80, 78, 86, 85, 80, 84],
      [
        "CRDT choice is well matched to the intermittent-connectivity reality of PHCs.",
        "Consent artefacts per sharing event show real ABDM awareness rather than a compliance name-drop.",
      ],
      [
        "Encryption key management on shared PHC terminals is not described.",
        "FHIR mapping scope is ambitious for the timeline.",
      ],
      [
        "Describe key custody: who holds the key when a terminal is shared by three staff members?",
        "Narrow FHIR scope to two or three resource types for the prototype.",
      ],
      ["Key management", "FHIR resource scope", "Audit log design"],
      "A strong healthcare proposal with sound offline architecture. Security key management is the main unanswered question for faculty to probe.",
    ),
    similarity: {
      score: 31,
      risk: "Low",
      matches: [
        {
          teamName: "Team Innovexa",
          problemId: "SIH1601",
          score: 31,
          concepts: ["offline-first sync"],
          reason: "Shared offline-sync technique only; different domains.",
        },
      ],
      keywords: ["PHC", "offline", "CRDT", "ABDM", "consent"],
      explanation: "Low overlap. Technique reuse is not idea duplication.",
      analyzedAt: ts("2026-07-31T11:20:00"),
    },
    review: null,
    shortlist: "Under Review",
    presentation: null,
    mentor: "Dr. A. M. Bhosale",
    createdAt: ts("2026-07-17T15:00:00"),
  },
  {
    id: "T-008",
    regId: "JGI-SIH-2026-0008",
    name: "Team GreenGrid",
    leader: "Tejas Wankhede",
    email: "tejas.wankhede@jspm.edu.in",
    phone: "+91 91580 71203",
    campus: "JSPM ICOER, Wagholi",
    department: "Electronics & Telecom",
    members: [
      { name: "Tejas Wankhede", prn: "72901701A", department: "Electronics & Telecom", year: "TE", skills: "IoT, ESP32" },
      { name: "Aditi Rane", prn: "72901702B", department: "Computer Engineering", year: "TE", skills: "React, charts" },
      { name: "Soham Kale", prn: "72901703C", department: "Electronics & Telecom", year: "SE", skills: "Sensors" },
      { name: "Mitali Deshpande", prn: "72901704D", department: "AI & Data Science", year: "TE", skills: "Forecasting" },
    ],
    problemId: "SIH1990",
    locked: true,
    stage: "Proposal Submission",
    proposalStatus: "Submitted",
    proposal: {
      title: "SuryaGrid — Campus Microgrid Monitoring",
      solution:
        "ESP32 based energy meters on each building feed a time-series store; the dashboard shows generation vs consumption and forecasts next-day solar output to recommend load shifting.",
      innovation: "Building-level load-shift recommendations rather than plain monitoring dashboards.",
      technicalApproach: "ESP32 + CT sensors, MQTT ingestion, TimescaleDB, Prophet forecasting, React dashboard.",
      techStack: "ESP32, MQTT, TimescaleDB, Python, Prophet, React",
      targetUsers: "Campus facility managers, sustainability committees",
      impact: "Targets a 12% reduction in grid draw during peak tariff hours.",
      scalability: "Additional buildings are new MQTT topics; no schema change.",
      implementation: "Week 1 hardware, Week 2 ingestion, Week 3 forecasting, Week 4 dashboard.",
    },
    ai: null,
    similarity: null,
    review: null,
    shortlist: "Under Review",
    presentation: null,
    mentor: "Prof. V. Deshpande",
    createdAt: ts("2026-07-18T10:05:00"),
  },
  {
    id: "T-009",
    regId: "JGI-SIH-2026-0009",
    name: "Team TrustEd",
    leader: "Nikhil Bagade",
    email: "nikhil.bagade@jspm.edu.in",
    phone: "+91 90110 66230",
    campus: "JSPM BSIOTR, Wagholi",
    department: "Computer Engineering",
    members: [
      { name: "Nikhil Bagade", prn: "73001801A", department: "Computer Engineering", year: "TE", skills: "Node, Express" },
      { name: "Snehal Yadav", prn: "73001802B", department: "Information Technology", year: "TE", skills: "React" },
      { name: "Rahul Zore", prn: "73001803C", department: "Computer Engineering", year: "SE", skills: "MySQL" },
    ],
    problemId: "SIH1623",
    locked: true,
    stage: "AI Analysis",
    proposalStatus: "Under AI Analysis",
    proposal: {
      title: "TrustEd — Central Credential Verification Portal",
      solution: "A centralised verification portal where employers enter a certificate number to confirm authenticity.",
      innovation: "Bulk verification API for background verification agencies.",
      technicalApproach: "Node.js REST API, MySQL record store, React portal, rate-limited public API.",
      techStack: "Node.js, Express, MySQL, React",
      targetUsers: "Employers, verification agencies",
      impact: "Faster verification.",
      scalability: "Read replicas.",
      implementation: "API, then portal.",
    },
    ai: mkAi(
      56,
      [60, 44, 72, 58, 52, 56, 60],
      ["Simple architecture that the team can realistically finish."],
      [
        "Innovation is limited — this is a database lookup with a web front end.",
        "Does not address tamper-proofing, which is the core of the problem statement.",
        "Impact and scalability sections are single sentences.",
      ],
      [
        "Add a cryptographic signature so records cannot be silently altered by an insider.",
        "Expand every section to explain the reasoning, not just the choice.",
      ],
      ["Tamper-proofing approach", "Impact quantification", "Security model", "Timeline"],
      "The proposal is buildable but currently under-answers the problem statement's central requirement of tamper resistance. Substantial strengthening is needed before faculty review.",
    ),
    similarity: {
      score: 47,
      risk: "Moderate",
      matches: [
        {
          teamName: "Team ChainVerify",
          problemId: "SIH1623",
          score: 47,
          concepts: ["credential verification portal", "employer lookup"],
          reason: "Same verification workflow with a centralised rather than ledger-backed store.",
        },
        {
          teamName: "Team CodeSankalp",
          problemId: "SIH1623",
          score: 44,
          concepts: ["employer verification"],
          reason: "Shared employer-facing verification concept.",
        },
      ],
      keywords: ["verification", "certificate", "employer", "portal"],
      explanation: "Three teams are converging on the same problem statement. Faculty comparison recommended.",
      analyzedAt: ts("2026-07-31T13:05:00"),
    },
    review: null,
    shortlist: "Under Review",
    presentation: null,
    mentor: "Prof. V. Deshpande",
    createdAt: ts("2026-07-18T14:35:00"),
  },
  {
    id: "T-010",
    regId: "JGI-SIH-2026-0010",
    name: "Team KalaSetu",
    leader: "Shruti Kale",
    email: "shruti.kale@jspm.edu.in",
    phone: "+91 89830 41180",
    campus: "JSPM JSCOE, Hadapsar",
    department: "Information Technology",
    members: [
      { name: "Shruti Kale", prn: "73101901A", department: "Information Technology", year: "TE", skills: "Next.js" },
      { name: "Omkar Bhoite", prn: "73101902B", department: "Computer Engineering", year: "TE", skills: "Node, Stripe" },
      { name: "Prachi Sonawane", prn: "73101903C", department: "Information Technology", year: "SE", skills: "UI/UX" },
      { name: "Rohan Jagdale", prn: "73101904D", department: "AI & Data Science", year: "TE", skills: "Image models" },
    ],
    problemId: "SIH1866",
    locked: true,
    stage: "Registration",
    proposalStatus: "Draft",
    proposal: {
      title: "KalaSetu — Marketplace for Tribal Artisans",
      solution:
        "A vernacular, low-bandwidth marketplace where artisan cooperatives list handmade products, with AI enhancement of phone-camera product photos and integrated logistics.",
      innovation: "Automatic product photo enhancement and background cleanup from a basic phone camera shot.",
      technicalApproach: "Next.js storefront, Node API, image enhancement pipeline, Shiprocket logistics integration.",
      techStack: "Next.js, Node.js, PostgreSQL, Razorpay",
      targetUsers: "Tribal artisan cooperatives, urban buyers",
      impact: "",
      scalability: "",
      implementation: "",
    },
    ai: null,
    similarity: null,
    review: null,
    shortlist: "Under Review",
    presentation: null,
    mentor: null,
    createdAt: ts("2026-07-19T09:20:00"),
  },
  {
    id: "T-011",
    regId: "JGI-SIH-2026-0011",
    name: "Team RakshaNet",
    leader: "Aditya Kulkarni",
    email: "aditya.kulkarni@jspm.edu.in",
    phone: "+91 90040 78123",
    campus: "JSPM RSCOE, Tathawade",
    department: "AI & Data Science",
    members: [
      { name: "Aditya Kulkarni", prn: "73202001A", department: "AI & Data Science", year: "BE", skills: "Graph ML" },
      { name: "Kimaya Joshi", prn: "73202002B", department: "Computer Engineering", year: "TE", skills: "Kafka, Java" },
      { name: "Sameer Qureshi", prn: "73202003C", department: "AI & Data Science", year: "TE", skills: "Python, Spark" },
      { name: "Diya Shah", prn: "73202004D", department: "Information Technology", year: "TE", skills: "React" },
      { name: "Yuvraj Patil", prn: "73202005E", department: "Computer Engineering", year: "SE", skills: "Neo4j" },
    ],
    problemId: "SIH1934",
    locked: true,
    stage: "Faculty Review",
    proposalStatus: "Under Faculty Review",
    proposal: {
      title: "RakshaNet — UPI Fraud Ring Detection",
      solution:
        "A streaming pipeline that scores each UPI transaction for anomaly risk in under 80 ms and builds a transaction graph to surface coordinated mule-account rings for investigator review.",
      innovation:
        "Combines per-transaction anomaly scoring with graph community detection, so the system catches rings whose individual transactions all look normal.",
      technicalApproach:
        "Kafka ingestion, Spark structured streaming for feature computation, isolation forest for point anomalies, Neo4j with Louvain community detection for ring surfacing, React investigator console.",
      techStack: "Kafka, Spark, Python, Neo4j, React",
      targetUsers: "Bank fraud-operations teams, NPCI, cyber-crime investigators",
      impact:
        "Mule-ring detection typically happens weeks after the fact; graph surfacing brings this to the same day.",
      scalability: "Kafka partitions scale ingestion; graph analytics run incrementally on a rolling window.",
      implementation:
        "Week 1 synthetic transaction generator, Week 2 streaming features, Week 3 graph detection, Week 4 investigator console.",
    },
    ai: mkAi(
      85,
      [87, 89, 78, 88, 86, 84, 83],
      [
        "The insight that individually-normal transactions form detectable rings is the strongest idea in this proposal.",
        "Realistic latency budget stated (80 ms) rather than a vague 'real time' claim.",
      ],
      [
        "No access to real UPI data; synthetic data may not reflect true fraud topology.",
        "False-positive cost to genuine users is not discussed.",
      ],
      [
        "State how the synthetic generator is validated against published fraud typologies.",
        "Add a precision/recall target and describe the investigator triage workload.",
      ],
      ["False positive handling", "Data validity argument", "Regulatory/privacy considerations"],
      "Technically ambitious and conceptually sharp. Data realism is the main vulnerability the panel will probe.",
    ),
    similarity: {
      score: 19,
      risk: "Low",
      matches: [],
      keywords: ["UPI", "fraud", "graph", "streaming"],
      explanation: "No meaningfully similar submission found in the current cohort.",
      analyzedAt: ts("2026-08-01T09:00:00"),
    },
    review: null,
    shortlist: "Under Review",
    presentation: null,
    mentor: "Prof. N. Rane",
    createdAt: ts("2026-07-19T16:40:00"),
  },
  {
    id: "T-012",
    regId: "JGI-SIH-2026-0012",
    name: "Team DrishtiPath",
    leader: "Sagar Dhumal",
    email: "sagar.dhumal@jspm.edu.in",
    phone: "+91 97300 90876",
    campus: "JSPM ICOER, Wagholi",
    department: "Electronics & Telecom",
    members: [
      { name: "Sagar Dhumal", prn: "73302101A", department: "Electronics & Telecom", year: "BE", skills: "Embedded, RPi" },
      { name: "Trupti Gadekar", prn: "73302102B", department: "AI & Data Science", year: "TE", skills: "Depth vision" },
      { name: "Nilesh Bhagat", prn: "73302103C", department: "Electronics & Telecom", year: "TE", skills: "Audio DSP" },
      { name: "Ketaki Pisal", prn: "73302104D", department: "Computer Engineering", year: "SE", skills: "Python" },
    ],
    problemId: "SIH1709",
    locked: true,
    stage: "Shortlist",
    proposalStatus: "Shortlisted",
    proposal: {
      title: "DrishtiPath — Wearable Navigation Aid",
      solution:
        "A chest-mounted wearable using a stereo depth camera and bone-conduction audio to warn of obstacles, detect open manholes and read signboards aloud in Marathi and English.",
      innovation:
        "Tuned for Indian footpath hazards specifically — open drains, parked two-wheelers and uneven paving — rather than the clean-corridor assumptions of imported devices, and priced under ₹6,000 in parts.",
      technicalApproach:
        "Raspberry Pi 5 with OAK-D Lite depth camera, MiDaS depth fallback, on-device OCR with Tesseract Marathi, bone conduction audio output, haptic belt for directional cues.",
      techStack: "Python, OpenCV, OAK-D, Tesseract, Raspberry Pi",
      targetUsers: "Visually impaired pedestrians, NGOs working in disability rehabilitation",
      impact: "Imported equivalents cost ₹80,000+; this brings assistive navigation into reach for Indian households.",
      scalability: "Bill of materials is off-the-shelf; assembly can be handled by NGO partner workshops.",
      implementation: "Week 1 hardware assembly, Week 2 depth pipeline, Week 3 OCR and audio, Week 4 user trial with 5 participants.",
    },
    ai: mkAi(
      84,
      [86, 88, 80, 82, 90, 78, 84],
      [
        "Cost argument (₹6,000 vs ₹80,000) is concrete and compelling.",
        "Hazard set is specific to the Indian context, showing real user research.",
        "Planned user trial with actual participants is rare at this stage and adds credibility.",
      ],
      [
        "Battery life and device weight are not stated — both are decisive for a wearable.",
        "OCR on moving footage is significantly harder than the proposal implies.",
      ],
      [
        "Add weight and battery-life targets to the specification.",
        "Trigger OCR only when the user stops walking, to avoid motion blur.",
      ],
      ["Battery life", "Device weight", "Safety disclaimer and liability note"],
      "A humane, well-researched hardware proposal with a strong cost story. Ergonomic specifications are the missing piece.",
    ),
    similarity: {
      score: 25,
      risk: "Low",
      matches: [],
      keywords: ["assistive", "depth camera", "wearable", "OCR"],
      explanation: "Unique in this cohort.",
      analyzedAt: ts("2026-08-01T10:30:00"),
    },
    review: {
      scores: {
        "Problem Understanding": 9,
        Innovation: 9,
        Feasibility: 7,
        "Technical Approach": 8,
        Impact: 10,
        "Presentation Readiness": 8,
      },
      total: 51,
      comments: "Bring the working wearable to the presentation. Cost breakdown slide will be important.",
      reviewer: "Prof. N. Rane",
      reviewedAt: ts("2026-08-02T14:20:00"),
    },
    shortlist: "Shortlisted",
    presentation: {
      date: "2026-08-18",
      time: "02:00 PM",
      venue: "Seminar Hall A, RSCOE",
      panel: "Prof. S. R. Kulkarni, Dr. A. M. Bhosale, Prof. N. Rane",
      status: "Scheduled",
      remarks: "",
    },
    mentor: "Prof. V. Deshpande",
    createdAt: ts("2026-07-20T11:15:00"),
  },
];

export const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "A-006",
    title: "Offline presentation schedule published",
    body: "Shortlisted teams must report to Seminar Hall A, RSCOE on 18 August 2026. Slot timings are visible on the Presentation page. Each team gets 8 minutes plus 4 minutes of Q&A.",
    date: ts("2026-08-05T10:00:00"),
    type: "info",
    audience: "All",
  },
  {
    id: "A-005",
    title: "Shortlist announced for Internal SIH 2026",
    body: "The portal has generated the shortlist from combined AI proposal scores, similarity risk and faculty evaluation. Shortlisted teams can view their status on the dashboard.",
    date: ts("2026-08-03T16:30:00"),
    type: "result",
    audience: "All",
  },
  {
    id: "A-004",
    title: "Faculty review round has started",
    body: "Faculty reviewers can now open submitted proposals, view AI analysis and similarity reports, and record evaluation scores. Review window closes 3 August 2026.",
    date: ts("2026-07-31T09:00:00"),
    type: "info",
    audience: "Faculty",
  },
  {
    id: "A-003",
    title: "AI analysis completed for 9 proposals",
    body: "Proposal quality analysis and duplicate-idea detection have finished for all proposals submitted before the deadline. Teams can view detailed feedback in the AI Proposal Analyzer.",
    date: ts("2026-07-30T18:00:00"),
    type: "ai",
    audience: "Students",
  },
  {
    id: "A-002",
    title: "Proposal submission deadline — 29 July 2026, 11:59 PM",
    body: "Submit your proposal through the Proposal Submission page. Drafts that are not finally submitted before the deadline will not be considered for review.",
    date: ts("2026-07-22T12:00:00"),
    type: "deadline",
    audience: "Students",
  },
  {
    id: "A-001",
    title: "Team registration is open",
    body: "Registration for JSPM Group Internal SIH 2026 is now open across all four campuses. Teams must have 4 to 6 members. Team membership is locked once registration is submitted.",
    date: ts("2026-07-12T09:00:00"),
    type: "deadline",
    audience: "Students",
  },
];

export interface Deadline {
  label: string;
  date: string;
  done: boolean;
}

export const DEADLINES: Deadline[] = [
  { label: "Team registration closes", date: "2026-07-22", done: true },
  { label: "Problem statement selection", date: "2026-07-25", done: true },
  { label: "Proposal submission deadline", date: "2026-07-29", done: true },
  { label: "Faculty review window closes", date: "2026-08-03", done: true },
  { label: "Shortlist publication", date: "2026-08-05", done: true },
  { label: "Offline faculty presentation", date: "2026-08-18", done: false },
  { label: "Final result publication", date: "2026-08-20", done: false },
];

export const DEMO_USERS: Record<Role, { name: string; title: string; email: string; initials: string }> = {
  student: {
    name: "Aarav Deshmukh",
    title: "Student — Team Innovexa (Leader)",
    email: "aarav.deshmukh@jspm.edu.in",
    initials: "AD",
  },
  faculty: {
    name: "Prof. S. R. Kulkarni",
    title: "Faculty Reviewer — Computer Engineering",
    email: "sr.kulkarni@jspm.edu.in",
    initials: "SK",
  },
  mentor: {
    name: "Prof. N. Rane",
    title: "Mentor — 4 assigned teams",
    email: "n.rane@jspm.edu.in",
    initials: "NR",
  },
  admin: {
    name: "Dr. A. M. Bhosale",
    title: "Internal SIH Coordinator (Admin)",
    email: "am.bhosale@jspm.edu.in",
    initials: "AB",
  },
};

export const problemById = (id: string | null | undefined) => PROBLEMS.find((p) => p.id === id) ?? null;
