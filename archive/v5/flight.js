'use strict';
(()=>{
 const canvas=document.getElementById('flight-canvas'),ctx=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const knots=[[.75,.46],[.83,.24],[.43,.32],[.18,.63],[.73,.66],[.85,.26],[.36,.44],[.23,.69],[.79,.40],[.59,.22],[.16,.60],[.75,.60],[.85,.28],[.33,.26],[.22,.62],[.73,.66],[.83,.30],[.48,.45]];
 let w=innerWidth,h=innerHeight,dpr=1,active=false,raf=0,last=0,clock=0,p=0,opacity=1;
 let x=w*.75,y=h*.46,prevX=x,prevY=y,vx=1,vy=0,zones=[];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function resize(){w=document.documentElement.clientWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);x=clamp(x,22,w-22);y=clamp(y,65,h-35);update();}
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

   }
   tx=clamp(tx,25,w-25);ty=clamp(ty,78,h-45);
   const blocked=(px,py)=>zones.some(r=>px>r.left-38&&px<r.right+38&&py>r.top-38&&py<r.bottom+38);
   if(blocked(tx,ty)){
     let found=false;
     for(const radius of [35,65,100,145]){for(let a=0;a<12;a++){const angle=a*Math.PI/6,px=clamp(tx+Math.cos(angle)*radius,25,w-25),py=clamp(ty+Math.sin(angle)*radius,80,h-45);if(!blocked(px,py)){tx=px;ty=py;found=true;break;}}if(found)break;}
   }
   return {x:tx,y:ty};
 }
 function frame(now){
   if(!active)return;const dt=clamp((now-(last||now-16))/1000,.001,.04);last=now;clock+=dt;
   const to=route(p,clock),k=reduced?1:1-Math.exp(-dt/0.20);prevX=x;prevY=y;x+=(to.x-x)*k;y+=(to.y-y)*k;vx+=(x-prevX-vx)*.2;vy+=(y-prevY-vy)*.2;
   const nearText=zones.some(r=>x>r.left-40&&x<r.right+40&&y>r.top-40&&y<r.bottom+40);const desired=nearText?0:1;opacity+=(desired-opacity)*(1-Math.exp(-dt/.16));
   ctx.clearRect(0,0,w,h);ctx.globalAlpha=opacity;
   // Symmetrical translucent folded petal: no head, tail, ribbon or trail.
   const size=w<761?25:34;
   const halo=ctx.createRadialGradient(x,y,0,x,y,size*2.8);halo.addColorStop(0,'rgba(255,220,187,.13)');halo.addColorStop(1,'rgba(225,180,214,0)');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,size*2.8,0,Math.PI*2);ctx.fill();
   ctx.save();ctx.translate(x,y);ctx.rotate(-.4+Math.sin(clock*.38)*.32);ctx.scale(1+Math.sin(clock*.6)*.05,1);
   for(let layer=0;layer<3;layer++){ctx.save();ctx.rotate(layer*.8-.6);const grad=ctx.createLinearGradient(-size,-size,size,size);grad.addColorStop(0,'rgba(255,247,218,.66)');grad.addColorStop(.4,'rgba(244,184,188,.35)');grad.addColorStop(.75,'rgba(181,162,218,.26)');grad.addColorStop(1,'rgba(255,231,193,.54)');ctx.fillStyle=grad;ctx.strokeStyle='rgba(255,233,207,.38)';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(0,-size);ctx.bezierCurveTo(size*1.1,-size*.7,size*.9,size*.65,0,size);ctx.bezierCurveTo(-size*.85,size*.55,-size*.75,-size*.6,0,-size);ctx.fill();ctx.stroke();ctx.restore();}ctx.restore();
   ctx.globalAlpha=1;
   if(!reduced)raf=requestAnimationFrame(frame);else last=0;
 }
 function activate(rect){if(active)return;active=true;if(rect){x=clamp(rect.left+rect.width*.78,25,w-25);y=clamp(rect.top+rect.height*.2,78,h-45);}update();if(!reduced)raf=requestAnimationFrame(frame);}
 addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{last=0;});
 window.KsebeFlight={activate,update};resize();
})();
