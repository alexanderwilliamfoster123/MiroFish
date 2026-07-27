// build-single-file.mjs — bundles the whole game into ONE self-contained
// .html file that runs by double-clicking (file://) with no server, no npm,
// and no internet. Three.js is embedded as a data: URL; all game modules are
// concatenated into a single inline module.
//
//   node build-single-file.mjs   ->  claude-of-duty.html
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(DIR, p), 'utf8');

// 1. Embed Three.js as a data: module URL. three.module.js is the full build
//    (it includes WebGLRenderer etc.) and imports three.core.js relatively —
//    so we embed core as its own data URL and rewrite the import to point at
//    it (nested data URLs resolve fine for module scripts).
const toDataUrl = (src) => 'data:text/javascript;base64,' + Buffer.from(src, 'utf8').toString('base64');
const coreDataUrl = toDataUrl(read('vendor/three.core.js'));
const moduleSrc = read('vendor/three.module.js').replace(/\.\/three\.core\.js/g, coreDataUrl);
const threeDataUrl = toDataUrl(moduleSrc);

// 2. Concatenate game modules in dependency order, stripping local imports
//    and `export` keywords so everything shares one module scope.
const order = ['audio', 'fx', 'world', 'player', 'weapons', 'enemies', 'hud', 'game', 'main'];
let body = '';
for (const name of order) {
  let src = read(`src/${name}.js`);
  src = src
    .split('\n')
    .filter((line) => !/^\s*import\s.*from\s+['"][^'"]+['"];?\s*$/.test(line)) // drop all imports
    .join('\n')
    .replace(/^\s*export\s+(class|const|function|let|var)\s/gm, '$1 ');        // drop export keyword
  body += `\n// ===== ${name}.js =====\n` + src + '\n';
}

const gameModule = `import * as THREE from 'three';\n` + body;

// 3. Read the HTML shell, swap the importmap + external script for inlined ones.
let html = read('index.html');

// point 'three' at the embedded data URL
html = html.replace(
  /<script type="importmap">[\s\S]*?<\/script>/,
  `<script type="importmap">\n  {\n    "imports": { "three": "${threeDataUrl}" }\n  }\n  </script>`
);

// replace the external module script with the inlined bundle
html = html.replace(
  /<script type="module" src="\.\/src\/main\.js"><\/script>/,
  `<script type="module">\n${gameModule}\n</script>`
);

const out = path.join(DIR, 'claude-of-duty.html');
fs.writeFileSync(out, html);
const mb = (fs.statSync(out).size / 1048576).toFixed(2);
console.log(`Wrote ${out} (${mb} MB) — open it directly in a browser.`);
