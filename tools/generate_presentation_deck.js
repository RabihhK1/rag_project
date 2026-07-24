const pptxgen = require(process.env.PPTXGENJS_PATH || "pptxgenjs");
const fs = require("fs");
const path = require("path");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "RAG Project Team";
pptx.company = "DAR Internship";
pptx.subject = "CIS Security Assistant delivery overview";
pptx.title = "CIS Security Assistant — Delivery Overview";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US",
};
pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pptx.layout = "WIDE";
pptx.margin = 0;

const C = {
  bg: "09111F", panel: "111D30", panel2: "15243A", border: "294462",
  text: "F4F8FC", muted: "A9B8CA", blue: "51A8FF", cyan: "67E8F9",
  green: "6EE7B7", purple: "B7A6FF", amber: "FBBF24", red: "FDA4AF",
};
const S = pptx.ShapeType;

function addBg(slide, section, slideNo) {
  slide.background = { color: C.bg };
  slide.addShape(S.rect, { x: 0, y: 0, w: 13.333, h: 0.1, fill: { color: C.blue }, line: { color: C.blue } });
  slide.addShape(S.arc, { x: 10.7, y: -1.15, w: 3.4, h: 3.4, adjustPoint: 0.25, rotate: 25, fill: { color: "102D4C", transparency: 26 }, line: { color: "102D4C", transparency: 100 } });
  slide.addText(section.toUpperCase(), { x: 0.58, y: 0.3, w: 4, h: 0.22, fontFace: "Aptos", fontSize: 7.5, bold: true, charSpacing: 1.3, color: C.cyan, margin: 0 });
  slide.addText(`0${slideNo}`, { x: 12.2, y: 7.06, w: 0.5, h: 0.18, fontSize: 8, color: C.muted, align: "right", margin: 0 });
}

function title(slide, text, subtitle) {
  slide.addText(text, { x: 0.58, y: 0.65, w: 11.8, h: 0.57, fontSize: 25, bold: true, color: C.text, margin: 0, breakLine: false, fit: "shrink" });
  if (subtitle) slide.addText(subtitle, { x: 0.6, y: 1.26, w: 11.3, h: 0.31, fontSize: 10.5, color: C.muted, margin: 0, fit: "shrink" });
}

function pill(slide, text, x, y, w, color = C.blue) {
  slide.addShape(S.roundRect, { x, y, w, h: 0.33, rectRadius: 0.06, fill: { color, transparency: 82 }, line: { color, transparency: 48, width: 0.6 } });
  slide.addText(text, { x: x + 0.09, y: y + 0.09, w: w - 0.18, h: 0.1, fontSize: 7.6, bold: true, color, align: "center", margin: 0, fit: "shrink" });
}

function bullet(slide, text, x, y, w, color = C.text) {
  slide.addShape(S.ellipse, { x, y: y + 0.08, w: 0.07, h: 0.07, fill: { color: C.cyan }, line: { color: C.cyan } });
  slide.addText(text, { x: x + 0.18, y, w: w - 0.18, h: 0.28, fontSize: 10, color, breakLine: false, margin: 0, fit: "shrink" });
}

function panel(slide, x, y, w, h, heading, accent = C.blue) {
  slide.addShape(S.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: C.panel }, line: { color: C.border, width: 0.8 } });
  slide.addShape(S.rect, { x, y, w: 0.05, h, fill: { color: accent }, line: { color: accent } });
  slide.addText(heading, { x: x + 0.24, y: y + 0.19, w: w - 0.4, h: 0.22, fontSize: 11, bold: true, color: C.text, margin: 0, fit: "shrink" });
}

// Slide 1
{
  const slide = pptx.addSlide();
  addBg(slide, "Delivery overview", 1);
  title(slide, "From RAG brief to a reviewable security assistant", "What was requested, what was delivered, and the stack behind it.");
  panel(slide, 0.58, 1.85, 5.95, 3.58, "What was asked", C.purple);
  [
    "CIS Controls RAG chat experience",
    "Streaming responses with citations",
    "Conversation persistence and history",
    "Regeneration, feedback, and guided onboarding",
  ].forEach((item, index) => bullet(slide, item, 0.86, 2.43 + index * 0.57, 5.25));
  panel(slide, 6.79, 1.85, 5.95, 3.58, "What was shipped", C.green);
  [
    "Polished React chat workspace + welcome prompts",
    "Grounded answers, source metadata, and versions",
    "Saved threads, inline feedback, and analytics",
    "Secure middleware foundation: identity, audit, rate limits",
  ].forEach((item, index) => bullet(slide, item, 7.07, 2.43 + index * 0.57, 5.2, C.text));
  slide.addText("TECH STACK", { x: 0.6, y: 5.85, w: 1.5, h: 0.16, fontSize: 7.5, bold: true, color: C.muted, charSpacing: 1.2, margin: 0 });
  pill(slide, "React + Vite", 0.6, 6.15, 1.45, C.cyan);
  pill(slide, "FastAPI + Python", 2.2, 6.15, 1.7, C.green);
  pill(slide, "MongoDB + Weaviate", 4.05, 6.15, 1.95, C.purple);
  pill(slide, "Ollama", 6.15, 6.15, 1.05, C.amber);
  pill(slide, ".NET 10 + PostgreSQL", 7.35, 6.15, 2.15, C.blue);
  pill(slide, "Docker", 9.65, 6.15, 1.05, C.red);
  slide.addNotes(`Today I will show how the original RAG assignment became a practical security assistant.\n\nThe brief was not only to produce answers. It required a complete chat experience: streaming, citations, saved conversations, response regeneration, and feedback.\n\nWhat was delivered is a React workspace that guides users from a new chat into source-backed CIS Controls questions. It supports citations and response versions so answers can be reviewed, not treated as a black box. The security middleware work adds the right production foundation: identity, auditable requests, sessions, and rate limits.\n\nThe stack deliberately stays pragmatic: Python owns the AI workflow; React owns the experience; .NET and PostgreSQL add a security and identity boundary.`);
}

// Slide 2
{
  const slide = pptx.addSlide();
  addBg(slide, "Architecture", 2);
  title(slide, "A clear boundary between user experience, security, and AI", "RAG stays close to the existing Python pipeline; .NET becomes the public security gateway.");

  const boxes = [
    { x: 0.65, y: 2.2, w: 1.85, h: 1.1, t: "React\nchat UI", c: C.cyan },
    { x: 3.1, y: 2.2, w: 2.2, h: 1.1, t: ".NET middleware\nauth · audit · proxy", c: C.blue },
    { x: 5.9, y: 2.2, w: 2.15, h: 1.1, t: "FastAPI RAG\nretrieve · rerank · stream", c: C.green },
    { x: 8.7, y: 1.45, w: 1.65, h: 0.82, t: "Weaviate\nretrieval", c: C.purple },
    { x: 8.7, y: 2.55, w: 1.65, h: 0.82, t: "Ollama\ngeneration", c: C.amber },
    { x: 8.7, y: 3.65, w: 1.65, h: 0.82, t: "MongoDB\nthreads + feedback", c: C.cyan },
    { x: 11.05, y: 2.2, w: 1.65, h: 1.1, t: "PostgreSQL\nidentity + audit", c: C.red },
  ];
  boxes.forEach((b) => {
    slide.addShape(S.roundRect, { x: b.x, y: b.y, w: b.w, h: b.h, rectRadius: 0.06, fill: { color: C.panel2 }, line: { color: b.c, width: 1 } });
    slide.addText(b.t, { x: b.x + 0.09, y: b.y + 0.28, w: b.w - 0.18, h: 0.48, fontSize: 10, bold: true, align: "center", valign: "mid", color: C.text, margin: 0, breakLine: false, fit: "shrink" });
  });
  [[2.5, 2.75, 3.1, 2.75], [5.3, 2.75, 5.9, 2.75], [8.05, 2.75, 8.7, 1.86], [8.05, 2.75, 8.7, 2.96], [8.05, 2.75, 8.7, 4.06], [10.35, 2.75, 11.05, 2.75]].forEach(([x1, y1, x2, y2]) => {
    slide.addShape(S.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color: C.muted, width: 1.4, beginArrowType: "none", endArrowType: "triangle" } });
  });
  panel(slide, 0.65, 5.25, 12.05, 1.05, "Why this decision", C.cyan);
  slide.addText("Keep the working RAG pipeline in Python; use .NET as the public gateway for authentication, user isolation, rate limiting, auditability, and private service-to-service access.", { x: 0.95, y: 5.72, w: 11.45, h: 0.28, fontSize: 11, color: C.text, margin: 0, fit: "shrink" });
  slide.addNotes(`The architecture separates the concerns that change at different speeds. React owns the user experience. FastAPI owns the existing RAG pipeline, including retrieval, reranking, and streaming.\n\nWhen a user asks a question, Weaviate returns relevant CIS chunks. The RAG service reranks those chunks and sends the selected evidence to Ollama. The final response is streamed back with source metadata. MongoDB keeps the conversation and feedback records.\n\nThe justified decision is not to rewrite the already-working AI stack. Instead, .NET is a security gateway in front of it. It is the right place for identity, rotating sessions, audit logs, rate limits, and the internal key used to protect FastAPI from direct browser access.`);
}

// Slide 3
{
  const slide = pptx.addSlide();
  addBg(slide, "Impact", 3);
  title(slide, "Trust, traceability, and a feedback loop turn RAG into a useful product", "The value is faster security guidance without losing the ability to review or improve it.");
  panel(slide, 0.6, 1.85, 3.78, 3.78, "Lessons learned", C.purple);
  [
    "Streaming needs careful UI state and cancellation handling",
    "Citations are essential for trust in security answers",
    "Versions make regeneration reviewable, not disposable",
    "Identity and service setup must be tested early",
  ].forEach((item, index) => bullet(slide, item, 0.87, 2.42 + index * 0.63, 3.2));
  panel(slide, 4.77, 1.85, 3.78, 3.78, "Business value", C.green);
  [
    "Faster access to CIS guidance",
    "More consistent, source-backed decisions",
    "Reusable knowledge across security teams",
    "Auditability for responsible AI adoption",
  ].forEach((item, index) => bullet(slide, item, 5.04, 2.42 + index * 0.63, 3.2));
  panel(slide, 8.94, 1.85, 3.78, 3.78, "Feedback loop", C.cyan);
  slide.addText("Ask", { x: 9.35, y: 2.34, w: 0.75, h: 0.25, fontSize: 13, bold: true, color: C.text, margin: 0 });
  slide.addText("→", { x: 10.12, y: 2.32, w: 0.3, h: 0.25, fontSize: 16, color: C.cyan, margin: 0 });
  slide.addText("Verify", { x: 10.45, y: 2.34, w: 0.85, h: 0.25, fontSize: 13, bold: true, color: C.text, margin: 0 });
  slide.addText("→", { x: 11.35, y: 2.32, w: 0.3, h: 0.25, fontSize: 16, color: C.cyan, margin: 0 });
  slide.addText("Improve", { x: 11.68, y: 2.34, w: 0.72, h: 0.25, fontSize: 13, bold: true, color: C.text, margin: 0 });
  slide.addShape(S.line, { x: 9.34, y: 2.83, w: 2.7, h: 0, line: { color: C.cyan, width: 1.5, beginArrowType: "none", endArrowType: "triangle" } });
  slide.addText("User feedback and response ratings become evidence for improving retrieval, prompts, and future answer quality.", { x: 9.25, y: 3.35, w: 3.05, h: 0.75, fontSize: 12, color: C.muted, align: "center", valign: "mid", margin: 0, fit: "shrink" });
  slide.addShape(S.roundRect, { x: 0.6, y: 6.13, w: 12.1, h: 0.45, rectRadius: 0.05, fill: { color: "113453" }, line: { color: C.blue, transparency: 45 } });
  slide.addText("Takeaway: the assistant accelerates CIS research while keeping humans in control through sources, versions, feedback, and auditability.", { x: 0.86, y: 6.27, w: 11.6, h: 0.16, fontSize: 10.5, bold: true, color: C.text, align: "center", margin: 0, fit: "shrink" });
  slide.addNotes(`The biggest lesson was that a strong RAG product is more than one generated answer. It needs streaming that feels responsive, citations that make answers checkable, and response versions that preserve alternatives instead of hiding them.\n\nThe business value is clear: security teams can reach relevant CIS guidance faster and make more consistent decisions. The sources help users verify the answer, and the saved conversations make that work reusable.\n\nFinally, feedback is not just a UI feature. A rating and reason create a measurable improvement loop. Over time it tells us where retrieval, prompt design, or document coverage should be improved. That is how the system becomes more useful while remaining accountable.`);
}

const outputDir = path.join(process.cwd(), "deliverables");
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "CIS_RAG_Assistant_Demo_Deck.pptx");
pptx.writeFile({ fileName: outputPath });
