const fs = require('node:fs');

const graphPath = 'generated/graph.json';
if (!fs.existsSync(graphPath)) {
  console.error('Missing generated/graph.json. Run `npm run knowledge:graph` first.');
  process.exit(1);
}

const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const nodes = graph.nodes.filter((n) => n.file);

const layerOrder = ['foundations', 'models-and-tools', 'workflows-and-practices', 'systems-and-governance'];
const layerTitle = {
  foundations: '知识系统（自动）：基础层',
  'models-and-tools': '知识系统（自动）：模型与工具层',
  'workflows-and-practices': '知识系统（自动）：工作流与实践层',
  'systems-and-governance': '知识系统（自动）：系统与治理层',
  unclassified: '知识系统（自动）：未分类'
};

const grouped = new Map();
nodes.forEach((node) => {
  const layer = (node.metadata?.architecture_layer || ['unclassified'])[0];
  if (!grouped.has(layer)) grouped.set(layer, []);
  grouped.get(layer).push(node);
});

const sections = [];
const allLayers = Array.from(new Set([...layerOrder, ...Array.from(grouped.keys())]));
allLayers.forEach((layer) => {
  const list = grouped.get(layer) || [];
  if (list.length === 0) return;
  sections.push({
    text: layerTitle[layer] || `知识系统（自动）：${layer}`,
    items: list
      .sort((a, b) => (a.metadata?.display_order || 0) - (b.metadata?.display_order || 0))
      .map((node) => ({ text: node.label, link: `/${node.file.replace(/\.md$/, '')}` }))
  });
});

fs.writeFileSync('.vitepress/knowledge-nav.json', `${JSON.stringify(sections, null, 2)}\n`);
console.log(`.vitepress/knowledge-nav.json created with ${sections.length} section(s).`);
