# lol-argument

**观点压力测试 — 帮你发现自己到底有没有真正持有一个观点。**

[English](./README_EN.md)

> - Drafted a blog post
> - Used an LLM to meticulously improve the argument over 4 hours.
> - Wow, feeling great, it's so convincing!
> - Fun idea let's ask it to argue the opposite.
> - LLM demolishes the entire argument and convinces me that the opposite is in fact true.
> - lol
>
> — Andrej Karpathy

很多人以为自己有观点，其实只是有一个"从未被挑战过的倾向"。LLM 的阿谀特性会加剧这个问题——你让它帮你改文章，它只会让你更自信，不会告诉你"你这个观点根本站不住"。

这个工具把 Karpathy 的 4 小时手动体验，变成一个结构化的、多智能体的、可重复的产品流程。

<!-- TODO: 添加截图/GIF -->

## 它怎么工作

### 1. 构建阶段

输入你的观点，4 个 AI 智能体开始多轮协作加固：

| 智能体 | 角色 |
|--------|------|
| 🔗 **逻辑学家** | 搭建形式逻辑框架，梳理前提和推理链 |
| 📊 **实证主义者** | 补充数据、证据、真实案例 |
| 🏛️ **哲学家** | 深化哲学基础、伦理维度 |
| 🔮 **综合者** | 整合所有贡献，产出加固版论证 |

智能体之间互相阅读、引用、补充。每轮都在上一轮基础上加固。

### 2. 你手动翻转

当你觉得论证"够强了"，点击翻转按钮。这一刻很重要——你在心理上 commit 了"我认为这个论证是完整的"。

### 3. 摧毁阶段

另外 4 个智能体登场，对你的论证发起无情攻击：

| 智能体 | 角色 |
|--------|------|
| 🔍 **怀疑论者** | 质疑前提和假设 |
| 😈 **魔鬼代言人** | 构建最强反对叙事 |
| ⚡ **现实主义者** | 指出实践中的失败和反例 |
| 🔬 **解构者** | 识别逻辑谬误和隐藏偏见 |

### 4. 压力测试报告

系统生成结构化报告：
- 哪些论证经受住了攻击
- 哪些被彻底摧毁
- 你的盲点在哪
- 总体强度评估

## 快速上手

```bash
git clone https://github.com/study8677/lol-argument.git
cd lol-argument
npm install
npm run dev
```

打开 http://localhost:3000，在设置面板中输入你的 API Key，输入观点，开始测试。

### API Key 配置

两种方式（二选一）：

1. **UI 输入**（推荐）：在页面设置面板中直接输入，存储在浏览器 localStorage
2. **环境变量**：复制 `.env.example` 为 `.env.local`，填入 Key

```bash
cp .env.example .env.local
# 编辑 .env.local
```

> **安全提醒：** 公开部署时不要在环境变量中配置 API Key，应让用户在 UI 中输入自己的 Key。

### 支持的 LLM Provider

| Provider | 默认模型 | 说明 |
|----------|---------|------|
| **Anthropic** | `claude-sonnet-4-6` | 默认，推荐 |
| **OpenAI** | `gpt-4o` | 在设置中切换 |
| **Custom** | 自定义 | 支持 Ollama、vLLM 等 OpenAI 兼容接口 |

## 技术架构

- **框架**：Next.js 15 (App Router) + TypeScript
- **样式**：Tailwind CSS v4
- **LLM**：Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/openai`)
- **状态**：单页状态机，`useReducer` + `sessionStorage` 持久化
- **编排**：客户端驱动，每个 agent turn 独立 API 调用
- **流式传输**：Newline-delimited JSON over ReadableStream
- **测试**：Vitest (66 tests)

### 关键设计

- **Turn Commit 语义**：streaming tokens 是临时 UI 状态，只有 `agent_done` 才写入 transcript 和 sessionStorage
- **State Version**：sessionStorage 带版本号，reducer 结构变更时自动丢弃旧状态
- **工作笔记协议**：`[[WORKLOG]]`/`[[ANSWER]]` 硬分隔符，确定性解析
- **反阿谀设计**：反驳阶段 prompt 强制"不留情面、不客气、直击要害"

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fstudy8677%2Flol-argument)

API routes 已配置 `maxDuration`（turn: 60s, report: 120s），兼容 Vercel Hobby plan。

## Scripts

```bash
npm run dev        # 启动开发服务器 (Turbopack)
npm run build      # 生产构建
npm run start      # 启动生产服务器
npm test           # 运行测试 (Vitest)
npm run typecheck  # TypeScript 类型检查
npm run lint       # ESLint 代码检查
```

## License

[MIT](./LICENSE)
