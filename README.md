<div align="center">

# lol-argument

### Opinion Stress Test

**Find out if you actually hold an opinion — or just have an unchallenged tendency.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
&nbsp;&nbsp;
[中文](./README_ZH.md)

</div>

---

<div align="center">
<br>

> *Drafted a blog post. Used an LLM to meticulously improve the argument over 4 hours. Wow, feeling great, it's so convincing! Fun idea let's ask it to argue the opposite. LLM demolishes the entire argument and convinces me that the opposite is in fact true.* ***lol***
>
> — **Andrej Karpathy**

<br>
</div>

<div align="center">

![demo](./docs/demo.gif)

*8 AI agents build your argument up, then tear it apart.*

</div>

---

## The Problem

LLMs are sycophants. Ask one to improve your argument and it'll make you feel like a genius. It won't tell you *"your entire premise is wrong."*

**lol-argument** fixes this by design: first it builds you up (so you feel invincible), then it **destroys** you (so you learn something). The emotional arc — confidence rising → peak → collapse — is the product.

## See It In Action

> **Input opinion:** *"Remote work is more productive than office work."*

<table>
<tr>
<td width="50%">

### 🏗️ Build Phase

*Agents make you feel invincible...*

</td>
<td width="50%">

### 💀 Demolish Phase

*...then tear it all apart.*

</td>
</tr>
<tr>
<td valign="top">

**🔗 The Logician** (Round 1)
> The core logical structure:
> - **Premise A1**: Office work mandates daily commute time (T_c)
> - **Premise A2**: Remote work converts T_c into productive or rest time
> - **Premise A3**: Adequate rest improves cognitive performance by 20-30%
> - **Therefore**: Remote work directly increases effective output by eliminating T_c

**📊 The Empiricist** (Round 1)
> Stanford's 2-year study (Bloom et al.) found a **13% performance increase** in remote workers. Buffer's 2023 survey: **98% of remote workers** want to continue. Average commute reclaimed: **54 minutes/day** = 220 hours/year of recoverable time.

**🔮 The Synthesizer** (Round 3 — Fortified Argument)
> The fortified argument rests on three unassailable pillars: (1) Time reallocation — mathematically provable, (2) Attention protection — supported by deep work research, (3) Autonomy–motivation link — grounded in decades of Self-Determination Theory...

</td>
<td valign="top">

**🔍 The Skeptic** (Round 1)
> Who says "productivity" means individual output? **What about collective intelligence?** The premise silently equates productivity with solo task completion. But most valuable work is collaborative. You've defined away the strongest counterargument before the debate even began.

**😈 The Devil's Advocate** (Round 1)
> Let me build the opposite case: Remote work **destroys** productivity — you just can't measure the damage. The Bloom study? Participants were **call center workers** doing repetitive tasks. Try running a startup remotely. Innovation needs collisions, not Zoom calls.

**🔬 The Deconstructor** (Round 3)
> **Survivorship bias**: every remote work "success story" ignores the teams that silently failed. **False dichotomy**: the argument frames it as remote vs. office, ignoring hybrid models. **Circular reasoning**: "remote workers report higher satisfaction" — because unsatisfied ones already quit.

</td>
</tr>
</table>

### 📊 Stress Test Report

| Argument | Survived? | Verdict |
|----------|:---------:|---------|
| Commute time reclamation improves output | ✅ | Data-backed, attackers couldn't refute the math |
| Deep work is easier at home | ✅ | Partially survived — true for individual tasks, weakened for collaborative work |
| Remote work boosts innovation | ❌ | **Destroyed** — no direct evidence, counterexamples from hybrid companies |
| Self-determination theory supports autonomy | ❌ | **Destroyed** — theory applies to motivation, not necessarily to productivity metrics |

> **Blind spots identified**: Industry variance (knowledge work ≠ all work), management overhead costs, junior employee development, "productivity" definition was never challenged until demolish phase.
>
> **Overall strength: Moderate** — Core time-reallocation argument survived. Broader claims about innovation and universal applicability were demolished.

---

## How It Works

```
┌─────────────┐     ┌──────────┐     ┌───────────────┐     ┌──────────┐
│  Your Opinion │ ──▶ │  BUILD   │ ──▶ │  YOU FLIP 🔄  │ ──▶ │ DEMOLISH │ ──▶ 📊 Report
└─────────────┘     └──────────┘     └───────────────┘     └──────────┘
                     4 agents          "I'm confident"      4 agents
                     strengthen it     ← you commit →       destroy it
```

### Build Phase — *"This is unbreakable"*

| | Agent | What they do |
|---|---|---|
| 🔗 | **The Logician** | Formal logic framework — premises, chains, conclusions |
| 📊 | **The Empiricist** | Data, evidence, real-world examples, statistics |
| 🏛️ | **The Philosopher** | Philosophical foundations, ethics, deeper implications |
| 🔮 | **The Synthesizer** | Integrates everything into a unified fortified argument |

Agents read and build on each other's work. Multiple rounds (1-20, your choice). Gets stronger each time.

### The Flip — *"I'm ready"*

You decide when to flip. This matters — you're committing to *"I believe this argument is complete."* Then the screen goes dark.

### Demolish Phase — *"...oh no"*

| | Agent | What they do |
|---|---|---|
| 🔍 | **The Skeptic** | Attacks premises — *"Why should we accept that?"* |
| 😈 | **The Devil's Advocate** | Builds the strongest counter-narrative |
| ⚡ | **The Realist** | *"In practice, this fails because..."* |
| 🔬 | **The Deconstructor** | Finds logical fallacies, hidden biases, circular reasoning |

Anti-sycophancy is enforced at the prompt level: *no mercy, no politeness, strike at the core.*

### The Report — *"Here's what survived"*

A structured stress test report: which arguments survived, which were destroyed, your blind spots, and an overall strength rating (`Strong` / `Moderate` / `Weak` / `Demolished`).

## Two Modes

| Mode | How it works |
|------|-------------|
| **Interactive** | Pause after each round. Read, think, add your own input. You decide when to continue or stop. |
| **Auto** | Agents run all rounds on their own. You just watch. |

## More Examples

<details>
<summary><b>"AI will replace most white-collar jobs within 10 years"</b> → Demolished</summary>

**Build phase highlights:**
- Logician: Automation follows a clear capability curve — GPT-3 → GPT-4 → current models show exponential improvement
- Empiricist: Goldman Sachs estimates 300M jobs affected; McKinsey projects 30% of work hours automatable by 2030

**Demolish phase highlights:**
- Skeptic: "Replace" is doing a lot of heavy lifting — **augment ≠ replace**. ATMs didn't eliminate bank tellers, they changed the role.
- Realist: Every "X will replace Y" prediction in tech history has been wrong on timeline. Self-driving cars were "2 years away" in 2016.
- Deconstructor: **Survivorship bias in AI demos** — you see the cherry-picked successes, not the 90% of attempts that fail silently.

**Verdict**: The "augmentation" reframing demolished the core "replacement" claim. Timeline predictions were indefensible.
</details>

<details>
<summary><b>"Democracy is the best form of government"</b> → Moderate</summary>

**Build phase highlights:**
- Philosopher: Rawlsian veil of ignorance — rational agents would choose democratic governance to protect against tyranny
- Empiricist: Democratic nations score higher on Human Development Index, press freedom, and economic stability

**Demolish phase highlights:**
- Devil's Advocate: Singapore, Rwanda — authoritarian governance with better outcomes than many democracies. Democracy optimizes for popularity, not correctness.
- Skeptic: "Best" by what metric? Best for GDP? Happiness? Stability? Long-term survival? Each gives a different answer.

**Verdict**: Core democratic protections survived. "Best" was revealed as an underspecified claim — the argument is much stronger when scoped to "best for protecting individual rights."
</details>

<details>
<summary><b>"Veganism is morally obligatory"</b> → Weak</summary>

**Build phase highlights:**
- Philosopher: Singer's utilitarian framework — if we can reduce suffering at minimal cost to ourselves, we're morally obligated to
- Logician: Premise chain: animals suffer → we cause it → we can avoid it → therefore we should

**Demolish phase highlights:**
- Realist: **Global food system reality** — 1 billion people depend on animal agriculture for livelihood. "Just stop" ignores economic devastation.
- Deconstructor: **Is-ought fallacy** — "animals suffer" (fact) doesn't automatically yield "we must be vegan" (moral claim) without additional moral premises that are themselves debatable.
- Skeptic: Why draw the line at animals? Plants respond to stimuli. Farming kills insects. The moral boundary is arbitrary.

**Verdict**: Suffering-reduction argument partially survived but "obligatory" was destroyed — the argument works better as "morally preferable" than "morally required."
</details>

---

## Supported Providers

| Provider | Default Model | Notes |
|----------|--------------|-------|
| Anthropic | `claude-sonnet-4-6` | Recommended |
| OpenAI | `gpt-4o` | Switch in settings |
| Custom | Any | Ollama, vLLM, NVIDIA NIM, any OpenAI-compatible endpoint |

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| LLM | Vercel AI SDK — multi-provider |
| State | Single-page state machine, `useReducer` + `sessionStorage` |
| Orchestration | Client-driven, per-agent streaming API calls |
| Streaming | Newline-delimited JSON over ReadableStream |
| Testing | Vitest (70 tests) |

<details>
<summary><b>Architecture Details</b></summary>

- **Turn Commit Semantics** — Streaming tokens are temp UI state. Only `agent_done` commits to transcript + sessionStorage.
- **State Version** — sessionStorage carries a version number; stale state auto-discards on schema change.
- **Worklog Protocol** — `[[WORKLOG]]`/`[[ANSWER]]` hard delimiters with deterministic parsing.
- **Client Orchestration** — Each agent turn is 1 API call (~15s). No long-running server functions. Vercel Hobby compatible.
- **Anti-Sycophancy** — Demolish prompts enforce ruthlessness. Build prompts deliberately encourage confidence (it's a feature).

</details>

## Getting Started

```bash
git clone https://github.com/study8677/lol-argument.git
cd lol-argument
npm install
cp .env.example .env.local   # Edit with your API key
npm run dev                  # → http://localhost:3000
```

Or skip `.env.local` entirely — just enter your API key in the Settings panel on the page.

## Deploy

Currently local-only. Cloud deployment (Vercel / Cloudflare Pages) coming soon.

The app requires server-side API routes for LLM calls, so static hosting (GitHub Pages) is not supported.

## Development

```bash
npm run dev        # Dev server (Turbopack)
npm run build      # Production build
npm run start      # Production server
npm test           # Vitest (70 tests)
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
```

## License

[MIT](./LICENSE)

---

<div align="center">
<sub>Inspired by <a href="https://x.com/karpathy">Andrej Karpathy</a>'s moment of cognitive collapse. The "lol" is the point.</sub>
</div>
