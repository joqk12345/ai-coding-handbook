<script setup lang="ts">
import { getContentGroups, getGlobalTotals } from './content-analytics'

type Layer = 'tools' | 'planning' | 'memory' | 'concurrency' | 'collaboration' | 'strategy' | 'appendix'

interface TimelineStage {
  id: string
  title: string
  subtitle: string
  chapterRange: string
  chapterCount: number
  output: string
  layer: Layer
}

const groups = getContentGroups()
const totals = getGlobalTotals(groups)

const stages: TimelineStage[] = [
  {
    id: 'T0',
    title: '认知校准',
    subtitle: '建立 AI 编程心智模型',
    chapterRange: '第1章-第4章 + 附章A',
    chapterCount: 5,
    output: '明确适用/不适用边界',
    layer: 'tools'
  },
  {
    id: 'T1',
    title: '工具掌握',
    subtitle: 'Claude Code 核心能力落地',
    chapterRange: '第5章 + 5.1-5.14',
    chapterCount: 15,
    output: '形成可复用 .claude/ 工作流',
    layer: 'planning'
  },
  {
    id: 'T2',
    title: '多工具扩展',
    subtitle: '建立多模型选型能力',
    chapterRange: '第6章-第9章（含 6.1-6.3）',
    chapterCount: 7,
    output: '沉淀任务类型到工具映射',
    layer: 'memory'
  },
  {
    id: 'T3',
    title: '工程化提效',
    subtitle: '提示、测试、调试闭环',
    chapterRange: '第10章-第12章（含 12.1-12.6）',
    chapterCount: 9,
    output: '可验证的端到端交付流程',
    layer: 'concurrency'
  },
  {
    id: 'T4',
    title: 'Agent 系统构建',
    subtitle: '从单 Agent 到多智能体',
    chapterRange: '第13章-第19章（实践复盘）',
    chapterCount: 7,
    output: '任务/后台/协作原型系统',
    layer: 'collaboration'
  },
  {
    id: 'T5',
    title: '组织级演进',
    subtitle: '从个人效率到团队速度',
    chapterRange: '第19章（自主代码库）-第30章（含 27.1-27.2）',
    chapterCount: 14,
    output: '团队治理与扩展路线图',
    layer: 'strategy'
  },
  {
    id: 'T6',
    title: '持续更新',
    subtitle: '建立长期学习机制',
    chapterRange: '附录A + 附录B',
    chapterCount: 2,
    output: '工具速查与资源更新基线',
    layer: 'appendix'
  }
]

const maxChapterCount = Math.max(...stages.map((v) => v.chapterCount), 1)

const layerList = [
  { id: 'tools', label: '认知层' },
  { id: 'planning', label: '工具层' },
  { id: 'memory', label: '选型层' },
  { id: 'concurrency', label: '工程层' },
  { id: 'collaboration', label: '系统层' },
  { id: 'strategy', label: '组织层' },
  { id: 'appendix', label: '支撑层' }
] as const

const layerDotClass: Record<Layer, string> = {
  tools: 'dot-tools',
  planning: 'dot-planning',
  memory: 'dot-memory',
  concurrency: 'dot-concurrency',
  collaboration: 'dot-collaboration',
  strategy: 'dot-strategy',
  appendix: 'dot-appendix'
}

const layerLineClass: Record<Layer, string> = {
  tools: 'line-tools',
  planning: 'line-planning',
  memory: 'line-memory',
  concurrency: 'line-concurrency',
  collaboration: 'line-collaboration',
  strategy: 'line-strategy',
  appendix: 'line-appendix'
}

const layerBarClass: Record<Layer, string> = {
  tools: 'bar-tools',
  planning: 'bar-planning',
  memory: 'bar-memory',
  concurrency: 'bar-concurrency',
  collaboration: 'bar-collaboration',
  strategy: 'bar-strategy',
  appendix: 'bar-appendix'
}

function chapterPercent(count: number): number {
  return Math.round((count / maxChapterCount) * 100)
}
</script>

<template>
  <div class="timeline-wrap">
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-label">Markdown 文件</div>
        <div class="summary-value">{{ totals.files }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">总行数</div>
        <div class="summary-value">{{ totals.lines }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">标题数</div>
        <div class="summary-value">{{ totals.headings }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">代码块数</div>
        <div class="summary-value">{{ totals.codeBlocks }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">词数</div>
        <div class="summary-value">{{ totals.words }}</div>
      </div>
    </div>

    <div>
      <h3 class="sub-title">能力层图例</h3>
      <div class="legend-list">
        <div v-for="layer in layerList" :key="layer.id" class="legend-item">
          <span class="legend-dot" :class="layerDotClass[layer.id]" />
          <span class="legend-text">{{ layer.label }}</span>
        </div>
      </div>
    </div>

    <div class="timeline">
      <div v-for="(item, index) in stages" :key="item.id" class="timeline-row">
        <div class="timeline-axis">
          <div class="timeline-node" :class="layerDotClass[item.layer]">{{ item.id }}</div>
          <div
            v-if="index !== stages.length - 1"
            class="timeline-line"
            :class="layerLineClass[stages[index + 1].layer]"
          />
        </div>

        <article class="timeline-card">
          <div class="timeline-meta">
            <span class="version-badge">{{ item.id }}</span>
            <span class="core-add">{{ item.chapterRange }}</span>
          </div>
          <h4 class="timeline-title">
            {{ item.title }}
            <span class="timeline-subtitle">{{ item.subtitle }}</span>
          </h4>
          <div class="stats-row">
            <span>{{ item.chapterCount }} chapters</span>
          </div>
          <div class="loc-track">
            <div class="loc-fill" :class="layerBarClass[item.layer]" :style="{ width: `${chapterPercent(item.chapterCount)}%` }" />
          </div>
          <p class="insight">“{{ item.output }}”</p>
        </article>
      </div>
    </div>

    <div>
      <h3 class="growth-title">阶段覆盖章节数</h3>
      <div class="growth-list">
        <div v-for="item in stages" :key="`growth-${item.id}`" class="growth-row">
          <span class="growth-id">{{ item.id }}</span>
          <div class="growth-track">
            <div class="growth-fill" :class="layerBarClass[item.layer]" :style="{ width: `${Math.max(8, chapterPercent(item.chapterCount))}%` }">
              <span class="growth-value">{{ item.chapterCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-wrap {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.6rem;
}

.summary-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 0.55rem 0.65rem;
  background: var(--vp-c-bg-soft);
}

.summary-label {
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
}

.summary-value {
  font-size: 1.02rem;
  font-weight: 700;
}

.sub-title,
.growth-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 700;
}

.legend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.legend-dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 999px;
}

.legend-text {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.timeline {
  position: relative;
}

.timeline-row {
  display: flex;
  gap: 1rem;
  padding-bottom: 1.2rem;
}

.timeline-axis {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-node {
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  box-shadow: 0 0 0 4px var(--vp-c-bg);
}

.timeline-line {
  width: 2px;
  flex: 1;
  min-height: 2.5rem;
}

.timeline-card {
  flex: 1;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 0.9rem 1rem;
  background: var(--vp-c-bg-soft);
  animation: card-in 0.35s ease both;
}

.timeline-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
}

.version-badge {
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--vp-c-divider);
}

.core-add {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.timeline-title {
  margin: 0.45rem 0 0;
  font-size: 1rem;
  font-weight: 700;
}

.timeline-subtitle {
  margin-left: 0.45rem;
  font-size: 0.84rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.stats-row {
  margin-top: 0.5rem;
  display: flex;
  gap: 1rem;
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
}

.loc-track,
.growth-track {
  margin-top: 0.45rem;
  width: 100%;
  background: var(--vp-c-bg);
  border-radius: 999px;
  overflow: hidden;
}

.loc-track {
  height: 0.44rem;
}

.loc-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.45s ease;
}

.insight {
  margin: 0.65rem 0 0;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}

.growth-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.growth-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.growth-id {
  width: 2.2rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.78rem;
  text-align: right;
}

.growth-track {
  height: 1.15rem;
}

.growth-fill {
  height: 100%;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.38rem;
  animation: bar-in 0.5s ease both;
}

.growth-value {
  color: #fff;
  font-size: 0.65rem;
  font-weight: 600;
}

.dot-tools,
.bar-tools { background: #3b82f6; }
.dot-planning,
.bar-planning { background: #10b981; }
.dot-memory,
.bar-memory { background: #a855f7; }
.dot-concurrency,
.bar-concurrency { background: #f59e0b; }
.dot-collaboration,
.bar-collaboration { background: #ef4444; }
.dot-strategy,
.bar-strategy { background: #ec4899; }
.dot-appendix,
.bar-appendix { background: #64748b; }

.line-tools { background: rgba(59, 130, 246, 0.35); }
.line-planning { background: rgba(16, 185, 129, 0.35); }
.line-memory { background: rgba(168, 85, 247, 0.35); }
.line-concurrency { background: rgba(245, 158, 11, 0.35); }
.line-collaboration { background: rgba(239, 68, 68, 0.35); }
.line-strategy { background: rgba(236, 72, 153, 0.35); }
.line-appendix { background: rgba(100, 116, 139, 0.35); }

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bar-in {
  from { opacity: 0.5; }
  to { opacity: 1; }
}

@media (max-width: 640px) {
  .timeline-row {
    gap: 0.7rem;
  }

  .timeline-card {
    padding: 0.8rem;
  }
}
</style>
