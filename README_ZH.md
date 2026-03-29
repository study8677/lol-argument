<div align="center">

# lol-argument

### 观点压力测试

**帮你发现自己到底有没有真正持有一个观点。**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
&nbsp;&nbsp;
[English](./README.md)

</div>

---

<div align="center">
<br>

> *花了 4 小时用 LLM 完善论证，感觉无懈可击。然后让它论证相反的观点，它把我的论证彻底摧毁了。* ***lol***
>
> — **Andrej Karpathy**

<br>
</div>

<div align="center">

![demo](./docs/demo.gif)

*8 个 AI 智能体，先帮你加固论证，再把它彻底摧毁。*

</div>

---

## 问题

LLM 天生阿谀。你让它改文章，它只会让你更自信，不会告诉你"你的前提根本就是错的"。

**lol-argument** 把这变成特性：先故意让你越来越自信（复现那个 "feeling great" 的状态），然后**摧毁你**（复现那个 "lol" 时刻）。自信上升 → 顶点 → 崩塌——这个情绪曲线就是产品本身。

## 流程

```
┌──────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────┐
│  你的观点  │ ──▶ │  构 建   │ ──▶ │  你翻转 🔄  │ ──▶ │  摧 毁   │ ──▶ 📊 报告
└──────────┘     └──────────┘     └─────────────┘     └──────────┘
                  4个智能体           "够强了"           4个智能体
                  加固论证          ← 你按下按钮 →       摧毁论证
```

### 构建阶段 — *"这无懈可击"*

| | 智能体 | 职责 |
|---|---|---|
| 🔗 | **逻辑学家** | 搭建形式逻辑框架，梳理前提和推理链 |
| 📊 | **实证主义者** | 补充数据、证据、真实案例、统计支撑 |
| 🏛️ | **哲学家** | 深化哲学基础、伦理维度、更广泛影响 |
| 🔮 | **综合者** | 整合所有贡献，产出加固版论证 |

智能体互相阅读、引用、补充。多轮迭代，越来越强。

### 翻转 — *"我准备好了"*

你自己决定什么时候翻转——心理上 commit "我认为这个论证是完整的"。然后屏幕变黑。

### 摧毁阶段 — *"……完了"*

| | 智能体 | 职责 |
|---|---|---|
| 🔍 | **怀疑论者** | 攻击前提——*"凭什么认为这是对的？"* |
| 😈 | **魔鬼代言人** | 构建最强反对叙事 |
| ⚡ | **现实主义者** | *"听起来很美，但实际上……"* |
| 🔬 | **解构者** | 识别逻辑谬误、隐藏偏见、循环论证 |

Prompt 层面强制反阿谀：*不留情面、不客气、直击要害。*

### 报告 — *"这些活下来了"*

结构化压力测试报告：哪些论证存活、哪些被摧毁、你的盲点、总体强度评级。

## 两种模式

| 模式 | 说明 |
|------|------|
| **交互模式** | 每轮暂停，你可以阅读、思考、插入自己的反馈。你决定何时继续或停止。 |
| **自动模式** | 智能体自行跑完所有轮次，你只需观看。 |

## 支持的 Provider

| Provider | 默认模型 | 备注 |
|----------|---------|------|
| Anthropic | `claude-sonnet-4-6` | 推荐 |
| OpenAI | `gpt-4o` | 在设置中切换 |
| Custom | 任意 | 支持 Ollama、vLLM、NVIDIA NIM 等 OpenAI 兼容接口 |

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 15 (App Router) + TypeScript |
| 样式 | Tailwind CSS v4 |
| LLM | Vercel AI SDK — 多 Provider |
| 状态 | 单页状态机，`useReducer` + `sessionStorage` |
| 编排 | 客户端驱动，每个 agent turn 独立 API 调用 |
| 流式 | Newline-delimited JSON over ReadableStream |
| 测试 | Vitest (70 tests) |

<details>
<summary><b>架构细节</b></summary>

- **Turn Commit 语义** — Streaming tokens 是临时 UI 状态，只有 `agent_done` 才写入 transcript + sessionStorage
- **State Version** — sessionStorage 带版本号，schema 变更时自动丢弃旧状态
- **工作笔记协议** — `[[WORKLOG]]`/`[[ANSWER]]` 硬分隔符，确定性解析
- **客户端编排** — 每个 agent turn 一次 API 调用（~15s），无长时间运行的服务端函数，兼容 Vercel Hobby
- **反阿谀设计** — 反驳阶段 prompt 强制无情攻击；构建阶段故意鼓励自信（这是特性）

</details>

## 快速上手

```bash
git clone https://github.com/study8677/lol-argument.git
cd lol-argument
npm install
cp .env.example .env.local   # 编辑填入 API Key
npm run dev                  # → http://localhost:3000
```

也可以不配 `.env.local`，直接在页面设置面板中输入 API Key。

## 部署

当前仅支持本地运行。云部署（Vercel / Cloudflare Pages）即将支持。

本项目需要服务端 API Routes 调用 LLM，不支持纯静态托管（如 GitHub Pages）。

## 开发

```bash
npm run dev        # 开发服务器 (Turbopack)
npm run build      # 生产构建
npm run start      # 生产服务器
npm test           # Vitest (70 tests)
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
```

## License

[MIT](./LICENSE)

---

<div align="center">
<sub>灵感来自 <a href="https://x.com/karpathy">Andrej Karpathy</a> 的认知崩塌时刻。那个 "lol" 就是产品本身。</sub>
</div>
