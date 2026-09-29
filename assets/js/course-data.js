/* ============================================================
   Master roadmap for the AI Validation Engineer Academy.
   Single source of truth for the dashboard + every session's
   prev/next nav + progress %. Edit here when new sessions land.
   ============================================================ */

const COURSE = {
  examTarget: {
    questions: 40,
    minutes: 60,
    passPct: 65,
    chapters: [
      { n: 1, title: "Introduction to Artificial Intelligence", q: 6, pts: 6, mins: 120 },
      { n: 2, title: "Quality Characteristics for AI-Based Systems", q: 3, pts: 3, mins: 45 },
      { n: 3, title: "Machine Learning", q: 7, pts: 8, mins: 375 },
      { n: 4, title: "Testing AI-Based Systems", q: 7, pts: 8, mins: 195 },
      { n: 5, title: "Input Data Testing for Machine Learning Systems", q: 6, pts: 7, mins: 180 },
      { n: 6, title: "Model Testing for Machine Learning Systems", q: 9, pts: 10, mins: 225 },
      { n: 7, title: "Machine Learning Development Testing", q: 2, pts: 2, mins: 30 },
    ],
  },

  sessions: [
    { n: 1, id: "s01", chapter: "Orientation", title: "Welcome & How This Training Works", file: "curriculum/s01-orientation.html", built: true,
      blurb: "How AI testing differs from conventional QA, how the 30-session roadmap is structured, and a diagnostic baseline quiz." },
    { n: 2, id: "s02", chapter: "Ch.1", title: "The AI Landscape", file: "curriculum/s02-ai-landscape.html", built: true,
      blurb: "AI-based vs. conventional systems, narrow/general/super AI, AI technology families, and generative AI." },
    { n: 3, id: "s03", chapter: "Ch.1", title: "Hardware, Hosting & Regulation", file: "curriculum/s03-hardware-hosting-regulation.html", built: true,
      blurb: "Hardware for ML, development & hosting options, ML frameworks, and the global regulatory landscape." },
    { n: 4, id: "s04", chapter: "Ch.2", title: "Quality Characteristics for AI Systems", file: "curriculum/s04-quality-characteristics.html", built: true,
      blurb: "ISO/IEC 25059 quality characteristics, AI safety, and writing acceptance criteria for AI-based systems." },
    { n: 5, id: "s05", chapter: "Ch.3", title: "Forms of ML & the ML Workflow", file: "curriculum/s05-ml-forms-workflow.html", built: true,
      blurb: "Supervised / unsupervised / reinforcement learning, and the end-to-end ML development workflow." },
    { n: 6, id: "s06", chapter: "Ch.3", title: "Pretrained Models, Fine-Tuning, RAG & Data Prep", file: "curriculum/s06-pretrained-finetune-rag-data.html", built: true,
      blurb: "Reusing foundation models, fine-tuning, retrieval-augmented generation, and data preparation activities." },
    { n: 7, id: "s07", chapter: "Ch.3", title: "ML Performance Metrics (Classification)", file: "curriculum/s07-classification-metrics.html", built: true,
      blurb: "Confusion matrices, accuracy, precision, recall, F1 — with an interactive calculator lab." },
    { n: 8, id: "s08", chapter: "Ch.3", title: "Model/Dataset Impact & Regression Metrics", file: "curriculum/s08-regression-metrics-impact.html", built: true,
      blurb: "Hands-on comparison of different model + dataset combinations, plus supplementary MAE/MSE/RMSE." },
    { n: 9, id: "s09", chapter: "Ch.3", title: "Neural Networks & the Perceptron", file: "curriculum/s09-neural-networks-perceptron.html", built: true,
      blurb: "Structure of a deep neural network, with a hands-on perceptron training lab." },
    { n: 10, id: "s10", chapter: "Ch.3", title: "NN Coverage Measures + Chapter 3 Review", file: "curriculum/s10-nn-coverage-review.html", built: true,
      blurb: "Neuron/layer coverage criteria for neural networks, then a full Chapter 3 review quiz." },
    { n: 11, id: "s11", chapter: "Ch.4", title: "Locked vs. Adaptive Systems & Test Oracles", file: "curriculum/s11-locked-adaptive-oracles.html", built: true,
      blurb: "Why AI testing must be statistical, and the oracle problem for AI-based systems." },
    { n: 12, id: "s12", chapter: "Ch.4", title: "Testing GenAI, LLMs & Red Teaming", file: "curriculum/s12-genai-llm-red-teaming.html", built: true,
      blurb: "Techniques for testing generative AI and LLMs, red teaming, and an exploratory-testing lab." },
    { n: 13, id: "s13", chapter: "Ch.4", title: "Test Levels & Risk-Based Testing for MLS", file: "curriculum/s13-test-levels-risk-based.html", built: true,
      blurb: "Test levels specific to machine learning systems, and applying risk-based testing." },
    { n: 14, id: "s14", chapter: "Ch.5", title: "Input Data Risks & Testing for Bias", file: "curriculum/s14-input-data-risks-bias.html", built: true,
      blurb: "Input data risks and mitigations, plus techniques for detecting bias in datasets." },
    { n: 15, id: "s15", chapter: "Ch.5", title: "Data Pipeline & Representativeness Testing", file: "curriculum/s15-pipeline-representativeness.html", built: true,
      blurb: "Testing the data pipeline itself and verifying that data is representative of the real world." },
    { n: 16, id: "s16", chapter: "Ch.5", title: "Dataset Constraints & Label Correctness", file: "curriculum/s16-constraints-label-correctness.html", built: true,
      blurb: "Constraint testing for datasets and label correctness testing, with a hands-on lab." },
    { n: 17, id: "s17", chapter: "Ch.6", title: "Model Risks, Documentation & Review", file: "curriculum/s17-model-risks-documentation.html", built: true,
      blurb: "ML model risks and mitigations, and reviewing model documentation (model cards)." },
    { n: 18, id: "s18", chapter: "Ch.6", title: "Probabilistic Performance & Adversarial Testing", file: "curriculum/s18-performance-adversarial.html", built: true,
      blurb: "ML functional performance testing of probabilistic systems and adversarial attacks on models." },
    { n: 19, id: "s19", chapter: "Ch.6", title: "Metamorphic Testing, Drift & Over/Underfitting", file: "curriculum/s19-metamorphic-drift-fitting.html", built: true,
      blurb: "Hands-on metamorphic testing lab, plus drift testing and over/underfitting detection." },
    { n: 20, id: "s20", chapter: "Ch.6", title: "A/B, Back-to-Back Testing + Chapter 6 Review", file: "curriculum/s20-ab-back2back-review.html", built: true,
      blurb: "A/B testing and back-to-back testing, then a full Chapter 6 review quiz (heaviest exam weight)." },
    { n: 21, id: "s21", chapter: "Ch.7", title: "ML Development & Deployment Testing", file: "curriculum/s21-development-deployment.html", built: true,
      blurb: "Risks during ML development and deployment testing to support robust production behavior." },

    // ---- Applied Practice: core practitioner skills beyond the ISTQB syllabus, ----
    // ---- still part of the main training (not optional). ----
    { n: 22, id: "s22", chapter: "Applied Practice", title: "Evaluation Economics & Product Framing", file: "curriculum/s22-evaluation-economics.html", built: true,
      blurb: "The cost-latency-quality frontier, distributional thinking about AI quality, and blocking vs. optimization metrics." },
    { n: 23, id: "s23", chapter: "Applied Practice", title: "Instrumentation & CI/CD for AI Evals", file: "curriculum/s23-instrumentation-cicd.html", built: true,
      blurb: "What to log and why, trace design, and building a regression safety net for evals into CI/CD." },
    { n: 24, id: "s24", chapter: "Applied Practice", title: "Evaluation Pipelines, Launch Gates & Drift Monitoring", file: "curriculum/s24-pipelines-launch-gates.html", built: true,
      blurb: "Evaluation pipeline architecture, launch readiness gates, and monitoring for drift once a system is in production." },
    { n: 25, id: "s25", chapter: "Applied Practice", title: "Decision-Making, Ownership & Governance", file: "curriculum/s25-decision-ownership-governance.html", built: true,
      blurb: "Turning evaluation signals into product decisions, the AI Reliability Lead ownership model, and evaluation cadence/governance." },

    // ---- ISTQB Certification Prep: optional bonus block. Only needed if you ----
    // ---- decide to sit the official CT-AI v2.0 exam. ----
    { n: 26, id: "s26", chapter: "ISTQB Prep (Optional)", title: "Keyword & Glossary Mastery Drill", file: "curriculum/s26-glossary-drill.html", built: true,
      blurb: "Every AI-specific keyword and glossary term across all 7 syllabus chapters, as interactive flashcards." },
    { n: 27, id: "s27", chapter: "ISTQB Prep (Optional)", title: "Practice Exam #1 (Timed, 40Q)", file: "exams/practice-exam-1.html", built: true,
      blurb: "A full 40-question, 60-minute mock exam matched to the real chapter weighting, with a diagnostic review." },
    { n: 28, id: "s28", chapter: "ISTQB Prep (Optional)", title: "Remediation + Practice Exam #2", file: "exams/practice-exam-2.html", built: true,
      blurb: "Targeted review of your weak areas from Exam #1, then a second fresh 40-question mock exam." },
    { n: 29, id: "s29", chapter: "ISTQB Prep (Optional)", title: "Official Sample Exam Walkthrough", file: "exams/official-sample-walkthrough.html", built: true,
      blurb: "Every question from the official ISTQB CT-AI v2.0 sample exam, worked through with full rationale." },
    { n: 30, id: "s30", chapter: "ISTQB Prep (Optional)", title: "Final Mock Exam & Readiness Report", file: "exams/final-mock-exam.html", built: true,
      blurb: "One last exam-realistic 40-question run, with a full readiness report and next steps." },
  ],
};

// ---- progress helpers (localStorage) ----
const Progress = {
  key(id) { return `avea.session.${id}`; },
  get(id) {
    try { return JSON.parse(localStorage.getItem(this.key(id)) || "null"); }
    catch (e) { return null; }
  },
  set(id, data) {
    try { localStorage.setItem(this.key(id), JSON.stringify({ ...this.get(id), ...data, updated: Date.now() })); }
    catch (e) { /* private mode / storage blocked — degrade silently */ }
  },
  markComplete(id) { this.set(id, { complete: true }); },
  isComplete(id) { return !!(this.get(id) && this.get(id).complete); },
  quizScore(id) { const d = this.get(id); return d && d.quiz ? d.quiz : null; },
  saveQuiz(id, correct, total) { this.set(id, { quiz: { correct, total, pct: Math.round((correct / total) * 100) } }); },
  completedCount() { return COURSE.sessions.filter(s => this.isComplete(s.id)).length; },
  overallPct() { return Math.round((this.completedCount() / COURSE.sessions.length) * 100); },
};

if (typeof module !== "undefined") module.exports = { COURSE, Progress };
