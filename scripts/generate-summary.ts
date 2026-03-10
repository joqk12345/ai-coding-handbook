const fs = require('node:fs');
const { getSummarySections } = require('./lib.ts');

const lines = ['# Generated Summary', '', '> Auto-generated from `SUMMARY.md` section structure and reading order.', ''];

function getTopLevelChapterNumber(title) {
  const match = String(title || '').trim().match(/^第(\d+)章/);
  return match ? Number(match[1]) : null;
}

function getSubsectionChapterNumber(title) {
  const match = String(title || '').trim().match(/^(\d+)\.\d+/);
  return match ? Number(match[1]) : null;
}

getSummarySections().forEach((section) => {
  lines.push(`## ${section.title}`);
  let currentChapterNumber = null;

  section.entries.forEach((entry) => {
    const link = `/${entry.filePath.replace(/\.md$/, '')}`;
    const topLevelChapterNumber = getTopLevelChapterNumber(entry.title);
    const subsectionChapterNumber = getSubsectionChapterNumber(entry.title);

    if (topLevelChapterNumber !== null) {
      currentChapterNumber = topLevelChapterNumber;
      lines.push(`- [${entry.title}](${link})`);
      return;
    }

    if (subsectionChapterNumber !== null && subsectionChapterNumber === currentChapterNumber) {
      lines.push(`    - [${entry.title}](${link})`);
      return;
    }

    lines.push(`- [${entry.title}](${link})`);
  });

  lines.push('');
});

fs.writeFileSync('generated/summary.md', `${lines.join('\n')}\n`);
console.log('generated/summary.md created');
