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
  
  // Replace the specific hardcoded strings
  // Handle variations in spacing
  content = content.replace(/background:\s*rgba\(74,\s*106,\s*168,\s*0\.2\);/g, 'background: var(--badge-blue-bg);');
  content = content.replace(/color:\s*#a9c0f2;/g, 'color: var(--badge-blue-text);');
  content = content.replace(/border:\s*1px\s*solid\s*rgba\(74,\s*106,\s*168,\s*0\.4\);/g, 'border: 1px solid var(--badge-blue-border);');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed blue badges in', path.basename(file));
  }
});
