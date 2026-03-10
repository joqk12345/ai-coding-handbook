const { syncSummarySectionTitles } = require('./lib.ts');

const changed = syncSummarySectionTitles();

if (changed) {
  console.log('SUMMARY.md section titles synchronized.');
} else {
  console.log('SUMMARY.md section titles already up to date.');
}
