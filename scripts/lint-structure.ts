const fs = require('node:fs');
const { listMarkdownFiles, parseArticle } = require('./lib.ts');

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
const ids = new Map();
const articles = files.map((f, i) => parseArticle(f, i + 1));

articles.forEach(({ filePath, metadata }) => {
  if (ids.has(metadata.id)) errors.push(`Duplicate ID '${metadata.id}' in ${filePath} and ${ids.get(metadata.id)}`);
  ids.set(metadata.id, filePath);

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

  if ((metadata.related || []).length === 0 && (metadata.references || []).length === 0) {
    warnings.push(`Potential orphan article: ${filePath}`);
  }
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
