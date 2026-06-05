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
];

/* "What I can do" — concrete capabilities, framed as actions (no employers). */
export const abilities = [
  { icon: "mic", title: "Built real-time voice agents", sub: "Sub-300ms speech-to-speech with tool-calling & telephony" },
  { icon: "nodes", title: "Designed multi-agent systems", sub: "Event-driven crews orchestrated with LangGraph" },
  { icon: "layers", title: "Engineered RAG pipelines", sub: "Dense + vectorless retrieval, grounded and tuned" },
  { icon: "chart", title: "Shipped production ML", sub: "Ranking & predictive models with evaluation frameworks" },
  { icon: "cloud", title: "Architected cloud infra", sub: "Azure & AWS services, data flows and deployment" },
  { icon: "database", title: "Managed databases", sub: "PostgreSQL, vector stores and data pipelines" },
  { icon: "bolt", title: "Integrated realtime APIs", sub: "Telephony, WebSockets and streaming relays" },
  { icon: "code", title: "Built full-stack POCs", sub: "FastAPI + React, prototype to production" },
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
