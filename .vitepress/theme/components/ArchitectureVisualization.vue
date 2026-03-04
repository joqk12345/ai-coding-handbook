<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Layer = 'tools' | 'planning' | 'memory' | 'concurrency' | 'collaboration' | 'strategy' | 'appendix'

interface LayerItem {
  id: string
  name: string
  chapterRange: string
  question: string
  output: string
  layer: Layer
}

const layers: LayerItem[] = [
  {
    id: 'L1',
    name: '认知层',
    chapterRange: '第1章 + 第2章 + Agent 本质',
    question: 'AI 编程改变了什么边界？',
    output: '统一术语与问题定义',
    layer: 'tools'
  },
  {
    id: 'L2',
    name: '工具层',
    chapterRange: '第2章 + 2.1-2.11',
    question: '如何稳定驱动 Claude Code？',
    output: '命令、上下文、技能的标准化流程',
    layer: 'planning'
  },
  {
    id: 'L3',
    name: '选型层',
    chapterRange: '第3章-第6章',
    question: '不同任务如何选择合适模型？',
    output: '多工具对比与迁移策略',
    layer: 'memory'
  },
  {
    id: 'L4',
    name: '工程层',
    chapterRange: '第7章-第9章',
    question: '如何形成可验证交付闭环？',
    output: 'Prompt + Test + Debug 工作流',
    layer: 'concurrency'
  },
  {
    id: 'L5',
    name: '系统层',
    chapterRange: '第10章-第12章',
    question: '如何构建可扩展 Agent 系统？',
    output: '任务、后台、多智能体协作架构',
    layer: 'collaboration'
  },
  {
    id: 'L6',
    name: '组织层',
    chapterRange: '第13章 + 第14章',
    question: '如何把个人速度升级为团队速度？',
    output: '治理与扩展路线图',
    layer: 'strategy'
  },
  {
    id: 'L7',
    name: '支撑层',
    chapterRange: '附录A + 附录B',
    question: '如何持续更新工具与知识？',
    output: '资源体系与长期学习机制',
    layer: 'appendix'
  }
]

const layerClassMap: Record<Layer, string> = {
  tools: 'layer-tools',
  planning: 'layer-planning',
  memory: 'layer-memory',
  concurrency: 'layer-concurrency',
  collaboration: 'layer-collaboration',
  strategy: 'layer-strategy',
  appendix: 'layer-appendix'
}

const dependencySteps = [
  { label: 'L1->L2', color: 'pulse-tools' },
  { label: 'L2->L4', color: 'pulse-planning' },
  { label: 'L3<->L4', color: 'pulse-memory' },
  { label: 'L4->L5', color: 'pulse-concurrency' },
  { label: 'L5->L6', color: 'pulse-collaboration' },
  { label: 'L7 across all', color: 'pulse-appendix' }
]

const pulseCount = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (pulseCount.value >= dependencySteps.length) {
      pulseCount.value = 0
      return
    }
    pulseCount.value += 1
  }, 780)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const activeSteps = computed(() => dependencySteps.slice(0, pulseCount.value))

const flowNodes = computed(() => {
  const startY = 48
  const gap = 44
  return layers.map((item, index) => ({
    id: item.id,
    label: `${item.id} ${item.name}`,
    subtitle: item.chapterRange,
    x: 320,
    y: startY + index * gap,
    cls: layerClassMap[item.layer]
  }))
})

const svgHeight = computed(() => Math.max(360, 90 + flowNodes.value.length * 44))
</script>

<template>
  <div class="arch-wrap">
    <section>
      <h3 class="title">分层能力架构（L1-L7）</h3>
      <div class="class-stack">
        <template v-for="(item, index) in layers" :key="item.id">
          <div v-if="index !== 0" class="arrow">↓</div>
          <article class="class-card" :class="layerClassMap[item.layer]">
            <div class="row">
              <div>
                <div class="class-name">{{ item.id }} · {{ item.name }}</div>
                <p class="class-desc">{{ item.question }}</p>
              </div>
              <div class="meta">
                <span>{{ item.chapterRange }}</span>
              </div>
            </div>
            <p class="layer-output">{{ item.output }}</p>
          </article>
        </template>
      </div>
    </section>

    <section>
      <h3 class="title">跨层依赖脉冲</h3>
      <div class="msg-box">
        <div class="msg-header">
          <span>dependencies[]</span>
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
      <h3 class="title">主线关系流图</h3>
      <div class="svg-box">
        <svg :viewBox="`0 0 640 ${svgHeight}`" class="flow-svg" role="img" aria-label="book architecture flow">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--vp-c-text-2)" />
            </marker>
          </defs>

          <template v-for="(node, index) in flowNodes" :key="node.id">
            <path
              v-if="index !== flowNodes.length - 1"
              :d="`M ${node.x} ${node.y + 12} L ${node.x} ${flowNodes[index + 1].y - 14}`"
              class="edge"
              marker-end="url(#arrow)"
            />

            <rect
              :x="node.x - 185"
              :y="node.y - 14"
              width="370"
              height="32"
              rx="8"
              class="node"
              :class="node.cls"
            />
            <text :x="node.x" :y="node.y - 1" text-anchor="middle" class="node-text">
              {{ node.label }}
            </text>
            <text :x="node.x" :y="node.y + 11" text-anchor="middle" class="node-text-small">
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
  gap: 0.45rem;
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}

.layer-output {
  margin: 0.4rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
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

.pulse-tools { background: #3b82f6; }
.pulse-planning { background: #10b981; }
.pulse-memory { background: #a855f7; }
.pulse-concurrency { background: #f59e0b; }
.pulse-collaboration { background: #ef4444; }
.pulse-appendix { background: #64748b; }

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

.layer-strategy {
  border-color: rgba(236, 72, 153, 0.45);
  background: rgba(236, 72, 153, 0.08);
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
