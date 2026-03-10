const fs = require('node:fs');

const graph = JSON.parse(fs.readFileSync('generated/graph.json', 'utf8'));
const articles = graph.nodes.filter((n) => n.file);
const layerMap = new Map();

articles.forEach((article) => {
  const layers = article.metadata?.architecture_layer || ['unclassified'];
  layers.forEach((layer) => {
    if (!layerMap.has(layer)) layerMap.set(layer, []);
    layerMap.get(layer).push(article);
  });
});

const lines = ['# Generated Architecture Map', '', '> Auto-generated layered conceptual map.', ''];
Array.from(layerMap.entries()).forEach(([layer, list]) => {
  lines.push(`## ${layer}`);
  list.sort((a, b) => a.label.localeCompare(b.label)).forEach((node) => lines.push(`- [${node.label}](/${node.file.replace(/\.md$/, "")})`));
  lines.push('');
});

fs.writeFileSync('generated/architecture.md', `${lines.join('\n')}\n`);
console.log('generated/architecture.md created');
