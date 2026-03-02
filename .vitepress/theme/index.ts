import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import TimelineVisualization from './components/TimelineVisualization.vue'
import ArchitectureVisualization from './components/ArchitectureVisualization.vue'

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('TimelineVisualization', TimelineVisualization)
    app.component('ArchitectureVisualization', ArchitectureVisualization)
  }
}

export default theme
