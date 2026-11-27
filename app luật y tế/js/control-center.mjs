import {snapshot,validateBackup,restoreBackup,MAX_BACKUP_BYTES} from './local-progress.mjs';
const $=id=>document.getElementById(id);
const sites=[['Learning Hub','hoc.html'],['Luật Y tế','index.html'],['Học Code','hoc-code/index.html'],['Tam Quan','tam-quan.html'],['Triết học','triet-hoc.html'],['Đạo đức','dao-duc.html'],['Học kiểm thử','hoc-test/index.html'],['Hospital World','clinic.html']];
const get=async path=>{const res=await fetch(path,{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!res.ok)throw Error('HTTP '+res.status);return res};
async function count(path,id){
 try{const d=await (await get(path)).json();if(!Array.isArray(d))throw Error('invalid');$(id).textContent=String(d.length)}
 catch{$(id).textContent='Không xác minh được'}
}
async function refresh(){
 $('refresh').disabled=true;$('monitor-status').textContent='Đang kiểm tra…';$('sites').replaceChildren();
 try{
  await Promise.all([...sites.map(async ([name,url])=>{
   const li=document.createElement('li'),a=document.createElement('a'),status=document.createElement('span');
   a.href=url;a.textContent=name;status.textContent='Đang kiểm tra';li.append(a,status);$('sites').append(li);
   const start=performance.now();
   try{const r=await get(url);if(!(r.headers.get('content-type')||'').includes('text/html'))throw Error('Không phải HTML');status.textContent='HTTP '+r.status+' · '+Math.round(performance.now()-start)+' ms'}
   catch(e){status.textContent='Không xác minh: '+e.message}
  }),count('data/laws.json','count-laws'),count('data/quiz.json','count-quiz'),(async()=>{
   try{const d=await (await get('build-info.json')).json();$('build-sha').textContent=String(d.commit||'Không rõ').slice(0,12);$('build-time').textContent=String(d.builtAt||'')}
   catch{$('build-sha').textContent='Chưa có báo cáo build'}
  })()]);
  $('monitor-status').textContent='Hoàn thành kiểm tra lúc '+new Date().toLocaleTimeString('vi-VN');
 }finally{$('refresh').disabled=false}
}
$('refresh').addEventListener('click',refresh);
$('backup-export').addEventListener('click',()=>{
 try{
  const data=snapshot(localStorage),json=JSON.stringify(data,null,2);
  if(new TextEncoder().encode(json).length>MAX_BACKUP_BYTES)throw Error('Tiến độ vượt quá 2 MB.');
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='luatyte-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('backup-status').textContent='Đã xuất '+Object.keys(data.data).length+' mục.';
 }catch(e){$('backup-status').textContent=e.message}
});
$('backup-import').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;
 try{
  if(file.size>MAX_BACKUP_BYTES)throw Error('File quá lớn.');
  const raw=JSON.parse(await file.text()),v=validateBackup(raw);
  const n=Object.keys(v.data).length;
  if(!confirm('Ghi đè '+n+' mục tiến độ? '+v.ignored.length+' khóa ngoài phạm vi sẽ không nhập.'))return;
  const result=restoreBackup(localStorage,raw);
  $('backup-status').textContent='Đã nhập '+result.restored+' mục; bỏ qua '+result.ignored.length+' khóa ngoài phạm vi.';
 }catch(err){$('backup-status').textContent='Không nhập được: '+err.message}
 finally{e.target.value=''}
});
refresh();
