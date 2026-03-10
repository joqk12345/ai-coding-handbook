const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const {
  defaultMetadata,
  extractExternalReferences,
  extractTitle,
  getSummaryEntries,
  isCoreKnowledgeFile,
  listMarkdownFiles,
  normalizeMarkdownPath,
  parseFrontmatter,
  stringifyFrontmatter
} = require('./lib.ts');

const SUMMARY_PATH = 'SUMMARY.md';
const ENTRY_LINE_PATTERN = /^(\s*)\*\s+\[([^\]]+)\]\(([^)]+\.md)\)\s*$/;
const SECTION_PATTERNS = [
  { matcher: (filePath) => filePath.startsWith('part-1/'), pattern: /^\*\s+\*\*第一部分：/ },
  { matcher: (filePath) => filePath.startsWith('part-2/'), pattern: /^\*\s+\*\*第二部分：/ },
  { matcher: (filePath) => filePath.startsWith('part-3/'), pattern: /^\*\s+\*\*第三部分：/ },
  { matcher: (filePath) => filePath.startsWith('part-4/'), pattern: /^\*\s+\*\*第四部分：/ },
  { matcher: (filePath) => filePath.startsWith('part-5/'), pattern: /^\*\s+\*\*第五部分：/ },
  { matcher: (filePath) => filePath.startsWith('appendix/'), pattern: /^\*\s+\*\*附录\*\*/ }
];

function printUsageAndExit() {
  console.error('Usage: npm run knowledge:adopt -- <file.md> [more files...]');
  console.error('   or: npm run knowledge:adopt -- --all-orphans');
  process.exit(1);
}

function toLetterIndex(letter) {
  return String(letter || '').toUpperCase().charCodeAt(0) - 64;
}

function getTitleSortKey(title, metadata = {}) {
  const normalized = String(title || '').trim();

  let match = normalized.match(/^第(\d+)章/);
  if (match) return [0, Number(match[1]), 0, Number(metadata.display_order) || 0, normalized];

  match = normalized.match(/^(\d+)\.(\d+)/);
  if (match) return [1, Number(match[1]), Number(match[2]), Number(metadata.display_order) || 0, normalized];

  match = normalized.match(/^附章([A-Z])/i);
  if (match) return [2, toLetterIndex(match[1]), 0, Number(metadata.display_order) || 0, normalized];

  match = normalized.match(/^附录([A-Z])/i);
  if (match) return [3, toLetterIndex(match[1]), 0, Number(metadata.display_order) || 0, normalized];

  return [9, Number(metadata.display_order) || Number.MAX_SAFE_INTEGER, 0, 0, normalized];
}

function compareSortKeys(left, right) {
  const max = Math.max(left.length, right.length);
  for (let index = 0; index < max; index += 1) {
    const leftValue = left[index] ?? '';
    const rightValue = right[index] ?? '';
    if (leftValue === rightValue) continue;
    return leftValue < rightValue ? -1 : 1;
  }
  return 0;
}

function ingestFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = parseFrontmatter(raw);
  const defaults = defaultMetadata(filePath, extractTitle(filePath, content), Number(data.display_order) || 0);
  const merged = { ...defaults, ...data };
  const detectedReferences = extractExternalReferences(content);
  const manualReferences = (merged.references || []).filter((ref) => !String(ref).startsWith('http://') && !String(ref).startsWith('https://'));
  merged.references = [...manualReferences, ...detectedReferences];

  const updatedRaw = stringifyFrontmatter(merged, content);
  if (updatedRaw !== raw) {
    fs.writeFileSync(filePath, updatedRaw);
  }

  return {
    filePath,
    title: String(merged.title || extractTitle(filePath, content)).trim(),
    metadata: merged
  };
}

function resolveSectionPattern(filePath) {
  const matched = SECTION_PATTERNS.find((item) => item.matcher(filePath));
  if (!matched) {
    throw new Error(`No SUMMARY section mapping for ${filePath}`);
  }
  return matched.pattern;
}

function findSectionEnd(lines, sectionStart) {
  for (let index = sectionStart + 1; index < lines.length; index += 1) {
    if (/^\*\s+\*\*.+\*\*\s*$/.test(lines[index])) return index;
  }
  return lines.length;
}

function upsertSummaryEntry(filePath, title, metadata) {
  const raw = fs.readFileSync(SUMMARY_PATH, 'utf8');
  const parsed = parseFrontmatter(raw);
  const lines = parsed.content.split('\n');
  const normalizedPath = normalizeMarkdownPath(filePath);
  const nextLines = lines.filter((line) => {
    const match = line.match(ENTRY_LINE_PATTERN);
    return !match || normalizeMarkdownPath(match[3]) !== normalizedPath;
  });

  const sectionPattern = resolveSectionPattern(normalizedPath);
  const sectionStart = nextLines.findIndex((line) => sectionPattern.test(line));
  if (sectionStart === -1) {
    throw new Error(`Target SUMMARY section not found for ${filePath}`);
  }

  const sectionEnd = findSectionEnd(nextLines, sectionStart);
  const newSortKey = getTitleSortKey(title, metadata);
  let insertIndex = sectionEnd;

  for (let index = sectionStart + 1; index < sectionEnd; index += 1) {
    const match = nextLines[index].match(ENTRY_LINE_PATTERN);
    if (!match) continue;
    const existingSortKey = getTitleSortKey(match[2], {});
    if (compareSortKeys(newSortKey, existingSortKey) < 0) {
      insertIndex = index;
      break;
    }
  }

  nextLines.splice(insertIndex, 0, `    *   [${title}](${normalizedPath})`);
  fs.writeFileSync(SUMMARY_PATH, stringifyFrontmatter(parsed.data, nextLines.join('\n')));
}

function resolveTargets(args) {
  if (args.includes('--all-orphans')) {
    const summaryPaths = new Set(getSummaryEntries().map((entry) => normalizeMarkdownPath(entry.filePath)));
    return listMarkdownFiles()
      .map(normalizeMarkdownPath)
      .filter((filePath) => isCoreKnowledgeFile(filePath) && filePath !== 'README.md' && !summaryPaths.has(filePath));
  }

  const fileArgs = args.filter((arg) => !arg.startsWith('--')).map(normalizeMarkdownPath);
  if (fileArgs.length === 0) printUsageAndExit();
  return fileArgs;
}

function run() {
  const args = process.argv.slice(2);
  const targets = resolveTargets(args);
  if (targets.length === 0) {
    console.log('No orphan knowledge files found.');
    return;
  }

  const adopted = [];
  targets.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    if (!isCoreKnowledgeFile(filePath) || filePath === 'README.md') {
      throw new Error(`Unsupported knowledge file for adoption: ${filePath}`);
    }

    const article = ingestFile(filePath);
    upsertSummaryEntry(article.filePath, article.title, article.metadata);
    adopted.push(article.filePath);
  });

  execFileSync('npm', ['run', 'knowledge:build'], { stdio: 'inherit' });
  console.log(`Adopted ${adopted.length} article(s) into SUMMARY.md.`);
}

run();
