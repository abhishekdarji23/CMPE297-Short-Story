const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const fa = require("react-icons/fa");
// Optional: a helper that writes THEME colors into the .pptx theme part. Without it the deck still builds.
let applyTheme = async () => {};
try { ({ applyTheme } = require(process.env.PPTX_THEME_HELPER || "./apply_theme.js")); } catch (e) {}

const FIG = path.join(__dirname, "..", "figures");
const OUT = path.join(__dirname, "..", "slides", "Agent_Harness_Short_Story.pptx");
const NOTES = JSON.parse(fs.readFileSync(path.join(__dirname, "notes.json"), "utf8"));

const THEME = {
  name: "Harness",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "0B0B0B", lt1: "FFFFFF", dk2: "0D366B", lt2: "F4F8FE",
    accent1: "2A78D6", accent2: "EB6834", accent3: "86B6EF", accent4: "1C5CAB",
    accent5: "52514E", accent6: "CDE2FB", hlink: "2A78D6", folHlink: "6250D6",
  },
};
const HEX = { navy: "0D366B", blue: "2A78D6", ice: "CDE2FB", pale: "F4F8FE", ink2: "52514E", line: "C9D9F0" };

async function icon(Comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
async function dims(file) { const m = await sharp(file).metadata(); return { w: m.width, h: m.height }; }
async function fit(file, bx, by, bw, bh) {
  const d = await dims(file); const r = Math.min(bw / d.w, bh / d.h);
  const w = d.w * r, h = d.h * r;
  return { path: file, x: bx + (bw - w) / 2, y: by + (bh - h) / 2, w, h };
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pres.author = "Abhishek Darji";
  pres.title = "It's Not Just the Model, It's the Harness";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  pres.defineSlideMaster({
    title: "DARK", background: { color: HEX.navy },
    objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.7, y: 0.9, w: 11.9, h: 2.4, fontSize: 38, bold: true, color: C.background1, valign: "middle", align: "left" }, text: "" } }],
  });
  pres.defineSlideMaster({
    title: "CONTENT", background: { color: "FFFFFF" },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.85, fontSize: 32, bold: true, color: C.text2, valign: "middle" }, text: "" } },
      { text: { text: "Abhishek Darji · SJSU · Agent Harness Short Story", options: { x: 0.6, y: 7.0, w: 7, h: 0.3, fontSize: 10, color: C.accent5, fontFace: "Calibri" } } },
    ],
    slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: "52514E", fontFace: "Calibri", align: "right" },
  });

  const notes = (s, i) => s.addNotes(NOTES[i].notes);
  let i = 0;
  const T = (s, t) => s.addText(t, { placeholder: "title" });
  const body = (o) => Object.assign({ isTextBox: true, fontFace: "Calibri", color: HEX.ink2, fontSize: 16, valign: "top", margin: 0 }, o);

  // 1 Title
  pres.addSection({ title: "Introduction" });
  let s = pres.addSlide({ sectionTitle: "Introduction" });
  s.background = { color: HEX.navy };
  s.addImage({ path: path.join(FIG, "fig0_cover.png"), x: 0, y: 0, w: 13.333, h: 6.667, altText: "Cover: It's not just the model, it's the harness" });
  s.addText("Short story · survey of agent system & harness design (arXiv 2606.20683)", body({ x: 0.67, y: 6.85, w: 12, h: 0.4, color: "9EC5F4", fontSize: 13 }));
  notes(s, i++);

  // 2 Hook
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Introduction" });
  T(s, "Same model, same tasks, 20.8 points apart");
  const stat = (x, big, small, col) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.7, w: 3.7, h: 3.0, fill: { color: col }, rectRadius: 0.15, line: { color: col } });
    s.addText(big, body({ x: x + 0.3, y: 2.0, w: 3.1, h: 1.3, fontSize: 60, bold: true, color: col === HEX.navy ? "FFFFFF" : HEX.navy, fontFace: "Cambria" }));
    s.addText(small, body({ x: x + 0.3, y: 3.4, w: 3.1, h: 1.1, fontSize: 15, color: col === HEX.navy ? "CDE2FB" : HEX.ink2 }));
  };
  stat(0.6, "59.4%", "Gemini 3.1 Pro inside Gemini CLI on Terminal-Bench 2.0", HEX.ice);
  stat(4.8, "80.2%", "The same model inside the TongAgents harness", HEX.navy);
  stat(9.0, "13.6", "Median best-vs-worst harness gap (points) across 20 models", HEX.ice);
  s.addText("The weights didn't change. Only the software around the model did.", body({ x: 0.6, y: 5.2, w: 12, h: 0.6, fontSize: 22, italic: true, color: HEX.navy, fontFace: "Cambria" }));
  s.addText("Source: Guo et al. (2026), arXiv:2606.20683, Sec. 7.4", body({ x: 0.6, y: 6.2, w: 8, h: 0.3, fontSize: 11, color: "8A8984" }));
  notes(s, i++);

  // 3 The paper
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Introduction" });
  T(s, "The anchor survey");
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.5, w: 6.6, h: 4.9, fill: { color: HEX.pale }, line: { color: HEX.line }, rectRadius: 0.12 });
  s.addText("From Question Answering to Task Completion: A Survey on Agent System and Harness Design", body({ x: 0.95, y: 1.8, w: 6.0, h: 1.4, fontSize: 20, bold: true, color: HEX.navy, fontFace: "Cambria" }));
  s.addText([
    { text: "Jianyuan Guo, Chang Xu, Yunhe Wang et al.", options: { breakLine: true, bold: true } },
    { text: "City University of Hong Kong · University of Sydney · Peking University · TokenRhythm Technologies", options: { breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "arXiv:2606.20683 · June 2026 · cs.AI", options: { breakLine: true } },
    { text: "Paper list: github.com/ggjy/Awesome-Agent-Engineering" },
  ], body({ x: 0.95, y: 3.35, w: 6.0, h: 2.8, fontSize: 15 }));
  s.addText("Today's route", body({ x: 7.8, y: 1.55, w: 5, h: 0.5, fontSize: 20, bold: true, color: HEX.navy, fontFace: "Cambria" }));
  const route = ["Model vs. harness", "Taxonomy: four paradigms", "Architecture: six components", "Evidence from 3 leaderboards", "Companion surveys", "Open challenges", "My two cents"];
  route.forEach((r, k) => {
    const y = 2.2 + k * 0.6;
    s.addShape(pres.shapes.OVAL, { x: 7.8, y, w: 0.42, h: 0.42, fill: { color: k === 0 ? HEX.navy : HEX.blue }, line: { color: HEX.blue } });
    s.addText(String(k + 1), body({ x: 7.8, y, w: 0.42, h: 0.42, align: "center", valign: "middle", color: "FFFFFF", fontSize: 13, bold: true }));
    s.addText(r, body({ x: 8.4, y, w: 4.4, h: 0.42, valign: "middle", fontSize: 16, color: "0B0B0B" }));
  });
  notes(s, i++);

  // 4 Model vs harness
  pres.addSection({ title: "Taxonomy" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Taxonomy" });
  T(s, "Every agent is a model plus a harness");
  const brain = await icon(fa.FaBrain, "FFFFFF"), cogs = await icon(fa.FaCogs, "FFFFFF");
  const card = (x, ic, head, lines, dark) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.55, w: 5.9, h: 4.1, fill: { color: dark ? HEX.navy : HEX.pale }, line: { color: dark ? HEX.navy : HEX.line }, rectRadius: 0.12 });
    s.addShape(pres.shapes.OVAL, { x: x + 0.4, y: 1.9, w: 0.85, h: 0.85, fill: { color: HEX.blue }, line: { color: HEX.blue } });
    s.addImage({ data: ic, x: x + 0.6, y: 2.1, w: 0.45, h: 0.45, altText: head + " icon" });
    s.addText(head, body({ x: x + 1.45, y: 1.95, w: 4.2, h: 0.75, fontSize: 24, bold: true, valign: "middle", color: dark ? "FFFFFF" : HEX.navy, fontFace: "Cambria" }));
    s.addText(lines.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < lines.length - 1 } })),
      body({ x: x + 0.45, y: 3.05, w: 5.1, h: 2.4, fontSize: 16, color: dark ? "E2EDFB" : HEX.ink2, paraSpaceAfter: 8 }));
  };
  card(0.6, brain, "Foundation model", ["The “cognitive engine”", "Reads an observation, proposes the next action", "Improved by pre-training and post-training"], false);
  card(6.83, cogs, "Execution harness", ["Everything else at runtime", "What the model sees, which tools it can call, what it remembers", "How the loop runs and what gets checked before acting"], true);
  s.addText("Analogy: the model is the driver; the harness is the car, the dashboard, the brakes and the GPS.", body({ x: 0.6, y: 6.0, w: 12, h: 0.5, fontSize: 17, italic: true, color: HEX.navy }));
  notes(s, i++);

  // 5 Measurement boundary
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Taxonomy" });
  T(s, "Static tests no longer separate frontier models");
  const cols = [
    ["Question answering", "MMLU-Pro, GPQA Diamond", "Frontier GPT, Claude and Gemini models cluster in a narrow, high band, so these tests barely discriminate", HEX.pale, HEX.navy],
    ["Task completion", "SWE-bench, Terminal-Bench, WebArena, OSWorld", "Multi-step work in live environments; scores still spread widely, and much of the spread is the harness", HEX.navy, "FFFFFF"],
  ];
  cols.forEach(([h, ex, d, bg, fg], k) => {
    const x = 0.6 + k * 6.23;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.6, w: 5.9, h: 3.9, fill: { color: bg }, line: { color: k ? HEX.navy : HEX.line }, rectRadius: 0.12 });
    s.addText(h, body({ x: x + 0.4, y: 1.9, w: 5.1, h: 0.6, fontSize: 24, bold: true, color: fg, fontFace: "Cambria" }));
    s.addText(ex, body({ x: x + 0.4, y: 2.6, w: 5.1, h: 0.5, fontSize: 15, bold: true, color: k ? "9EC5F4" : HEX.blue }));
    s.addText(d, body({ x: x + 0.4, y: 3.25, w: 5.1, h: 2.0, fontSize: 17, color: k ? "E2EDFB" : HEX.ink2 }));
  });
  s.addShape(pres.shapes.RIGHT_ARROW, { x: 6.2, y: 3.2, w: 0.9, h: 0.6, fill: { color: HEX.blue }, line: { color: HEX.blue } });
  s.addText("The survey calls this the measurement boundary of model-centric scaling (Sec. 3.2).", body({ x: 0.6, y: 5.9, w: 12, h: 0.5, fontSize: 16, italic: true, color: HEX.navy }));
  notes(s, i++);

  // 6 Four paradigms (figure)
  const figSlide = async (title, file, alt, caption, sec) => {
    const sl = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
    sl.addText(title, { placeholder: "title" });
    const f = await fit(path.join(FIG, file), 0.6, 1.3, 12.1, caption ? 5.0 : 5.55);
    sl.addImage(Object.assign(f, { altText: alt }));
    if (caption) sl.addText(caption, body({ x: 0.6, y: 6.4, w: 12.1, h: 0.45, fontSize: 15, italic: true, color: HEX.navy }));
    return sl;
  };
  s = await figSlide("Taxonomy: four paradigms of agent engineering", "fig1_four_paradigms.png", "Four paradigms: prompt, context, harness, agent-native training", null, "Taxonomy");
  notes(s, i++);

  // 7 self-evolving split
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Taxonomy" });
  T(s, "“Self-evolving” is really three questions");
  const three = [
    ["WHO", "does each role?", "Multi-model harness", "Route planning, coding and verifying to different models", "Magentic-One · OpenHands"],
    ["HOW", "is the policy optimized?", "Learnable harness", "Treat the harness itself as something to search or edit", "NLAH · Meta-Harness · AHE"],
    ["WHEN", "does everything update?", "Co-evolution", "Model and harness improve together from execution traces", "Darwin Gödel Machine · SICA"],
  ];
  three.forEach(([w, q, name, d, ex], k) => {
    const x = 0.6 + k * 4.15;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.55, w: 3.85, h: 4.9, fill: { color: k === 2 ? HEX.navy : HEX.pale }, line: { color: k === 2 ? HEX.navy : HEX.line }, rectRadius: 0.12 });
    const fg = k === 2 ? "FFFFFF" : HEX.navy, sub = k === 2 ? "E2EDFB" : HEX.ink2;
    s.addText(w, body({ x: x + 0.35, y: 1.85, w: 3.2, h: 0.9, fontSize: 44, bold: true, color: k === 2 ? "86B6EF" : HEX.blue, fontFace: "Cambria" }));
    s.addText(q, body({ x: x + 0.35, y: 2.75, w: 3.2, h: 0.5, fontSize: 17, color: fg }));
    s.addText(name, body({ x: x + 0.35, y: 3.4, w: 3.2, h: 0.5, fontSize: 20, bold: true, color: fg, fontFace: "Cambria" }));
    s.addText(d, body({ x: x + 0.35, y: 4.0, w: 3.2, h: 1.2, fontSize: 15, color: sub }));
    s.addText(ex, body({ x: x + 0.35, y: 5.45, w: 3.2, h: 0.7, fontSize: 13, italic: true, color: k === 2 ? "9EC5F4" : HEX.blue }));
  });
  notes(s, i++);

  // 8 anatomy figure
  pres.addSection({ title: "Architecture" });
  s = await figSlide("Architecture: six coupled runtime components", "fig2_harness_anatomy.png", "Harness anatomy: observation, context, loop, action, state, verification around the model", null, "Architecture");
  notes(s, i++);

  // 9 trade-off table
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Architecture" });
  T(s, "Six components, six built-in trade-offs");
  const hdr = (t) => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: HEX.navy }, fontSize: 14 } });
  const rows = [
    [hdr("Component"), hdr("Job"), hdr("Trade-off"), hdr("Representative work")],
    ["Observation (I_obs)", "Raw signals into model-readable views", "Richness vs. cost and distractors", "SWE-agent interface, OSWorld"],
    ["Context (C)", "What enters each call, when, in what form", "Fidelity vs. manageability", "RAG, MemGPT"],
    ["Control loop (L)", "Observe-reason-act cycle, retries, stopping", "Adaptability vs. stability", "ReAct, Meta-Harness"],
    ["Action (I_act)", "Output into tool calls, shell, browser", "Flexibility vs. controllability", "Function calling, MCP"],
    ["State (S)", "Plans, checkpoints, memory, logs", "Completeness vs. usability", "Checkpoint stores, LoCoMo"],
    ["Verification (V)", "Tests, verifiers, sandbox, rollback", "Autonomy vs. robustness", "Test-driven repair loops"],
  ].map((r, k) => k === 0 ? r : r.map((c, j) => ({ text: c, options: { bold: j === 0, color: j === 0 ? HEX.navy : "333333", fill: { color: k % 2 ? HEX.pale : "FFFFFF" }, fontSize: 14 } })));
  s.addTable(rows, { x: 0.6, y: 1.5, w: 12.1, colW: [2.6, 3.7, 3.0, 2.8], fontFace: "Calibri", border: { type: "solid", color: "DDE6F3", pt: 0.75 }, rowH: 0.62, valign: "middle", margin: 0.08 });
  s.addText("My use: when an agent fails, ask which of the six broke, before asking for a bigger model.", body({ x: 0.6, y: 6.2, w: 12, h: 0.45, fontSize: 16, italic: true, color: HEX.navy }));
  notes(s, i++);

  // 10-12 evidence figures
  pres.addSection({ title: "Evidence" });
  s = await figSlide("Evidence 1: SWE-bench Verified", "fig3_swebench_same_model.png", "Dumbbell chart of SWE-bench scores per model across harnesses",
    "Agentless is a fixed pipeline, not a loop: when tests give a clear verdict, structure can beat open-ended autonomy.", "Evidence");
  notes(s, i++);
  s = await figSlide("Evidence 2: Terminal-Bench 2.0", "fig4_terminalbench_spread.png", "Dumbbell chart of Terminal-Bench harness spread per model",
    "75 submissions, 32,604 trials. 14 of 20 models vary by 10+ points across harnesses.", "Evidence");
  notes(s, i++);
  s = await figSlide("Evidence 3: WebArena", "fig5_webarena_lift.png", "Dumbbell chart of WebArena model-only vs best harness",
    "Rankings inside one fixed harness (BrowserGym) differ again: “better model” only holds for a given harness.", "Evidence");
  notes(s, i++);

  // 13 simple wins / models matter
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Evidence" });
  T(s, "Simple harnesses can win, and models still matter");
  const pair = (x, head, a, al, b, bl, foot) => {
    s.addText(head, body({ x, y: 1.5, w: 5.9, h: 0.5, fontSize: 20, bold: true, color: HEX.navy, fontFace: "Cambria" }));
    [[a, al, HEX.ice, HEX.navy], [b, bl, HEX.navy, "FFFFFF"]].forEach(([v, l, bg, fg], k) => {
      const yy = 2.15 + k * 1.75;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: yy, w: 5.9, h: 1.55, fill: { color: bg }, line: { color: bg }, rectRadius: 0.12 });
      s.addText(v, body({ x: x + 0.3, y: yy + 0.15, w: 2.2, h: 1.25, fontSize: 40, bold: true, valign: "middle", color: fg, fontFace: "Cambria" }));
      s.addText(l, body({ x: x + 2.55, y: yy + 0.15, w: 3.15, h: 1.25, fontSize: 15, valign: "middle", color: k ? "E2EDFB" : HEX.ink2 }));
    });
    s.addText(foot, body({ x, y: 5.8, w: 5.9, h: 0.8, fontSize: 15, italic: true, color: HEX.navy }));
  };
  pair(0.6, "Small and clean beats big", "76.8%", "mini-SWE-agent (~100 lines of Python) + Claude Opus 4.5", "77.6%", "OpenHands + CodeAct 2.1, a far larger framework",
    "Interface design matters more than feature count.");
  pair(6.83, "Upgrade the model, keep the harness", "49.0%", "SWE-agent + tools with Claude 3.5 Sonnet", "73.2%", "Same harness with Claude Opus 4",
    "Model and harness interact; neither alone explains the score.");
  notes(s, i++);

  // 14 cost
  s = await figSlide("Accuracy has a token bill", "fig6_cost_vs_score.png", "Scatter of Terminal-Bench score vs median input tokens",
    "Only ~15% of trials report dollar cost, so the survey avoids cost rankings; the direction is still clear.", "Evidence");
  notes(s, i++);

  // 15 cheat sheet
  pres.addSection({ title: "Beyond" });
  s = await figSlide("Matching the harness to the task", "fig8_harness_cheatsheet.png", "Cheat-sheet mapping task properties to harness components", null, "Beyond");
  notes(s, i++);

  // 16 companion map
  s = await figSlide("Four companion surveys that zoom in", "fig7_survey_map.png", "Map of anchor survey and four companion surveys", null, "Beyond");
  notes(s, i++);

  // 17 open challenges
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Beyond" });
  T(s, "Open challenges named by the survey");
  const ch = [
    ["Value-aware evaluation", "Report cost per effective success and P95 latency next to accuracy"],
    ["Learning to verify and recover", "Train self-checking; keep updates only if they pass held-out, regression and safety tests"],
    ["Safe co-evolution", "Guard against benchmark overfitting, stale memory and unsafe self-modification"],
    ["Generalization vs. specialization", "Shared base (logs, permissions, cost) plus domain adapters; MCP and A2A are not enough alone"],
    ["Measurement quality", "Brittle checkers and leaky environments; prefer audited variants like WebArena Verified"],
  ];
  ch.forEach(([h, d], k) => {
    const y = 1.5 + k * 1.02;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.1, w: 0.62, h: 0.62, fill: { color: k % 2 ? HEX.blue : HEX.navy }, line: { color: HEX.blue } });
    s.addText(String(k + 1), body({ x: 0.6, y: y + 0.1, w: 0.62, h: 0.62, align: "center", valign: "middle", color: "FFFFFF", fontSize: 18, bold: true }));
    s.addText(h, body({ x: 1.5, y: y + 0.02, w: 11.2, h: 0.4, fontSize: 19, bold: true, color: HEX.navy, fontFace: "Cambria" }));
    s.addText(d, body({ x: 1.5, y: y + 0.45, w: 11.2, h: 0.4, fontSize: 15 }));
  });
  notes(s, i++);

  // 18 two cents
  pres.addSection({ title: "Conclusion" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Conclusion" });
  T(s, "My two cents");
  const col2 = (x, head, items, dark) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.5, w: 5.9, h: 4.6, fill: { color: dark ? HEX.navy : HEX.pale }, line: { color: dark ? HEX.navy : HEX.line }, rectRadius: 0.12 });
    s.addText(head, body({ x: x + 0.4, y: 1.75, w: 5.1, h: 0.55, fontSize: 22, bold: true, color: dark ? "FFFFFF" : HEX.navy, fontFace: "Cambria" }));
    s.addText(items.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < items.length - 1 } })),
      body({ x: x + 0.4, y: 2.5, w: 5.1, h: 3.8, fontSize: 16, color: dark ? "E2EDFB" : HEX.ink2, paraSpaceAfter: 12 }));
  };
  col2(0.6, "What it gets right", [
    "The six-component tuple is the clearest mental model of an agent runtime I've read",
    "Honest about evidence: labels leaderboard comparisons as observational",
    "Splits “self-evolving” into who / how / when",
  ], false);
  col2(6.83, "Where I'd push back", [
    "Harness vs. compute isn't separated: big gains often come with ~10x tokens; I'd want equal-budget runs",
    "Safety gets less room than capability; MCP and memory attack surfaces grow with write access",
    "Co-evolution is hard to evaluate honestly: it can overfit the benchmark that measures it",
  ], true);
  notes(s, i++);

  // 19 takeaways
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Conclusion" });
  T(s, "Takeaways if you build agents");
  const tk = [
    [fa.FaPencilRuler, "Fix the interface before buying a bigger model", "mini-SWE-agent: ~100 lines, within 1 point of OpenHands"],
    [fa.FaStream, "Log everything", "Traces tell you which of the six components failed"],
    [fa.FaBalanceScale, "Report accuracy with cost", "+13 points at ~10x tokens may not fit a production budget"],
    [fa.FaCheckDouble, "Use the strongest oracle available", "Make the task testable, then let the loop retry against tests"],
  ];
  for (let k = 0; k < tk.length; k++) {
    const [ic, h, d] = tk[k];
    const x = 0.6 + (k % 2) * 6.23, y = 1.55 + Math.floor(k / 2) * 2.7;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.9, h: 2.4, fill: { color: HEX.pale }, line: { color: HEX.line }, rectRadius: 0.12 });
    s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: y + 0.4, w: 0.85, h: 0.85, fill: { color: HEX.blue }, line: { color: HEX.blue } });
    s.addImage({ data: await icon(ic, "FFFFFF"), x: x + 0.55, y: y + 0.6, w: 0.45, h: 0.45, altText: h + " icon" });
    s.addText(h, body({ x: x + 1.45, y: y + 0.35, w: 4.25, h: 0.85, fontSize: 19, bold: true, color: HEX.navy, fontFace: "Cambria", valign: "middle" }));
    s.addText(d, body({ x: x + 1.45, y: y + 1.3, w: 4.25, h: 0.85, fontSize: 16 }));
  }
  notes(s, i++);

  // 20 thanks
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "Conclusion" });
  s.addText("A modern agent's score is really a score for the model in its harness", { placeholder: "title" });
  s.addText([
    { text: "References", options: { bold: true, color: "FFFFFF", breakLine: true } },
    { text: "Guo et al. (2026). Survey on Agent System and Harness Design. arXiv:2606.20683", options: { breakLine: true } },
    { text: "Ning et al. (2026). Code as Agent Harness. arXiv:2605.18747", options: { breakLine: true } },
    { text: "Ge et al. (2026). SE for LLM-Based Agents: A Lifecycle-Oriented Survey. arXiv:2611.23260", options: { breakLine: true } },
    { text: "Wang et al. (2026). Log Analysis for LLM-Based Agents. arXiv:2611.23281", options: { breakLine: true } },
    { text: "Yehudai et al. (2026). A Survey on Evaluation of LLM-Based Agents. Findings of ACL 2026" },
  ], body({ x: 0.7, y: 3.7, w: 11.8, h: 2.6, fontSize: 15, color: "CDE2FB", paraSpaceAfter: 4 }));
  s.addText("Thank you · Abhishek Darji · San José State University", body({ x: 0.7, y: 6.6, w: 11, h: 0.4, fontSize: 15, color: "86B6EF" }));
  notes(s, i++);

  if (i !== NOTES.length) throw new Error(`notes mismatch ${i} vs ${NOTES.length}`);
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
