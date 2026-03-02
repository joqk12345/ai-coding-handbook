<script setup lang="ts">
import { computed } from 'vue'
import { getContentGroups, getGlobalTotals } from './content-analytics'

type Layer = 'tools' | 'planning' | 'memory' | 'concurrency' | 'collaboration' | 'appendix'

const groups = getContentGroups()
const totals = getGlobalTotals(groups)

const maxLines = Math.max(...groups.map((v) => v.lines), 1)

const layerByIndex: Layer[] = [
  'tools',
  'planning',
  'memory',
  'concurrency',
  'collaboration',
  'appendix'
]

const timelineData = computed(() =>
  groups.map((group, index) => ({
    ...group,
    layer: layerByIndex[index] ?? 'appendix'
  }))
)

const layerList = [
  { id: 'tools', label: 'Tools 语义层' },
  { id: 'planning', label: 'Planning 结构层' },
  { id: 'memory', label: 'Memory 内容层' },
  { id: 'concurrency', label: 'Concurrency 实战层' },
  { id: 'collaboration', label: 'Collaboration 协作层' },
  { id: 'appendix', label: 'Appendix 支撑层' }
] as const

const layerDotClass: Record<Layer, string> = {
  tools: 'dot-tools',
  planning: 'dot-planning',
  memory: 'dot-memory',
  concurrency: 'dot-concurrency',
  collaboration: 'dot-collaboration',
  appendix: 'dot-appendix'
}

const layerLineClass: Record<Layer, string> = {
  tools: 'line-tools',
  planning: 'line-planning',
  memory: 'line-memory',
  concurrency: 'line-concurrency',
  collaboration: 'line-collaboration',
  appendix: 'line-appendix'
}

const layerBarClass: Record<Layer, string> = {
  tools: 'bar-tools',
  planning: 'bar-planning',
  memory: 'bar-memory',
  concurrency: 'bar-concurrency',
  collaboration: 'bar-collaboration',
  appendix: 'bar-appendix'
}

function linesPercent(lines: number): number {
  return Math.round((lines / maxLines) * 100)
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
      <h3 class="sub-title">全书能力层图例</h3>
      <div class="legend-list">
        <div v-for="layer in layerList" :key="layer.id" class="legend-item">
          <span class="legend-dot" :class="layerDotClass[layer.id]" />
          <span class="legend-text">{{ layer.label }}</span>
        </div>
      </div>
    </div>

    <div class="timeline">
      <div v-for="(item, index) in timelineData" :key="item.id" class="timeline-row">
        <div class="timeline-axis">
          <div class="timeline-node" :class="layerDotClass[item.layer]">P{{ index + 1 }}</div>
          <div
            v-if="index !== timelineData.length - 1"
            class="timeline-line"
            :class="layerLineClass[timelineData[index + 1].layer]"
          />
        </div>

        <article class="timeline-card">
          <div class="timeline-meta">
            <span class="version-badge">{{ item.id }}</span>
            <span class="core-add">{{ item.subtitle }}</span>
          </div>
          <h4 class="timeline-title">{{ item.title }}</h4>
          <div class="stats-row">
            <span>{{ item.files }} files</span>
            <span>{{ item.lines }} lines</span>
            <span>{{ item.headings }} headings</span>
            <span>{{ item.codeBlocks }} code blocks</span>
          </div>
          <div class="loc-track">
            <div class="loc-fill" :class="layerBarClass[item.layer]" :style="{ width: `${linesPercent(item.lines)}%` }" />
          </div>
        </article>
      </div>
    </div>

    <div>
      <h3 class="growth-title">分部内容体量（按行数）</h3>
      <div class="growth-list">
        <div v-for="item in timelineData" :key="`growth-${item.id}`" class="growth-row">
          <span class="growth-id">{{ item.id }}</span>
          <div class="growth-track">
            <div class="growth-fill" :class="layerBarClass[item.layer]" :style="{ width: `${Math.max(6, linesPercent(item.lines))}%` }">
              <span class="growth-value">{{ item.lines }}</span>
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

.stats-row {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
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
  width: 8.7rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.72rem;
  text-align: right;
  color: var(--vp-c-text-2);
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
.dot-appendix,
.bar-appendix { background: #64748b; }

.line-tools { background: rgba(59, 130, 246, 0.35); }
.line-planning { background: rgba(16, 185, 129, 0.35); }
.line-memory { background: rgba(168, 85, 247, 0.35); }
.line-concurrency { background: rgba(245, 158, 11, 0.35); }
.line-collaboration { background: rgba(239, 68, 68, 0.35); }
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

  .growth-id {
    width: 5.8rem;
    font-size: 0.66rem;
  }
}
</style>
