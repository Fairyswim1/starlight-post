import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const f of ['index.html','style.css','app.mjs','engine.mjs','levels.mjs'])await copyFile(f,`dist/${f}`);
await cp('assets','dist/assets',{recursive:true});
console.log('Static game built in dist/');
