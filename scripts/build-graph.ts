const fs = require('node:fs');
const { getCoreSummaryEntries, parseArticle } = require('./lib.ts');

const summaryEntries = getCoreSummaryEntries();
const nodes = new Map();
const edges = [];
const nodeByFile = new Map();

summaryEntries.forEach((entry) => {
  const { metadata } = parseArticle(entry.filePath, entry.order);
  const normalizedMetadata = {
    ...metadata,
    display_order: entry.order,
    summary_order: entry.order,
    summary_section: entry.sectionTitle,
    summary_title: entry.title
  };
  const nodeType = metadata.type === 'reference' ? 'reference' : 'article';
  nodes.set(normalizedMetadata.id, {
    id: normalizedMetadata.id,
    label: entry.title,
    type: nodeType,
    file: entry.filePath,
    metadata: normalizedMetadata
  });
  nodeByFile.set(entry.filePath, nodes.get(normalizedMetadata.id));

  (normalizedMetadata.concepts || []).forEach((concept) => {
    const id = `concept:${concept}`;
    if (!nodes.has(id)) nodes.set(id, { id, label: concept, type: 'concept' });
    edges.push({ source: normalizedMetadata.id, target: id, type: 'related' });
  });

  (normalizedMetadata.tools || []).forEach((tool) => {
    const id = `tool:${tool}`;
    if (!nodes.has(id)) nodes.set(id, { id, label: tool, type: 'tool' });
    edges.push({ source: normalizedMetadata.id, target: id, type: 'related' });
  });

  (normalizedMetadata.related || []).forEach((target) => edges.push({ source: normalizedMetadata.id, target, type: 'related' }));
  (normalizedMetadata.references || []).forEach((target) => edges.push({ source: normalizedMetadata.id, target, type: 'references' }));
});

const readingPath = summaryEntries
  .map((entry) => nodeByFile.get(entry.filePath))
  .filter(Boolean);

for (let i = 1; i < readingPath.length; i += 1) {
  edges.push({ source: readingPath[i - 1].id, target: readingPath[i].id, type: 'evolution' });
}

const graph = {
  generatedAt: new Date().toISOString(),
  nodeCount: nodes.size,
  edgeCount: edges.length,
  nodes: Array.from(nodes.values()),
  edges
};

fs.mkdirSync('generated', { recursive: true });
fs.writeFileSync('generated/graph.json', `${JSON.stringify(graph, null, 2)}\n`);
console.log(`Graph generated with ${graph.nodeCount} nodes and ${graph.edgeCount} edges.`);
