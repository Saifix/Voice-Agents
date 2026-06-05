/* ------------------------------------------------------------------ *
 *  Portfolio content — single source of truth for the homepage.
 *  Edit here to update the site; the Home page renders purely from this.
 * ------------------------------------------------------------------ */

export const profile = {
  name: "Saif-ur-Rehman",
  title: "Senior AI Engineer · ML & Agentic Systems",
  tagline: "I take Generative AI systems from prototype to production.",
  summary:
    "AI Engineer with 4 years moving Generative AI systems from prototype to production " +
    "across RAG pipelines, multi-agent workflows and LLM applications. Enterprise-grade " +
    "delivery at an ISO 9001–certified SaaS company, supervising large-scale AI projects " +
    "alongside product, backend and frontend teams — equally at home shipping rapid " +
    "full-stack POCs and MVPs for stakeholder demos.",
  location: "Lahore, Pakistan",
  email: "saif_rehman08@yahoo.com",   // change to your preferred public contact
  linkedin: "https://linkedin.com/in/saifix-ai",
};

export const stats = [
  { n: "4+", l: "Years in AI" },
  { n: "<300ms", l: "Realtime voice latency" },
  { n: "95%", l: "Mean NDCG (ranking)" },
  { n: "5+", l: "Agents orchestrated" },
];

export const experience = [
  {
    role: "AI Engineer",
    company: "JobLogic",
    location: "Lahore, Pakistan",
    period: "Mar 2025 – Present",
    bullets: [
      "Shipped a real-time voice assistant on OpenAI's GPT Realtime API (native speech-to-speech) with sub-300ms latency, tool-calling, retrieval grounding and multi-fallback reliability; benchmarked against Gemini 3 Flash and integrated with Twilio, lifting automated call handling by ~65%.",
      "Engineered an event-driven multi-agent system on Azure Service Bus with LangGraph, orchestrating 5+ specialized agents for engineer-visit confirmation, quote dispatch and live courier/map-based location sharing.",
      "Built LLMOps pipelines with Langfuse and Promptfoo for prompt versioning, response monitoring and evaluation; configured MCP servers for structured tool access and reproducible agent context.",
      "Designed and deployed a production XGBoost Ranking model (XGBRanker) at 95% mean NDCG, matching engineers to optimal jobs and lifting assignment efficiency by 30%.",
      "Authored the HMRC R&D Tax Relief technical narrative (CIRD81900 / CIRD81960) to the competent-professional standard; submission accepted by HMRC, securing R&D tax relief for the company.",
    ],
  },
  {
    role: "AI Engineer",
    company: "Logiqon Solutions",
    location: "Remote",
    period: "Apr 2024 – Mar 2025",
    bullets: [
      "Architected a multi-agent AI system covering 4 e-commerce workflows (query resolution, order placement, tracking, issue resolution) combining vectorless reasoning-based RAG with dense passage retrieval, tuned chunking/embedding strategies and inter-agent fallback handling.",
      "Designed software architecture and cloud infrastructure for an early-stage AI startup, scoping services, data flows and deployment topology from zero to first customer demo.",
      "Developed F.A.R.M., a Generative AI agricultural assistant orchestrating 3 specialized agents — a CNN-based crop-disease classifier, weather analysis and market-price monitoring — with bilingual (English/Urdu) voice over domain-specific embeddings.",
    ],
  },
  {
    role: "Software Engineer",
    company: "Acumen Technologies",
    location: "Rawalpindi, Pakistan",
    period: "Jun 2022 – Mar 2024",
    bullets: [
      "Trained a credit-risk predictive model at 99.57% accuracy (Random Forest + XGBoost); addressed class imbalance with SMOTE, engineered income-stability scores, reduced false positives by 20% and improved retention by 15%.",
      "Built scalable Python backend services and full-stack POCs with React frontends, converting analytical prototypes into production-ready systems for client validation.",
    ],
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
      "AWS Bedrock", "AWS SageMaker", "AWS Canvas",
    ],
  },
  {
    group: "LLMOps & ML",
    items: [
      "Langfuse", "Promptfoo", "Prompt Versioning", "Evaluation Frameworks",
      "TensorFlow", "PyTorch", "Scikit-learn", "XGBoost", "Prophet",
      "BG/NBD", "SHAP", "Pandas", "NumPy",
    ],
  },
];

export const education = [
  {
    degree: "MS Artificial Intelligence",
    school: "Lahore University of Management Sciences (LUMS)",
    period: "Sep 2024 – Jul 2026",
  },
  {
    degree: "BS Computer Science",
    school: "Air University, Islamabad",
    period: "Sep 2018 – Jul 2022",
  },
];

export const honors = [
  "Runner-up, NETSOL AI Hackathon — $2,000 prize, Team Lead",
  "SAMSUNG AI Innovation Campus Certification (LLMs & Computer Vision)",
];
