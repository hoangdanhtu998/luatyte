/* Shared UI Studio preferences v3. Stores only allowlisted layout ID and revision. */
(() => {
  'use strict';
  const ids=new Set(['legacy','notion','minimal','bento','developer','cyberpunk','rpg']);
  const key='luatyte-ui-studio-v3';
  const oldKey='luatyte-ui-studio-v2';
  const shared=location.protocol==='https:' && (location.hostname==='luatyte.online'||location.hostname.endsWith('.luatyte.online'));
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const set=(k,v)=>localStorage.setItem(k,v);
  const remove=k=>localStorage.removeItem(k);
  const parse=v=>{
    if(typeof v!=='string')return null;
    const m=/^([a-z]+)(?:\.(\d{1,16}))?$/.exec(v);
    if(!m||!ids.has(m[1]))return null;
    const revision=Number(m[2]||0);
    return Number.isSafeInteger(revision)&&revision>=0?{id:m[1],revision}:null;
  };
  const encode=p=>p.id+'.'+p.revision;
  const cookie=k=>{try{return document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(k+'='))?.slice(k.length+1)||null}catch{return null}};
  const latest=(...values)=>values.filter(Boolean).reduce((a,b)=>!a||b.revision>a.revision?b:a,null);
  const common=()=>latest(shared?parse(cookie(key)):null,parse(get(key)),shared?parse(cookie(oldKey)):null,parse(get(oldKey)))||{id:'legacy',revision:0};
  const own=app=>parse(get(key+':'+app))||parse(get(oldKey+':'+app))||(app==='qa'?parse(get('qa-hub-ui-studio-v1')):null);
  const active=app=>{const g=common(),a=own(app);return a&&a.revision===g.revision?a.id:g.id};
  const scope=app=>{const a=own(app);return a&&a.revision===common().revision?'app':'all'};
  const save=(app,id,where)=>{
    if(!ids.has(id))throw Error('Bố cục không hợp lệ.');
    if(where==='inherit'){remove(key+':'+app);remove(oldKey+':'+app);if(app==='qa')remove('qa-hub-ui-studio-v1');return {shared:true};}
    if(where==='app'){set(key+':'+app,encode({id,revision:common().revision}));return {shared:true};}
    const revision=Math.max(Date.now(),common().revision+1);
    const value=encode({id,revision});
    set(key,value);
    remove(key+':'+app);remove(oldKey+':'+app);
    if(app==='qa')remove('qa-hub-ui-studio-v1');
    if(!shared)return {shared:false};
    document.cookie=key+'='+value+'; Domain=luatyte.online; Path=/; Max-Age=31536000; SameSite=Lax; Secure';
    return {shared:cookie(key)===value};
  };
  window.LuatYTeUIStudio=Object.freeze({active,scope,save,shared});
})();
