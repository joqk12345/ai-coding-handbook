<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface ArchClass {
  name: string
  introducedIn: string
  description: string
  layer: 'tools' | 'planning' | 'memory' | 'concurrency' | 'collaboration'
  isNew?: boolean
}

const classes = ref<ArchClass[]>([
  {
    name: 'TodoManager',
    introducedIn: 's03',
    description: '可见任务规划与约束管理',
    layer: 'planning'
  },
  {
    name: 'SkillLoader',
    introducedIn: 's05',
    description: '从 SKILL.md 动态加载领域能力',
    layer: 'planning'
  },
  {
    name: 'ContextManager',
    introducedIn: 's06',
    description: '三层上下文压缩与预算控制',
    layer: 'memory'
  },
  {
    name: 'TaskManager',
    introducedIn: 's07',
    description: '文件化任务状态持久化与依赖管理',
    layer: 'memory'
  },
  {
    name: 'BackgroundManager',
    introducedIn: 's09',
    description: '非阻塞后台执行与通知队列',
    layer: 'concurrency'
  },
  {
    name: 'TeammateManager',
    introducedIn: 's12',
    description: '多 Agent 生命周期调度',
    layer: 'collaboration',
    isNew: true
  },
  {
    name: 'SharedBoard',
    introducedIn: 's12',
    description: '跨 Agent 共享状态与冲突协调',
    layer: 'collaboration',
    isNew: true
  }
])

const layerClassMap: Record<ArchClass['layer'], string> = {
  tools: 'layer-tools',
  planning: 'layer-planning',
  memory: 'layer-memory',
  concurrency: 'layer-concurrency',
  collaboration: 'layer-collaboration'
}

const messageSteps = [
  { label: 'user', color: 'msg-user' },
  { label: 'assistant', color: 'msg-assistant' },
  { label: 'tool_call', color: 'msg-tool-call' },
  { label: 'tool_result', color: 'msg-tool-result' },
  { label: 'assistant', color: 'msg-assistant' },
  { label: 'tool_call', color: 'msg-tool-call' },
  { label: 'tool_result', color: 'msg-tool-result' },
  { label: 'assistant(final)', color: 'msg-assistant' }
]

const activeCount = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (activeCount.value >= messageSteps.length) {
      activeCount.value = 0
      return
    }
    activeCount.value += 1
  }, 780)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const activeSteps = computed(() => messageSteps.slice(0, activeCount.value))
</script>

<template>
  <div class="arch-wrap">
    <section>
      <h3 class="title">架构类栈演进</h3>
      <div class="class-stack">
        <template v-for="(item, index) in [...classes].reverse()" :key="item.name">
          <div v-if="index !== 0" class="arrow">↓</div>
          <article class="class-card" :class="layerClassMap[item.layer]">
            <div class="row">
              <div>
                <div class="class-name">{{ item.name }}</div>
                <p class="class-desc">{{ item.description }}</p>
              </div>
              <div class="meta">
                <span>{{ item.introducedIn }}</span>
                <span v-if="item.isNew" class="new-tag">NEW</span>
              </div>
            </div>
          </article>
        </template>
      </div>
    </section>

    <section>
      <h3 class="title">消息流（messages[]）</h3>
      <div class="msg-box">
        <div class="msg-header">
          <span>messages[]</span>
          <span class="len">len={{ activeCount }}</span>
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
          <span v-if="activeCount === 0" class="msg-empty">[]</span>
        </div>
      </div>
    </section>

    <section>
      <h3 class="title">执行流程图（Execution Flow）</h3>
      <div class="svg-box">
        <svg viewBox="0 0 640 360" class="flow-svg" role="img" aria-label="agent execution flow">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--vp-c-text-2)" />
            </marker>
          </defs>

          <path d="M320 42 L320 74" class="edge" marker-end="url(#arrow)" />
          <path d="M320 108 L320 136" class="edge" marker-end="url(#arrow)" />
          <path d="M320 186 L320 216" class="edge" marker-end="url(#arrow)" />
          <path d="M320 256 L320 286" class="edge" marker-end="url(#arrow)" />

          <rect x="250" y="18" width="140" height="30" rx="16" class="node node-start" />
          <text x="320" y="37" text-anchor="middle" class="node-text">User Prompt</text>

          <rect x="250" y="74" width="140" height="34" rx="6" class="node node-process" />
          <text x="320" y="95" text-anchor="middle" class="node-text">Build Context</text>

          <polygon points="320,136 350,161 320,186 290,161" class="node node-decision" />
          <text x="320" y="164" text-anchor="middle" class="node-text-small">Need Tool?</text>

          <rect x="250" y="216" width="140" height="40" rx="6" class="node node-subprocess" />
          <text x="320" y="231" text-anchor="middle" class="node-text-small">Tool Call +</text>
          <text x="320" y="246" text-anchor="middle" class="node-text-small">Tool Result</text>

          <rect x="250" y="286" width="140" height="30" rx="16" class="node node-end" />
          <text x="320" y="305" text-anchor="middle" class="node-text">Final Answer</text>

          <text x="336" y="205" class="label">loop until done</text>
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
  font-size: 0.93rem;
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
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.new-tag {
  background: var(--vp-c-text-1);
  color: var(--vp-c-bg);
  border-radius: 999px;
  padding: 0.02rem 0.45rem;
  font-size: 0.62rem;
  font-weight: 700;
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

.msg-user { background: #3b82f6; }
.msg-assistant { background: #52525b; }
.msg-tool-call { background: #f59e0b; }
.msg-tool-result { background: #10b981; }

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

.node-start { stroke: #3b82f6; }
.node-process { stroke: #10b981; }
.node-decision { stroke: #f59e0b; }
.node-subprocess {
  stroke: #a855f7;
  stroke-dasharray: 6 4;
}
.node-end { stroke: #ef4444; }

.node-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  fill: var(--vp-c-text-1);
}

.node-text-small {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 10px;
  fill: var(--vp-c-text-1);
}

.label {
  font-size: 10px;
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
  }
}
</style>
