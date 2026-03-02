type RawModules = Record<string, string>

const markdownModules: RawModules = {
  ...(import.meta.glob('/part-1-introduction/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true
  }) as RawModules),
  ...(import.meta.glob('/part-2-core-tools/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true
  }) as RawModules),
  ...(import.meta.glob('/part-3-advanced-techniques/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true
  }) as RawModules),
  ...(import.meta.glob('/part-4-practice/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true
  }) as RawModules),
  ...(import.meta.glob('/part-5-self-driving-codebase/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true
  }) as RawModules),
  ...(import.meta.glob('/appendix/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true
  }) as RawModules)
}

export interface ContentGroup {
  id: string
  title: string
  subtitle: string
  files: number
  lines: number
  headings: number
  codeBlocks: number
  words: number
}

const PART_META: Record<string, { title: string; subtitle: string }> = {
  'part-1-introduction': { title: '第一部分：入门', subtitle: 'Foundations' },
  'part-2-core-tools': { title: '第二部分：核心工具详解', subtitle: 'Core Tools' },
  'part-3-advanced-techniques': { title: '第三部分：高级技巧与实战', subtitle: 'Advanced Techniques' },
  'part-4-practice': { title: '第四部分：实践 - 从零构建 Agent', subtitle: 'Practice' },
  'part-5-self-driving-codebase': { title: '第五部分：自主代码库', subtitle: 'Self-driving Codebase' },
  appendix: { title: '附录', subtitle: 'Appendix' }
}

const ORDER = [
  'part-1-introduction',
  'part-2-core-tools',
  'part-3-advanced-techniques',
  'part-4-practice',
  'part-5-self-driving-codebase',
  'appendix'
]

function countMatches(content: string, pattern: RegExp): number {
  const m = content.match(pattern)
  return m ? m.length : 0
}

function countWords(content: string): number {
  return content
    .replace(/`[^`]*`/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

export function getContentGroups(): ContentGroup[] {
  const grouped = new Map<string, ContentGroup>()

  for (const [path, raw] of Object.entries(markdownModules)) {
    const normalized = path.startsWith('/') ? path.slice(1) : path
    const root = normalized.split('/')[0]
    if (!PART_META[root]) continue

    const current = grouped.get(root) ?? {
      id: root,
      title: PART_META[root].title,
      subtitle: PART_META[root].subtitle,
      files: 0,
      lines: 0,
      headings: 0,
      codeBlocks: 0,
      words: 0
    }

    current.files += 1
    current.lines += raw.split('\n').length
    current.headings += countMatches(raw, /^#{1,6}\s+/gm)
    current.codeBlocks += Math.floor(countMatches(raw, /^```/gm) / 2)
    current.words += countWords(raw)

    grouped.set(root, current)
  }

  return ORDER.map((id) => grouped.get(id)).filter(Boolean) as ContentGroup[]
}

export function getGlobalTotals(groups: ContentGroup[]) {
  return groups.reduce(
    (acc, item) => {
      acc.files += item.files
      acc.lines += item.lines
      acc.headings += item.headings
      acc.codeBlocks += item.codeBlocks
      acc.words += item.words
      return acc
    },
    { files: 0, lines: 0, headings: 0, codeBlocks: 0, words: 0 }
  )
}
