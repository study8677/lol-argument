# CLAUDE.md — lol-argument

## 项目灵感

来自 Andrej Karpathy 的一条推文：

> - Drafted a blog post
> - Used an LLM to meticulously improve the argument over 4 hours.
> - Wow, feeling great, it's so convincing!
> - Fun idea let's ask it to argue the opposite.
> - LLM demolishes the entire argument and convinces me that the opposite is in fact true.
> - lol
>
> The LLMs may elicit an opinion when asked but are extremely competent in arguing almost any direction. This is actually super useful as a tool for forming your own opinions, just make sure to ask different directions and be careful with the sycophancy.

项目名 `lol-argument` 中的 "lol" 就是致敬那个认知崩塌的瞬间。

## 产品定位

**帮助用户发现自己到底有没有真正持有一个观点。**

很多人以为自己有观点，其实只是有一个"从未被挑战过的倾向"。LLM 的阿谀特性（sycophancy）会加剧这个问题——你让它帮你改文章，它只会让你更自信，不会告诉你"你这个观点根本站不住"。

这个项目把 Karpathy 的 4 小时手动体验，变成一个结构化的、多智能体的、可重复的产品流程。

## 核心体验："先捧后杀"

这是 feature，不是 bug。

构建阶段故意让用户越来越自信（复现 Karpathy "feeling great, it's so convincing!" 的状态），翻转阶段的认知冲击才会更强烈（复现那个 "lol" 时刻）。这个情绪曲线——自信上升 → 顶点 → 翻转崩塌——就是产品的灵魂。

## 两阶段设计

### 阶段一：构建（Build）

用户输入一个观点、文章、或论述。

四个支持方智能体进行**多轮迭代讨论**：
- **逻辑学家**：搭建形式逻辑框架，梳理前提、推理链、结论
- **实证主义者**：补充数据、证据、真实案例、统计支撑
- **哲学家**：深化哲学基础、伦理维度、更广泛的影响
- **综合者**：整合所有贡献，消除矛盾，输出统一的加固版本

编排规则：
- 不是各说各的，而是智能体之间互相阅读、互相引用、互相补充
- 每轮顺序：逻辑学家 → 实证主义者 → 哲学家 → 综合者
- 默认 3 轮，用户可选 3/5/7 轮，每一轮都在上一轮基础上加固
- 综合者在最后一轮的输出 = "fortified argument"，作为反驳阶段的靶子
- 用户能实时看到这个讨论过程（对话流）

构建阶段的目标：让论证变得尽可能强大，让用户产生"这真的无懈可击"的感觉。

### 翻转触发

**由用户手动触发。** 用户自己决定"够了，我觉得已经足够强了"，然后点击翻转按钮。

这个手动触发很重要——它让用户在心理上 commit 了"我认为这个论证是完整的"，这样翻转后的冲击才有意义。如果系统自动触发，用户会觉得"还没构建完就被打断了"。

翻转时应该有一个有仪式感的过渡（视觉/动画），标志着从"构建模式"进入"摧毁模式"。

### 阶段二：反驳（Demolish）

四个反驳方智能体登场：
- **怀疑论者**：攻击前提和假设，质疑被视为理所当然的基础
- **魔鬼代言人**：构建最强的反对叙事，最具修辞攻击力
- **现实主义者**：指出实践中的失败、不可能性、现实反例
- **解构者**：识别逻辑谬误、隐藏偏见、循环论证、虚假二分法

关键规则：
- 反驳方能看到构建阶段的所有论证内容（特别是 fortified argument），针对性拆解
- 同样是多轮迭代讨论（轮数与构建阶段一致），智能体之间互相配合
- Prompt 层面强制反阿谀：不留情面、不客气、直击要害
- 用户同样能实时看到讨论过程（对话流）

### 最终产出：压力测试报告

在正反双方的对话流展示完毕后，系统生成一份结构化的**观点压力测试报告**，包含：
- 原始观点
- 构建阶段的核心论证摘要（正方最强的几个点）
- 反驳阶段的核心攻击摘要（反方最致命的几个点）
- 论证强度评估：哪些论证经受住了攻击，哪些被摧毁
- 盲点分析：用户原始观点中完全没有考虑到的角度
- 结论：这个观点经过压力测试后的"存活状态"

## 设计原则

1. **对话流是过程，报告是结论** —— 用户先体验正反交锋的过程（这是有趣的部分），最后拿到一份可以保存/分享的结构化报告（这是有用的部分）
2. **智能体要有个性** —— 每个智能体有明确的角色、思考方式、说话风格，不是同一个 LLM 换了个名字
3. **反阿谀设计** —— 构建阶段允许阿谀（这是故意的），但反驳阶段要在 prompt 层面强制要求"不留情面、不客气、直击要害"
4. **透明性** —— 用户能看到每个智能体的思考过程，而不只是最终结论
5. **仪式感** —— 翻转那一刻要有"事情即将变得不一样"的视觉/交互信号

## 技术决策（已确定）

- [x] **技术栈**：Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- [x] **LLM**：Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/openai`)，多 provider 支持，默认 `claude-sonnet-4-6`
- [x] **智能体角色**：构建方 4 个（逻辑学家、实证主义者、哲学家、综合者），反驳方 4 个（怀疑论者、魔鬼代言人、现实主义者、解构者）
- [x] **编排逻辑**：默认 3 轮，用户可选 3/5/7 轮，4 agents × N rounds per phase
- [x] **架构**：单页状态机（全部在 `/`），无路由跳转，`useReducer` + `sessionStorage` 持久化
- [x] **编排方式**：客户端驱动，每个 agent turn 是独立 API 调用（`/api/debate/turn`），避免 Vercel 函数超时
- [x] **流式传输**：per-agent POST + ReadableStream，newline-delimited JSON 事件协议
- [x] **API Key**：`X-API-Key` header 传输，优先级 UI (localStorage) > env，应用代码不持久化/打印 key
- [x] **报告**：Prompt-based JSON + schema validation（兼容所有 provider），评判性分析（非复述）
- [x] **部署**：Vercel 一键部署，`maxDuration` 配置（turn: 60s, report: 120s），Hobby 兼容
- [x] **导出**：复制为 Markdown + 下载 JSON
- [x] **测试**：自动化测试覆盖 reducer、orchestrator、protocol parser、schema validation

## 项目状态

当前阶段：v1 实现完成。lint/typecheck/test/build 全部通过。
