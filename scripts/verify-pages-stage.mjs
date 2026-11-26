import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('_site');
const files=[];
async function walk(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  assert.ok(!entry.isSymbolicLink(),'Unexpected symlink: '+file);
  if(entry.isDirectory())await walk(file);
  else files.push(path.relative(root,file).replaceAll(path.sep,'/'));
 }
}
await walk(root);
const forbidden=files.filter(p=>/(^|\/)(server|node_modules|backups|\.git|\.github)(\/|$)|(^|\/)\.env[^/]*$|(^|\/)server\.mjs$|\.(?:db(?:-[\w]+)?|sqlite\w*|pem|key|bak|log)$/i.test(p));
assert.deepEqual(forbidden,[],'Forbidden local files in site');
const required=['index.html','hoc.html','tam-quan.html','triet-hoc.html','dao-duc.html','hoc-code/index.html','hoc-code/lesson.html','hoc-test/index.html','hoc-test/lab/index.html','clinic.html','admin.html','ui-studio.js','ui-studio-prefs.js','ui-studio.css','ui-studio-art.avif','404.html','CNAME'];
for(const file of required)assert.ok((await stat(path.join(root,file))).isFile(),file);
assert.equal((await readFile(path.join(root,'CNAME'),'utf8')).trim(),'luatyte.online');
console.log(JSON.stringify({status:'pass',fileCount:files.length,required:required.length,forbidden:forbidden.length}));
