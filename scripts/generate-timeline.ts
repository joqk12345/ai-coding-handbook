const fs = require('node:fs');

const graph = JSON.parse(fs.readFileSync('generated/graph.json', 'utf8'));
const articles = graph.nodes
  .filter((n) => n.file)
  .sort((a, b) => String(a.metadata?.date).localeCompare(String(b.metadata?.date)));

const byEra = new Map();
articles.forEach((article) => {
  const era = article.metadata?.timeline_era || 'unknown';
  if (!byEra.has(era)) byEra.set(era, []);
  byEra.get(era).push(article);
});

const lines = ['# Generated Timeline', '', '> Auto-generated chronological evolution of topics.', ''];
Array.from(byEra.entries()).forEach(([era, list]) => {
  lines.push(`## ${era}`);
  list.forEach((node) => lines.push(`- ${node.metadata?.date} — [${node.label}](/${node.file.replace(/\.md$/, "")})`));
  lines.push('');
});

fs.writeFileSync('generated/timeline.md', `${lines.join('\n')}\n`);
console.log('generated/timeline.md created');
