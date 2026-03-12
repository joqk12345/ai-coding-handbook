<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps({
  encoded: {
    type: String,
    required: true
  }
})

const root = ref(null)
const isRendered = ref(false)
const renderError = ref('')

const code = computed(() => {
  try {
    const binary = atob(props.encoded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
})

let mermaidModulePromise
let mermaidInitialized = false

async function loadMermaid() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')
  }
  return mermaidModulePromise
}

async function renderDiagram() {
  if (typeof window === 'undefined' || !root.value || !code.value) return

  isRendered.value = false
  renderError.value = ''

  try {
    const mermaidModule = await loadMermaid()
    const mermaid = mermaidModule.default

    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'neutral'
      })
      mermaidInitialized = true
    }

    const renderTarget = root.value
    renderTarget.innerHTML = ''

    const id = `mermaid-${Math.random().toString(36).slice(2, 10)}`
    const { svg } = await mermaid.render(id, code.value)
    renderTarget.innerHTML = svg
    isRendered.value = true
  } catch (error) {
    renderError.value = error instanceof Error ? error.message : 'Mermaid 渲染失败'
  }
}

onMounted(async () => {
  await nextTick()
  await renderDiagram()
})

watch(code, async () => {
  await nextTick()
  await renderDiagram()
})
</script>

<template>
  <div class="mermaid-block">
    <div ref="root" class="mermaid-block__canvas" />
    <details v-if="renderError" class="mermaid-block__error">
      <summary>Mermaid 渲染失败，展开查看源码</summary>
      <pre><code>{{ code }}</code></pre>
      <p>{{ renderError }}</p>
    </details>
  </div>
</template>

<style scoped>
.mermaid-block {
  margin: 20px 0;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 16px;
  background: linear-gradient(180deg, #fcfcfd 0%, #f6f7f9 100%);
  overflow: hidden;
}

.mermaid-block__canvas {
  padding: 18px 18px 12px;
}

:deep(svg) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}

.mermaid-block__error {
  padding: 0 18px 18px;
  color: #4b5563;
}

.mermaid-block__error summary {
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 10px;
}

.mermaid-block__error pre {
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.04);
  overflow-x: auto;
}

.mermaid-block__error p {
  margin: 10px 0 0;
  font-size: 13px;
}
</style>
