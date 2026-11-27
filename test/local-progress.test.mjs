import test from 'node:test';
import assert from 'node:assert/strict';
import {snapshot,validateBackup,restoreBackup} from '../app luật y tế/js/local-progress.mjs';
function storage(data={}){
 const m=new Map(Object.entries(data));return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k),m};
}
test('backup includes known progress, not arbitrary data',()=>{
 const s=storage({'lyt_qstat':'{}','lyt_dailyProgress':'{"score":2}','apiKey':'secret','lyt_syncAt':'20'});
 const b=snapshot(s);assert.deepEqual(Object.keys(b.data),['lyt_qstat','lyt_dailyProgress']);
 const target=storage({'other':'keep'});assert.equal(restoreBackup(target,b).restored,2);assert.equal(target.getItem('other'),'keep');
});
test('legacy backup ignores keys outside allowlist; malformed value cannot write',()=>{
 const s=storage({'lyt_qstat':'{"old":1}'});
 const b={app:'luatyte',v:1,data:{lyt_qstat:'{}',apiKey:'"bad"'}};
 assert.deepEqual(validateBackup(b).ignored,['apiKey']);restoreBackup(s,b);assert.equal(s.getItem('apiKey'),null);
 assert.throws(()=>restoreBackup(s,{app:'luatyte',v:2,data:{lyt_qstat:'not json'}}));assert.equal(s.getItem('lyt_qstat'),'{}');
});
test('storage error rolls back prior writes',()=>{
 const s=storage({'lyt_qstat':'{"old":1}'});
 const write=s.setItem;s.setItem=(k,v)=>{if(k==='lyt_dailyProgress')throw Error('quota');write(k,v)};
 assert.throws(()=>restoreBackup(s,{app:'luatyte',v:2,data:{lyt_qstat:'{}',lyt_dailyProgress:'{}'}}),/khôi phục/);
 assert.equal(s.getItem('lyt_qstat'),'{"old":1}');
});
