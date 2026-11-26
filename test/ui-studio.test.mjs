import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
test('UI Studio loads on all five deployed entry pages',()=>{
 for(const [page,prefix] of [['app luật y tế/index.html',''],['app luật y tế/hoc.html',''],['app luật y tế/tam-quan.html',''],['app luật y tế/hoc-code/index.html','../'],['hoc-test/index.html','../']]){
  const html=read(page);assert.ok(html.includes('href="'+prefix+'ui-studio.css"'),page);assert.ok(html.includes('src="'+prefix+'ui-studio.js"'),page);
 }
});
test('six presets and original rollback are present',()=>{
 const js=read('app luật y tế/ui-studio.js'),css=read('app luật y tế/ui-studio.css');
 for(const id of ['notion','minimal','bento','developer','cyberpunk','rpg']){assert.ok(js.includes("'"+id+"'"));assert.ok(css.includes('data-ui-studio="'+id+'"'))}
 assert.ok(js.includes("'legacy'"));assert.ok(read('app luật y tế/ui-studio-prefs.js').includes('Domain=luatyte.online; Path=/;'));assert.ok(css.includes('prefers-reduced-motion'));
});
test('offline cache includes all UI Studio assets',()=>{
 const sw=read('app luật y tế/sw.js');
 for(const p of ['ui-studio.js','ui-studio.css','ui-studio-art.svg']){assert.ok(sw.includes('"'+p+'"'));assert.ok(read('app luật y tế/'+p).length>0)}
});