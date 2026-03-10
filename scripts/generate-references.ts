const fs = require('node:fs');

const graph = JSON.parse(fs.readFileSync('generated/graph.json', 'utf8'));
const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
const grouped = new Map();

graph.edges
  .filter((e) => e.type === 'references')
  .forEach((edge) => {
    const source = nodeById.get(edge.source);
    if (!source?.file) return;
    if (!grouped.has(edge.target)) grouped.set(edge.target, []);
    grouped.get(edge.target).push(source.file);
  });

const lines = ['# Generated Reference Index', '', '> Auto-generated cross-reference index.', ''];
Array.from(grouped.entries()).forEach(([target, incoming]) => {
  const targetNode = nodeById.get(target);
  lines.push(`## ${targetNode?.label || target}`);
  incoming.sort().forEach((file) => lines.push(`- referenced by [${file}](/${file.replace(/\.md$/, "")})`));
  lines.push('');
});
if (grouped.size === 0) lines.push('_No explicit references yet. Add `references` metadata to articles to populate this index._', '');

fs.writeFileSync('generated/references.md', `${lines.join('\n')}\n`);
console.log('generated/references.md created');
