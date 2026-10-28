'use strict';
(()=>{
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), smooth=v=>v*v*(3-2*v);
 let awake=false,toastTimer,trigger,wakeAt=-10;
 const dialog=$('#purchase-dialog');
 $$('[data-plan]').forEach(b=>b.addEventListener('click',()=>{trigger=b;$('#chosen-plan').textContent=b.dataset.plan;$('#chosen-price').textContent=b.dataset.plan==='BASIC'?'990 ₽':'1 590 ₽';dialog.showModal();document.body.classList.add('modal-open');}));
 $('#close-purchase').addEventListener('click',()=>dialog.close());$('#back-to-plans').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');trigger?.focus({preventScroll:true});});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=document.querySelector(a.getAttribute('href'));if(target){e.preventDefault();if(target.id==='home')window.scrollTo({top:0,behavior:reduced?'auto':'smooth'});else target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});history.replaceState(null,'',a.getAttribute('href'));}}));
 const miracleGiftButton=$('#miracle-gift-button');
 if(miracleGiftButton){
  const releaseAt=Date.parse('2026-11-01T00:00:00+03:00');
  const destinations=[
   'https://pechenka.archangelsguide.ru/',
   'https://monetka.archangelsguide.ru/',
   'https://bilet.archangelsguide.ru/',
   'https://obyatie.archangelsguide.ru/',
   'https://babochka.archangelsguide.ru/'
  ];
  const syncMiracleAvailability=()=>{
   const locked=Date.now()<releaseAt;
   miracleGiftButton.disabled=locked;
   miracleGiftButton.setAttribute('aria-disabled',String(locked));
  };
  syncMiracleAvailability();
  setTimeout(syncMiracleAvailability,Math.max(0,releaseAt-Date.now()));
  document.addEventListener('visibilitychange',syncMiracleAvailability);
  addEventListener('focus',syncMiracleAvailability);
  miracleGiftButton.addEventListener('click',()=>{
   syncMiracleAvailability();
   if(miracleGiftButton.disabled)return;
   location.assign(destinations[Math.floor(Math.random()*destinations.length)]);
  });
 }
 // Every page load gets a fresh invitation; a permanent shortcut remains after dismissal.
 const nudge=$('#miracle-nudge'),gift=$('#gift'),launcher=$('#miracle-launcher'),arrival=$('#arrival');let nudgeShown=false,nudgeDismissed=false,nudgeTimer;
 function hideNudge(){clearTimeout(nudgeTimer);nudge.hidden=true;nudgeDismissed=true;document.body.classList.remove('miracle-notice-open');}
 function leavingFirstScreen(){return arrival.getBoundingClientRect().top<innerHeight-1;}
 function dismissNudgeOnScroll(){if(!nudgeDismissed&&leavingFirstScreen())hideNudge();}
 function showNudge(){if(nudgeShown||nudgeDismissed||document.hidden)return;if(leavingFirstScreen()){hideNudge();return;}const r=gift.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0){hideNudge();return;}if(dialog.open||$('#whisper').classList.contains('visible')){nudgeTimer=setTimeout(showNudge,1500);return;}nudge.hidden=false;nudgeShown=true;document.body.classList.add('miracle-notice-open');}
 $('#close-miracle-nudge').addEventListener('click',()=>{hideNudge();launcher.focus({preventScroll:true});});
 $('#peek-miracle').addEventListener('click',()=>{hideNudge();$('#miracle-title').setAttribute('tabindex','-1');$('#miracle-title').focus({preventScroll:true});});
 launcher.addEventListener('click',()=>{hideNudge();$('#miracle-title').setAttribute('tabindex','-1');$('#miracle-title').focus({preventScroll:true});});
 addEventListener('scroll',dismissNudgeOnScroll,{passive:true});
 nudgeTimer=setTimeout(showNudge,4000);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!nudgeShown&&!nudgeDismissed){clearTimeout(nudgeTimer);nudgeTimer=setTimeout(showNudge,4000);}});
 if('IntersectionObserver' in window){const giftObserver=new IntersectionObserver(entries=>{for(const entry of entries){launcher.hidden=entry.isIntersecting;if(entry.isIntersecting)hideNudge();}},{threshold:.12});giftObserver.observe(gift);}
 const reveals=$$('.reveal');if(!reduced&&'IntersectionObserver' in window){document.body.classList.add('js-motion');const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target);}},{threshold:.08});reveals.forEach(el=>io.observe(el));}
 $('#pearl').addEventListener('click',()=>{if(awake)return;awake=true;wakeAt=clock;document.body.classList.add('light-awake');$('#pearl').setAttribute('aria-pressed','true');$('#pearl').disabled=true;holdingLight=false;$('#pearl .pearl-prompt strong').textContent='Свет теперь с тобой';$('#pearl .pearl-prompt small').textContent='Листай. Я рядом.';$('#whisper').textContent='Не всё хорошее нужно заслужить. Что-то может случиться просто так.';$('#whisper').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#whisper').classList.remove('visible'),5200);});
 let px=0,py=0,mx=0,my=0,holdingLight=false;$('#pearl').addEventListener('pointerenter',()=>holdingLight=true);$('#pearl').addEventListener('pointerleave',()=>holdingLight=false);$('#pearl').addEventListener('focus',()=>holdingLight=true);$('#pearl').addEventListener('blur',()=>holdingLight=false);addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;px=(e.clientX/innerWidth-.5)*2;py=(e.clientY/innerHeight-.5)*2;},{passive:true});
 const scene=$('.deck-scene');scene.addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch')return;const r=scene.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;scene.style.setProperty('--tilt-x',`${-y*9}deg`);scene.style.setProperty('--tilt-y',`${x*14}deg`);});scene.addEventListener('pointerleave',()=>{scene.style.setProperty('--tilt-x','0deg');scene.style.setProperty('--tilt-y','0deg');});scene.addEventListener('focus',()=>scene.style.setProperty('--spread','50'));scene.addEventListener('blur',()=>scene.style.setProperty('--spread','0'));
 const pearl=$('.living-pearl'),sculpture=$('.pearl-sculpture');
 let w=innerWidth,h=innerHeight,zones=[],stops=[],last=0,lastPaint=0,clock=0,x=w*.5,y=h*.5,size=360,scrollDirty=true,initialized=false;
 function docTop(el){let top=0;for(let n=el;n;n=n.offsetParent)top+=n.offsetTop;return top;}
 function geometry(){w=document.documentElement.clientWidth;h=innerHeight;const hero=$('.hero'),arrival=$('.arrival'),journey=$('.scene-journey'),base=docTop(journey);const starts={home:base,arrival:base+hero.offsetHeight,deck:base+hero.offsetHeight+arrival.offsetHeight,closing:docTop($('.closing-journey'))};stops=$$('[data-pearl]').map(el=>{const name=el.dataset.pearl,section=el.closest('section');let local=0;for(let n=el;n&&n!==section;n=n.offsetParent)local+=n.offsetTop;const worldY=starts[name]+local;return {name,at:name==='home'?0:Math.max(0,worldY-h*.38),x:el.getBoundingClientRect().left,worldY};});hero.style.setProperty('--sticky-top',`${Math.min(0,h-hero.offsetHeight)}px`);arrival.style.setProperty('--sticky-top',`${Math.min(0,h-arrival.offsetHeight)}px`);$('.closing').style.setProperty('--sticky-top',`${Math.min(0,h-$('.closing').offsetHeight)}px`);if(!initialized||scrollY<10){const start=position();x=start.x;y=start.y;size=start.s;initialized=true;}scrollDirty=true;}

 function position(){let a=stops[0],b=stops[0],k=0;for(let i=1;i<stops.length;i++){b=stops[i];if(scrollY<=b.at){k=clamp((scrollY-a.at)/Math.max(1,b.at-a.at),0,1);break;}a=b;k=1;}if(!a||!b)return {x:w*.5,y:h*.5,s:300};const t=smooth(k),mobile=w<761;let tx=a.x+(b.x-a.x)*t,ty=(a.worldY-scrollY)*(1-t)+(b.worldY-scrollY)*t;const sizes=mobile?{home:280,arrival:95,deck:96,closing:150}:{home:400,arrival:135,deck:120,closing:190};let s=sizes[a.name]+(sizes[b.name]-sizes[a.name])*t;if(a.name!==b.name){const arc=Math.sin(k*Math.PI);tx+=Math.sin(k*Math.PI*2)*arc*(mobile?45:140);ty-=arc*(mobile?35:80);}return{x:clamp(tx,40,w-40),y:clamp(ty,55,h-55),s};}
 function draw(now){requestAnimationFrame(draw);if(document.hidden||reduced&&!scrollDirty||now-lastPaint<30&&!scrollDirty)return;lastPaint=now;const dt=Math.min((now-(last||now-16))/1000,.05);last=now;if(!reduced){clock+=dt;mx+=(px-mx)*.045;my+=(py-my)*.045;}const p=position();const wake=clock-wakeAt;if(awake&&wake<3.6&&!reduced){const u=wake/3.6;p.x+=Math.sin(u*Math.PI*2)*Math.sin(u*Math.PI)*w*.18;p.y-=Math.sin(u*Math.PI)*h*.09;p.s*=1-Math.sin(u*Math.PI)*.15;}const ease=reduced?1:1-Math.exp(-dt*6);const docked=scrollY<40&&!awake;const bob=reduced||docked?0:Math.sin(clock*1.25)*(holdingLight?1:7);x+=(p.x+(reduced||docked?0:Math.sin(clock*.7)*(holdingLight?1:6))-x)*ease;y+=(p.y+bob-y)*ease;size+=(p.s-size)*ease;const atHome=scrollY<$('.hero').offsetHeight*.45;pearl.classList.toggle('at-home',atHome);pearl.classList.toggle('show-prompt',scrollY<55);pearl.tabIndex=atHome?0:-1;pearl.setAttribute('aria-hidden',atHome?'false':'true');const covered=scrollY>h*.65&&zones.some(r=>x>r.left-size*.25&&x<r.right+size*.25&&y>r.top-size*.3&&y<r.bottom+size*.3);pearl.style.opacity=covered?'0':'1';pearl.style.left=`${x.toFixed(2)}px`;pearl.style.top=`${y.toFixed(2)}px`;pearl.style.width=pearl.style.height=`${size.toFixed(1)}px`;sculpture.style.transform=reduced?'none':`perspective(800px) translateY(${(Math.sin(clock*1.25)*(holdingLight?1:6)).toFixed(2)}px) rotateX(${(-my*9+Math.sin(clock*1.15)*9).toFixed(2)}deg) rotateY(${(mx*15+Math.sin(clock*.85)*22).toFixed(2)}deg) rotateZ(${(Math.sin(clock*.7)*14).toFixed(2)}deg)`;
 if(scrollDirty){zones=$$('h2,h3,p,li,summary,.pill,.arrival-copy,.pearl-prompt,.price,.miracle-teaser').filter(el=>{const section=el.closest('section');if(section===$('.hero')&&$('.arrival').getBoundingClientRect().top<h*.65)return false;if(section===$('.arrival')&&$('.deck-section').getBoundingClientRect().top<h*.65)return false;return true;}).map(el=>el.getBoundingClientRect()).filter(r=>r.bottom>0&&r.top<h);$('.progress').style.transform=`scaleX(${scrollY/Math.max(1,document.documentElement.scrollHeight-h)})`;const hero=$('.hero'),arrival=$('.arrival'),deck=$('.deck-scene');if(!reduced){for(const layer of [arrival,$('.deck-section'),$('.faq')]){const r=layer.getBoundingClientRect();const progress=smooth(clamp((h-r.top)/(h*.9),0,1));layer.style.setProperty('--panel-inset',`${(1-progress)*(w<761?13:46)}px`);layer.style.setProperty('--panel-radius',`${(1-progress)*(w<761?34:80)}px`);layer.style.setProperty('--panel-scale',`${.975+progress*.025}`);}hero.style.setProperty('--hero-drift',`${Math.min(h*.1,scrollY*.12)}px`);const ar=arrival.getBoundingClientRect();arrival.style.setProperty('--arrival-drift',`${clamp(-ar.top*.11,-55,55)}px`);arrival.style.setProperty('--arrival-zoom',`${1.06+clamp((h-ar.top)/(h+ar.height),0,1)*.07}`);const heroExit=clamp(scrollY/h,0,1);hero.style.setProperty('--hero-title-y',`${heroExit*65}px`);hero.style.setProperty('--hero-title-opacity',`${1-heroExit*.75}`);const dr=deck.getBoundingClientRect();deck.style.setProperty('--spread',`${clamp((h*.8-dr.top)*.2,0,90)}`);const entry=clamp((h-dr.top)/(h+dr.height*.35),0,1);deck.style.setProperty('--stage-lift',`${(1-entry)*32}px`);deck.style.setProperty('--stage-scale',`${.95+entry*.05}`);}scrollDirty=false;}}
 addEventListener('scroll',()=>{scrollDirty=true;},{passive:true});addEventListener('resize',geometry,{passive:true});document.fonts.ready.then(geometry);new ResizeObserver(geometry).observe(document.querySelector('main'));geometry();requestAnimationFrame(draw);
})();
