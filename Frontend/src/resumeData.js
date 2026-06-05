/* ------------------------------------------------------------------ *
 *  Portfolio content — single source of truth for the homepage.
 *  Edit here to update the site; the Home page renders purely from this.
 *  (Employer names intentionally omitted — work is framed by impact.)
 * ------------------------------------------------------------------ */

export const profile = {
  name: "Saif-ur-Rehman",
  title: "AI Engineer · ML & Agentic Systems",
  tagline: "I take Generative AI from prototype to production.",
  summary:
    "Four years building Generative AI systems that ship — real-time voice agents, " +
    "multi-agent workflows and RAG pipelines — across enterprise SaaS, e-commerce and " +
    "fintech. Equally at home architecting production systems and spinning up rapid " +
    "full-stack POCs for stakeholder demos.",
  location: "Lahore, Pakistan",
  email: "saif_rehman08@yahoo.com",   // change to your preferred public contact
  linkedin: "https://linkedin.com/in/saifix-ai",
};

export const stats = [
  { n: "4+", l: "Years in AI" },
  { n: "<300ms", l: "Realtime voice latency" },
  { n: "95%", l: "Mean NDCG ranking" },
  { n: "5+", l: "Agents orchestrated" },
];

/* High-level "what I build" — drives the capability tiles. */
export const capabilities = [
  {
    key: "voice",
    icon: "mic",
    title: "Realtime Voice AI",
    blurb: "Speech-to-speech agents with sub-300ms latency, tool-calling, retrieval grounding and telephony.",
  },
  {
    key: "agents",
    icon: "nodes",
    title: "Multi-Agent Systems",
    blurb: "Event-driven crews orchestrated with LangGraph, coordinating multi-step real-world workflows.",
  },
  {
    key: "rag",
    icon: "layers",
    title: "RAG & Retrieval",
    blurb: "Grounded answers via dense passage + vectorless reasoning retrieval, tuned end to end.",
  },
  {
    key: "ml",
    icon: "chart",
    title: "Production ML",
    blurb: "Ranking and predictive models shipped with evaluation frameworks and LLMOps pipelines.",
  },
];

/* Experience framed by impact + context (no employer names). */
export const work = [
  {
    role: "AI Engineer",
    context: "Enterprise Field-Service SaaS · ISO 9001",
    period: "2025 — Present",
    highlights: [
      "Shipped a real-time speech-to-speech voice assistant — sub-300ms latency, tool-calling, retrieval grounding and multi-fallback reliability — integrated with telephony, lifting automated call handling ~65%.",
      "Engineered an event-driven multi-agent system with LangGraph: 5+ specialized agents handling visit confirmation, quote dispatch and live map-based location sharing.",
      "Deployed an XGBoost ranking model at 95% mean NDCG, lifting job-assignment efficiency 30%.",
      "Built LLMOps pipelines (Langfuse, Promptfoo) and MCP tool servers for prompt versioning, monitoring and reproducible agent context.",
    ],
    tags: ["Realtime Voice", "LangGraph", "Telephony", "XGBoost", "MCP"],
  },
  {
    role: "AI Engineer",
    context: "E-commerce AI · Early-Stage Startups",
    period: "2024 — 2025",
    highlights: [
      "Architected a multi-agent system across 4 e-commerce workflows, blending vectorless reasoning RAG with dense passage retrieval and inter-agent fallback handling.",
      "Designed cloud architecture and data flows taking an AI startup from zero to first customer demo.",
      "Built a bilingual (English/Urdu) agricultural assistant orchestrating a CNN crop-disease classifier, weather analysis and market-price agents.",
    ],
    tags: ["RAG", "Dense Retrieval", "LangChain", "CNN", "Cloud Architecture"],
  },
  {
    role: "Software Engineer",
    context: "Fintech · Predictive Modeling",
    period: "2022 — 2024",
    highlights: [
      "Trained a credit-risk model at 99.57% accuracy (Random Forest + XGBoost, SMOTE), cutting false positives 20% and improving retention 15%.",
      "Built scalable Python backend services and full-stack POCs, turning analytical prototypes into production-ready systems.",
    ],
    tags: ["XGBoost", "SMOTE", "FastAPI", "React", "SHAP"],
  },
];

export const skills = [
  {
    group: "LLM & RAG",
    items: [
      "LangGraph", "LangChain", "Multi-Agent Orchestration", "RAG Pipelines",
      "Vectorless Reasoning RAG", "Dense Passage Retrieval", "LoRA / QLoRA",
      "Quantization", "MCP Tool Integration", "Pinecone", "FAISS", "Chroma",
    ],
  },
  {
    group: "Languages & APIs",
    items: [
      "Python (FastAPI)", "SQL", "JavaScript", "React", "PostgreSQL",
      "Supabase", "MongoDB", "REST / async", "WebSockets / RTC",
    ],
  },
  {
    group: "Cloud & Infra",
    items: [
      "Azure AI Search", "Azure Service Bus", "Azure AI Foundry", "Databricks",
      "AWS Bedrock", "AWS SageMaker",
    ],
  },
  {
    group: "LLMOps & ML",
    items: [
      "Langfuse", "Promptfoo", "Evaluation Frameworks", "TensorFlow", "PyTorch",
      "Scikit-learn", "XGBoost", "Prophet", "SHAP", "Pandas", "NumPy",
    ],
  },
];

export const education = [
  {
    degree: "MS Artificial Intelligence",
    school: "Lahore University of Management Sciences (LUMS)",
    period: "2024 — 2026",
  },
  {
    degree: "BS Computer Science",
    school: "Air University, Islamabad",
    period: "2018 — 2022",
  },
];

export const honors = [
  "Runner-up, NETSOL AI Hackathon — $2,000 prize, Team Lead",
  "SAMSUNG AI Innovation Campus Certification (LLMs & Computer Vision)",
];
