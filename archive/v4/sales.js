'use strict';
(()=>{
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const hero=$('#pearl'), art=$('.hero-art'), light=$('#companion');
 let awake=false, scrollFrame=0, pointer={x:0,y:0}, whisperTimer;
 function whisper(text){const el=$('#whisper');clearTimeout(whisperTimer);el.textContent=text;el.classList.add('visible');whisperTimer=setTimeout(()=>el.classList.remove('visible'),4200);}
 function activateLight(announce=true,origin=null){if(awake)return;awake=true;document.body.classList.add('light-awake');window.KsebeFlight.activate(origin||hero.getBoundingClientRect());$('.pearl-touch').innerHTML='СВЕТ ТЕПЕРЬ С ТОБОЙ <span>↗</span>';if(announce)whisper('Этот свет теперь с тобой. Листай дальше.');}
 function paint(){scrollFrame=0;const p=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);$('.scroll-progress').style.transform=`scaleX(${p})`;hero.style.transform=`translate3d(${pointer.x}px,${pointer.y}px,0)`;if(!reduced)$$('.world-backdrop').forEach(el=>{const r=el.parentElement.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)el.style.setProperty('--world-shift',`${Math.max(-28,Math.min(28,-r.top*.055))}px`);});window.KsebeFlight.update();}
 function schedule(){if(!scrollFrame)scrollFrame=requestAnimationFrame(paint);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 if(matchMedia('(pointer:fine)').matches&&!reduced){art.addEventListener('pointermove',e=>{const r=art.getBoundingClientRect();pointer={x:((e.clientX-r.left)/r.width-.5)*8,y:((e.clientY-r.top)/r.height-.5)*8};schedule();},{passive:true});art.addEventListener('pointerleave',()=>{pointer={x:0,y:0};schedule();});}
 const phrases=['Ты уже здесь. Этого достаточно.','Пусть сегодня случится что-то нежное.','Маленькое хорошее тоже считается.','Можно просто принять тепло.','А вдруг всё сложится ещё красивее?'];let phraseIndex=0;
 hero.addEventListener('click',()=>{hero.classList.remove('touched');void hero.offsetWidth;hero.classList.add('touched');setTimeout(()=>hero.classList.remove('touched'),1800);if(!awake)activateLight(false);else window.KsebeFlight.flash();whisper(phrases[phraseIndex++%phrases.length]);});
 light.addEventListener('click',()=>{window.KsebeFlight.flash();whisper(phrases[phraseIndex++%phrases.length]);});
 document.addEventListener('light-caught',()=>whisper(phrases[phraseIndex++%phrases.length]));
 document.addEventListener('pointerup',e=>{if(awake&&!e.target.closest('a,button,summary,input,select,textarea'))window.KsebeFlight.catchAt(e.clientX,e.clientY);});
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.12});$$('.reveal').forEach(el=>observer.observe(el));
 const responses={calm:'Не всё нужно решать прямо сейчас. Можно начать с одного спокойного момента.',clarity:'Из всего, что зовёт твоё внимание, выбери то, что сейчас важно именно тебе.',ground:'Не обязательно справляться со всем сразу. Можно опереться на себя — и сделать один шаг.'};
 $$('.state-tabs button').forEach(button=>button.addEventListener('click',()=>{$$('.state-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('.state-experience').dataset.state=button.dataset.state;$('#state-response').textContent=responses[button.dataset.state];}));
 const card=$('#message-card');function toggleCard(){const open=card.classList.toggle('opened');card.setAttribute('aria-pressed',String(open));card.setAttribute('aria-label',open?'Послание: '+$('#card-message').textContent+' Закрыть послание.':'Открыть послание');$('#open-message').innerHTML=(open?'Свет теперь рядом':'Открыть послание')+' <span class="link-circle">↗</span>';if(open)activateLight(true,card.getBoundingClientRect());}
 card.addEventListener('click',toggleCard);$('#open-message').addEventListener('click',()=>{toggleCard();if(innerWidth<761)card.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});});
 let breathing=false,breathTimer;const stage=$('#pause'),breath=$('#breathe'),status=$('#breath-status');
 function stop(){breathing=false;clearTimeout(breathTimer);stage.classList.remove('inhaling','exhaling');breath.innerHTML='Попробовать маленькую паузу <span>↗</span>';breath.setAttribute('aria-pressed','false');status.textContent='Этот момент остаётся с тобой.';}
 breath.addEventListener('click',()=>{if(breathing){stop();return;}breathing=true;breath.setAttribute('aria-pressed','true');breath.innerHTML='Завершить паузу <span>○</span>';let phase=0;function next(){if(!breathing)return;if(phase===6){stop();return;}const inhale=phase%2===0;stage.classList.toggle('inhaling',inhale);stage.classList.toggle('exhaling',!inhale);status.textContent=inhale?'Мягкий вдох. В удобном тебе ритме.':'Неторопливый выдох. Никуда не спешим.';phase++;breathTimer=setTimeout(next,4000);}next();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&breathing)stop();});
 const rhythms={quick:{label:'МАЛЕНЬКАЯ ПАУЗА',text:'На мгновение. Просто здесь.'},deep:{label:'КОГДА ХОЧЕТСЯ ГЛУБЖЕ',text:'Не обязательно торопить себя.'},diary:{label:'ЛИЧНЫЙ ДНЕВНИК',text:'Маленькое хорошее тоже считается.'}};
 $$('.rhythm-option').forEach(button=>button.addEventListener('click',()=>{stop();const key=button.dataset.rhythm;$$('.rhythm-option').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-expanded',String(b===button));});stage.dataset.rhythm=key;$('.rhythm-stage-label').textContent=rhythms[key].label;$('#rhythm-description').textContent=rhythms[key].text;breath.hidden=key==='diary';status.textContent=key==='diary'?'Сохраняй то, что хочется заметить.':'Небольшое знакомство с ритмом пространства.';}));
 const purchase=$('#purchase-dialog');let chosenButton;
 $$('[data-plan]').forEach(button=>button.addEventListener('click',()=>{chosenButton=button;$('#chosen-plan').textContent=button.dataset.plan;$('#chosen-price').textContent=button.dataset.plan==='BASIC'?'990 ₽':'1 590 ₽';purchase.showModal();document.body.classList.add('modal-open');}));
 $('#close-purchase').addEventListener('click',()=>purchase.close());$('#back-to-plans').addEventListener('click',()=>purchase.close());purchase.addEventListener('close',()=>{document.body.classList.remove('modal-open');chosenButton?.focus({preventScroll:true});});purchase.addEventListener('click',e=>{if(e.target===purchase){const r=purchase.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)purchase.close();}});
 // Native details elements preserve keyboard support; only one answer stays open.
 $$('.questions details').forEach(detail=>detail.querySelector('summary').addEventListener('click',()=>{if(!detail.open)$$('.questions details').forEach(other=>{if(other!==detail)other.open=false;});}));
 const layoutObserver=new ResizeObserver(schedule);layoutObserver.observe(document.querySelector("main"));
 document.fonts.ready.then(paint);paint();
})();
