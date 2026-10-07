import {readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){if(e.name.startsWith('.')||['node_modules','dist'].includes(e.name))continue;const path=join(dir,e.name);if(e.isDirectory())out.push(...await walk(path));else if(/\.(mjs|js)$/.test(e.name))out.push(path);}return out;}
const files=await walk(root);for(const file of files)execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
console.log(`Sintaxis correcta: ${files.length} archivos JavaScript.`);
