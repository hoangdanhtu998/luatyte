import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {setTimeout as sleep} from 'node:timers/promises';
test('local code server rejects foreign host, origin and non-JSON before execution', {timeout:20000},async()=>{
 const probe=net.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));
 const port=probe.address().port;await new Promise(r=>probe.close(r));
 const child=spawn(process.execPath,['app luật y tế/hoc-code/server/server.mjs'],{env:{...process.env,PORT:String(port),RUNNER:'local'},stdio:'ignore'});
 const base='http://127.0.0.1:'+port;
 try{
  let ready=false;
  for(let i=0;i<50;i++){try{ready=(await fetch(base+'/index.html')).ok;if(ready)break}catch{}await sleep(100)}
  assert.ok(ready,'server startup');
  const req=(headers,body='{}')=>new Promise((resolve,reject)=>{
   const r=http.request(base+'/api/run',{method:'POST',headers},res=>{res.resume();res.on('end',()=>resolve(res.statusCode))});
   r.on('error',reject);r.end(body);
  });
  assert.equal(await req({'Host':'unrelated.example','Content-Type':'application/json'}),403);
  assert.equal(await req({'Origin':'https://unrelated.example','Content-Type':'application/json'}),403);
  assert.equal(await req({'Sec-Fetch-Site':'cross-site','Content-Type':'application/json'}),403);
  assert.equal(await req({'Content-Type':'text/plain'}),415);
  assert.equal(await req({'Origin':base,'Content-Type':'application/json'},'invalid json'),400);
  assert.equal(await req({'Origin':base,'Content-Type':'application/json'}),400);
  assert.equal((await fetch(base+'/api/run')).status,405);
 }finally{
  if(child.exitCode===null){child.kill();await once(child,'exit')}
 }
});
