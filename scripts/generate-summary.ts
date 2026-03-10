const fs = require('node:fs');

const graph = JSON.parse(fs.readFileSync('generated/graph.json', 'utf8'));
const nodes = graph.nodes.filter((n) => n.file);

const grouped = new Map();
nodes.forEach((node) => {
  const layer = (node.metadata?.architecture_layer || ['unclassified'])[0];
  if (!grouped.has(layer)) grouped.set(layer, []);
  grouped.get(layer).push(node);
});

const lines = ['# Generated Summary', '', '> Auto-generated from article metadata and graph.', ''];
Array.from(grouped.entries()).forEach(([layer, list]) => {
  lines.push(`## ${layer}`);
  list
    .sort((a, b) => (a.metadata?.display_order || 0) - (b.metadata?.display_order || 0))
    .forEach((node) => lines.push(`- [${node.label}](/${node.file.replace(/\.md$/, "")})`));
  lines.push('');
});

fs.writeFileSync('generated/summary.md', `${lines.join('\n')}\n`);
console.log('generated/summary.md created');
