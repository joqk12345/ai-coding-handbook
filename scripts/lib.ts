const fs = require('node:fs');
const path = require('node:path');

const EXCLUDED_DIRS = new Set(['node_modules', '.git', '.vitepress', 'generated']);
const SUMMARY_PATH = 'SUMMARY.md';
const CORE_SUMMARY_SECTION_PATTERN = /^(前言|附录|第[一二三四五六七八九十]+部分)/;
const SUMMARY_SECTION_LINE_PATTERN = /^\*\s+\*\*(.+?)\*\*\s*$/;
const SUMMARY_ENTRY_LINE_PATTERN = /^(\s*)\*\s+\[([^\]]+)\]\(([^)]+\.md)\)\s*$/;

function walkMarkdown(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.github') continue;
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(base, fullPath).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      files.push(...walkMarkdown(fullPath, base));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(relPath);
    }
  }
  return files;
}

function listMarkdownFiles() {
  return walkMarkdown(process.cwd()).sort();
}

function normalizeMarkdownPath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if (trimmed === '[]') return [];
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1);
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1);
  return trimmed;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---\n')) return { data: {}, content: raw };
  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) return { data: {}, content: raw };
  const fm = raw.slice(4, end);
  const content = raw.slice(end + 5);
  const data = {};
  let currentArrayKey = null;
  fm.split('\n').forEach((line) => {
    if (!line.trim()) return;
    if (line.startsWith('  - ') && currentArrayKey) {
      data[currentArrayKey].push(parseScalar(line.slice(4)));
      return;
    }
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!value) {
      data[key] = [];
      currentArrayKey = key;
      return;
    }
    data[key] = parseScalar(value);
    currentArrayKey = null;
  });
  return { data, content };
}

function getSummarySections() {
  const raw = fs.readFileSync(SUMMARY_PATH, 'utf8');
  const { content } = parseFrontmatter(raw);
  const sections = [];
  let currentSection = null;
  let order = 0;

  const ensureSection = (title) => {
    let section = sections.find((item) => item.title === title);
    if (!section) {
      section = { title, entries: [] };
      sections.push(section);
    }
    return section;
  };

  content.split('\n').forEach((line) => {
    const sectionMatch = line.match(SUMMARY_SECTION_LINE_PATTERN);
    if (sectionMatch) {
      currentSection = ensureSection(sectionMatch[1].trim());
      return;
    }

    const linkMatch = line.match(SUMMARY_ENTRY_LINE_PATTERN);
    if (!linkMatch) return;

    const [, indentation, title, target] = linkMatch;
    if (!currentSection || indentation.length === 0) {
      currentSection = ensureSection('前言');
    }

    currentSection.entries.push({
      order: order + 1,
      title: title.trim(),
      filePath: normalizeMarkdownPath(target),
      sectionTitle: currentSection.title
    });
    order += 1;
  });

  return sections.filter((section) => section.entries.length > 0);
}

function getSummaryEntries() {
  return getSummarySections().flatMap((section) => section.entries);
}

function isCoreSummarySection(sectionTitle) {
  return CORE_SUMMARY_SECTION_PATTERN.test(sectionTitle);
}

function getCoreSummarySections() {
  let order = 0;
  return getSummarySections()
    .filter((section) => isCoreSummarySection(section.title))
    .map((section) => {
      const entries = section.entries.map((entry) => {
        order += 1;
        return {
          ...entry,
          order
        };
      });
      return { ...section, entries };
    });
}

function getCoreSummaryEntries() {
  return getCoreSummarySections().flatMap((section) => section.entries);
}

function getVisualizationSummarySections() {
  return getCoreSummarySections().filter((section) => section.title !== '前言');
}

function getVisualizationEntries() {
  return getVisualizationSummarySections().flatMap((section) => section.entries);
}

function extractTopLevelChapterNumber(title) {
  const match = String(title || '').trim().match(/^第(\d+)章/);
  return match ? Number(match[1]) : null;
}

function normalizeSummarySectionTitle(title, entries = []) {
  const normalizedTitle = String(title || '').trim();
  if (!/^第[一二三四五六七八九十]+部分：/.test(normalizedTitle)) return normalizedTitle;

  const chapterNumbers = entries
    .map((entry) => extractTopLevelChapterNumber(typeof entry === 'string' ? entry : entry.title))
    .filter((value) => value !== null);

  if (chapterNumbers.length === 0) return normalizedTitle;

  const minChapter = Math.min(...chapterNumbers);
  const maxChapter = Math.max(...chapterNumbers);
  const baseTitle = normalizedTitle.replace(/\s*\(第\d+(?:-\d+)?章\)\s*$/, '').trim();
  const rangeLabel = minChapter === maxChapter ? `第${minChapter}章` : `第${minChapter}-${maxChapter}章`;
  return `${baseTitle} (${rangeLabel})`;
}

function syncSummarySectionTitles() {
  const raw = fs.readFileSync(SUMMARY_PATH, 'utf8');
  const parsed = parseFrontmatter(raw);
  const lines = parsed.content.split('\n');
  let currentSection = null;
  let changed = false;

  const finalizeSection = () => {
    if (!currentSection) return;
    const expectedTitle = normalizeSummarySectionTitle(currentSection.title, currentSection.entries);
    if (expectedTitle !== currentSection.title) {
      lines[currentSection.lineIndex] = `*   **${expectedTitle}**`;
      changed = true;
    }
  };

  lines.forEach((line, index) => {
    const sectionMatch = line.match(SUMMARY_SECTION_LINE_PATTERN);
    if (sectionMatch) {
      finalizeSection();
      currentSection = {
        lineIndex: index,
        title: sectionMatch[1].trim(),
        entries: []
      };
      return;
    }

    if (!currentSection) return;
    const entryMatch = line.match(SUMMARY_ENTRY_LINE_PATTERN);
    if (entryMatch) {
      currentSection.entries.push(entryMatch[2].trim());
    }
  });

  finalizeSection();

  if (changed) {
    fs.writeFileSync(SUMMARY_PATH, stringifyFrontmatter(parsed.data, lines.join('\n')));
  }

  return changed;
}

function isCoreKnowledgeFile(filePath) {
  const normalized = normalizeMarkdownPath(filePath);
  return normalized === 'README.md' || normalized.startsWith('part-') || normalized.startsWith('appendix/');
}

function extractChapterRef(title) {
  const normalized = String(title || '').trim();
  const chapterMatch = normalized.match(/^(第[0-9一二三四五六七八九十]+章)/);
  if (chapterMatch) return chapterMatch[1];

  const decimalMatch = normalized.match(/^(\d+\.\d+)/);
  if (decimalMatch) return decimalMatch[1];

  const appendixMatch = normalized.match(/^(附录[A-Z])/);
  if (appendixMatch) return appendixMatch[1];

  const annexMatch = normalized.match(/^(附章[A-Z])/);
  if (annexMatch) return annexMatch[1];

  return normalized;
}

function escapeTableCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

function formatMarkdownTable(headers, rows) {
  const lines = [
    `| ${headers.map(escapeTableCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`
  ];

  rows.forEach((row) => {
    lines.push(`| ${row.map(escapeTableCell).join(' | ')} |`);
  });

  return lines;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceAutoGeneratedBlock(filePath, blockName, lines) {
  const startMarker = `<!-- AUTO-GENERATED:${blockName}:START -->`;
  const endMarker = `<!-- AUTO-GENERATED:${blockName}:END -->`;
  const raw = fs.readFileSync(filePath, 'utf8');
  const pattern = new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}`);

  if (!pattern.test(raw)) {
    throw new Error(`Missing auto-generated block markers '${blockName}' in ${filePath}`);
  }

  const replacement = `${startMarker}\n${lines.join('\n')}\n${endMarker}`;
  fs.writeFileSync(filePath, raw.replace(pattern, replacement));
}

function writeMarkdownFile(filePath, lines) {
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function normalizeUrl(url) {
  return String(url || '')
    .trim()
    .replace(/[),.;`]+$/g, '')
    .replace(/^<|>$/g, '');
}

function isIndexableReferenceUrl(url) {
  try {
    const parsed = new URL(url);
    return !['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function extractExternalReferences(content) {
  const found = new Set();
  const markdownLinkPattern = /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;
  const autolinkPattern = /<(https?:\/\/[^>\s]+)>/g;
  const bareUrlPattern = /https?:\/\/[^\s<>()]+/g;

  for (const pattern of [markdownLinkPattern, autolinkPattern, bareUrlPattern]) {
    for (const match of content.matchAll(pattern)) {
      const candidate = normalizeUrl(match[1] || match[0]);
      if (candidate && isIndexableReferenceUrl(candidate)) found.add(candidate);
    }
  }

  return Array.from(found);
}


function formatYamlValue(value) {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  return JSON.stringify(String(value));
}

function stringifyFrontmatter(data, content) {
  const lines = ['---'];
  const orderedKeys = [
    'id','title','slug','date','type','topics','concepts','tools','architecture_layer','timeline_era','related','references','status','display_order'
  ];
  for (const key of orderedKeys) {
    const value = data[key];
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        value.forEach((item) => lines.push(`  - ${formatYamlValue(item)}`));
      }
    } else {
      lines.push(`${key}: ${formatYamlValue(value)}`);
    }
  }
  lines.push('---', '');
  return `${lines.join('\n')}${content.startsWith('\n') ? content.slice(1) : content}`;
}

function toSlug(filePath) {
  return filePath.replace(/\.md$/i, '').replace(/[^a-zA-Z0-9/\-]+/g, '-').split('/').filter(Boolean).join('-').toLowerCase();
}

function inferType(filePath) {
  const p = filePath.toLowerCase();
  if (p.includes('reference')) return 'reference';
  if (p.includes('concept')) return 'concept';
  if (p.includes('case')) return 'case-study';
  return 'article';
}

function inferLayer(filePath) {
  if (filePath.startsWith('part-1/')) return ['foundations'];
  if (filePath.startsWith('part-2/')) return ['models-and-tools'];
  if (filePath.startsWith('part-3/') || filePath.startsWith('part-4/')) return ['workflows-and-practices'];
  if (filePath.startsWith('part-5/') || filePath.startsWith('docs/')) return ['systems-and-governance'];
  return ['workflows-and-practices'];
}

function inferDate(filePath) {
  const match = filePath.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '2025-01-01';
}

function inferEra(date) {
  if (date <= '2023-12-31') return 'early-foundations';
  if (date <= '2024-12-31') return 'agent-adoption';
  return 'autonomous-systems';
}

function extractTitle(filePath, body) {
  const heading = body.split('\n').find((line) => line.startsWith('# '));
  return heading ? heading.replace(/^#\s+/, '').trim() : path.basename(filePath, '.md');
}

function defaultMetadata(filePath, title, order) {
  const slug = toSlug(filePath);
  const date = inferDate(filePath);
  return {
    id: slug,
    title,
    slug,
    date,
    type: inferType(filePath),
    topics: [],
    concepts: [],
    tools: [],
    architecture_layer: inferLayer(filePath),
    timeline_era: inferEra(date),
    related: [],
    references: [],
    status: 'published',
    display_order: order
  };
}

function parseArticle(filePath, order = 0) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = parseFrontmatter(raw);
  const title = extractTitle(filePath, parsed.content);
  return {
    filePath,
    metadata: { ...defaultMetadata(filePath, title, order), ...parsed.data },
    body: parsed.content,
    rawData: parsed.data
  };
}

module.exports = {
  listMarkdownFiles,
  normalizeMarkdownPath,
  parseFrontmatter,
  stringifyFrontmatter,
  parseArticle,
  defaultMetadata,
  extractTitle,
  getSummarySections,
  getSummaryEntries,
  getCoreSummarySections,
  getCoreSummaryEntries,
  getVisualizationSummarySections,
  getVisualizationEntries,
  isCoreSummarySection,
  isCoreKnowledgeFile,
  normalizeSummarySectionTitle,
  syncSummarySectionTitles,
  extractChapterRef,
  formatMarkdownTable,
  replaceAutoGeneratedBlock,
  writeMarkdownFile,
  extractExternalReferences
};
