# AI Omni Dashboard Core 🚀

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge-brightgreen.svg)

**AI Omni Dashboard Core** 是一款强大的浏览器自动化聚合控制面板插件。它彻底颠覆了传统的多 AI 切换体验，通过底层原生的 DOM 穿透技术与状态机同步流，实现**全网首个真正意义上的“一键群发、全平台流式打字流同步响应”**。

无论是面对大厂复杂的富文本框架（如 ProseMirror、Lexical、Quill），还是动态渲染的影子 DOM（Shadow DOM），本项目都能精准实施降维打击，让各大顶尖 AI 乖乖听从你的指挥！

---

## ✨ 核心特性

* 🌐 **多矩阵全弹发射**：一键将你的 Prompt 同时分发至 **ChatGPT、Claude、DeepSeek、Gemini、Grok**。
* ⚡ **突破富文本防线**：内置**原生光标流注入逻辑（Cursor Stream Injection）**，完美骗过各大 AI 2026年最新版前端的数据监听状态机。
* 🌊 **极速流式打字同步**：基于 `MutationObserver` 与靶向过滤器，毫秒级抓取各 AI 的实时生成文本，并在聚合面板中完美还原“打字机流”。
* 🧼 **智能脏数据剥离**：自动识别并剔除 AI 页面上的“思考箱（Thinking Block）”、快捷操作按钮、推荐追问等干扰文本，只回传最纯净的回答。
* 🧠 **跨文化直观对决**：在同一个面板里，一眼看穿大厂 AI 的底层“性格”（例如：老实服从指令的实干派 vs 极度自信站台的自我派）。

---

## 📅 支持矩阵 (Support Matrix)

| AI 平台 | 输入框驱动机制 | 流式文本同步状态 | 思考箱/脏数据剥离 | 状态 |
| :--- | :--- | :--- | :--- | :--- |
| **DeepSeek** | 标准原生注入 | 🟢 完美同步 (流) | ✅ 自动识别 | **Ready** |
| **ChatGPT** | 物理文本流模拟 | 🟢 完美同步 (流) | ✅ 自动识别 | **Ready** |
| **Claude** | 物理文本流模拟 | 🟢 完美同步 (流) | ✅ 自动识别 | **Ready** |
| **Google Gemini**| 原生 `insertText` 穿透 | 🟢 完美同步 (流) | ✅ 自动识别 | **Ready** |
| **X Grok** | 富文本状态机破防 | 🟢 完美同步 (流) | ✅ 深度穿透清洗 | **Ready** |

---

## 🛠️ 项目架构

项目采用了清晰的**星型拓扑架构（Star Topology）**，由控制面板（Dashboard）作为中央枢纽，通过 Chrome Runtime Bridge 与各个独立的 AI 网页驱动（Engines）进行高频全双工通信。