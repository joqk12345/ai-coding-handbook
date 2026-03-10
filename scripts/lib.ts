const fs = require('node:fs');
const path = require('node:path');

const EXCLUDED_DIRS = new Set(['node_modules', '.git', '.vitepress', 'generated']);

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
  parseFrontmatter,
  stringifyFrontmatter,
  parseArticle,
  defaultMetadata,
  extractTitle
};
