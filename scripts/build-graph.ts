const fs = require('node:fs');
const { listMarkdownFiles, parseArticle } = require('./lib.ts');

const files = listMarkdownFiles();
const nodes = new Map();
const edges = [];

files.forEach((filePath, index) => {
  const { metadata } = parseArticle(filePath, index + 1);
  const nodeType = metadata.type === 'reference' ? 'reference' : 'article';
  nodes.set(metadata.id, { id: metadata.id, label: metadata.title, type: nodeType, file: filePath, metadata });

  (metadata.concepts || []).forEach((concept) => {
    const id = `concept:${concept}`;
    if (!nodes.has(id)) nodes.set(id, { id, label: concept, type: 'concept' });
    edges.push({ source: metadata.id, target: id, type: 'related' });
  });

  (metadata.tools || []).forEach((tool) => {
    const id = `tool:${tool}`;
    if (!nodes.has(id)) nodes.set(id, { id, label: tool, type: 'tool' });
    edges.push({ source: metadata.id, target: id, type: 'related' });
  });

  (metadata.related || []).forEach((target) => edges.push({ source: metadata.id, target, type: 'related' }));
  (metadata.references || []).forEach((target) => edges.push({ source: metadata.id, target, type: 'references' }));
});

const chronological = Array.from(nodes.values())
  .filter((n) => n.file)
  .sort((a, b) => String(a.metadata.date).localeCompare(String(b.metadata.date)));
for (let i = 1; i < chronological.length; i += 1) {
  edges.push({ source: chronological[i - 1].id, target: chronological[i].id, type: 'evolution' });
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
