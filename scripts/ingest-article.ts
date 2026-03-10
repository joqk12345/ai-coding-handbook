const fs = require('node:fs');
const { listMarkdownFiles, parseFrontmatter, defaultMetadata, extractTitle, stringifyFrontmatter } = require('./lib.ts');

const requiredKeys = [
  'id','title','slug','date','type','topics','concepts','tools','architecture_layer','timeline_era','related','references','status','display_order'
];

let updated = 0;
listMarkdownFiles().forEach((filePath, index) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = parseFrontmatter(raw);
  const defaults = defaultMetadata(filePath, extractTitle(filePath, content), index + 1);
  const merged = { ...defaults, ...data };
  const missing = requiredKeys.some((key) => merged[key] === undefined);

  if (missing || !raw.startsWith('---\n')) {
    fs.writeFileSync(filePath, stringifyFrontmatter(merged, content));
    updated += 1;
  }
});

console.log(`Metadata ingestion complete. Updated ${updated} file(s).`);
