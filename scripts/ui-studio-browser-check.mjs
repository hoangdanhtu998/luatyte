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
const pages=[['home','/hoc.html'],['law','/index.html'],['code','/hoc-code/index.html'],['tamquan','/tam-quan.html'],['philosophy','/triet-hoc.html'],['ethics','/dao-duc.html'],['testing','/hoc-test/index.html']];
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
 assert.equal(await evalAt(a,"LuatYTeUIStudio.active('law')"),'developer');
 await evalAt(a,"LuatYTeUIStudio.save('law','rpg','all')");
 assert.equal(await evalAt(q,"LuatYTeUIStudio.active('qa')"),'rpg');
 assert.equal(await evalAt(x,"LuatYTeUIStudio.active('qa')"),'legacy');
 results.push({test:'cross-origin preview cookie + override isolation',passed:true});
 await a.close();await q.close();await x.close();
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
      await dialog.getByLabel('Phạm vi áp dụng').selectOption('app');
      await dialog.getByRole('button',{name:'Áp dụng',exact:true}).click();
      await dialog.waitFor({state:'hidden'});
      assert.equal(await page.locator('html').getAttribute('data-ui-studio'),layout);
      await page.locator('.ecosystem-banner').waitFor({state:'visible'});
      const decoded=await page.evaluate(async()=>{const i=new Image();i.src='/ui-studio-art.avif';await i.decode();return i.naturalWidth});
      assert.equal(decoded,700);
      const bounds=await page.evaluate(()=>{
        const read=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
        return {nav:read('body>nav[aria-label="Chuyển khu học"]'),main:read('main')||read('.wrap'),banner:read('.ecosystem-banner')};
      });
      assert.ok(bounds.banner.width>=240,'banner too narrow');
      if(app==='home'&&viewport==='desktop'&&['notion','developer','cyberpunk'].includes(layout)){
        assert.ok(bounds.nav.width<320,'sidebar width '+bounds.nav.width);
        assert.ok(bounds.main.x>=bounds.nav.right-2,'sidebar overlaps main');
        assert.ok(bounds.main.y<200,'main pushed below fold');
      }
      if(app==='home'&&viewport==='mobile')assert.ok(bounds.main.y>=bounds.nav.bottom-2,'nav overlaps main');
      if(app==='home'){
        const ctas=await page.locator('.hub-card .hub-cta').evaluateAll(nodes=>nodes.map(el=>{
          const style=getComputedStyle(el);
          const lum=color=>{
            const rgb=color.match(/[\d.]+/g).slice(0,3).map(n=>Number(n)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
            return 0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2];
          };
          const a=lum(style.color),b=lum(style.backgroundColor);
          return {text:el.textContent.trim(),ratio:(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05)};
        }));
        assert.ok(ctas.length>=6,'missing learning CTAs');
        assert.ok(ctas.every(x=>x.text&&x.ratio>=4.5),'CTA contrast: '+JSON.stringify(ctas));
      }
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
