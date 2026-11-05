// Ensure every legacy page using Tailwind has a local stylesheet fallback.
// This does not remove or rewrite any page-specific design rules.
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const excluded = new Set(['node_modules','.git','public','assets','images','styles','fonts','_nuxt','wp-content','admin','scripts']);
let count = 0;
function walk(dir, level = 0) {
  for (const item of fs.readdirSync(dir,{withFileTypes:true})) {
    if (item.isDirectory()) {
      if (!excluded.has(item.name) && level < 5) walk(path.join(dir,item.name),level+1);
      continue;
    }
    if (!item.isFile() || !item.name.endsWith('.html')) continue;
    const file = path.join(dir,item.name);
    const original = fs.readFileSync(file,'utf8');
    if (!original.includes('https://cdn.tailwindcss.com') || original.includes('href="/styles/tailwind.generated.css"')) continue;
    const fixed = original.replace(/(<script\b[^>]*\bsrc=["']https:\/\/cdn\.tailwindcss\.com(?:\/[^"']*)?["'][^>]*><\/script>)/i,
      '<link rel="stylesheet" href="/styles/tailwind.generated.css">\n  $1');
    if (fixed !== original) { fs.writeFileSync(file,fixed); count++; }
  }
}
walk(root);
console.log('Static HTML pages linked to local Tailwind stylesheet:',count);
