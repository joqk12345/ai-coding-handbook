const fs = require('node:fs');
const { formatMarkdownTable } = require('./lib.ts');

function getReferenceMeta(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
    const shortPath = pathname.length > 36 ? `${pathname.slice(0, 33)}...` : pathname;
    return {
      host,
      sortKey: `${host}${pathname}${parsed.search}`,
      label: shortPath ? `${host}${shortPath}` : host
    };
  } catch {
    return {
      host: 'other',
      sortKey: url,
      label: url.length > 48 ? `${url.slice(0, 45)}...` : url
    };
  }
}

const graph = JSON.parse(fs.readFileSync('generated/graph.json', 'utf8'));
const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
const grouped = new Map();

graph.edges
  .filter((edge) => edge.type === 'references')
  .forEach((edge) => {
    const source = nodeById.get(edge.source);
    if (!source?.file) return;

    if (!grouped.has(edge.target)) {
      grouped.set(edge.target, []);
    }
    grouped.get(edge.target).push(source);
  });

const domainGroups = new Map();
Array.from(grouped.entries()).forEach(([target, incoming]) => {
  const meta = getReferenceMeta(target);
  if (!domainGroups.has(meta.host)) {
    domainGroups.set(meta.host, []);
  }

  domainGroups.get(meta.host).push({
    target,
    meta,
    incoming: incoming
      .sort((a, b) => (a.metadata?.summary_order || 0) - (b.metadata?.summary_order || 0))
      .map((node) => ({
        title: node.metadata?.summary_title || node.label,
        link: `/${node.file.replace(/\.md$/, '')}`
      }))
  });
});

const lines = ['# Generated Reference Index', '', '> Auto-generated external reference index grouped by source domain.', ''];

Array.from(domainGroups.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([domain, items]) => {
    lines.push(`## ${domain}`);
    lines.push('');

    const rows = items
      .sort((a, b) => {
        if (b.incoming.length !== a.incoming.length) return b.incoming.length - a.incoming.length;
        return a.meta.sortKey.localeCompare(b.meta.sortKey);
      })
      .map((item) => [
        `[${item.meta.label}](${item.target})`,
        item.incoming.map((entry) => `[${entry.title}](${entry.link})`).join('<br>'),
        String(item.incoming.length)
      ]);

    lines.push(...formatMarkdownTable(['参考链接', '被引用章节', '次数'], rows));
    lines.push('');
  });

if (domainGroups.size === 0) {
  lines.push('_No explicit references yet. Add `references` metadata to articles to populate this index._', '');
}

fs.writeFileSync('generated/references.md', `${lines.join('\n')}\n`);
console.log('generated/references.md created');
