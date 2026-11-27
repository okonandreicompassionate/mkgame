/* ===== PHYSICS + GORE PATCH (paste as its own <script> right before </body>) ===== */
// 1) natural attack timing + reach
Object.assign(ATK.p,{dur:20,s:6,e:11,range:1.12,kb:.2});
Object.assign(ATK.k,{dur:32,s:10,e:16,range:1.38,kb:.32});
Object.assign(ATK.h,{dur:44,s:16,e:22,range:1.15});

// 2) gore assets
const G={mist:[],gibs:[],fat:0},_v3=new THREE.Vector3();
const woundMat=new THREE.SpriteMaterial({map:bloodSplatTex,color:0x62050d,transparent:true,depthWrite:false,opacity:.92});
for(let i=0;i<70;i++){const q=new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex,color:0x7a0710,transparent:true,depthWrite:false,opacity:0}));q.visible=false;q.userData={l:0};S.add(q);G.mist.push(q)}
const gibG=new THREE.IcosahedronGeometry(1,0),gibM=[0x6e0a14,0x8a1018,0xe6dccb].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.55}));
for(let i=0;i<40;i++){const m=new THREE.Mesh(gibG,gibM[i%3===2?2:(i&1)]);m.visible=false;m.userData={l:0};m.castShadow=true;S.add(m);G.gibs.push(m)}
const poolM=[0,1].map(()=>{const m=new THREE.Mesh(new THREE.CircleGeometry(1,28),new THREE.MeshBasicMaterial({map:bloodSplatTex,color:0x5a060e,transparent:true,opacity:.88,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.017;m.visible=false;m.userData={s:0};S.add(m);return m});
// blood on the camera lens
const lc=document.createElement('canvas');lc.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:3';document.body.appendChild(lc);
const lctx=lc.getContext('2d'),lsp=[];
function fitLens(){lc.width=Math.max(2,innerWidth/2|0);lc.height=Math.max(2,innerHeight/2|0)}fitLens();addEventListener('resize',fitLens);
function blobPath(c,x,y,r,n){const pts=[];for(let i=0;i<n;i++){const a=i/n*6.283,rr=r*(.62+Math.random()*.75)*(i%2?1:1.12);pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr])}
  c.moveTo((pts[0][0]+pts[n-1][0])/2,(pts[0][1]+pts[n-1][1])/2);for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n];c.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2)}c.closePath()}
function mkSplat(r){const S2=Math.ceil(r*6),cv=document.createElement('canvas');cv.width=cv.height=S2;const c=cv.getContext('2d'),m=S2/2;
  const gr=c.createRadialGradient(m,m,r*.1,m,m,r*1.5);gr.addColorStop(0,'#4a0309');gr.addColorStop(.6,'#730710');gr.addColorStop(1,'#96101a');
  c.fillStyle=gr;c.beginPath();blobPath(c,m,m,r,9+(Math.random()*4|0));c.fill();
  const arms=5+(Math.random()*6|0);for(let i=0;i<arms;i++){const a=Math.random()*6.283,d0=r*.8,d1=r*(1.5+Math.random()*1.5),w=r*(.07+Math.random()*.16);
    c.beginPath();c.moveTo(m+Math.cos(a-.12)*d0,m+Math.sin(a-.12)*d0);c.lineTo(m+Math.cos(a)*d1,m+Math.sin(a)*d1);c.lineTo(m+Math.cos(a+.12)*d0,m+Math.sin(a+.12)*d0);c.fill();
    c.beginPath();c.arc(m+Math.cos(a)*(d1+w*2.2),m+Math.sin(a)*(d1+w*2.2),w*1.4,0,6.3);c.fill()}
  for(let i=0;i<4;i++){const a=Math.random()*6.283,d=r*(1.1+Math.random()*1.2);c.beginPath();blobPath(c,m+Math.cos(a)*d,m+Math.sin(a)*d,r*(.08+Math.random()*.16),6);c.fill()}
  c.globalCompositeOperation='source-atop';c.strokeStyle='rgba(255,170,160,.16)';c.lineWidth=Math.max(1,r*.16);c.lineCap='round';c.beginPath();c.moveTo(m-r*.5,m-r*.25);c.quadraticCurveTo(m-r*.2,m-r*.6,m+r*.15,m-r*.5);c.stroke();return cv}
function lensSplat(n,pw){for(let i=0;i<n&&lsp.length<60;i++){const r=(2+Math.random()*7)*pw*(Math.random()<.12?1.8:1);lsp.push({x:Math.random()*lc.width,y:Math.random()*lc.height*.8,r,img:mkSplat(r),a:.8,vy:.012+Math.random()*.07,life:300+Math.random()*260,tail:0,tw:r*(.18+Math.random()*.16)})}}
function lensTick(){lctx.clearRect(0,0,lc.width,lc.height);for(let i=lsp.length-1;i>=0;i--){const s=lsp[i];s.life--;if(s.life<120)s.a=s.life/120*.8;
  if(s.life>150)s.vy*=.996;s.y+=s.vy;s.tail+=s.vy;lctx.globalAlpha=Math.max(0,s.a);
  if(s.tail>1.5){lctx.fillStyle='#6a060e';lctx.beginPath();lctx.moveTo(s.x-s.tw,s.y);lctx.lineTo(s.x+s.tw,s.y);lctx.lineTo(s.x+s.tw*.35,s.y-s.tail);lctx.lineTo(s.x-s.tw*.35,s.y-s.tail);lctx.closePath();lctx.fill()}
  lctx.drawImage(s.img,s.x-s.img.width/2,s.y-s.img.height/2);if(s.life<=0)lsp.splice(i,1)}lctx.globalAlpha=1}
// helpers
function mist(x,y,z,n,dir){for(let i=0;i<n;i++){const q=G.mist.find(m=>m.userData.l<=0);if(!q)return;q.userData={l:34+Math.random()*18,L:50,vx:(Math.random()-.4)*.03*(dir||1),vy:(Math.random()-.2)*.02,s:.2+Math.random()*.25};q.position.set(x,y,z+.1);q.visible=true;q.material.opacity=.32}}
function dripAt(x,y,z,vx,vy,sz){const m=bloodDrops.find(m=>m.userData.life<=0);if(!m)return;const s=sz||.03+Math.random()*.03;m.userData={life:60+(Math.random()*30|0),vx:vx||0,vy:vy||0,vz:(Math.random()-.5)*.02,size:s};m.position.set(x,y,z+.08);m.scale.set(s*.7,s*1.25,1);m.material.opacity=.95;m.visible=true}
function spurt(x,y,z,dir,pw){for(let i=0;i<10;i++)dripAt(x,y,z,dir*(.05+Math.random()*.1*pw),.04+Math.random()*.1*pw,.035+Math.random()*.04)}
function gibs(x,y,z,dir,n){for(let i=0;i<n;i++){const m=G.gibs.find(g=>g.userData.l<=0);if(!m)return;const s=.035+Math.random()*.07;m.scale.set(s,s*(.6+Math.random()),s);m.position.set(x+(Math.random()-.5)*.3,y+Math.random()*.6,z);m.userData={l:700,vx:dir*(.02+Math.random()*.1)+(Math.random()-.5)*.04,vy:.05+Math.random()*.14,vz:(Math.random()-.5)*.06,rx:Math.random()*.4,ry:Math.random()*.4,rest:false};m.visible=true}}
// wounds that stay on the fighters and keep dripping
const REG={head:m=>m.head,torso:m=>m.torso,armN:m=>m.armN.lo,armF:m=>m.armF.lo,legN:m=>m.legN.lo,legF:m=>m.legF.lo};
function woundPos(r){const q=Math.random;
  if(r==='head')return[.02+q()*.09,-.08+q()*.2,.1+q()*.02];
  if(r==='torso'){const y=.12+q()*.62,zr=y>.4?.3*Math.sqrt(Math.max(0,1-((y-.52)/.3)**2))+.03:.17;return[(q()-.3)*.1,y,zr+.03]}
  if(r[0]==='a')return[(q()-.5)*.05,-.08-q()*.32,.085];
  return[(q()-.5)*.05,-.08-q()*.38,.1]}
function addWound(f,r,big){const m=f.m;m.wd=m.wd||[];if(m.wd.length>=30)return;const par=REG[r](m),p=woundPos(r),s=(.07+Math.random()*.1)*(big?1.4:1);
  for(const side of[1,-1]){const sp=new THREE.Sprite(woundMat);sp.position.set(p[0],p[1],p[2]*side);sp.userData={s,g:0};sp.scale.set(.01,.01,1);par.add(sp);m.wd.push(sp)}}
function woundHit(d,zone,dmg){const R=zone==='hi'?['head','head','torso']:zone==='lo'?['legN','legF','torso']:['torso','torso','armN','armF'];
  const n=1+(dmg>9?1:0)+(dmg>14?1:0);for(let i=0;i<n;i++)addWound(d,R[(Math.random()*R.length)|0],dmg>12)}
// wet sound
function wet(l){if(!actx||mvol<=0)return;const t=actx.currentTime;nz(t,.14,{f0:2200,f1:260,type:'bandpass',q:1.8,v:.45+l*.2,dec:2});if(l>0)tone(t,.12,{f0:90,f1:45,type:'triangle',v:.5});if(l>1)for(let i=0;i<4;i++)nz(t+i*.07,.05,{f0:3500,f1:900,type:'bandpass',q:4,v:.5,dec:1})}
const _sfx=sfx;sfx=function(k){_sfx(k);if(k==='hit')wet(0);else if(k==='hithv')wet(1);else if(k==='ko')wet(2)};

// 3) hurt(): same rules as before, plus gore + natural impact response
function hurt(a,d,dmg,kb,up,zone){
  if(d.down||d.hp<=0)return;
  if(d.inv>0){if(frame%5===0)fx(d.x,d.y+1.2,0xffffff,.5);return}
  if(d.cfg.dodge&&!d.block&&Math.random()<d.cfg.dodge){d.inv=14;d.vx=-a.face*.2;fx(d.x,d.y+1.2,0x888899,1);callout(d,'EVADED');return}
  if(a.cfg.rage)dmg*=1+(1-a.hp/MAX_HEALTH)*a.cfg.rage;
  const ctr=!!(d.atk&&d.atk.type!=='l'&&d.atk.t<atkOf(d,d.atk.type).s&&!d.block);if(ctr)dmg*=1.2;
  dmg*=.9*(d.cfg.armor||1);if(d.hp<MAX_HEALTH*.35)dmg*=.82;
  const specialMove=a.atk&&a.atk.type==='s'&&a.cfg.sAtk;
  const firstPunchBlocked=!!(specialMove&&specialMove.blockCancelFirst&&!(a.atk.hc||0));
  const guard=d.block&&d.face===-a.face&&d.y<=0&&!up&&!(specialMove&&specialMove.unblockableAfterFirst&&(a.atk.hc||0)>0),hv=dmg>9;
  // attacker keeps a little forward momentum (weight behind the blow) instead of snapping backwards
  if(a.atk&&(a.atk.type==='p'||a.atk.type==='k'||a.atk.type==='h'||a.atk.type==='s'||a.atk.type==='l'&&a.cfg.lDash)){a.atk.contactT=a.atk.t;a.vx=a.face*(guard?0:.035)}
  sfx(guard?'block':hv?'hithv':'hit');if(Math.abs(d.x)>4.9)a.vx=-a.face*(guard?.1:.075);
  if(guard){
    if(firstPunchBlocked){dmg=0;a.atk=null;a.cd=18;a.vx=0;callout(a,'SPEED PUNCH BLOCKED');fx(d.x+d.face*.3,d.y+1.4,0x99ccff,.9)}
    else{if(a.atk)a.atk.blocked=true;d.gb=(d.gb||0)+dmg;dmg*=.05;d.vx=a.face*.07;a.vx=-a.face*.12;fx(d.x+d.face*.3,d.y+1.4,0x99ccff,.6);hs=3;d.shk=3;a.shk=0;if(d.gb>=34){d.gb=0;d.block=false;d.hit=16;d.hz='mid';d.vx=a.face*.19;hs=4;shake=Math.max(shake,.3);fx(d.x,d.y+1.3,0xffd24a,1.6);sfx('hithv');dmg*=2}}
  }
  else{
    if(ctr){callout(a,'COUNTER HIT!');fx(d.x,d.y+1.5,0xffffff,1.2)}
    a.cmb=(a.cmbT>0?a.cmb:0)+1;a.cmbT=75;dmg*=Math.max(.3,1-.14*(a.cmb-1));
    if(a.cfg.lifesteal)a.hp=Math.min(MAX_HEALTH,a.hp+dmg*a.cfg.lifesteal);
    const brk=a.cmb>=6&&d.hp-dmg>0;if(brk){callout(d,'COMBO BREAKER!');a.cmb=0;a.cmbT=0;shockwave(d.x,0xffffff,1.2);flash(.4)}
    d.hurtT=6;d.atk=null;d.fly=false;d.sq=0;a.sp=Math.min(100,a.sp+dmg*1.2);d.sp=Math.min(100,d.sp+dmg*.5);
    // ---- gore ----
    const kill=d.hp-dmg<=0,wy=d.y+(zone==='hi'?1.75:zone==='lo'?.5:1.2);
    bloodBurst(d.x,wy,d.z,kill?16:hv?10:4,a.face);mist(d.x+a.face*.1,wy,d.z,hv?5:2,a.face);
    if(hv||kill||d.hp<MAX_HEALTH*.5)spurt(d.x,wy,d.z,a.face,hv?1.3:.6);
    woundHit(d,zone,dmg);
    if(hv||kill){d.spurt={t:kill?70:26,dir:a.face,y:wy-d.y,pw:kill?1.4:1};lensSplat(kill?14:5,kill?1.6:1)}else if(Math.random()<.25)lensSplat(1,.7);
    if(kill)gibs(d.x,wy,d.z,a.face,16);else if(hv&&d.hp-dmg<MAX_HEALTH*.15)slowmo=Math.max(slowmo,26);
    if(zone==='hi')d.bleedT=Math.max(d.bleedT,90);
    // ---- physics response ----
    const mass=Math.pow(d.cfg.bulk||1,.8);d.hdir=a.face;
    if(up||brk||dmg>=11.5||kill){d.down=true;d.landed=false;d.tair=0;d.bn=0;d.vy=up||(dmg>=11.5?.125:.155);d.vx=a.face*(.06+kb*.12)/mass}
    else{d.hz=zone||'mid';d.hit=d.cfg.noFlinch&&!hv?0:Math.max(8,(hv?15:11)-(a.cmb>>1));d.vx=a.face*kb*.3*(1+dmg*.03)/mass;d.vy=Math.max(d.vy,d.y>.3?.09:(hv?.045:.02))}
    shake=Math.max(shake,hv?.3:.12);hs=(hv?7:4)+(ctr?2:0);d.shk=hs;cpush=a.face*(hv?.16:.07);d.hmag=Math.min(1.6,.65+dmg/13);
    if(COARSE&&d===P&&navigator.vibrate)try{navigator.vibrate(hv?30:12)}catch(e){}
    fx(d.x,Math.max(.4,d.y+1.3),hv?0xffd24a:0xff7733,hv?1.6:1);
    if(hv){flash(.35);flashBlood(.4);camKick(.5);roll=a.face*.025;if(d.y<.15)addCrack(d.x);shockwave(d.x,0xffd24a,.7)}
    if(kill){slowmo=(P.wins>=1||B.wins>=1)?130:90;hs=14;flash(.8);flashBlood(1);camKick(1);sfx('ko')}
  }
  d.hp=Math.max(0,d.hp-dmg);
}

// 4) natural body mechanics layered on the existing pose
const _pose=pose;pose=function(f,win){_pose(f,win);natural(f)};
function natural(f){const m=f.m,a=f.atk;if(!m.nv)m.nv={w:0,s:0,h:0};const n=m.nv;let w=0,s=0;
  if(a&&(a.type==='p'||a.type==='k'||a.type==='h')){const d=atkOf(f,a.type),t=a.t;w=t<d.s?easeS(t/d.s):0;s=t<d.s?0:t<=d.e?1:Math.max(0,1-(t-d.e)/Math.max(2,d.dur-d.e));if(a.contactT!==undefined)s*=.6}
  n.w+=(w-n.w)*.55;n.s+=(s-n.s)*.5;
  const hv=f.hit>0?Math.sin(Math.PI*Math.min(1,(1-f.hit/16)*1.25)):0;n.h+=(hv-n.h)*.6;
  const sg=a&&a.type==='p'?(a.alt?-1:1):1,isK=a&&a.type==='k',isH=a&&a.type==='h';
  m.root.position.x+=f.face*(.11*n.s-.07*n.w);                       // load back, then drive into the blow
  m.hips.rotation.y+=sg*(isK?-.12:.22)*n.s-sg*.1*n.w;                 // hip rotation powers the punch
  m.torso.rotation.y+=sg*(isK?0:.18)*n.s;
  m.head.rotation.y-=sg*.14*n.s;                                      // eyes stay on the target
  m.hips.position.y+=isH?(-.11*n.w+.07*n.s):isK?.03*n.s:-.02*n.w;      // uppercut: dip then rise
  if(isK)m.root.rotation.z-=f.face*.1*n.s;                            // counter-balance on kicks
  if(f.land>0)m.hips.position.y-=.05*Math.min(1,f.land/12);           // landing squash
  const hm=f.hmag||1,hd=f.hdir||-f.face;                              // hit: recoil, head snap, twist
  m.root.position.x+=hd*.16*n.h*hm;m.head.rotation.y+=.5*n.h*hm;m.torso.rotation.y-=.25*n.h*hm}
// 5) extra physics: landing impact, sliding dust, blood drag
const _step=step;step=function(f,o,inp){const y0=f.y,vy0=f.vy;_step(f,o,inp);
  if(y0>.06&&f.y<=0&&vy0<-.1&&!f.fly){camKick(Math.min(.5,-vy0*3));for(let i=0;i<5;i++)fx(f.x+(Math.random()-.5)*.6,.08,0xbbaa99,.3)}
  if(f.y<=0&&(f.hit>0||f.down)&&Math.abs(f.vx)>.05&&frame%3===0)fx(f.x-Math.sign(f.vx)*.2,.07,0xbbaa99,.35);
  if(f.down&&f.landed&&f.hp<MAX_HEALTH*.5&&Math.abs(f.vx)>.04)addBloodStain(f.x,f.z,.7)};

// 6) per-tick gore update + reset
function goreTick(){lensTick();if(!P||!B)return;
  for(const q of G.mist)if(q.userData.l>0){const u=q.userData;u.l--;q.position.x+=u.vx;q.position.y+=u.vy;const k=u.s*(1+(1-u.l/u.L)*1.8);q.scale.set(k,k,1);q.material.opacity=.32*Math.max(0,u.l/u.L);if(u.l<=0)q.visible=false}
  for(const g of G.gibs){const u=g.userData;if(u.l<=0)continue;u.l--;if(!u.rest){u.vy-=.012;g.position.x+=u.vx;g.position.y+=u.vy;g.position.z+=u.vz;g.rotation.x+=u.rx;g.rotation.y+=u.ry;
    if(g.position.y<=.04){g.position.y=.04;addBloodStain(g.position.x,g.position.z,.5);if(Math.abs(u.vy)>.03){u.vy*=-.35;u.vx*=.7;u.vz*=.7}else u.rest=true}}if(u.l<=0)g.visible=false}
  [P,B].forEach((f,i)=>{const wd=f.m&&f.m.wd;
    if(wd&&wd.length){for(const sp of wd)if(sp.userData.g<1){sp.userData.g+=.07;const k=sp.userData.s*Math.min(1,sp.userData.g);sp.scale.set(k,k*1.2,1)}
      if(state!=='select'&&f.hp>0&&frame%Math.max(6,28-wd.length)===0){const sp=wd[(Math.random()*wd.length)|0];sp.getWorldPosition(_v3);dripAt(_v3.x,_v3.y,f.z,0,0)}}
    if(f.spurt&&f.spurt.t>0){f.spurt.t--;if(f.spurt.t%4===0)spurt(f.x,f.y+f.spurt.y,f.z,f.spurt.dir,f.spurt.pw*(f.spurt.t/40+.4))}
    const pm=poolM[i];if(f.down&&f.landed&&f.hp<MAX_HEALTH*.6){pm.visible=true;if(!pm.userData.p){pm.position.set(f.x-f.face*.3,.017,f.z-.05);pm.userData.p=1}
      const t=.4+(1-f.hp/MAX_HEALTH)*1.4+(f.hp<=0?Math.min(1.6,(f.koT||0)*.01):0);pm.userData.s+=(t-pm.userData.s)*.03;pm.scale.setScalar(pm.userData.s)}
    else if(!f.down)pm.userData.p=0});
  if(typeof koB!=='undefined'&&koB&&!G.fat){G.fat=1;const L=P.hp<=0?P:B;gibs(L.x,L.y+1.2,L.z,-L.face,28);lensSplat(20,2);flashBlood(1)}}
const _hud=hud;hud=function(){_hud();goreTick()};
const _nr=newRound;newRound=function(){_nr();lsp.length=0;G.fat=0;for(const g of G.gibs){g.visible=false;g.userData.l=0}for(const q of G.mist){q.visible=false;q.userData.l=0}for(const p of poolM){p.visible=false;p.userData.s=0;p.userData.p=0}};

// 7) Mortal-Kombat style camera: intro swoop, special push-ins, heartbeat suspense, finish-him orbit, fatality low angle
let cpush=0,hbT=0,slowmo=0,camOrb=0,slowC=0;
function heart(){if(!actx||mvol<=0)return;const t=actx.currentTime;tone(t,.16,{f0:70,f1:38,v:.9});tone(t+.2,.14,{f0:60,f1:34,v:.7})}
function camUpdate(){
  const mx=(P.x+B.x)/2,d=Math.abs(P.x-B.x);
  camAltitude+=(clamp(Math.max(P.y,B.y)/3.2,0,1)-camAltitude)*.12;
  const spA=[P,B].find(f=>f.atk&&f.atk.type==='s'),dead=P.hp<=0?P:B.hp<=0?B:null,fin=state==='ko'&&dead,win=fin?(dead===P?B:P):null;
  const minHp=Math.min(P.hp,B.hp)/MAX_HEALTH,low=state==='fight'&&minHp<.3,crit=state==='fight'&&minHp<.15;
  const baseFov=cam.aspect<1?50:30;let tFov=baseFov+12*camAltitude;
  const tf=Math.tan(cam.fov*Math.PI/360);
  let z=Math.max(6.5,(d+3.2)/(2*tf*cam.aspect));z=Math.min(z,16)+camAltitude*1.8;
  let fx0=mx,ty=1.2+camAltitude,cy=1.35+camAltitude*.45,sway=Math.sin(frame*.011)*.18,tilt=0;
  if(state==='intro'){const k=easeO(Math.min(1,stT/45));z*=1.55-.55*k;cy=.45+.9*k;sway=(1-k)*-2.4;tilt=(1-k)*.07}
  if(spA){tFov-=7;z*=.72;fx0=spA.x+spA.face*.6;cy=.8;ty=1.3;sway=spA.face*.7;tilt=-spA.face*.04}
  if(low){const u=1-minHp/.3;z*=1-.1*u;tFov-=3*u;if(crit)tilt+=Math.sin(frame*.15)*.01}
  if(low&&--hbT<=0){hbT=crit?38:55;kick=Math.max(kick,.35);flashBlood(.25);heart()}
  if(state==='fight'&&timer<=10&&tick===0)kick=Math.max(kick,.3);
  if(fin){camOrb+=.012;const k=easeO(Math.min(1,stT/70));
    z=Math.max(4.2,z*(1-.55*k));fx0=dead.x;cy=.85+.45*k;ty=.55+.2*Math.sin(camOrb);sway=Math.sin(camOrb)*1.4*k;tFov-=8*k;tilt=.05*Math.sin(camOrb*.7);
    if(koB){z*=.85;fx0=win.x;cy=.3;ty=1.6;tFov-=3;sway=win.face*-.8;tilt=-.04}}
  else camOrb=0;
  cam.fov+=(tFov-cam.fov)*.1;cam.updateProjectionMatrix();
  z*=1-kick*.1;kick*=.9;
  camFx+=(fx0-camFx)*.1;camTy+=(ty-camTy)*.1;
  cam.position.x+=(camFx+sway+cpush-cam.position.x)*.1;cpush*=.86;cam.position.z+=(z-cam.position.z)*.09;
  const sh=shake>.01?shake*.5:0;shake*=.85;
  cam.position.y+=(cy-cam.position.y)*.1+Math.sin(frame*2.3)*sh;
  cam.lookAt(camFx+Math.cos(frame*1.9)*sh,camTy,0);spot.position.x=mx;spotT.position.x=mx;roll*=.88;cam.rotateZ(roll+tilt)}
// slow-motion on killing blows (time dilation: only every 3rd tick advances the fight, camera keeps moving)
const _tg=tickGame;tickGame=function(){if(slowmo>0){slowmo--;slowC=(slowC+1)%3;if(slowC){camUpdate();lensTick();return}}_tg()};
