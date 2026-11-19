"""Original figures for the 'Agent Harness' short story.
Data: Guo et al., 'From Question Answering to Task Completion: A Survey on Agent
System and Harness Design' (arXiv:2606.20683), Sec. 7 (public leaderboard data).
"""
import sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from matplotlib import font_manager as fm

OUT = sys.argv[1]

for f in fm.findSystemFonts():
    if "Inter" in f:
        fm.fontManager.addfont(f)
plt.rcParams.update({
    "font.family": "Inter", "font.size": 12,
    "axes.edgecolor": "#c9c8c3", "axes.labelcolor": "#52514e",
    "xtick.color": "#52514e", "ytick.color": "#52514e",
    "axes.spines.top": False, "axes.spines.right": False,
    "figure.facecolor": "#fcfcfb", "axes.facecolor": "#fcfcfb",
    "savefig.facecolor": "#fcfcfb",
})
INK, INK2, MUTED, GRID = "#0b0b0b", "#52514e", "#8a8984", "#e8e7e3"
BLUE, ORANGE, AQUA = "#2a78d6", "#eb6834", "#1baf7a"
BLUE_L, ORANGE_L, AQUA_L = "#cde2fb", "#fbe0d4", "#d2f0e4"
NEUTRAL_L = "#efeeea"


def save(fig, name):
    fig.savefig(f"{OUT}/{name}", dpi=200, bbox_inches="tight", pad_inches=0.3)
    plt.close(fig)


def box(ax, x, y, w, h, fc, ec=None, r=0.02, lw=0):
    p = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0,rounding_size={r}",
                       fc=fc, ec=ec or fc, lw=lw)
    ax.add_patch(p)
    return p


def arrow(ax, a, b, color=MUTED, lw=1.6, style="-|>", rad=0.0):
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle=style, mutation_scale=14,
                                 color=color, lw=lw,
                                 connectionstyle=f"arc3,rad={rad}"))


def title(fig, t, sub=None, src=None):
    fig.text(0.02, 0.98, t, fontsize=17, weight="bold", color=INK, va="top")
    if sub:
        fig.text(0.02, 0.925, sub, fontsize=11.5, color=INK2, va="top")
    if src:
        fig.text(0.02, 0.005, src, fontsize=8.5, color=MUTED, va="bottom")


SRC = ("Source: public leaderboard data compiled in Guo et al. (2026), arXiv:2606.20683, Sec. 7. "
       "Observational, not controlled ablations. Chart: Abhishek Darji.")

# ---------------------------------------------------------------- 1 paradigms
def fig_paradigms():
    fig = plt.figure(figsize=(13, 6.2))
    ax = fig.add_axes([0, 0.06, 1, 0.78]); ax.set_xlim(0, 4); ax.set_ylim(0, 1); ax.axis("off")
    cols = [
        ("1  Prompt engineering", "Optimise the single instruction",
         "CoT · self-consistency · ToT\nReAct · Reflexion",
         "Can't supply missing knowledge\nor recover over long runs"),
        ("2  Workflows & context", "Optimise what enters the window",
         "RAG · GraphRAG · HippoRAG\nACON · ContextBudget · ACE",
         "Still feed-forward: no drift\ndetection, no outcome checks"),
        ("3  Harness engineering", "Optimise the runtime loop",
         "SWE-agent ACI · OpenHands\nMagentic-One · Meta-Harness",
         "Hand-built; reliability still\nbelow deployment needs"),
        ("4  Agent-native training", "Train the loop into weights,\nco-evolve model + harness",
         "DeepSeek-R1 · WebRL · DAPO\nDarwin Gödel Machine · SICA",
         "Overfitting, stale memory,\nunsafe self-modification"),
    ]
    shades = ["#e2edfb", "#cde2fb", "#9ec5f4", "#6da7ec"]
    for i, (h, focus, ex, limit) in enumerate(cols):
        x = i + 0.06; w = 0.86
        box(ax, x, 0.05, w, 0.9, NEUTRAL_L, r=0.04)
        box(ax, x, 0.78, w, 0.17, shades[i], r=0.04)
        ax.text(x + 0.04, 0.865, h, fontsize=13.5, weight="bold", color=INK, va="center")
        ax.text(x + 0.04, 0.72, "Locus of effort", fontsize=9, color=MUTED, va="top")
        ax.text(x + 0.04, 0.67, focus, fontsize=11.5, color=INK, va="top", weight="semibold")
        ax.text(x + 0.04, 0.50, "Representative work", fontsize=9, color=MUTED, va="top")
        ax.text(x + 0.04, 0.45, ex, fontsize=10.5, color=INK2, va="top", linespacing=1.5)
        ax.text(x + 0.04, 0.27, "What it can't fix", fontsize=9, color=MUTED, va="top")
        ax.text(x + 0.04, 0.22, limit, fontsize=10.5, color=INK2, va="top", linespacing=1.5)
        if i < 3:
            arrow(ax, (x + w + 0.005, 0.865), (x + w + 0.13, 0.865), color=INK2, lw=2)
    title(fig, "Four paradigms of agent engineering",
          "The engineering effort migrates outward, from the prompt to the runtime to training. All four coexist today.",
          "Adapted from the paradigm framing in Guo et al. (2026), arXiv:2606.20683, Sec. 4 / Fig. 5. Redrawn by Abhishek Darji.")
    save(fig, "fig1_four_paradigms.png")

# ---------------------------------------------------------------- 2 anatomy
def fig_anatomy():
    fig = plt.figure(figsize=(13, 7.6))
    ax = fig.add_axes([0, 0.04, 1, 0.84]); ax.set_xlim(0, 13); ax.set_ylim(0, 7.6); ax.axis("off")
    # environment
    box(ax, 0.3, 0.6, 2.3, 6.2, NEUTRAL_L, r=0.15)
    ax.text(1.45, 6.4, "Environment", ha="center", fontsize=13, weight="bold", color=INK)
    ax.text(1.45, 3.7, "repo · terminal\nbrowser · DOM\nAPIs · GUI\nfiles · users",
            ha="center", va="center", fontsize=10.5, color=INK2, linespacing=1.7)
    # harness frame
    box(ax, 3.1, 0.3, 9.6, 6.8, "#f4f8fe", ec="#9ec5f4", lw=1.4, r=0.2)
    ax.text(3.35, 6.75, "Execution harness  H = <I_obs, C, L, I_act, S, V>",
            fontsize=12.5, weight="bold", color="#1c5cab")
    # model
    X1, X2, X3, W, H = 3.35, 6.45, 9.55, 2.8, 1.3
    box(ax, X2, 2.9, W, H, BLUE, r=0.15)
    ax.text(X2 + W/2, 3.72, "Foundation model", ha="center", color="white", fontsize=12.5, weight="bold")
    ax.text(X2 + W/2, 3.27, "reasons & proposes actions", ha="center", color="white", fontsize=9.5)
    comps = {
        "I_obs": (X1, 5.0, "Observation interface", "raw signals → usable views\n(diffs, screenshots, logs)"),
        "C": (X2, 5.0, "Context manager", "what enters each call, when,\nin what form"),
        "L": (X3, 5.0, "Control loop", "observe-reason-act cycle,\nretries, routing, stop rules"),
        "S": (X1, 2.9, "State & artifacts", "checkpoints, plans, memory,\nlogs beyond the window"),
        "V": (X2, 0.8, "Verification & governance", "tests, verifiers, sandbox,\npermissions, rollback"),
        "I_act": (X3, 0.8, "Action interface", "function calls · MCP tools\nshell · browser · sub-agents"),
    }
    for k, (x, y, name, desc) in comps.items():
        box(ax, x, y, W, H, "white", ec="#86b6ef", lw=1.2, r=0.12)
        ax.text(x + 0.15, y + H - 0.28, name, fontsize=11, weight="bold", color=INK)
        ax.text(x + W - 0.15, y + H - 0.28, k, fontsize=10, color="#1c5cab", ha="right", style="italic")
        ax.text(x + 0.15, y + H - 0.55, desc, fontsize=9.3, color=INK2, va="top", linespacing=1.4)
    arrow(ax, (2.6, 5.65), (X1, 5.65), color=INK2)
    arrow(ax, (X1 + W, 5.65), (X2, 5.65), color=MUTED)
    arrow(ax, (X2 + W/2, 5.0), (X2 + W/2, 4.2), color=MUTED)
    arrow(ax, (X2 + W, 3.9), (X3 + 0.7, 5.0), color=MUTED)
    arrow(ax, (X3 + 1.9, 5.0), (X3 + 1.9, 2.1), color=MUTED)
    arrow(ax, (X3, 1.45), (X2 + W, 1.45), color=MUTED)
    arrow(ax, (X2, 1.45), (2.6, 1.45), color=INK2)
    arrow(ax, (X1 + W, 3.55), (X2, 3.55), color=MUTED, style="<|-|>")
    ax.text(2.68, 5.78, "signals", fontsize=8.5, color=MUTED)
    ax.text(2.68, 1.58, "checked actions", fontsize=8.5, color=MUTED)
    title(fig, "Anatomy of an execution harness",
          "Six coupled runtime responsibilities wrap the model. Tuning any one shifts the others.",
          "Adapted from the implementation view in Guo et al. (2026), arXiv:2606.20683, Sec. 2.2 & 5 / Fig. 3. Redrawn by Abhishek Darji.")
    save(fig, "fig2_harness_anatomy.png")

# ---------------------------------------------------------------- dumbbell helper
def dumbbell(rows, fname, ttl, sub, xlabel, lo_name, hi_name, xmax=100, note=None, lo_color=MUTED,
             hi_color=BLUE, label_ends=True):
    n = len(rows)
    H = 0.75 * n + 2.6
    fig = plt.figure(figsize=(12, H))
    ax = fig.add_axes([0.25, 1.05 / H, 0.70, (0.75 * n) / H])
    for i, r in enumerate(rows):
        y = n - 1 - i
        model, lo, hi = r[0], r[1], r[2]
        ax.plot([lo, hi], [y, y], color="#c9c8c3", lw=3, solid_capstyle="round", zorder=1)
        ax.scatter([lo], [y], s=110, color=lo_color, zorder=3, edgecolor="#fcfcfb", linewidth=2)
        ax.scatter([hi], [y], s=110, color=hi_color, zorder=3, edgecolor="#fcfcfb", linewidth=2)
        if label_ends and len(r) > 3:
            if r[3]:
                ax.text(lo - 1.2, y + 0.26, f"{r[3]}  {lo:.1f}", ha="right", va="center", fontsize=9.5,
                        color=INK2)
            else:
                ax.text(lo, y + 0.3, f"{lo:.1f}", ha="center", va="center", fontsize=9.5, color=INK2)
            ax.text(hi + 1.2, y + 0.26, f"{hi:.1f}  {r[4]}", ha="left", va="center", fontsize=9.5,
                    color=INK)
        ax.text(hi + 1.2, y - 0.2, f"+{hi - lo:.1f} pts", ha="left", va="center", fontsize=9.5,
                color=MUTED)
        ax.text(-2, y, model, ha="right", va="center", fontsize=11.5, color=INK, weight="semibold",
                transform=ax.transData, clip_on=False)
    ax.set_yticks([]); ax.spines["left"].set_visible(False)
    ax.set_xlim(0, xmax); ax.set_ylim(-0.7, n - 0.3)
    ax.grid(axis="x", color=GRID, lw=0.8); ax.set_axisbelow(True)
    ax.set_xlabel(xlabel, fontsize=10.5)
    # legend
    ly = (1.05 + 0.75 * n + 0.35) / H
    fig.text(0.25, ly, "●", color=lo_color, fontsize=13, va="center")
    fig.text(0.265, ly, lo_name, color=INK2, fontsize=10.5, va="center")
    fig.text(0.47, ly, "●", color=hi_color, fontsize=13, va="center")
    fig.text(0.485, ly, hi_name, color=INK2, fontsize=10.5, va="center")
    title(fig, ttl, sub, SRC + (f"  {note}" if note else ""))
    save(fig, fname)


def fig_swebench():
    rows = [
        ("Claude Opus 4 / 4.5*", 73.2, 77.6, "SWE-agent+tools", "OpenHands+CodeAct 2.1"),
        ("Claude 3.5 Sonnet", 33.6, 53.6, "SWE-agent", "PatchPilot"),
        ("GPT-4o", 23.2, 38.8, "SWE-agent", "Agentless"),
    ]
    dumbbell(rows, "fig3_swebench_same_model.png",
             "Same model, different harness: SWE-bench Verified",
             "% of real GitHub issues resolved. Only the scaffold around the model changes.",
             "% resolved (SWE-bench Verified)", "Weakest harness reported", "Strongest harness reported",
             xmax=100, note="*Opus 4 (SWE-agent+tools) vs Opus 4.5 (OpenHands), grouped as in the survey.")


def fig_terminal():
    rows = [
        ("Gemini 3.1 Pro", 59.4, 80.2, "Gemini CLI", "TongAgents"),
        ("Claude Opus 4.6", 58.0, 76.4, "Claude Code", "Meta-Harness"),
        ("GPT-5.3-Codex", 64.7, 78.4, "Terminus 2", "SageAgent"),
        ("GPT-5", 33.9, 49.6, "Mini-SWE-Agent", "Codex CLI"),
    ]
    dumbbell(rows, "fig4_terminalbench_spread.png",
             "Harness spread on Terminal-Bench 2.0",
             "Across 20 models with 3+ harness results, the median within-model range is 13.6 points.",
             "Task success (%)", "Lowest-scoring harness", "Highest-scoring harness", xmax=100)


def fig_webarena():
    rows = [
        ("GPT-4o", 13.1, 54.6, "", "WebOperator"),
        ("Llama-3.1-8B", 5.6, 48.5, "", "best harness"),
        ("GPT-4 Turbo", 16.5, 45.7, "", "AgentOccam"),
        ("R1-Distill-Llama-8B", 8.5, 43.6, "", "AgentSymbiotic"),
        ("GPT-4", 14.9, 33.0, "", "SteP"),
        ("GPT-3.5", 8.9, 29.1, "", "WebPilot"),
        ("Llama-3.2-1B", 2.4, 24.1, "", "best harness"),
    ]
    dumbbell(rows, "fig5_webarena_lift.png",
             "WebArena: what a harness adds on top of the bare model",
             "Task success on self-hosted websites. Harnessed Llama-3.1-8B (48.5%) scores over 3x bare GPT-4o (13.1%).",
             "Task success (%)", "Model with minimal scaffold", "Best reported harness", xmax=75)


# ---------------------------------------------------------------- 6 cost
def fig_cost():
    pts = [  # model, harness, tokens(K), score
        ("GPT-5.3-Codex", "Terminus 2", 58.4, 64.7),
        ("GPT-5.3-Codex", "Mux", 238.7, 74.6),
        ("Claude Opus 4.6", "Terminus 2", 79.4, 62.9),
        ("Claude Opus 4.6", "Meta-Harness", 755.0, 76.4),
        ("Gemini 3.1 Pro", "Terminus-KIRA", 257.5, 74.8),
    ]
    colors = {"GPT-5.3-Codex": BLUE, "Claude Opus 4.6": ORANGE, "Gemini 3.1 Pro": AQUA}
    fig = plt.figure(figsize=(11.5, 6.4))
    ax = fig.add_axes([0.09, 0.13, 0.86, 0.66])
    ax.set_xscale("log")
    for m in ["GPT-5.3-Codex", "Claude Opus 4.6"]:
        p = [q for q in pts if q[0] == m]
        ax.annotate("", xy=(p[1][2], p[1][3]), xytext=(p[0][2], p[0][3]),
                    arrowprops=dict(arrowstyle="-|>", color=colors[m], lw=1.6, alpha=0.6,
                                    shrinkA=8, shrinkB=8))
    place = {  # (x factor, y offset, ha)
        "Terminus 2|GPT-5.3-Codex": (1.0, 1.9, "center"),
        "Terminus 2|Claude Opus 4.6": (1.1, -0.6, "left"),
        "Mux|GPT-5.3-Codex": (0.9, -1.0, "right"),
        "Terminus-KIRA|Gemini 3.1 Pro": (1.08, 2.1, "left"),
        "Meta-Harness|Claude Opus 4.6": (1.0, 2.3, "center"),
    }
    for m, h, t, s in pts:
        ax.scatter(t, s, s=150, color=colors[m], edgecolor="#fcfcfb", linewidth=2, zorder=3)
        fx, dy, ha = place[f"{h}|{m}"]
        ax.text(t * fx, s + dy, f"{m} + {h}", fontsize=9.8, color=INK, va="bottom", ha=ha)
        ax.text(t * fx, s + dy - 0.15, f"{s:.1f}% · {t:.0f}K tokens", fontsize=9, color=INK2, va="top", ha=ha)
    ax.set_xlim(35, 2000); ax.set_ylim(58, 81)
    ax.set_xticks([50, 100, 250, 500, 1000]); ax.set_xticklabels(["50K", "100K", "250K", "500K", "1M"])
    ax.grid(color=GRID, lw=0.8); ax.set_axisbelow(True)
    ax.set_xlabel("Median input tokens per task (log scale)")
    ax.set_ylabel("Terminal-Bench 2.0 success (%)")
    x0 = 0.09
    for m, c in colors.items():
        fig.text(x0, 0.83, "●", color=c, fontsize=13, va="center")
        fig.text(x0 + 0.017, 0.83, m, color=INK2, fontsize=10.5, va="center")
        x0 += 0.2
    title(fig, "Accuracy is not free: the token bill behind harness gains",
          "Opus 4.6 gains +13.5 pts with Meta-Harness, at roughly 9.5x the median input context.",
          SRC.replace("Sec. 7.", "Sec. 7, Table 8."))
    save(fig, "fig6_cost_vs_score.png")


# ---------------------------------------------------------------- 7 survey map
def fig_map():
    fig = plt.figure(figsize=(13, 6.6))
    ax = fig.add_axes([0, 0.05, 1, 0.82]); ax.set_xlim(0, 13); ax.set_ylim(0, 6.6); ax.axis("off")
    box(ax, 4.4, 2.35, 4.2, 1.9, BLUE, r=0.18)
    ax.text(6.5, 3.75, "Agent System & Harness Design", ha="center", color="white", fontsize=12.5,
            weight="bold")
    ax.text(6.5, 3.4, "Guo et al. · CityU HK, U. Sydney, PKU", ha="center", color="white", fontsize=9.5)
    ax.text(6.5, 3.05, "arXiv 2606.20683 · Jun 2026", ha="center", color="white", fontsize=9.5)
    ax.text(6.5, 2.6, "ANCHOR: paradigms · anatomy · evidence", ha="center", color="white",
            fontsize=8.8, weight="semibold")
    sats = [
        (0.3, 4.55, "Code as Agent Harness", "Ning et al. · UIUC, Meta, Stanford\narXiv 2605.18747 · May 2026",
         "Code as the substrate for I_act, S, V:\nexecutable, inspectable, stateful", (4.4, 3.9)),
        (8.9, 4.55, "SE for LLM-Based Agents", "Ge et al. · arXiv 2611.23260 · Oct 2026",
         "The harness as software: 5 lifecycle\nstages, requirements → maintenance", (8.6, 3.9)),
        (0.3, 0.35, "Log Analysis for LLM Agents", "Wang et al. · arXiv 2611.23281 · Oct 2026",
         "Traces (S) as evidence for debugging\n& evaluation, 90 core studies", (4.4, 2.7)),
        (8.9, 0.35, "Agent evaluation surveys", "Yehudai et al. · ACL Findings 2026",
         "What to measure beyond task\nsuccess: cost, safety, reliability", (8.6, 2.7)),
    ]
    for x, y, t, who, gist, tgt in sats:
        box(ax, x, y, 3.8, 1.75, "white", ec="#86b6ef", lw=1.2, r=0.14)
        ax.text(x + 0.18, y + 1.45, t, fontsize=11.5, weight="bold", color=INK)
        ax.text(x + 0.18, y + 1.15, who, fontsize=8.6, color=MUTED, va="top", linespacing=1.4)
        ax.text(x + 0.18, y + 0.62, gist, fontsize=9.8, color=INK2, va="top", linespacing=1.4)
        src = (x + 3.8 if x < 4 else x, y + 0.9)
        arrow(ax, src, tgt, color="#86b6ef", lw=1.4, style="-")
    title(fig, "How the surveys in this story fit together",
          "One anchor survey, plus four recent companions that each zoom into part of the harness.",
          "Map by Abhishek Darji.")
    save(fig, "fig7_survey_map.png")


# ---------------------------------------------------------------- 8 my cheat sheet
def fig_cheatsheet():
    fig = plt.figure(figsize=(13, 6.3))
    ax = fig.add_axes([0, 0.03, 1, 0.83]); ax.set_xlim(0, 13); ax.set_ylim(0, 6); ax.axis("off")
    rows = [
        ("Long horizon", "context rot, lost progress", "C + S", "summarise / compact; checkpoint plans to disk"),
        ("Partial observability", "acting on a wrong picture", "I_obs + C", "richer but filtered views; re-observe before acting"),
        ("Strong oracle (tests)", "under-using free feedback", "V + L", "test-driven repair loop; retry on failure"),
        ("Weak oracle (no tests)", "confident wrong answers", "V", "provenance, verifier model, conservative stopping"),
        ("Irreversible actions", "one bad step is fatal", "V + I_act", "sandbox, permission gates, dry-run, rollback"),
        ("High autonomy", "drift, runaway cost", "L + V", "budgets, escalation to a human, audit traces"),
    ]
    hdr = ["Task property", "Failure pressure", "Harness parts to invest in", "Concrete move"]
    xs = [0.3, 3.0, 5.85, 8.1]
    for x, h in zip(xs, hdr):
        ax.text(x, 5.6, h.upper(), fontsize=9, color=MUTED, weight="bold")
    for i, (a, b, c, d) in enumerate(rows):
        y = 4.95 - i * 0.82
        if i % 2 == 0:
            box(ax, 0.15, y - 0.36, 12.7, 0.72, NEUTRAL_L, r=0.08)
        ax.text(xs[0], y, a, fontsize=11.5, weight="semibold", color=INK, va="center")
        ax.text(xs[1], y, b, fontsize=10.5, color=INK2, va="center")
        box(ax, xs[2], y - 0.2, 1.55, 0.4, BLUE_L, r=0.08)
        ax.text(xs[2] + 0.775, y, c, fontsize=10.5, color="#1c5cab", va="center", ha="center",
                weight="bold")
        ax.text(xs[3], y, d, fontsize=10.5, color=INK2, va="center")
    title(fig, "My cheat-sheet: from task property to harness design",
          "Task properties follow the survey's Table 5; the component picks and moves are my own reading.",
          "Based on Guo et al. (2026), arXiv:2606.20683, Sec. 6.3. Interpretation by Abhishek Darji.")
    save(fig, "fig8_harness_cheatsheet.png")


# ---------------------------------------------------------------- cover
def fig_cover():
    fig = plt.figure(figsize=(14, 7))
    ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(0, 14); ax.set_ylim(0, 7); ax.axis("off")
    fig.patch.set_facecolor("#0d366b")
    ax.set_facecolor("#0d366b")
    # rings
    import numpy as np
    for r, a in [(2.9, 0.18), (2.2, 0.3), (1.5, 0.5)]:
        th = np.linspace(0, 2 * np.pi, 300)
        ax.plot(10.4 + r * np.cos(th), 3.5 + r * np.sin(th), color="#6da7ec", lw=2, alpha=a)
    box(ax, 9.55, 3.0, 1.7, 1.0, "#3987e5", r=0.15)
    ax.text(10.4, 3.5, "model", ha="center", va="center", color="white", fontsize=15, weight="bold")
    labels = ["observe", "context", "loop", "act", "state", "verify"]
    for i, l in enumerate(labels):
        a = np.pi / 2 + i * 2 * np.pi / 6
        x, y = 10.4 + 2.2 * np.cos(a), 3.5 + 2.2 * np.sin(a)
        box(ax, x - 0.62, y - 0.24, 1.24, 0.48, "#184f95", ec="#86b6ef", lw=1.2, r=0.1)
        ax.text(x, y, l, ha="center", va="center", color="white", fontsize=11)
    ax.text(0.7, 4.6, "It's not just the model.", color="white", fontsize=34, weight="bold")
    ax.text(0.7, 3.75, "It's the harness.", color="#86b6ef", fontsize=34, weight="bold")
    ax.text(0.7, 2.75, "What a 2026 survey of agent systems tells us about\nwhere agent performance really comes from",
            color="#cde2fb", fontsize=15, linespacing=1.5, va="top")
    ax.text(0.7, 0.7, "Abhishek Darji · San José State University", color="#9ec5f4", fontsize=12)
    fig.savefig(f"{OUT}/fig0_cover.png", dpi=200, facecolor="#0d366b")
    plt.close(fig)


for f in [fig_cover, fig_paradigms, fig_anatomy, fig_swebench, fig_terminal, fig_webarena, fig_cost,
          fig_map, fig_cheatsheet]:
    f()
print("done")
