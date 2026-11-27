// Real Chromium rendering of branch files; intercepted URLs are preview, not production.
import {chromium} from 'playwright';
import {readFile, mkdir, writeFile, stat} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd(), site=path.join(root,'_site');
const output=path.join(root,'ui-studio-report');
await mkdir(output,{recursive:true});
const prefs=await readFile(path.join(site,'ui-studio-prefs.js'),'utf8');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.avif':'image/avif','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.mp3':'audio/mpeg'};
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'});
const preview='https://luatyte.online';
const qaPreview='https://qa-ui-preview.luatyte.online';
const fixture='<html><script>'+prefs+'</script></html>';
await context.route('**/*',async route=>{
 const url=new URL(route.request().url());
 if(url.origin!==preview&&url.origin!==qaPreview&&url.origin!=='https://unrelated.example')return route.abort();
 if(url.pathname==='/__ui-test')return route.fulfill({contentType:'text/html; charset=utf-8',body:fixture});
 if(url.origin!==preview)return route.abort();
 if(url.pathname.startsWith('/api/'))return route.fulfill({status:401,contentType:'application/json',body:'{}'});
 try{
  let rel=decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if(!rel||rel.endsWith('/'))rel+='index.html';
  const base=site;
  const file=path.resolve(base,rel);
  if(!file.startsWith(base+path.sep)||(await stat(file)).isDirectory())return route.abort();
  return route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:await readFile(file)});
 }catch{return route.fulfill({status:404,body:'Not found'})}
});
const pages=[['home','/hoc.html'],['law','/index.html'],['code','/hoc-code/index.html'],['tamquan','/tam-quan.html'],['philosophy','/triet-hoc.html'],['ethics','/dao-duc.html'],['testing','/hoc-test/index.html'],['hospital','/clinic.html']];
const layouts=['notion','minimal','bento','developer','cyberpunk','rpg'];
const results=[];
try{
 const a=await context.newPage(),q=await context.newPage(),x=await context.newPage();
 await a.goto(preview+'/__ui-test');await q.goto(qaPreview+'/__ui-test');await x.goto('https://unrelated.example/__ui-test');
 const evalAt=(page,expression)=>page.evaluate(expression);
 assert.equal(await evalAt(a,"LuatYTeUIStudio.save('law','developer','all').shared"),true);
 assert.equal(await evalAt(q,"LuatYTeUIStudio.active('qa')"),'developer');
 await evalAt(q,"LuatYTeUIStudio.save('qa','notion','app')");
 assert.equal(await evalAt(q,"LuatYTeUIStudio.active('qa')"),'notion');
 assert.equal(await evalAt(a,"LuatYTeUIStudio.active('law')"),'notion');
 await evalAt(a,"LuatYTeUIStudio.save('law','rpg','all')");
 assert.equal(await evalAt(q,"LuatYTeUIStudio.active('qa')"),'rpg');
 assert.equal(await evalAt(x,"LuatYTeUIStudio.active('qa')"),'legacy');
 results.push({test:'cross-origin preview cookie + global selection',passed:true});
 await a.close();await q.close();await x.close();
 const handoff=await context.newPage();await handoff.goto(preview+'/__ui-test?ui-preset=cyberpunk.'+(Date.now()+100));assert.equal(await handoff.evaluate("LuatYTeUIStudio.active('hospital')"),'cyberpunk');assert.ok(!new URL(handoff.url()).searchParams.has('ui-preset'));await handoff.close();results.push({test:'validated navigation handoff',passed:true});
 for(const [viewport,size] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  for(const [app,url] of pages){
   const page=await context.newPage();await page.setViewportSize(size);
   try{
    await page.goto(preview+url,{waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:'UI Studio',exact:true}).waitFor();
    for(const layout of layouts){
     const label=app+'-'+layout+'-'+viewport;
     let error=null;
     try{
      const open=page.getByRole('button',{name:'UI Studio',exact:true});
      await open.click();
      const dialog=page.locator('#ecosystem-ui-studio');
      await dialog.locator('input[value="'+layout+'"]').check();
      await dialog.getByLabel('Phạm vi áp dụng').selectOption('all');
      await dialog.getByRole('button',{name:'Áp dụng',exact:true}).click();
      await dialog.waitFor({state:'hidden'});
      assert.equal(await page.locator('html').getAttribute('data-ui-studio'),layout);
      const shellApps=['home','law','code','tamquan','testing','hospital'];
      if(shellApps.includes(app)){
       const frame=page.locator('.studio-frame');
       await frame.waitFor({state:'visible'});
       assert.equal(await frame.getAttribute('data-studio-app'),app);
       assert.equal(await page.locator('.studio-nav-item').count(),6);
       assert.equal(await page.locator('.studio-workspace').count(),1);
       assert.ok(await frame.locator('.studio-hero').isVisible(),'missing hero');
       assert.ok(await frame.locator('.studio-topic').count()>=4,'missing topics');
       assert.ok(await frame.locator('.studio-step').count()>=4,'missing roadmap');
       const geom=await frame.evaluate(f=>{
         const q=s=>{const r=f.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
         const b=f.querySelector('.studio-primary'),s=getComputedStyle(b);
         const lum=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(n=>Number(n)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]};
         const a=lum(s.color),c=lum(s.backgroundColor);
         return {nav:q('.studio-nav'),hero:q('.studio-hero'),work:q('.studio-workspace'),contrast:(Math.max(a,c)+.05)/(Math.min(a,c)+.05),areas:getComputedStyle(f).gridTemplateAreas};
       });
       assert.ok(geom.contrast>=4.5,'primary CTA contrast '+geom.contrast);
       assert.ok(geom.work.w>=280,'workspace too narrow');
       if(viewport==='desktop'&&['notion','developer','cyberpunk'].includes(layout)){
         assert.ok(geom.nav.w<300,'navigation too wide');
         assert.ok(geom.hero.x>=geom.nav.right-2,'nav overlaps hero');
       }else assert.ok(geom.hero.y>=geom.nav.bottom-2,'nav overlaps hero');
       if(app==='tamquan')assert.ok(await page.locator('#tamquan-dashboard').count(),'Tam Quan dashboard script did not initialize');
       if(app==='hospital')assert.ok(await page.locator('#pix2').count(),'Hospital canvas missing');
      }else await page.locator('.ecosystem-banner').waitFor({state:'visible'});
      const decoded=await page.evaluate(async()=>{const i=new Image();i.src='/ui-studio-art.avif';await i.decode();return i.naturalWidth});assert.equal(decoded,700);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(overflow<=2,'horizontal overflow '+overflow);
     }catch(e){error=String(e);}
     await page.screenshot({path:path.join(output,label+'.png'),animations:'disabled'}).catch(()=>{});
     results.push({test:label,passed:!error,error});
    }
   }catch(e){results.push({test:app+'-'+viewport,passed:false,error:String(e)});}
   await page.close();
  }
 }
}catch(e){results.push({test:'browser setup/cross-origin',passed:false,error:String(e)});}
finally{await browser.close();await writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));}
if(results.some(x=>!x.passed))process.exitCode=1;
