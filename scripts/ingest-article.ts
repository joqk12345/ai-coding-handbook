const fs = require('node:fs');
const {
  defaultMetadata,
  extractExternalReferences,
  extractTitle,
  listMarkdownFiles,
  parseFrontmatter,
  stringifyFrontmatter
} = require('./lib.ts');

const requiredKeys = [
  'id','title','slug','date','type','topics','concepts','tools','architecture_layer','timeline_era','related','references','status','display_order'
];

let updated = 0;
listMarkdownFiles().forEach((filePath, index) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = parseFrontmatter(raw);
  const defaults = defaultMetadata(filePath, extractTitle(filePath, content), index + 1);
  const merged = { ...defaults, ...data };
  const detectedReferences = extractExternalReferences(content);
  const manualReferences = (merged.references || []).filter((ref) => !String(ref).startsWith('http://') && !String(ref).startsWith('https://'));
  merged.references = [...manualReferences, ...detectedReferences];
  const missing = requiredKeys.some((key) => merged[key] === undefined);
  const existingReferences = Array.isArray(data.references) ? data.references : [];
  const referencesChanged = JSON.stringify(existingReferences) !== JSON.stringify(merged.references);

  if (missing || referencesChanged || !raw.startsWith('---\n')) {
    fs.writeFileSync(filePath, stringifyFrontmatter(merged, content));
    updated += 1;
  }
});

console.log(`Metadata ingestion complete. Updated ${updated} file(s).`);
