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

Agents read and build on each other's work. Multiple rounds. Gets stronger each time.

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

A structured stress test report: which arguments survived, which were destroyed, your blind spots, and an overall strength rating.

## Two Modes

| Mode | How it works |
|------|-------------|
| **Interactive** | Pause after each round. Read, think, add your own input. You decide when to continue or stop. |
| **Auto** | Agents run all rounds on their own. You just watch. |

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

<details>
<summary>Self-host with Docker (coming soon)</summary>

```bash
docker build -t lol-argument .
docker run -p 3000:3000 lol-argument
```

</details>

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
