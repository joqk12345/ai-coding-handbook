const fs = require('node:fs');
const { getCoreSummarySections } = require('./lib.ts');

function formatSidebarSectionText(title) {
  const normalized = String(title || '')
    .trim()
    .replace(/\s*\(第\d+(?:-\d+)?章\)\s*$/, '');

  if (normalized === '附录') return '附录 · 资源';

  const partMatch = normalized.match(/^(第[一二三四五六七八九十]+部分)：\s*(.+)$/);
  if (partMatch) {
    return `${partMatch[1]} · ${partMatch[2]}`;
  }

  return normalized;
}

function createLinkItem(entry) {
  return {
    text: entry.title,
    link: `/${entry.filePath.replace(/\.md$/, '')}`
  };
}

function extractParentChapterNumber(title) {
  const chapterMatch = String(title || '').trim().match(/^第(\d+)章/);
  if (chapterMatch) return Number(chapterMatch[1]);

  const sectionMatch = String(title || '').trim().match(/^(\d+)\.\d+/);
  if (sectionMatch) return Number(sectionMatch[1]);

  return null;
}

function buildSidebarItems(entries) {
  const items = [];
  let currentChapterItem = null;
  let currentChapterNumber = null;

  entries.forEach((entry) => {
    const title = String(entry.title || '').trim();
    const chapterMatch = title.match(/^第(\d+)章/);
    const sectionMatch = title.match(/^(\d+)\.\d+/);

    if (chapterMatch) {
      currentChapterNumber = Number(chapterMatch[1]);
      currentChapterItem = createLinkItem(entry);
      items.push(currentChapterItem);
      return;
    }

    if (sectionMatch && currentChapterItem && Number(sectionMatch[1]) === currentChapterNumber) {
      if (!currentChapterItem.items) {
        currentChapterItem.items = [];
        currentChapterItem.collapsed = false;
      }
      currentChapterItem.items.push(createLinkItem(entry));
      return;
    }

    currentChapterItem = null;
    currentChapterNumber = extractParentChapterNumber(title);
    items.push(createLinkItem(entry));
  });

  return items;
}

const sections = getCoreSummarySections()
  .filter((section) => section.title !== '前言')
  .map((section) => ({
    text: formatSidebarSectionText(section.title),
    items: buildSidebarItems(section.entries)
  }));

fs.writeFileSync('.vitepress/knowledge-nav.json', `${JSON.stringify(sections, null, 2)}\n`);
console.log(`.vitepress/knowledge-nav.json created with ${sections.length} section(s).`);
