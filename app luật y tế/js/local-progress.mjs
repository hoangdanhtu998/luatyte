// Personal learning backup. Explicit progress keys only; no credentials or server data.
const keys=new Set([
 ...['qstat','bookmarks','daily','dailyProgress','bestcombo','tfbest','matchPerfect','exams','badges','tab','unanswered','daystat','srs','revdays','remind','lawProg','goal','role','quizbest','known','hardQs','lyt_hardQs','progress','lyt_progress','swipe','clinic_v2','clinic_v2_bak','clinic_best','leaderboard','resume_reading'].map(k=>'lyt_'+k),
 'lytx_examSession','luatyte-slides-progress','luatyte-baigiang-completed','luatyte-stats','luatyte-bookmarks','luatyte-quiz-highscore','hoc-cpp-progress-v1','hoc-cpp-progress-v2','hoc-cpp-review-v1','hoc-code-goi-y-v1'
]);
export const MAX_BACKUP_BYTES=2*1024*1024;
export function snapshot(storage){
 const data=Object.create(null);
 for(const key of keys){const value=storage.getItem(key);if(value!==null)data[key]=value;}
 return {app:'luatyte',v:2,exported:new Date().toISOString(),data};
}
export function validateBackup(raw){
 if(!raw||raw.app!=='luatyte'||![1,2].includes(raw.v)||!raw.data||typeof raw.data!=='object'||Array.isArray(raw.data))throw Error('File tiến độ không hợp lệ.');
 if(new TextEncoder().encode(JSON.stringify(raw)).length>MAX_BACKUP_BYTES)throw Error('File quá lớn (tối đa 2 MB).');
 const data=Object.create(null),ignored=[];
 for(const [key,value] of Object.entries(raw.data)){
  if(!keys.has(key)){ignored.push(key);continue;}
  if(typeof value!=='string')throw Error('Dữ liệu không hợp lệ: '+key);
  try{JSON.parse(value)}catch{throw Error('JSON tiến độ không hợp lệ: '+key)}
  data[key]=value;
 }
 return {data,ignored};
}
export function restoreBackup(storage,raw){
 const validated=validateBackup(raw), previous=new Map(),written=[];
 for(const key of Object.keys(validated.data))previous.set(key,storage.getItem(key));
 try{
  for(const [key,value] of Object.entries(validated.data)){storage.setItem(key,value);written.push(key);}
 }catch(error){
  const rollbackErrors=[];
  for(const key of written.reverse()){
   try{const old=previous.get(key);if(old===null)storage.removeItem(key);else storage.setItem(key,old)}
   catch(e){rollbackErrors.push(key)}
  }
  if(rollbackErrors.length)throw Error('Không lưu được và không thể khôi phục một số mục. Dùng file sao lưu trước khi nhập lại.');
  throw Error('Không lưu được. Đã khôi phục các mục vừa ghi.');
 }
 return {restored:written.length,ignored:validated.ignored};
}
