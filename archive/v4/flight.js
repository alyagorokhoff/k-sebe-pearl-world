'use strict';
(()=>{
 const canvas=document.getElementById('flight-canvas'),ctx=canvas.getContext('2d'),actor=document.getElementById('companion');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const knots=[[.75,.46],[.83,.24],[.43,.32],[.18,.63],[.73,.66],[.85,.26],[.36,.44],[.23,.69],[.79,.40],[.59,.22],[.16,.60],[.75,.60],[.85,.28],[.33,.26],[.22,.62],[.73,.66],[.83,.30],[.48,.45]];
 let w=innerWidth,h=innerHeight,dpr=1,active=false,raf=0,last=0,clock=0,p=0,opacity=1,flashStart=-100;
 let x=w*.75,y=h*.46,prevX=x,prevY=y,vx=1,vy=0,trail=[],zones=[];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function resize(){w=document.documentElement.clientWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);x=clamp(x,22,w-22);y=clamp(y,65,h-35);trail=[];update();}
 function update(){
   p=clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-h),0,1);
   zones=[];
   for(const el of document.querySelectorAll('h1,h2,h3,p,summary,li,.primary-cta,.state-tabs,.header,#card-message,.card-title,.card-overline,.card-sign,.card-instruction')){
     const box=el.getBoundingClientRect();if(!box.height||box.bottom<0||box.top>h)continue;
     let rects;if(el.matches('.primary-cta,.state-tabs,.header,summary'))rects=[box];else{const range=document.createRange();range.selectNodeContents(el);rects=[...range.getClientRects()];}
     for(const r of rects)if(r.height&&r.bottom>0&&r.top<h)zones.push({left:r.left-5,right:r.right+5,top:r.top-3,bottom:r.bottom+3});
   }
   if(active&&reduced)frame(performance.now());
 }
 function cr(a,b,c,d,t){return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);}
 function route(progress,time){
   const f=Math.min(.99999,progress)*(knots.length-1),i=Math.floor(f),t=f-i;
   const get=k=>knots[clamp(k,0,knots.length-1)];const a=get(i-1),b=get(i),c=get(i+1),d=get(i+2);
   let tx=cr(a[0],b[0],c[0],d[0],t)*w,ty=cr(a[1],b[1],c[1],d[1],t)*h;
   if(!reduced){
     tx+=Math.sin(time*.52)*Math.min(20,w*.035);ty+=Math.cos(time*.61)*12;
     for(const [lo,hi,sign]of [[.17,.23,1],[.53,.59,-1],[.82,.88,1]])if(progress>lo&&progress<hi){const k=(progress-lo)/(hi-lo),angle=k*Math.PI*2,r=Math.min(85,w*.14);tx+=sign*r*Math.sin(angle);ty-=r*(1-Math.cos(angle));}
     const flashAge=time-flashStart;if(flashAge>=0&&flashAge<2.8){const a=flashAge/2.8*Math.PI*2,r=Math.min(w*.12,65)*Math.sin(flashAge/2.8*Math.PI);tx+=Math.cos(a)*r;ty+=Math.sin(a)*r;}
   }
   tx=clamp(tx,25,w-25);ty=clamp(ty,78,h-45);
   const blocked=(px,py)=>zones.some(r=>px>r.left-9&&px<r.right+9&&py>r.top-9&&py<r.bottom+9);
   if(blocked(tx,ty)){
     let found=false;
     for(const radius of [35,65,100,145]){for(let a=0;a<12;a++){const angle=a*Math.PI/6,px=clamp(tx+Math.cos(angle)*radius,25,w-25),py=clamp(ty+Math.sin(angle)*radius,80,h-45);if(!blocked(px,py)){tx=px;ty=py;found=true;break;}}if(found)break;}
   }
   return {x:tx,y:ty};
 }
 function drawRibbon(points,time){
   if(points.length<3)return;
   const grad=ctx.createLinearGradient(x,y,points.at(-1).x,points.at(-1).y);grad.addColorStop(0,'rgba(255,241,201,.72)');grad.addColorStop(.3,'rgba(255,190,165,.44)');grad.addColorStop(.65,'rgba(192,171,231,.4)');grad.addColorStop(1,'rgba(201,155,208,0)');
   ctx.beginPath();const sides=[[],[]];
   for(let i=0;i<points.length;i++){const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)],dx=next.x-prev.x,dy=next.y-prev.y,l=Math.hypot(dx,dy)||1,fade=1-i/points.length;const width=(w<761?5.5:8)*Math.pow(fade,.7)*(1+.15*Math.sin(i*.42-time*2));const nx=-dy/l,ny=dx/l;sides[0].push({x:points[i].x+nx*width,y:points[i].y+ny*width});sides[1].push({x:points[i].x-nx*width,y:points[i].y-ny*width});}
   ctx.moveTo(sides[0][0].x,sides[0][0].y);for(const q of sides[0])ctx.lineTo(q.x,q.y);for(const q of sides[1].reverse())ctx.lineTo(q.x,q.y);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
   for(let strand=0;strand<3;strand++){ctx.beginPath();for(let i=0;i<points.length;i++){const q=points[i],age=i/points.length,drift=Math.sin(i*.26+time*1.4+strand*1.9)*(4+strand*3)*age;const px=q.x+drift,py=q.y+Math.cos(i*.2+strand)*5*age;if(!i)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.lineWidth=strand===0?1.3:.6;ctx.strokeStyle=grad;ctx.globalAlpha=opacity*(strand===0?.8:.5);ctx.stroke();}ctx.globalAlpha=opacity;
 }
 function frame(now){
   if(!active)return;const dt=clamp((now-(last||now-16))/1000,.001,.04);last=now;clock+=dt;
   const to=route(p,clock),k=reduced?1:1-Math.exp(-dt/0.20);prevX=x;prevY=y;x+=(to.x-x)*k;y+=(to.y-y)*k;vx+=(x-prevX-vx)*.2;vy+=(y-prevY-vy)*.2;
   const nearText=zones.some(r=>x>r.left&&x<r.right&&y>r.top&&y<r.bottom);const desired=nearText?.65:1;opacity+=(desired-opacity)*(1-Math.exp(-dt/.16));
   ctx.clearRect(0,0,w,h);ctx.globalAlpha=opacity;
   trail.unshift({x,y});if(trail.length>(w<761?38:48))trail.pop();
   let run=0;const maximum=w<761?105:165;for(let i=1;i<trail.length;i++){run+=Math.hypot(trail[i].x-trail[i-1].x,trail[i].y-trail[i-1].y);if(run>maximum){trail.length=i+1;break;}}
   const haloRadius=w<761?65:100,halo=ctx.createRadialGradient(x,y,1,x,y,haloRadius);halo.addColorStop(0,'rgba(255,212,161,.15)');halo.addColorStop(.38,'rgba(233,159,195,.05)');halo.addColorStop(1,'rgba(210,160,220,0)');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,haloRadius,0,Math.PI*2);ctx.fill();
   const points=trail.map(q=>({...q}));const minimum=w<761?80:115;
   let distance=0;for(let i=1;i<points.length;i++)distance+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);
   if(points.length>2&&distance<minimum){const end=points.at(-1),angle=Math.atan2(vy,vx),extra=minimum-distance;for(let i=1;i<=15;i++){const d=extra*i/15,wave=Math.sin(i*.28+clock*1.3)*7*(i/15);points.push({x:end.x-Math.cos(angle)*d-Math.sin(angle)*wave,y:end.y-Math.sin(angle)*d+Math.cos(angle)*wave});}}
   const bendAngle=Math.atan2(vy,vx);for(let i=1;i<points.length;i++){const age=i/(points.length-1),wave=Math.sin(age*Math.PI*1.7+clock*.7)*10*age;points[i].x-=Math.sin(bendAngle)*wave;points[i].y+=Math.cos(bendAngle)*wave;}
   drawRibbon(points,clock);
   ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(vy,vx));const radius=w<761?15:21,core=ctx.createRadialGradient(0,0,0,0,0,radius);core.addColorStop(0,'rgba(255,252,224,1)');core.addColorStop(.22,'rgba(255,237,199,.96)');core.addColorStop(.58,'rgba(255,193,166,.38)');core.addColorStop(1,'rgba(207,171,229,0)');ctx.scale(1.2,.58);ctx.fillStyle=core;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.restore();
   // The flight sits over the world, but is cut out at actual reading lines and controls.
   ctx.globalAlpha=1;ctx.globalCompositeOperation='destination-out';ctx.fillStyle='#000';for(const r of zones)ctx.fillRect(r.left,r.top,r.right-r.left,r.bottom-r.top);ctx.globalCompositeOperation='source-over';
   const aw=w<761?44:54,ah=w<761?56:66;actor.style.transform=`translate3d(${x-aw/2}px,${y-ah/2}px,0)`;actor.style.opacity=String(Math.max(.6,opacity));
   if(!reduced)raf=requestAnimationFrame(frame);else last=0;
 }
 function activate(rect){if(active)return;active=true;if(rect){x=clamp(rect.left+rect.width*.78,25,w-25);y=clamp(rect.top+rect.height*.2,78,h-45);}trail=[];actor.hidden=false;actor.classList.add('visible');update();if(!reduced)raf=requestAnimationFrame(frame);}
 function flash(){flashStart=clock;}
 function catchAt(px,py){if(active&&Math.hypot(px-x,py-y)<65){flash();document.dispatchEvent(new CustomEvent('light-caught'));return true;}return false;}
 addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{last=0;});
 window.KsebeFlight={activate,update,flash,catchAt};resize();
})();
