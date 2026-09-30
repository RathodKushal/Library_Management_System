const fs = require('fs');
const path = require('path');

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const pagesDir = 'c:/Users/Rathod/Desktop/kushal/Projects/Reactra Final/client/src/pages';
const files = findFiles(pagesDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;
  
  // replace exact string matches for known circular vars
  content = content.replace(/--gold:\s*var\(--gold\);/g, '');
  content = content.replace(/--gold-light:\s*var\(--gold-light\);/g, '');
  content = content.replace(/--text-main:\s*var\(--text-main\);/g, '');
  content = content.replace(/--text-muted:\s*var\(--text-muted\);/g, '');
  content = content.replace(/--card-bg:\s*var\(--card-bg\);/g, '');
  content = content.replace(/--card-border:\s*var\(--card-border\);/g, '');
  content = content.replace(/--input-bg:\s*var\(--input-bg\);/g, '');
  content = content.replace(/--danger:\s*var\(--danger\);/g, '');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed', path.basename(file));
  }
});
