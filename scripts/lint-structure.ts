const fs = require('node:fs');
const {
  extractExternalReferences,
  getCoreSummaryEntries,
  getSummaryEntries,
  isCoreKnowledgeFile,
  listMarkdownFiles,
  normalizeSummarySectionTitle,
  parseArticle
} = require('./lib.ts');

function parseSimpleYaml(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const result = {};
  let section = null;
  lines.forEach((line) => {
    if (!line.trim() || line.trim().startsWith('#')) return;
    if (!line.startsWith('  - ') && line.includes(':')) {
      const [key, value] = line.split(':').map((v) => v.trim());
      if (!value) {
        result[key] = [];
        section = key;
      } else {
        result[key] = value;
        section = null;
      }
      return;
    }
    if (line.startsWith('  - ') && section) {
      const v = line.slice(4).trim();
      if (!result[section]) result[section] = [];
      result[section].push(v);
    }
  });
  return result;
}

const taxonomy = parseSimpleYaml('meta/taxonomy.yaml');
const erasRaw = fs.readFileSync('meta/timeline-eras.yaml', 'utf8');
const eraNames = Array.from(erasRaw.matchAll(/- name: ([^\n]+)/g)).map((m) => m[1].trim());
const eraRanges = {};
let current = null;
erasRaw.split('\n').forEach((line) => {
  const t = line.trim();
  if (t.startsWith('- name: ')) {
    current = t.replace('- name: ', '').trim();
    eraRanges[current] = {};
  } else if (t.startsWith('start:') && current) {
    eraRanges[current].start = t.replace('start:', '').trim();
  } else if (t.startsWith('end:') && current) {
    eraRanges[current].end = t.replace('end:', '').trim();
  }
});

const errors = [];
const warnings = [];
const files = listMarkdownFiles();
const fileSet = new Set(files);
const summaryEntries = getSummaryEntries();
const summaryByFile = new Map();
const ids = new Map();
const articles = files.map((f, i) => parseArticle(f, i + 1));
const rawDisplayOrderByFile = new Map();

summaryEntries.forEach((entry) => {
  if (summaryByFile.has(entry.filePath)) {
    errors.push(`Duplicate SUMMARY link target '${entry.filePath}' in sections '${summaryByFile.get(entry.filePath).sectionTitle}' and '${entry.sectionTitle}'`);
    return;
  }
  summaryByFile.set(entry.filePath, entry);
  if (!fileSet.has(entry.filePath)) {
    errors.push(`SUMMARY references missing file '${entry.filePath}'`);
  }
});

const summarySections = new Map();
summaryEntries.forEach((entry) => {
  if (!summarySections.has(entry.sectionTitle)) {
    summarySections.set(entry.sectionTitle, []);
  }
  summarySections.get(entry.sectionTitle).push(entry);
});

summarySections.forEach((entries, sectionTitle) => {
  const expectedTitle = normalizeSummarySectionTitle(sectionTitle, entries);
  if (expectedTitle !== sectionTitle) {
    warnings.push(`SUMMARY section title drift: '${sectionTitle}' should be '${expectedTitle}'`);
  }
});

articles.forEach(({ filePath, metadata, body }) => {
  if (ids.has(metadata.id)) errors.push(`Duplicate ID '${metadata.id}' in ${filePath} and ${ids.get(metadata.id)}`);
  ids.set(metadata.id, filePath);
  rawDisplayOrderByFile.set(filePath, metadata.display_order);

  ['id','title','slug','date','type','topics','concepts','tools','architecture_layer','timeline_era','related','references','status','display_order']
    .forEach((key) => {
      if (metadata[key] === undefined) errors.push(`Missing metadata '${key}' in ${filePath}`);
    });

  if (!taxonomy.types.includes(metadata.type)) errors.push(`Invalid type '${metadata.type}' in ${filePath}`);
  (metadata.topics || []).forEach((topic) => {
    if (!taxonomy.topics.includes(topic)) errors.push(`Invalid taxonomy topic '${topic}' in ${filePath}`);
  });

  if (!eraNames.includes(metadata.timeline_era)) {
    errors.push(`Unknown timeline era '${metadata.timeline_era}' in ${filePath}`);
  } else {
    const range = eraRanges[metadata.timeline_era];
    if (metadata.date < range.start || metadata.date > range.end) {
      errors.push(`Timeline conflict in ${filePath}: date ${metadata.date} outside ${metadata.timeline_era}`);
    }
  }

  if (isCoreKnowledgeFile(filePath) && !summaryByFile.has(filePath) && !filePath.match(/-(en|ja|zh)\.md$/)) {
    warnings.push(`Markdown file is outside SUMMARY reading path: ${filePath}`);
  }

  const detectedReferences = extractExternalReferences(body);
  const metadataUrls = (metadata.references || []).filter((ref) => String(ref).startsWith('http://') || String(ref).startsWith('https://'));
  if (JSON.stringify(detectedReferences) !== JSON.stringify(metadataUrls)) {
    warnings.push(`Reference metadata drift in ${filePath}: run \`npm run knowledge:ingest\``);
  }
});

const displayOrderOwners = new Map();
getCoreSummaryEntries().forEach((entry) => {
  const rawDisplayOrder = rawDisplayOrderByFile.get(entry.filePath);
  if (rawDisplayOrder === undefined) return;

  if (!displayOrderOwners.has(rawDisplayOrder)) {
    displayOrderOwners.set(rawDisplayOrder, [entry.filePath]);
  } else {
    displayOrderOwners.get(rawDisplayOrder).push(entry.filePath);
  }
});

Array.from(displayOrderOwners.entries())
  .filter(([, owners]) => owners.length > 1)
  .forEach(([displayOrder, owners]) => {
    warnings.push(`Duplicate display_order ${displayOrder} across ${owners.join(', ')}`);
  });

const allIds = new Set(Array.from(ids.keys()));
articles.forEach(({ filePath, metadata }) => {
  (metadata.related || []).forEach((rel) => {
    if (!allIds.has(rel) && !String(rel).startsWith('concept:') && !String(rel).startsWith('tool:')) {
      errors.push(`Broken related reference '${rel}' in ${filePath}`);
    }
  });
  (metadata.references || []).forEach((ref) => {
    if (!allIds.has(ref) && !String(ref).startsWith('http://') && !String(ref).startsWith('https://')) {
      errors.push(`Broken reference '${ref}' in ${filePath}`);
    }
  });
});

warnings.forEach((w) => console.warn(`WARN: ${w}`));
if (errors.length) {
  errors.forEach((e) => console.error(`ERROR: ${e}`));
  process.exit(1);
}
console.log('Structure lint passed.');
