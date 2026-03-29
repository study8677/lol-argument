# lol-argument

**Opinion Stress Test — Find out if you actually hold an opinion, or just have an unchallenged tendency.**

[中文](./README.md)

> - Drafted a blog post
> - Used an LLM to meticulously improve the argument over 4 hours.
> - Wow, feeling great, it's so convincing!
> - Fun idea let's ask it to argue the opposite.
> - LLM demolishes the entire argument and convinces me that the opposite is in fact true.
> - lol
>
> — Andrej Karpathy

Most people think they have opinions, but really they just have tendencies that have never been challenged. LLM sycophancy makes this worse — ask it to improve your argument and it'll only make you more confident, never telling you "your argument doesn't hold up."

This tool turns Karpathy's 4-hour manual experience into a structured, multi-agent, repeatable product flow.

<!-- TODO: Add screenshots/GIF -->

## How It Works

### 1. Build Phase

Enter your opinion. 4 AI agents collaboratively strengthen it over multiple rounds:

| Agent | Role |
|-------|------|
| 🔗 **The Logician** | Builds formal logical framework, identifies premises and reasoning chains |
| 📊 **The Empiricist** | Adds data, evidence, real-world examples, statistical support |
| 🏛️ **The Philosopher** | Deepens philosophical foundations, ethical dimensions |
| 🔮 **The Synthesizer** | Integrates all contributions, produces the fortified argument |

Agents read, reference, and build on each other's work. Each round strengthens the previous.

### 2. You Trigger the Flip

When you feel the argument is "strong enough", click the flip button. This moment matters — you're psychologically committing to "I believe this argument is complete."

### 3. Demolish Phase

4 opposing agents enter and ruthlessly attack your argument:

| Agent | Role |
|-------|------|
| 🔍 **The Skeptic** | Attacks premises and assumptions |
| 😈 **The Devil's Advocate** | Builds the strongest counter-narrative |
| ⚡ **The Realist** | Points out practical failures and counterexamples |
| 🔬 **The Deconstructor** | Identifies logical fallacies and hidden biases |

### 4. Stress Test Report

The system generates a structured report:
- Which arguments survived the attack
- Which were demolished
- Your blind spots
- Overall strength assessment

## Quick Start

```bash
git clone https://github.com/study8677/lol-argument.git
cd lol-argument
npm install
npm run dev
```

Open http://localhost:3000, enter your API key in the settings panel, type your opinion, and start testing.

### API Key Setup

Two options (pick one):

1. **UI input** (recommended): Enter directly in the settings panel on the page. Stored in browser localStorage.
2. **Environment variable**: Copy `.env.example` to `.env.local` and fill in your key.

```bash
cp .env.example .env.local
# Edit .env.local
```

> **Security Note:** When deploying publicly, do NOT set API keys in environment variables. Let each user provide their own key via the UI.

### Supported LLM Providers

| Provider | Default Model | Notes |
|----------|--------------|-------|
| **Anthropic** | `claude-sonnet-4-6` | Default, recommended |
| **OpenAI** | `gpt-4o` | Switch in settings |
| **Custom** | User-defined | Supports Ollama, vLLM, and other OpenAI-compatible endpoints |

## Architecture

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **LLM**: Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/openai`)
- **State**: Single-page state machine, `useReducer` + `sessionStorage` persistence
- **Orchestration**: Client-driven, each agent turn is an independent API call
- **Streaming**: Newline-delimited JSON over ReadableStream
- **Testing**: Vitest (66 tests)

### Key Design Decisions

- **Turn Commit Semantics**: Streaming tokens are temporary UI state only. Only `agent_done` commits to transcript and sessionStorage.
- **State Version**: sessionStorage includes a version number. Stale state is discarded on reducer schema changes.
- **Worklog Protocol**: `[[WORKLOG]]`/`[[ANSWER]]` hard delimiters with deterministic parsing and graceful fallback.
- **Anti-Sycophancy**: Demolish phase prompts enforce "no mercy, no politeness, strike at the core."

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fstudy8677%2Flol-argument)

API routes are configured with `maxDuration` (turn: 60s, report: 120s), compatible with Vercel Hobby plan.

## Scripts

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm test           # Run tests (Vitest)
npm run typecheck  # TypeScript type check
npm run lint       # ESLint
```

## License

[MIT](./LICENSE)
