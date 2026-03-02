<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getContentGroups } from './content-analytics'

const groups = getContentGroups()
const maxLines = Math.max(...groups.map((g) => g.lines), 1)

const layerClassMap: Record<number, string> = {
  0: 'layer-tools',
  1: 'layer-planning',
  2: 'layer-memory',
  3: 'layer-concurrency',
  4: 'layer-collaboration',
  5: 'layer-appendix'
}

const contentFlowSteps = groups.map((g) => ({
  label: g.title.replace('：', ':'),
  color: 'pulse-default'
}))

const pulseCount = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (pulseCount.value >= contentFlowSteps.length) {
      pulseCount.value = 0
      return
    }
    pulseCount.value += 1
  }, 780)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const activeSteps = computed(() => contentFlowSteps.slice(0, pulseCount.value))

const flowNodes = computed(() => {
  const startY = 48
  const gap = 56
  return groups.map((group, index) => ({
    id: group.id,
    label: group.title,
    subtitle: `${group.files} files / ${group.lines} lines`,
    x: 320,
    y: startY + index * gap,
    cls: layerClassMap[index] ?? 'layer-appendix'
  }))
})

const svgHeight = computed(() => Math.max(320, 90 + flowNodes.value.length * 56))

function linesPercent(lines: number): number {
  return Math.max(4, Math.round((lines / maxLines) * 100))
}
</script>

<template>
  <div class="arch-wrap">
    <section>
      <h3 class="title">全书目录架构分层</h3>
      <div class="class-stack">
        <template v-for="(item, index) in groups" :key="item.id">
          <div v-if="index !== 0" class="arrow">↓</div>
          <article class="class-card" :class="layerClassMap[index]">
            <div class="row">
              <div>
                <div class="class-name">{{ item.title }}</div>
                <p class="class-desc">{{ item.subtitle }}</p>
              </div>
              <div class="meta">
                <span>{{ item.files }} files</span>
                <span>{{ item.headings }} headings</span>
                <span>{{ item.codeBlocks }} blocks</span>
              </div>
            </div>
            <div class="line-track">
              <div class="line-fill" :style="{ width: `${linesPercent(item.lines)}%` }" />
            </div>
          </article>
        </template>
      </div>
    </section>

    <section>
      <h3 class="title">内容流（按分部脉冲）</h3>
      <div class="msg-box">
        <div class="msg-header">
          <span>content_flow[]</span>
          <span class="len">len={{ pulseCount }}</span>
        </div>
        <div class="msg-list">
          <span
            v-for="(step, i) in activeSteps"
            :key="`${step.label}-${i}`"
            class="msg-chip"
            :class="step.color"
          >
            {{ step.label }}
          </span>
          <span v-if="pulseCount === 0" class="msg-empty">[]</span>
        </div>
      </div>
    </section>

    <section>
      <h3 class="title">分部关系流图</h3>
      <div class="svg-box">
        <svg :viewBox="`0 0 640 ${svgHeight}`" class="flow-svg" role="img" aria-label="book content flow">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--vp-c-text-2)" />
            </marker>
          </defs>

          <template v-for="(node, index) in flowNodes" :key="node.id">
            <path
              v-if="index !== flowNodes.length - 1"
              :d="`M ${node.x} ${node.y + 16} L ${node.x} ${flowNodes[index + 1].y - 18}`"
              class="edge"
              marker-end="url(#arrow)"
            />

            <rect
              :x="node.x - 185"
              :y="node.y - 18"
              width="370"
              height="40"
              rx="8"
              class="node"
              :class="node.cls"
            />
            <text :x="node.x" :y="node.y - 2" text-anchor="middle" class="node-text">
              {{ node.label }}
            </text>
            <text :x="node.x" :y="node.y + 12" text-anchor="middle" class="node-text-small">
              {{ node.subtitle }}
            </text>
          </template>
        </svg>
      </div>
    </section>
  </div>
</template>

<style scoped>
.arch-wrap {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.title {
  margin: 0 0 0.7rem;
  font-size: 1rem;
  font-weight: 700;
}

.class-stack {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.arrow {
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
}

.class-card {
  border: 2px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  background: var(--vp-c-bg-soft);
  animation: fade-up 0.3s ease both;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.class-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.9rem;
  font-weight: 700;
}

.class-desc {
  margin: 0.22rem 0 0;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.meta {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}

.line-track {
  margin-top: 0.5rem;
  height: 0.3rem;
  width: 100%;
  border-radius: 999px;
  background: var(--vp-c-bg);
  overflow: hidden;
}

.line-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--vp-c-text-1);
}

.msg-box,
.svg-box {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 0.85rem;
}

.msg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.len {
  padding: 0.1rem 0.38rem;
  border-radius: 5px;
  background: var(--vp-c-bg);
}

.msg-list {
  margin-top: 0.6rem;
  display: flex;
  gap: 0.42rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
}

.msg-chip {
  white-space: nowrap;
  color: #fff;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.64rem;
  padding: 0.25rem 0.45rem;
  animation: chip-in 0.22s ease both;
}

.msg-empty {
  font-size: 0.76rem;
  color: var(--vp-c-text-3);
}

.pulse-default { background: #334155; }

.flow-svg {
  width: 100%;
  height: auto;
  min-height: 260px;
}

.edge {
  stroke: var(--vp-c-text-2);
  stroke-width: 1.5;
  fill: none;
}

.node {
  fill: none;
  stroke-width: 2;
}

.node-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  fill: var(--vp-c-text-1);
}

.node-text-small {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 9px;
  fill: var(--vp-c-text-2);
}

.layer-tools {
  border-color: rgba(59, 130, 246, 0.45);
  background: rgba(59, 130, 246, 0.08);
}

.layer-planning {
  border-color: rgba(16, 185, 129, 0.45);
  background: rgba(16, 185, 129, 0.08);
}

.layer-memory {
  border-color: rgba(168, 85, 247, 0.45);
  background: rgba(168, 85, 247, 0.08);
}

.layer-concurrency {
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.08);
}

.layer-collaboration {
  border-color: rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.08);
}

.layer-appendix {
  border-color: rgba(100, 116, 139, 0.45);
  background: rgba(100, 116, 139, 0.08);
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes chip-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 640px) {
  .row {
    flex-direction: column;
    gap: 0.35rem;
  }

  .meta {
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>
