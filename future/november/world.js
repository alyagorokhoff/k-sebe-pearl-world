'use strict';
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pearl = $('#pearl');
  let scrollY = window.scrollY, scheduled = false;
  let pointer = {x:0,y:0}, whisperTimer, responseTimer;
  const art = $('.hero-art');
  const scenes = ['home','pause','message','miracle'].map(id=>document.getElementById(id));
  const journeyLinks = $$('.journey a');
  function measure() { paint(); }
  function paint() {
    scheduled = false;
    let active=0;scenes.forEach((scene,i)=>{if(scene.getBoundingClientRect().top<innerHeight*.55)active=i;});
    journeyLinks.forEach((link,i)=>{link.classList.toggle('active',i===active);if(i===active)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
    const drift = reduced ? 0 : Math.min(24, scrollY * .035);
    // The sculpture stays inside its own reserved hero area. It never crosses text.
    pearl.style.transform = `translate3d(${pointer.x}px,${pointer.y + drift}px,0)`;
    $('.scroll-progress').style.transform = `scaleX(${scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`;
  }
  function schedule() {if(!scheduled){scheduled=true;requestAnimationFrame(paint);}}
  window.addEventListener('scroll',()=>{scrollY=window.scrollY;schedule();},{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  if(window.matchMedia('(pointer:fine)').matches && !reduced) art.addEventListener('pointermove',e=>{
    const r=art.getBoundingClientRect();
    pointer={x:((e.clientX-r.left)/r.width-.5)*8,y:((e.clientY-r.top)/r.height-.5)*8};schedule();
  },{passive:true});
  art.addEventListener('pointerleave',()=>{pointer={x:0,y:0};schedule();});
  const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
  }),{threshold:.13});
  $$('.reveal').forEach(el=>observer.observe(el));
  function whisper(text) {
    const el=$('#whisper');clearTimeout(whisperTimer);el.textContent=text;el.classList.add('visible');
    whisperTimer=setTimeout(()=>el.classList.remove('visible'),4400);
  }
  const whispers=['Ты уже здесь. Этого достаточно.','Пусть сегодня случится что-то нежное.','Маленькое хорошее тоже считается.','Можно просто принять тепло.','А вдруг всё сложится ещё красивее?'];
  let whisperIndex=0;
  pearl.addEventListener('click',e=>{
    clearTimeout(responseTimer);pearl.classList.remove('touched');void pearl.offsetWidth;pearl.classList.add('touched');
    responseTimer=setTimeout(()=>pearl.classList.remove('touched'),1250);
    whisper(whispers[whisperIndex++ % whispers.length]);
    if(!reduced){
      const r=pearl.getBoundingClientRect(), ripple=document.createElement('span');ripple.className='touch-ripple';
      ripple.style.left=(e.detail?e.clientX:r.left+r.width/2)+'px';ripple.style.top=(e.detail?e.clientY:r.top+r.height/2)+'px';
      document.body.append(ripple);ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
    }
  });
  let breathing=false, breathTimer;
  const breathButton=$('#breathe'), pause=$('#pause'), breathStatus=$('#breath-status');
  function stopBreathing() {
    breathing=false;clearTimeout(breathTimer);pause.classList.remove('inhaling','exhaling');
    breathButton.innerHTML='Побыть в этом моменте <span>↗</span>';breathButton.setAttribute('aria-pressed','false');
    breathStatus.textContent='Этот момент остаётся с тобой.';
  }
  breathButton.setAttribute('aria-pressed','false');
  breathButton.addEventListener('click',()=>{
    if(breathing){stopBreathing();return;}
    breathing=true;breathButton.innerHTML='Завершить паузу <span>○</span>';breathButton.setAttribute('aria-pressed','true');
    let phase=0;
    function next(){
      if(!breathing)return;
      if(phase>=6){stopBreathing();whisper('Спасибо за этот момент с собой.');return;}
      const inhale=phase%2===0;pause.classList.toggle('inhaling',inhale);pause.classList.toggle('exhaling',!inhale);
      breathStatus.textContent=inhale?'Мягкий вдох. В удобном тебе ритме.':'Неторопливый выдох. Никуда не спешим.';
      phase++;breathTimer=setTimeout(next,4000);
    }next();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden && breathing)stopBreathing();});
  const card=$('#message-card');
  function toggleCard(){
    const open=card.classList.toggle('opened');card.setAttribute('aria-pressed',String(open));
    card.setAttribute('aria-label',open?'Послание: '+$('#card-message').textContent+'. Закрыть послание.':'Открыть послание');
    $('#open-message').innerHTML=(open?'Оставить это с собой':'Прочитать послание')+' <span class="link-circle">↗</span>';
  }
  card.addEventListener('click',toggleCard);
  $('#open-message').addEventListener('click',()=>{toggleCard();if(innerWidth<761)card.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});});
  const gifts=[
    {title:'Хорошее уже в пути',text:'Пусть в твоём дне появится неожиданная радость. Та, которую не нужно планировать. Оставь для неё немного места.',color:'#e4c6d1'},
    {title:'Можно чуть медленнее',text:'Маленький подарок на сегодня: один момент без спешки. Тёплая чашка в ладонях, любимая песня или взгляд в окно. Выбери свой.',color:'#ded4e4'},
    {title:'Тепло возвращается',text:'Вспомни человека, рядом с которым тебе тепло. Пусть это будет маленьким поводом написать: «Как хорошо, что ты есть».',color:'#d8c5d8'},
    {title:'Место для приятного',text:'Сегодня можно выбрать что-то просто потому, что тебе нравится. Без большой причины. Маленькая радость — уже достаточная причина.',color:'#ebcdd3'},
    {title:'Твоя тихая удача',text:'Пусть сегодня найдётся что-то вовремя: нужные слова, свободная минутка или маленькое совпадение, от которого захочется улыбнуться.',color:'#d8cddd'},
    {title:'Нежность без повода',text:'Тебе досталось немного нежности. Сохрани её для себя или подари кому-то. Хорошему не обязательно ждать особенного дня.',color:'#e5ccd7'}
  ];
  const dialog=$('#gift-dialog');let currentGift=0,opening=false,doorTimer,crossingTimer,selectedDoor,roomTimer;
  function giftIndex(door){
    let previous=-1;try{previous=Number(sessionStorage.getItem('k-sebe-last-gift')??-1);}catch{}
    const options=gifts.map((_,i)=>i).filter(i=>i!==previous);
    const values=new Uint32Array(1);crypto.getRandomValues(values);
    const index=options[(values[0]+door)%options.length];try{sessionStorage.setItem('k-sebe-last-gift',String(index));}catch{}
    return index;
  }
  function showGift(index){
    currentGift=index;const gift=gifts[index];$('#gift-title').textContent=gift.title;$('#gift-text').textContent=gift.text;
    $('#gift-status').textContent='';$('#gift-link').hidden=true;dialog.style.setProperty('--gift-tint',gift.color);dialog.dataset.gift=String(index);
    $('.threshold').classList.remove('crossing');
    if(!dialog.open){dialog.showModal();document.body.classList.add('modal-open');}
  }
  $$('.door-button').forEach(button=>button.addEventListener('click',()=>{
    if(opening)return;opening=true;selectedDoor=button;button.classList.add('is-opening');
    $$('.door-button').forEach(b=>b.disabled=true);
    crossingTimer=setTimeout(()=>$('.threshold').classList.add('crossing'),reduced?0:1400);
    doorTimer=setTimeout(()=>{showGift(giftIndex(Number(button.dataset.door)));opening=false;},reduced?20:2150);
  }));
  function closeGift(){dialog.close();}
  $('#close-gift').addEventListener('click',closeGift);$('#another-gift').addEventListener('click',closeGift);
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeGift();}});
  dialog.addEventListener('close',()=>{
    clearTimeout(doorTimer);clearTimeout(crossingTimer);$('.threshold').classList.remove('crossing');opening=false;document.body.classList.remove('modal-open');
    $$('.door-button').forEach(b=>{b.classList.remove('is-opening');b.disabled=false;});
    if(selectedDoor)selectedDoor.focus({preventScroll:true});
    if(/^#gift-[0-5]$/.test(location.hash)){history.replaceState(null,'','#miracle');$('#miracle').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});}
  });
  $('#gift-view').addEventListener('click',()=>{
    clearTimeout(roomTimer);dialog.classList.remove('room-lit');void dialog.offsetWidth;dialog.classList.add('room-lit');roomTimer=setTimeout(()=>dialog.classList.remove('room-lit'),5000);
  });
  function giftURL(){const url=new URL(location.href);url.hash='gift-'+currentGift;return url.href;}
  $('#share-gift').addEventListener('click',async()=>{
    const url=giftURL(),gift=gifts[currentGift],status=$('#gift-status');
    try{
      if(navigator.share){await navigator.share({title:'Тебе маленькое чудо · К СЕБЕ',text:gift.title+' — подарок для тебя.',url});status.textContent='Чудо отправлено дальше.';}
      else if(navigator.clipboard){await navigator.clipboard.writeText(url);status.textContent='Ссылка скопирована. Её можно отправить близкому человеку.';}
      else{const input=$('#gift-link');input.hidden=false;input.value=url;input.focus();input.select();status.textContent='Скопируй эту ссылку и отправь тому, кому хочешь подарить чудо.';}
    }catch(e){status.textContent=e.name==='AbortError'?'Подарок остаётся здесь. Можно поделиться позже.':'Скопируй ссылку ниже и отправь её близкому человеку.';if(e.name!=='AbortError'){const input=$('#gift-link');input.hidden=false;input.value=url;input.focus();input.select();}}
  });
  function wrap(ctx,text,maxWidth){const words=text.split(' '),lines=[];let line='';for(const w of words){const next=line?line+' '+w:w;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=w;}else line=next;}if(line)lines.push(line);return lines;}
  $('#save-gift').addEventListener('click',async()=>{
    const button=$('#save-gift'),status=$('#gift-status');button.disabled=true;status.textContent='Готовлю твой подарок…';
    try{
      await document.fonts.ready;const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext('2d'),gift=gifts[currentGift];
      const bg=ctx.createLinearGradient(0,0,1080,1920);bg.addColorStop(0,'#f7efe9');bg.addColorStop(.52,gift.color);bg.addColorStop(1,'#f4eae5');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1920);
      ctx.strokeStyle='#a9869d55';ctx.lineWidth=1;ctx.strokeRect(55,55,970,1810);
      ctx.textAlign='center';ctx.fillStyle='#8d6e81';ctx.font='22px Arial';ctx.fillText('МАЛЕНЬКОЕ ЧУДО ДЛЯ ТЕБЯ',540,220);
      ctx.save();ctx.beginPath();ctx.moveTo(400,700);ctx.lineTo(400,430);ctx.bezierCurveTo(400,240,680,240,680,430);ctx.lineTo(680,700);ctx.closePath();ctx.clip();
      const sky=ctx.createLinearGradient(0,270,0,700);sky.addColorStop(0,gift.color);sky.addColorStop(1,'#fff4e3');ctx.fillStyle=sky;ctx.fillRect(390,270,300,440);
      ctx.fillStyle='#fff8e3';ctx.beginPath();ctx.arc(570,430,37,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#bda0b7';ctx.beginPath();ctx.moveTo(380,595);ctx.bezierCurveTo(450,540,580,545,700,505);ctx.lineTo(700,710);ctx.lineTo(380,710);ctx.fill();
      ctx.fillStyle='#e5cfd8';ctx.beginPath();ctx.moveTo(380,595);ctx.bezierCurveTo(500,555,600,625,700,610);ctx.lineTo(700,710);ctx.lineTo(380,710);ctx.fill();
      ctx.fillStyle='#ead8dc';ctx.fillRect(380,640,330,70);ctx.strokeStyle='#fff4e888';ctx.lineWidth=1;for(let y=648;y<705;y+=9){ctx.beginPath();ctx.moveTo(390,y);ctx.lineTo(690,y-4);ctx.stroke();}ctx.restore();
      ctx.strokeStyle='#b293a550';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(390,710);ctx.lineTo(390,430);ctx.bezierCurveTo(390,225,690,225,690,430);ctx.lineTo(690,710);ctx.closePath();ctx.stroke();
      ctx.fillStyle='#62465c';ctx.font='400 100px Cormorant';const titleLines=wrap(ctx,gift.title,800);let y=900-(titleLines.length-1)*50;titleLines.forEach(line=>{ctx.fillText(line,540,y);y+=106;});
      ctx.fillStyle='#826779';ctx.font='400 53px Cormorant';const lines=wrap(ctx,gift.text,755);y=1190;lines.forEach(line=>{ctx.fillText(line,540,y);y+=66;});
      ctx.fillStyle='#947789';ctx.font='400 36px Cormorant';ctx.fillText('С теплом, К СЕБЕ',540,1700);
      canvas.toBlob(blob=>{if(!blob){button.disabled=false;status.textContent='Не удалось создать файл. Попробуй ещё раз.';return;}
        const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='k-sebe-chudo-'+(currentGift+1)+'.png';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);button.disabled=false;status.textContent='Подарок готов. Файл PNG отправлен в загрузки.';
      },'image/png');
    }catch{button.disabled=false;status.textContent='Не удалось сохранить подарок. Попробуй ещё раз.';}
  });
  const gallery=$('.doors');
  function stepDoor(direction){
    const step=gallery.querySelector('.door-button').getBoundingClientRect().width+32;
    gallery.scrollBy({left:step*direction,behavior:reduced?'instant':'smooth'});
  }
  $('#previous-door').addEventListener('click',()=>stepDoor(-1));
  $('#next-door').addEventListener('click',()=>stepDoor(1));
  document.fonts.ready.then(measure);measure();
  function incomingGift(){const incoming=/^#gift-([0-5])$/.exec(location.hash);if(incoming)showGift(Number(incoming[1]));}
  window.addEventListener('hashchange',incomingGift);incomingGift();
})();
