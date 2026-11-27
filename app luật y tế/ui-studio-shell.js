/* Shared App Shell v1. One layout engine; existing app DOM stays the source of truth. */
(() => {
 'use strict';
 const root=document.documentElement;
 const boot=document.currentScript;
 const app=boot.dataset.app||root.dataset.uiApp||'home';
 const prefs=window.LuatYTeUIStudio;
 if(!prefs)return;
 const catalog=[
  ['law','Học Luật Y Tế','⚖','/index.html'],
  ['code','Học Code','⌘','/hoc-code/index.html'],
  ['tamquan','Học Tam Quan','✿','/tam-quan.html'],
  ['testing','Testing Academy','✓','/hoc-test/index.html'],
  ['hospital','Hospital World','✚','/clinic.html'],
  ['qa','QA Hub Pro','◇','http://127.0.0.1:3000/']
 ];
 // Targets are existing controls or existing routes, not duplicated business logic.
 const configs={
  law:{name:'Học Luật Y Tế',label:'MEDICAL LAW',title:'Hiểu luật.\nVững thực hành.',desc:'Tra cứu văn bản, luyện câu hỏi và ôn tập kiến thức pháp luật y tế.',main:'.wrap',primary:['Tra cứu văn bản','[data-tab="thuvien"]','click'],road:[['Nền tảng','ly_thuyet.html'],['Tra cứu','[data-tab="thuvien"]','click'],['Ôn tập','[data-tab="thenho"]','click'],['Luyện đề','[data-tab="tracnghiem"]','click'],['Thi thử','[data-tab="thithu"]','click']],topics:[['Thư viện luật','Văn bản và nguồn tham khảo','⚖','[data-tab="thuvien"]','click'],['Flashcard','Ôn ghi nhớ điều luật','▤','[data-tab="thenho"]','click'],['Làm quiz','Luyện câu hỏi theo chủ đề','✓','[data-tab="tracnghiem"]','click'],['Thi thử','Bộ đề và lịch sử thi','◴','[data-tab="thithu"]','click'],['Lộ trình','Học theo vai trò','↗','[data-tab="lotrinh"]','click'],['Phân tích','Xem kết quả học tập','▥','[data-tab="phantich"]','click']],context:[['Tiến độ','[data-tab="tiendo"]','click'],['Thử thách hôm nay','[data-tab="tracnghiem"]','click'],['Theo dõi hệ thống','admin.html']]},
  code:{name:'Học Code',label:'CODE STUDIO',title:'Hiểu bản chất.\nThực hành mỗi ngày.',desc:'Học C/C++ qua bài đọc, slide, ví dụ và bài tập lập trình đang có.',main:'main',header:'header.top',primary:['Học tiếp','#start','click'],road:[['Chuẩn bị','setup.html'],['Nền tảng','#levels','scroll'],['Bài học','#start','click'],['Ôn tập','#levels','scroll'],['Dự án','du-an.html']],topics:[['Danh sách bài học','C/C++ theo từng cấp độ','⌘','#levels','scroll'],['Học tiếp','Mở bài đang học','↗','#start','click'],['Môi trường','Cài đặt trình biên dịch','⚙','setup.html'],['Dự án','Thực hành theo yêu cầu','◇','du-an.html']],context:[['Tiến độ học','#status','scroll'],['Danh sách dự án','du-an.html']]},
  tamquan:{name:'Học Tam Quan',label:'MIND LAB',title:'Hiểu mình.\nHiểu thế giới.',desc:'Thế giới quan, nhân sinh quan và giá trị quan qua bài học và suy ngẫm.',main:'main',primary:['Khám phá lộ trình','#tq-roadmap','scroll'],road:[['Nền tảng','#m1','scroll'],['Thế giới quan','#m2','scroll'],['Nhân sinh quan','#b7','scroll'],['Giá trị quan','#m3','scroll'],['Ứng dụng','#m9','scroll']],topics:[['Thế giới quan','Cách nhìn và hiểu thế giới','◎','#m2','scroll'],['Nhân sinh quan','Mục tiêu và ý nghĩa cuộc sống','✿','#b7','scroll'],['Giá trị quan','Điều ta coi trọng','◇','#m3','scroll'],['Triết học','Tư tưởng và lập luận','▤','triet-hoc.html'],['Đạo đức','Tình huống và lựa chọn','⚖','dao-duc.html'],['Nhật ký','Suy ngẫm trên thiết bị','✎','#tq-reflection','scroll']],context:[['Bản đồ khái niệm','#tq-map','scroll'],['Nhịp học','.tq-streak','scroll'],['Nhật ký phản tư','#tq-reflection','scroll']]},
  testing:{name:'Testing Academy',label:'TESTING ACADEMY',title:'Học kiểm thử.\nThực hành dự án.',desc:'Học kỹ thuật kiểm thử và thực hành trên dự án Sao Mai giả lập.',main:'main',header:'header.top',primary:['Bắt đầu thực hành','#start','click'],road:[['Kiến thức','#levels','scroll'],['Test case','lesson.html?track=tester&id=tc-01-nhan-du-an'],['Thực hành','lab/index.html'],['Hướng dẫn','huong-dan-test.html'],['QA Hub','lesson.html?track=tester&id=qa-hub-tong-quan']],topics:[['Bài học','Kỹ thuật và kiến thức kiểm thử','▤','#levels','scroll'],['Sao Mai','Dự án thực chiến','✚','lesson.html?track=tester&id=tc-01-nhan-du-an'],['Bug Hunting','App đặt lịch giả lập','⌕','lab/index.html'],['Hướng dẫn','Quy trình thực hiện test','✓','huong-dan-test.html'],['Tìm bài','Tìm nội dung hiện có','⌕','#lesson-search','scroll'],['QA Hub','Bài học quản lý kiểm thử','◇','lesson.html?track=tester&id=qa-hub-tong-quan']],context:[['Tiến độ học','#status','scroll'],['Tìm bài học','#lesson-search','scroll']]},
  hospital:{name:'Hospital World',label:'HOSPITAL WORLD',title:'Một ca trực.\nNhiều quyết định.',desc:'Khám phá phòng khám, quản lý và luyện tình huống nghiệp vụ trong game hiện có.',main:'main',header:'header.hud',primary:['Vào phòng khám','#v-start','scroll'],road:[['Phòng khám','#v-start','scroll'],['Thành tựu','#btn-stats','click'],['Quản lý','#btn-upgrade','click'],['Trợ giúp','#help','click']],topics:[['Phòng khám','Không gian mô phỏng','✚','#v-start','scroll'],['Thành tựu','Thống kê game hiện có','◇','#btn-stats','click'],['Quản lý','Nâng cấp trong game','⚙','#btn-upgrade','click'],['Hướng dẫn','Cách chơi','?','#help','click']],context:[['Tiến độ game','#stat-progress','scroll'],['Trợ giúp','#help','click']]},
  qa:{name:'QA Hub Pro',label:'QA HUB PRO',title:'Kiểm thử có hệ thống.\nChất lượng có bằng chứng.',desc:'Quản lý dự án, test case, lỗi và báo cáo bằng công cụ QA hiện có.',main:'.layout',primary:['Mở Test case','#/testcases'],road:[['Dự án','#/projects'],['Test case','#/testcases'],['Lỗi','#/bugs'],['Báo cáo','#/summary'],['Hệ thống','#/hethong']],topics:[['Dự án','Quản lý phạm vi kiểm thử','◇','#/projects'],['Test case','Thiết kế và thực thi','✓','#/testcases'],['Bug report','Theo dõi lỗi tìm thấy','⌕','#/bugs'],['Báo cáo','Kết quả kiểm thử','▥','#/summary'],['Hệ thống','Môi trường và cấu hình','⚙','#/hethong'],['Chat AI','Trợ lý hiện có','✦','#/chat']],context:[['Báo cáo','#/summary'],['Cấu hình AI','#/assistant']]},
  home:{name:'Learning Hub',label:'LUATYTE.ONLINE',title:'Một không gian.\nNhiều hành trình.',desc:'Chọn lĩnh vực học tập, luyện tập và khám phá kiến thức.',main:'.hub-main',primary:['Chọn khu học','.hub-grid','scroll'],road:[['Học luật','index.html'],['Học code','hoc-code/index.html'],['Tư duy','tam-quan.html'],['Kiểm thử','/hoc-test/'],['Mô phỏng','clinic.html']],topics:catalog.map(x=>[x[1],'Mở không gian học tập',x[2],x[3]]),context:[['Theo dõi hệ thống','admin.html']]}
 };
 const cfg=configs[app];if(!cfg)return;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
 const publicURL=path=>app==='qa'&&path.startsWith('/')?'https://luatyte.online'+path:path;
 const urlFor=href=>prefs.link?prefs.link(href):new URL(href,location.href).href;
 const route=(name,target,mode,cls='studio-link')=>{
   if(mode){
     const b=el('button',cls,name);b.type='button';b.addEventListener('click',()=>{
       const node=document.querySelector(target);if(!node)return;
       // Open all enclosing details without altering learning data.
       for(let p=node.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
       if(mode==='click'){node.click();if(node.tagName==='A')return;}
       const next=mode==='click'&&node.dataset.tab?document.getElementById('p-'+node.dataset.tab):node;
       (next||node).scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
     });return b;
   }
   const a=el('a',cls,name);const href=app==='qa'&&target.startsWith('/')&&!target.startsWith('//')?publicURL(target):target;
   a.dataset.studioHref=href;a.href=urlFor(href);return a;
 };
 const card=(entry,i)=>{
   const [name,desc,icon,target,mode]=entry;
   const node=route('',target,mode,'studio-topic');node.style.setProperty('--card-index',i);
   const iconNode=el('span','studio-topic-icon',icon);iconNode.setAttribute('aria-hidden','true');
   const copy=el('span','studio-topic-copy');copy.append(el('strong','',name),el('small','',desc));
   const arrow=el('span','studio-arrow','↗');arrow.setAttribute('aria-hidden','true');
   node.append(iconNode,copy,arrow);return node;
 };
 function init(){
   if(document.querySelector('.studio-frame'))return;
   const main=document.querySelector(cfg.main),open=document.querySelector('.ecosystem-ui-open,.ui-studio-open');
   if(!main||!open)return;
   const legacyNav=document.querySelector('body>nav[aria-label="Chuyển khu học"]');
   const legacyHeader=cfg.header&&document.querySelector(cfg.header);
   const lessonChat=app==='tamquan'&&document.querySelector('.lesson-chat');
   const progress=app==='law'?main.querySelector('.hero .stats'):['code','testing'].includes(app)?main.querySelector('.progress-line'):null;
   const frame=el('div','studio-frame');frame.setAttribute('data-studio-app',app);
   const nav=el('nav','studio-nav');nav.setAttribute('aria-label','Điều hướng hệ sinh thái');
   const brand=route('luatyte.online',publicURL('/hoc.html'),null,'studio-brand');brand.setAttribute('aria-label','Trang tổng hợp luatyte.online');brand.prepend(el('span','studio-brand-mark','L'));
   nav.append(brand,el('small','studio-nav-label','KHÔNG GIAN HỌC'));
   for(const [id,name,icon,href] of catalog){
     const a=route('',id==='qa'&&app==='qa'?location.origin+'/':publicURL(href),null,'studio-nav-item');a.setAttribute('aria-label',name);a.title=name;
     const mark=el('span','studio-nav-icon',icon);mark.setAttribute('aria-hidden','true');a.append(mark,el('span','studio-nav-text',name));
     if(id===app)a.setAttribute('aria-current','page');nav.append(a);
   }
   const top=el('header','studio-topbar');
   const breadcrumb=el('div','studio-breadcrumb');breadcrumb.append(el('small','','KHÔNG GIAN HỌC'),el('strong','',cfg.name));
   const topActions=el('div','studio-top-actions');top.append(breadcrumb,topActions);
   const hero=el('section','studio-hero');hero.setAttribute('aria-label','Giới thiệu '+cfg.name);
   const heroCopy=el('div','studio-hero-copy');heroCopy.append(el('span','studio-eyebrow',cfg.label),el('h1','',cfg.title),el('p','',cfg.desc));
   const heroActions=el('div','studio-hero-actions');heroActions.append(route(cfg.primary[0],cfg.primary[1],cfg.primary[2],'studio-primary'),route('Mở nội dung','#studio-workspace','scroll','studio-secondary'));
   heroCopy.append(heroActions);
   const art=el('div','studio-art');art.setAttribute('aria-hidden','true');hero.append(heroCopy,art);
   const roadmap=el('section','studio-roadmap studio-panel');roadmap.setAttribute('aria-label','Lộ trình');
   const roadHead=el('div','studio-panel-head');roadHead.append(el('h2','','Lộ trình'),el('small','','Các điểm đến'));
   const steps=el('ol','studio-steps');
   cfg.road.forEach(([name,target,mode],i)=>{const li=el('li','studio-step'),link=route('',target,mode,'studio-step-link');link.append(el('span','studio-step-number',String(i+1)),el('span','',name));li.append(link);steps.append(li);});
   roadmap.append(roadHead,steps);
   const topics=el('section','studio-topics');const topicHead=el('div','studio-panel-head');topicHead.append(el('h2','','Khám phá'),el('small','','Nội dung của ứng dụng'));const grid=el('div','studio-topic-grid');cfg.topics.forEach((item,i)=>grid.append(card(item,i)));topics.append(topicHead,grid);
   const context=el('aside','studio-context');context.setAttribute('aria-label','Tiện ích học tập');
   const contextPanel=el('section','studio-panel studio-context-panel');contextPanel.append(el('span','studio-eyebrow','WORKSPACE'),el('h2','','Tiện ích'));
   for(const item of cfg.context)contextPanel.append(route(item[0],item[1],item[2],'studio-context-link'));
   const info=el('section','studio-panel studio-info');info.append(el('h3','','Không gian cá nhân'),el('p','','Nội dung và kết quả học được giữ nguyên khi đổi giao diện.'));
   if(app==='qa')info.append(el('small','','QA Hub chạy cục bộ. Liên kết sang web học chuyển preset qua URL.'));
   context.append(contextPanel,info);
   const workspace=el('section','studio-workspace');workspace.id='studio-workspace';workspace.setAttribute('aria-label','Nội dung '+cfg.name);
   const workHead=el('div','studio-panel-head studio-work-head');workHead.append(el('h2','','Không gian làm việc'),el('small','',cfg.name));workspace.append(workHead);
   frame.append(nav,top,hero,roadmap,topics,context,workspace);
   const anchors=new Map();
   const portal=(node,target)=>{if(!node)return;const marker=document.createComment('studio-restore');node.before(marker);anchors.set(node,marker);target.append(node)};
   const restore=()=>{for(const [node,marker] of [...anchors].reverse()){marker.replaceWith(node);}anchors.clear()};
   const view=()=>{
     const detail=app==='qa'&&location.hash&&location.hash!=='#/tong'&&location.hash!=='#/overview';
     const start=app==='hospital'&&document.getElementById('v-start');
     frame.dataset.view=detail||(start&&start.classList.contains('hidden'))?'detail':'overview';
   };
   function update(){
     const active=root.dataset.uiStudio&&root.dataset.uiStudio!=='legacy';
     if(active&&!frame.isConnected){
       // The shell is a presentation portal: no cloned inputs, canvas or app nodes.
       document.body.insertBefore(frame,document.body.firstChild);
       portal(open,topActions);portal(legacyHeader,workspace);portal(main,workspace);
       if(progress){progress.classList.add('studio-live-progress');portal(progress,contextPanel);}
       if(lessonChat)portal(lessonChat,context);
       if(legacyNav)legacyNav.dataset.studioOldNav='true';
       root.dataset.studioShell='on';
     }else if(!active&&frame.isConnected){
       delete root.dataset.studioShell;if(legacyNav)delete legacyNav.dataset.studioOldNav;
       restore();if(progress)progress.classList.remove('studio-live-progress');frame.remove();
     }
     frame.querySelectorAll('[data-studio-href]').forEach(a=>a.href=urlFor(a.dataset.studioHref));
     view();
   }
   // Keep links up to date even when storage is updated in another tab.
   frame.addEventListener('click',event=>{const a=event.target.closest('a[data-studio-href]');if(a)a.href=urlFor(a.dataset.studioHref)});
   new MutationObserver(update).observe(root,{attributes:true,attributeFilter:['data-ui-studio']});
   window.addEventListener('hashchange',view);
   if(app==='hospital'){const start=document.getElementById('v-start');if(start)new MutationObserver(view).observe(start,{attributes:true,attributeFilter:['class']})}
   window.addEventListener('storage',update);window.addEventListener('pageshow',update);window.addEventListener('focus',update);
   update();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
