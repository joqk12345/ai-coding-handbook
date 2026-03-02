<script setup lang="ts">
interface VersionItem {
  id: string
  title: string
  subtitle: string
  coreAddition: string
  loc: number
  tools: number
  layer: 'tools' | 'planning' | 'memory' | 'concurrency' | 'collaboration'
  keyInsight?: string
}

const layerList = [
  { id: 'tools', label: 'Tools 层' },
  { id: 'planning', label: 'Planning 层' },
  { id: 'memory', label: 'Memory 层' },
  { id: 'concurrency', label: 'Concurrency 层' },
  { id: 'collaboration', label: 'Collaboration 层' }
] as const

const versions: VersionItem[] = [
  {
    id: 's01',
    title: '最小可运行 Agent',
    subtitle: 'Single Loop',
    coreAddition: 'read_file / write_file / run_command',
    loc: 120,
    tools: 3,
    layer: 'tools',
    keyInsight: '先建立最小闭环，再追求复杂能力。'
  },
  {
    id: 's03',
    title: '任务规划引入',
    subtitle: 'Task Planning',
    coreAddition: 'TodoManager + 可见任务状态',
    loc: 245,
    tools: 5,
    layer: 'planning',
    keyInsight: '把隐性推理转换为显性任务状态。'
  },
  {
    id: 's06',
    title: '上下文治理',
    subtitle: 'Memory & Compression',
    coreAddition: 'ContextManager + 分层压缩',
    loc: 388,
    tools: 7,
    layer: 'memory',
    keyInsight: '上下文不是越大越好，而是越有效越好。'
  },
  {
    id: 's09',
    title: '并发执行',
    subtitle: 'Background Tasks',
    coreAddition: 'BackgroundManager + 异步任务队列',
    loc: 536,
    tools: 9,
    layer: 'concurrency',
    keyInsight: '并发的价值在于非阻塞，不在于盲目并行。'
  },
  {
    id: 's12',
    title: '多 Agent 协同',
    subtitle: 'Team Collaboration',
    coreAddition: 'TeammateManager + SharedBoard',
    loc: 740,
    tools: 12,
    layer: 'collaboration',
    keyInsight: '协作能力决定了复杂任务的上限。'
  }
]

const maxLoc = Math.max(...versions.map((v) => v.loc))

const layerDotClass: Record<VersionItem['layer'], string> = {
  tools: 'dot-tools',
  planning: 'dot-planning',
  memory: 'dot-memory',
  concurrency: 'dot-concurrency',
  collaboration: 'dot-collaboration'
}

const layerLineClass: Record<VersionItem['layer'], string> = {
  tools: 'line-tools',
  planning: 'line-planning',
  memory: 'line-memory',
  concurrency: 'line-concurrency',
  collaboration: 'line-collaboration'
}

const layerBarClass: Record<VersionItem['layer'], string> = {
  tools: 'bar-tools',
  planning: 'bar-planning',
  memory: 'bar-memory',
  concurrency: 'bar-concurrency',
  collaboration: 'bar-collaboration'
}

function locPercent(loc: number): number {
  return Math.round((loc / maxLoc) * 100)
}
</script>

<template>
  <div class="timeline-wrap">
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
      <div v-for="(item, index) in versions" :key="item.id" class="timeline-row">
        <div class="timeline-axis">
          <div class="timeline-node" :class="layerDotClass[item.layer]">{{ item.id }}</div>
          <div
            v-if="index !== versions.length - 1"
            class="timeline-line"
            :class="layerLineClass[versions[index + 1].layer]"
          />
        </div>

        <article class="timeline-card">
          <div class="timeline-meta">
            <span class="version-badge">{{ item.id }}</span>
            <span class="core-add">{{ item.coreAddition }}</span>
          </div>
          <h4 class="timeline-title">
            {{ item.title }}
            <span class="timeline-subtitle">{{ item.subtitle }}</span>
          </h4>
          <div class="stats-row">
            <span>{{ item.loc }} LOC</span>
            <span>{{ item.tools }} tools</span>
          </div>
          <div class="loc-track">
            <div class="loc-fill" :class="layerBarClass[item.layer]" :style="{ width: `${locPercent(item.loc)}%` }" />
          </div>
          <p v-if="item.keyInsight" class="insight">“{{ item.keyInsight }}”</p>
        </article>
      </div>
    </div>

    <div>
      <h3 class="growth-title">LOC 增长轨迹</h3>
      <div class="growth-list">
        <div v-for="item in versions" :key="`growth-${item.id}`" class="growth-row">
          <span class="growth-id">{{ item.id }}</span>
          <div class="growth-track">
            <div class="growth-fill" :class="layerBarClass[item.layer]" :style="{ width: `${Math.max(4, locPercent(item.loc))}%` }">
              <span class="growth-value">{{ item.loc }}</span>
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

.line-tools { background: rgba(59, 130, 246, 0.35); }
.line-planning { background: rgba(16, 185, 129, 0.35); }
.line-memory { background: rgba(168, 85, 247, 0.35); }
.line-concurrency { background: rgba(245, 158, 11, 0.35); }
.line-collaboration { background: rgba(239, 68, 68, 0.35); }

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
