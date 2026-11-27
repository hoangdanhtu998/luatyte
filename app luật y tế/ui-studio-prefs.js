/* UI Studio v4: a single global preset, with explicit cross-origin handoff. */
(() => {
 'use strict';
 const ids=new Set(['legacy','notion','minimal','bento','developer','cyberpunk','rpg']);
 const key='luatyte-ui-studio-v4', old=['luatyte-ui-studio-v3','luatyte-ui-studio-v2'];
 const param='ui-preset';
 const shared=location.protocol==='https:'&&(location.hostname==='luatyte.online'||location.hostname.endsWith('.luatyte.online'));
 const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
 const parse=v=>{
   const m=typeof v==='string'&&/^([a-z]+)(?:\.(\d{1,16}))?$/.exec(v);
   if(!m||!ids.has(m[1]))return null;
   const revision=Number(m[2]||0);
   return Number.isSafeInteger(revision)&&revision>=0?{id:m[1],revision}:null;
 };
 const encode=p=>p.id+'.'+p.revision;
 const cookie=k=>{try{return document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(k+'='))?.slice(k.length+1)||null}catch{return null}};
 const latest=(...values)=>values.filter(Boolean).reduce((a,b)=>!a||b.revision>a.revision?b:a,null);
 const common=()=>latest(shared?parse(cookie(key)):null,parse(get(key)),...old.flatMap(k=>[shared?parse(cookie(k)):null,parse(get(k))]))||{id:'legacy',revision:0};
 const persist=p=>{
   const value=encode(p);localStorage.setItem(key,value);
   if(shared){document.cookie=key+'='+value+'; Domain=luatyte.online; Path=/; Max-Age=31536000; SameSite=Lax; Secure';}
   return {shared:shared&&cookie(key)===value};
 };
 // A navigation from the other origin may transfer only a known preset and revision.
 // Never transfer credentials or arbitrary storage. No remote API or background network request.
 try {
   const url=new URL(location.href);
   if(url.searchParams.has(param)){
     const incoming=parse(url.searchParams.get(param));
     if((shared||local)&&incoming&&incoming.revision>=common().revision)persist(incoming);
     url.searchParams.delete(param);history.replaceState(history.state,'',url.href);
   }
 } catch {}
 const active=()=>common().id;
 const save=(_app,id)=>{
   if(!ids.has(id))throw Error('Bố cục không hợp lệ.');
   return persist({id,revision:Math.max(Date.now(),common().revision+1)});
 };
 const link=href=>{
   const url=new URL(href,location.href);
   const targetShared=url.protocol==='https:'&&(url.hostname==='luatyte.online'||url.hostname.endsWith('.luatyte.online'));
   const targetLocal=url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname);
   if(url.origin!==location.origin&&(targetShared||targetLocal))url.searchParams.set(param,encode(common()));
   return url.href;
 };
 window.LuatYTeUIStudio=Object.freeze({active,scope:()=> 'all',save,shared,link});
})();
