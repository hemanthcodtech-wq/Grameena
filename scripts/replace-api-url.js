// Script: replaces all hardcoded 'http://localhost:5000...' strings in
// frontend/src JSX/JS files with Vite env-variable template literals.
// Run: node scripts/replace-api-url.js

const fs = require('fs');
const path = require('path');

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) results.push(full);
  }
  return results;
}

const srcDir = path.join(__dirname, '..', 'frontend', 'src');
const files = walk(srcDir);

let changed = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Replace 'http://localhost:5000/...' single-quoted strings with template literals
  const updated = content.replace(
    /'http:\/\/localhost:5000([^']*)'/g,
    '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`'
  );
  if (updated !== content) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log('Updated:', file.replace(srcDir, 'src'));
    changed++;
  }
}
console.log(`\nDone. ${changed} file(s) updated.`);
