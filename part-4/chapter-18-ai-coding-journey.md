---
id: "part-4-chapter-18-ai-coding-journey"
title: "第19章：从怀疑到实践——三个月 AI Coding 实战复盘"
slug: "part-4-chapter-18-ai-coding-journey"
date: "2025-01-01"
type: "article"
topics: []
concepts: []
tools: []
architecture_layer:
  - "workflows-and-practices"
timeline_era: "autonomous-systems"
related: []
references: []
status: "published"
display_order: 62
---
# 第19章：从怀疑到实践——三个月 AI Coding 实战复盘

> *从去年12月开始高强度实践 AI coding 到现在三个多月，要歇一下了，这玩意儿快是快，累也是真累，大脑负荷比自己写代码还重。借此告一段落的机会梳理一下成果，记录于此备忘。*

## 引言：为什么是三个月

2024年12月开始，我决定全身心投入 AI 编程实践。三个月后回头看，这段时间既有令人惊叹的成就，也有值得深思的教训。

**核心感悟**：AI 编程确实能大幅提升效率，但同时对人类的认知负荷提出了前所未有的挑战。这不是"躺平"替代人类，而是另一种形式的"站着工作"——你需要比以往任何时候都更清晰地思考。

---

## 项目成果展示

三个月的高强度实践，我完成了以下项目：

### 1. Reversi（翻转棋/奥赛罗棋）

用 Python 编写的 Reversi 游戏，跨平台 GUI 应用。

**技术栈**：
- 一开始用 Flet 框架
- 后来被其混乱的升级策略气晕，换成了 Qt（PySide6）

**亮点**：
- 完善的 UI ↔ Engine 协议体系
- 支持与各种不同语言编写的 AI 引擎对战
- 支持引擎间大乱斗
- 可以玩也可以用于教学

**衍生成果**：一篇自己觉得挺有意思的文章。

### 2. SBS 扩展（SBS-EXT）

给 Markdown 扩展标准 SBS 编写的几个扩展。

**技术栈**：
- Python 和 TypeScript（最适合 AI 编程的语言）
- 可用 Markdown 格式创作图文并茂的桥牌、国际象棋和围棋内容

**成果**：有个线上 demo 可以体验。

### 3. SCT（Rime 配置工具）

多年以前用 Objective-C 为 Rime 中州韵输入法写过图形化配置工具 SCU，后来没时间维护，一致觉得心怀愧疚。

**转变**：AI 让我可以比较轻松地维护这种级别的工具了，用新的 SwiftUI 重写了这个新版本。

**感悟**：AI 编程不仅能创建新项目，还能让"历史遗留项目"起死回生。

### 4. QIDAO（围棋工具）

我觉得应该是目前 macOS 下最好的围棋工具。

**技术栈**：SwiftUI + Rust core 混合语言开发

**功能**：
- 棋谱分析
- 棋谱编辑
- 对弈练习

三模式无缝切换，专业领域的工具真是一言难尽。

### 5. OASIS（Haskell LLM 客户端）

用 Haskell 编写的大语言模型 client 库及用例。

**背景**：基本上是移植了之前用 Python 写的 MAL 和 modelbench 工具。

**经验总结**：经实践证明，Haskell 强大的类型系统和静态编译，确实可以降低代码中隐形错误的几率。整个开发过程除了被 Haskell 的 TUI 库坑了一阵以外都很顺利。

**重要发现**：即使 Haskell 也无法阻止 AI 的一些先天陋习，比如放着代码中已有的共享框架自己另写一个。不断督促 AI 去重构以保持低熵，依然是人类逃不掉的职责。

**相关文章**：《什么是好的代码》《为什么你要学习类型系统》

### 6. MERCURY（AI 赋能 RSS 阅读器）

这一批里面复杂度最高的软件。

**数据**：
- 300 多个 commits
- 大约 30000 行 Swift 代码
- 1.0 之后一共发布了 7 个功能版本
- 用了整个 2 月份来完成

**结论**：现在算是功能比较完整的一个现代化 RSS 工具了。

#### 衍生实践：Mercury 背后的本地推理栈

Mercury 提供了自动摘要、翻译、自动标签等 agent 功能之后，我很快发现一个更合理的分工：高难度、开放式的推理仍然更适合云端强模型，但高频、结构化、可验证的任务非常适合下沉到本地。典型例子包括文章摘要、标签生成、批量翻译、轻量分类，以及 embedding 这类基础处理。

本地化的收益也很直接：调用成本更低、响应更稳定、隐私边界更清晰。对产品来说，这往往比“本地也能跑一个大模型”更有意义。

我这套配置跑在一台 Apple M1 Max + 32GB 统一内存的 MacBook Pro 上，通常能给 GPU 留出 20GB 以上可用内存。对 24GB 显存级别的 NVIDIA 卡，这套思路同样有参考价值。

##### 模型选择

这一阶段我常驻的模型大致分成三类：

- `Qwen3.5-35B-A3B`：主力通用模型，主要负责摘要、标签、分类、轻量问答等高频任务。在 M1 Max 上能到 50+ tokens/s，适合做产品里的默认后台劳动力。
- `Qwen3.5-27B`：能力更强但速度明显更慢，更适合留给需要更好理解力的场景，而不是作为常驻默认模型。
- `HY-MT1.5-1.8B`：翻译专用小模型，适合承接大批量文本翻译，因为足够小，也更容易与主力模型同时驻留。

量化上的经验也很务实：主力通用模型可以优先选 4-bit 档位，小型专项模型则可以适当提高量化精度，换取更稳定的输出质量。

##### 引擎与工具

我没有只押注一种格式，而是同时保留 GGUF 和 MLX 两套链路：

- `llama.cpp`：GGUF 方案的保底引擎。优势在于生态成熟、量化选择多、API 完整。
- `llama-swap`：负责 on-demand 加载、模型切换和统一入口。它很适合把同一个模型文件包装成多个“逻辑实例”。
- `oMLX`：Apple 芯片上的 MLX 主力方案，速度优势很明显，适合承担日常高频调用。
- `LM Studio`：我主要把它当成模型搜索、下载和初步测试工具使用，而不是核心服务端。

我之所以两套并行，而不是二选一，原因很简单：MLX 在 Apple 芯片上适合做主力，GGUF/`llama.cpp` 生态更稳，适合兜底。对本地部署来说，速度和可维护性通常都要保留一条后路。

##### 一个精简但够用的 `llama-swap` 配置

下面这份配置不是完整生产版，只保留了最核心的结构：宏复用、统一模型目录，以及一个可对外暴露的模型实例。

```yaml
healthCheckTimeout: 300
startPort: 9001

macros:
  "latest-llama": |
    /opt/homebrew/bin/llama-server
    --port ${PORT}
  "default_ctx": 16384
  "models_dir": "${env.HOME}/.lmstudio/models"

models:
  "qwen3.5-35b-a3b":
    cmd: |
      ${latest-llama}
      --model ${models_dir}/unsloth/Qwen3.5-35B-A3B-GGUF/Qwen3.5-35B-A3B-UD-Q4_K_L.gguf
      --ctx-size ${default_ctx}
      --cache-type-k q8_0
      --cache-type-v q8_0
      -np 1
      -ngl 99
    aliases:
      - "qwen3.5"
```

如果需要扩展到翻译模型、embedding 模型，或者同一个模型的 thinking / non-thinking 双实例，再按同样结构继续往下追加即可。

准备好配置文件后，我会把它放到 `~/.config/llama-swap/llama-swap.yaml`，然后用下面这条命令启动：

```bash
llama-swap -config ~/.config/llama-swap/llama-swap.yaml -listen 0.0.0.0:9000
```

这样一来，本地模型就能以兼容 OpenAI API 的方式统一暴露出来。客户端只需要把 `base_url` 指向 `http://0.0.0.0:9000/v1`，`api_key` 随便填一个字符串即可。进一步把它做成 macOS 的 LaunchAgent 之后，本地就等于有了一个常驻的模型路由层。

##### 在 Mercury 里的实际分工

我在 Mercury 里把这套本地模型链路分成两个 provider：一个指向 `llama-swap`，另一个指向 `oMLX`。然后按任务性质分配模型：

| Agent 任务 | 主模型 | 备份模型 |
|------|------|------|
| Summary | `oMLX` 下的 `Qwen3.5-35B`（关闭 thinking） | DeepSeek |
| Translation | `llama-swap` 下的 `HY-MT1.5` | `oMLX` 下的 `Qwen3.5-35B` |
| Tagging | `oMLX` 下的 `Qwen3.5-35B`（关闭 thinking） | DeepSeek |

这套分工背后的原则其实很朴素：摘要、标签、翻译这类任务输入输出边界清楚，评判标准也相对稳定，因此非常适合交给本地模型长期承接；而一旦任务进入开放式规划、复杂推理或高风险决策，再回退到云端强模型会更稳妥。

### 7. SWIFT-READABILITY（Swift 阅读增强库）

在编写 Mercury 的过程中发现现有 Swift 的 Readability 库都没法用。

**成果**：
- 完全原生 Swift
- 不依赖任何 JS 引擎
- 100% 通过了原版 Mozilla Readability JS 库的测试集
- 是个相当不错的副产品

**重要发现**：这种已有完备测试集的库的开发，实在太适合目前的 AI coding agent 了。以后写 test case 比写功能实现可能更需要人类（也更值钱）。

---

## 经验教训总结

### 1. GUI 应用是 AI 编程的"硬骨头"

> *发现我还是喜欢写有着简洁优雅设计的 GUI 应用，可能也是目前 AI coding 比较费劲的一个类型。*

GUI 应用的特点：
- 状态管理复杂
- 用户交互多样
- 视觉效果难以用文字描述
- 往往需要反复调整才能满意

**经过这些玩意儿的洗礼，再去写一些命令行或者后台服务简直像度假。**

### 2. 人类的核心职责：保持低熵

AI 擅长生成代码，但不擅长：
- 发现已有的共享框架
- 避免重复造轮子
- 保持代码结构简洁

**不断督促 AI 去重构以保持低熵，依然是人类逃不掉的职责。**

### 3. 测试驱动是 AI 编程的最佳伴侣

当我有了完整的测试集（如 swift-readability 项目的 Mozilla 测试集），AI 的开发效率和质量都大幅提升。

**以后写 test case 比写功能实现可能更需要人类（也更值钱）。**

### 4. 混合语言开发是常态

项目中出现了：
- Python + TypeScript
- Swift + Rust
- Python + Haskell

AI 编程让多语言项目不再是噩梦，但需要人类来设计架构和协调边界。

### 5. 大脑负荷比写代码还重

> *快是快，累也是真累，大脑负荷比自己写代码还重。*

这可能是 AI 编程最反直觉的一点：
- 你不需要写代码，但你需要更清晰地思考
- 你不需要调试，但你需要更准确地描述问题
- 你不需要重构，但你需要更严格地验收结果

---

## 下一步计划

好好总结一下经验教训，争取开发一个真正有用、能不断迭代的"AI时代软件工程"课程出来。

---

## 附录：项目技术栈一览

| 项目 | 主要语言 | 框架/库 | 代码行数 |
|------|----------|---------|----------|
| Reversi | Python | PySide6 (Qt) | ~5000 |
| SBS-EXT | Python, TypeScript | - | ~3000 |
| SCT | Swift | SwiftUI | ~2000 |
| QIDAO | Swift, Rust | SwiftUI, tauri | ~8000 |
| OASIS | Haskell | - | ~4000 |
| Mercury | Swift | SwiftUI | ~30000 |
| swift-readability | Swift | - | ~2000 |

---

## 参考资源

- Reversi 项目
- SBS 扩展标准
- QIDAO 围棋工具
- Mercury RSS 阅读器
- 《什么是好的代码》
- 《为什么你要学习类型系统》
