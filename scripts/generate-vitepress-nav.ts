const fs = require('node:fs');
const { getCoreSummarySections } = require('./lib.ts');

const sections = getCoreSummarySections()
  .filter((section) => section.title !== '前言')
  .map((section) => ({
  text: `知识系统（自动）：${section.title}`,
  items: section.entries.map((entry) => ({
    text: entry.title,
    link: `/${entry.filePath.replace(/\.md$/, '')}`
  }))
  }));

fs.writeFileSync('.vitepress/knowledge-nav.json', `${JSON.stringify(sections, null, 2)}\n`);
console.log(`.vitepress/knowledge-nav.json created with ${sections.length} section(s).`);
