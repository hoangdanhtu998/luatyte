/* UI Studio v2 — only presentation, no changes to learning or account data. */
(() => {
  'use strict';
  const root = document.documentElement;
  const script = document.currentScript;
  const app = script.dataset.app || 'home';
  const presets = [
    ['legacy','Giao diện gốc','Giữ bố cục và bộ màu hiện tại'],
    ['notion','Knowledge Workspace','Tài liệu, mục lục và danh sách'],
    ['minimal','Apple Minimal','Sáng, thoáng, tập trung nội dung'],
    ['bento','Bento Grid','Dashboard lưới với thẻ lớn nhỏ'],
    ['developer','Developer Dark','Workspace tối, cam tím'],
    ['cyberpunk','Cyberpunk','Nền lưới, neon, khung HUD'],
    ['rpg','RPG Learning','Hành trình, mốc học và nhiệm vụ']
  ];
  const ids = new Set(presets.map(p=>p[0]));
  const key = 'luatyte-ui-studio-v2';
  const appKey = key+':'+app;
  const domain = location.protocol==='https:' && (location.hostname==='luatyte.online' || location.hostname.endsWith('.luatyte.online'));
  const read = k=>{try{return localStorage.getItem(k)}catch{return null}};
  const cookie = ()=>{try{return document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(key+'='))?.slice(key.length+1)||null}catch{return null}};
  const global = ()=>{const c=domain?cookie():null;return ids.has(c)?c:ids.has(read(key))?read(key):'legacy'};
  const selected = ()=>ids.has(read(appKey))?read(appKey):global();
  const apply = v=>{root.dataset.uiStudio=ids.has(v)?v:'legacy'};
  root.dataset.uiApp=app;
  apply(selected());
  const create=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el};
  const button=(text,cls)=>{const el=create('button',text,cls);el.type='button';return el};
  const init=()=>{
    if(document.querySelector('#ecosystem-ui-studio'))return;
    const host=document.querySelector('nav[aria-label="Chuyển khu học"]')||document.querySelector('header.top')||document.querySelector('.sidebar')||document.querySelector('header')||document.body;
    const open=button('UI Studio','ecosystem-ui-open');open.setAttribute('aria-haspopup','dialog');host.append(open);
    const dialog=create('dialog',undefined,'ecosystem-ui-dialog');dialog.id='ecosystem-ui-studio';dialog.setAttribute('aria-labelledby','ecosystem-ui-title');
    const title=create('h2','UI Studio');title.id='ecosystem-ui-title';
    const text=create('p','Thử bố cục ngay trên trang. Dữ liệu học và tài khoản không thay đổi.');
    const cards=create('fieldset',undefined,'ecosystem-ui-options');cards.append(create('legend','Phong cách giao diện'));
    let draft=selected();
    const radios=[];
    const status=create('p',undefined,'ecosystem-ui-status');status.setAttribute('role','status');
    for(const [id,name,desc] of presets){
      const label=create('label',undefined,'ecosystem-ui-option');
      const radio=create('input');radio.type='radio';radio.name='ecosystem-layout';radio.value=id;
      const thumb=create('span',undefined,'ecosystem-ui-thumb');thumb.dataset.preview=id;thumb.setAttribute('aria-hidden','true');
      const words=create('span');words.append(create('strong',name),create('small',desc));
      label.append(radio,thumb,words);cards.append(label);radios.push(radio);
      radio.addEventListener('change',()=>{if(radio.checked){draft=id;apply(id);status.textContent='Xem trước: '+name}});
    }
    const scopeLabel=create('label','Phạm vi áp dụng ','ecosystem-ui-scope');
    const scope=create('select');scope.setAttribute('aria-label','Phạm vi áp dụng');
    for(const [v,t] of [['app','Chỉ ứng dụng này'],['all','Toàn bộ hệ sinh thái'],['inherit','Dùng giao diện chung']]){const o=create('option',t);o.value=v;scope.append(o)}
    scopeLabel.append(scope);
    const actions=create('div',undefined,'ecosystem-ui-actions');
    const save=button('Áp dụng'),cancel=button('Hủy'),reset=button('Giao diện gốc');
    actions.append(save,cancel,reset);
    dialog.append(title,text,cards,scopeLabel,status,actions);document.body.append(dialog);
    const sync=()=>radios.forEach(r=>{r.checked=r.value===draft});
    const resetDraft=()=>{draft=selected();apply(draft);sync()};
    open.addEventListener('click',()=>{resetDraft();scope.value=ids.has(read(appKey))?'app':'all';status.textContent='';dialog.showModal()});
    save.addEventListener('click',()=>{
      try{
        if(scope.value==='app')localStorage.setItem(appKey,draft);
        else if(scope.value==='inherit')localStorage.removeItem(appKey);
        else{
          localStorage.setItem(key,draft);
          localStorage.removeItem(appKey);
          if(domain){
            document.cookie=key+'='+draft+'; Domain=luatyte.online; Path=/; Max-Age=31536000; SameSite=Lax; Secure';
            if(cookie()!==draft)status.textContent='Đã lưu tại trình duyệt, nhưng cookie chia sẻ bị chặn.';
          }
        }
        dialog.close();
      }catch{status.textContent='Không thể lưu lựa chọn. Kiểm tra cài đặt lưu trữ của trình duyệt.'}
    });
    cancel.addEventListener('click',()=>dialog.close());
    reset.addEventListener('click',()=>{draft='legacy';sync();apply(draft)});
    dialog.addEventListener('close',()=>{apply(selected());open.focus()});
    const refresh=()=>{if(!dialog.open)apply(selected())};
    window.addEventListener('storage',refresh);window.addEventListener('pageshow',refresh);window.addEventListener('focus',refresh);
    const target=document.querySelector('.hub-main,main,.wrap');
    if(target && !target.querySelector('.ecosystem-banner')){
      const data={home:['LUATYTE.ONLINE / LEARNING SPACE','Một nền tảng. Nhiều hành trình học.','Chọn lĩnh vực, tiếp tục bài học và khám phá kiến thức.','index.html','Học Luật Y Tế','law'],law:['LUẬT Y TẾ / LEARNING SPACE','Hiểu luật. Vững thực hành.','Tra cứu văn bản, ôn tập và luyện câu hỏi thực tế.','hoc.html','Khám phá các khu học','law'],code:['CODE HUB / WORKSPACE','Học code bằng thực hành.','Tiếp tục lộ trình lập trình theo từng cấp độ.','#levels','Khám phá lộ trình','code'],tamquan:['TAM QUAN / KNOWLEDGE SPACE','Mở rộng cách nhìn thế giới.','Thế giới quan, nhân sinh quan và giá trị quan qua tình huống.','#m1','Bắt đầu bài học','tamquan'],testing:['QA HUB / LEARNING SPACE','Học kiểm thử. Làm thực tế.','Rèn kỹ năng qua bài học và dự án kiểm thử.','#levels','Khám phá lộ trình','testing']};
      const d=data[app]||data.home;
      const banner=create('section',undefined,'ecosystem-banner');banner.setAttribute('aria-label','Giới thiệu không gian học');
      const words=create('div');words.append(create('small',d[0]),create('h2',d[1]),create('p',d[2]));
      const link=create('a',d[4],'ecosystem-banner-cta');link.href=d[3];words.append(link);
      const image=create('img');image.src=new URL('ui-studio-art.svg#'+d[5],script.src).href;image.alt='';image.width=420;image.height=220;image.decoding='async';
      banner.append(words,image);target.prepend(banner);
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();