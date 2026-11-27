/* ===== AIM + DISMEMBER + FACES/MUSCLE + FLIGHT PATCH ===== */
(()=>{
const R=Math.random,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),_w=new THREE.Vector3(),X={fat:0};
const warn=(()=>{let n=0;return e=>{if(n++<3)console.warn('patch:',e)}})();
/* 1. AIMED POWERS */
const AL=[];
function aline(pts,col,l){const g=new THREE.BufferGeometry().setFromPoints(pts.map(q=>new THREE.Vector3(q[0],q[1],q[2]||.25)));
  const o=new THREE.Line(g,new THREE.LineBasicMaterial({color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));S.add(o);AL.push({o,l,L:l})}
function zig(x1,y1,x2,y2,col,n,j){const p=[];n=n||9;j=j===undefined?.35:j;for(let i=0;i<=n;i++){const k=i/n,jj=i&&i<n?(R()-.5)*j:0;p.push([x1+(x2-x1)*k+jj,y1+(y2-y1)*k+jj*.6])}aline(p,col,10);aline(p,0xffffff,6)}
function aimShot(s,o){
  const sx=s.spr.position.x,sy=s.spr.position.y,dx=o.x-sx,dy=o.y+1.15-sy,sp=Math.abs(s.vx)||.3;
  const ang=Math.atan2(dy,dx)+(s.y0-(s.f.y+1.35))*.3;
  s.vx=Math.cos(ang)*sp;s.vy=Math.sin(ang)*sp;s.py=sy}
const _sA=step;
step=function(f,o,inp){
  let fake=false;
  try{const at=f.atk;
    if(at&&state==='fight'&&!at.done&&(at.type==='l'||at.type==='s')){
      const a=atkOf(f,at.type);
      if(at.t>=a.s-2&&at.t<=a.e+1){
        if(Math.abs(o.x-f.x)>.3)f.face=o.x>f.x?1:-1;
        if(at.downLaser&&o.y>=f.y-.2)at.downLaser=false;
        const blast=at.type==='l'&&!f.cfg.lDash&&!f.cfg.proj&&!at.downLaser;
        const tol=blast?9:at.type==='s'?Math.min(3.2,Math.max(.9,((f.cfg.sAtk&&f.cfg.sAtk.range)||1.2)*.95)):0,dy=Math.abs(o.y-f.y);
        if(tol>.9&&dy>.45&&dy<=tol){o._ry=o.y;o.y=f.y;fake=true}
      }}}catch(e){warn(e)}
  const nb=beams.length,ns=shots.length;
  try{_sA(f,o,inp)}finally{if(fake){o.y=o._ry;o._ry=undefined}}
  try{
    for(let i=nb;i<beams.length;i++){const b=beams[i];if(b&&b.f===f&&!b._a){b._a=1;b.down=true;b.target=o}}
    for(let i=ns;i<shots.length;i++)aimShot(shots[i],o);
    const at=f.atk;
    if(at&&at.type==='s'&&!at._vx&&at.t>=atkOf(f,'s').s+1){at._vx=1;const col=f.cfg.acc||f.cfg.eye||0xffffff;
      if(f.cfg.id==='thunder'){for(let i=0;i<4;i++)zig(o.x+(R()-.5)*1.2,9,o.x+(R()-.5)*.3,o.y+1.1,col,10,.5);flash(.4);shockwave(o.x,col,1.4)}
      else if(((f.cfg.sAtk&&f.cfg.sAtk.range)||0)>=1.6)zig(f.x+f.face*.4,f.y+1.3,o.x,o.y+1.15,col,6,.12)}
  }catch(e){warn(e)}
};
updShots=function(){
  for(let i=shots.length-1;i>=0;i--){const s=shots[i];
    if(!(paused||hs>0)){s.t++;s.l--;s.spr.position.x+=s.vx;s.py=(s.py===undefined?s.y0:s.py)+(s.vy||0);s.spr.position.y=s.py+Math.sin(s.t*.35)*(s.p.wave||0)*8;
      const k=s.p.size*2.4*(1+.18*Math.sin(s.t*.9));s.spr.scale.set(k,k,1);
      if(s.t%2===0)trailAt({x:s.spr.position.x-s.vx*2,y:s.spr.position.y-(s.vy||0)*2},s.p.col);
      const o=s.f===P?B:P,sx=s.spr.position.x,sy=s.spr.position.y;
      if(!s.vis&&state==='fight'&&!o.down&&o.hp>0&&Math.abs(o.x-sx)<.5&&sy>o.y+.1&&sy<o.y+2.1){
        hurt(s.f,o,s.p.dmg,s.p.kb||.15,s.p.up,'mid');
        if(!(o.inv>0)&&!o.down){if(s.p.pull){o.vx=-s.f.face*.2;o.hit=Math.max(o.hit,14)}if(s.p.freeze){o.hit=Math.max(o.hit,s.p.freeze);o.vx*=.2;fx(o.x,o.y+1.2,0x9ae8ff,2)}if(s.p.burn)o.burnT=150}
        fx(sx,sy,s.p.col,1.5);shockwave(sx,s.p.col,.5);s.l=0}
      for(let j=0;j<shots.length;j++){const q=shots[j];if(q!==s&&q.f!==s.f&&q.l>0&&Math.abs(q.spr.position.x-sx)<.5&&Math.abs(q.spr.position.y-sy)<.8){fx(sx,sy,0xffffff,2);flash(.4);shockwave(sx,0xffffff,.8);sfx('hithv');s.l=0;q.l=0}}
      if(Math.abs(sx)>9||sy>9||sy<-1)s.l=0}
    if(s.l<=0){S.remove(s.spr);s.spr.material.dispose();shots.splice(i,1)}}
};
/* 2. DISMEMBERMENT + BLOODY HANDS */
const SV=[],sevMat=new THREE.MeshStandardMaterial({color:0x6a0a12,roughness:.3}),boneMat=new THREE.MeshStandardMaterial({color:0xe8e0d0,roughness:.6});
function crack(){if(!actx||mvol<=0)return;const t=actx.currentTime;nz(t,.02,{f0:7000,f1:3000,type:'highpass',v:.8});tone(t,.07,{f0:900,f1:260,type:'square',v:.3});nz(t,.12,{f0:2600,f1:400,type:'bandpass',q:2,v:.7,dec:2});tone(t,.2,{f0:90,f1:40,v:.8})}
function rip(){if(!actx||mvol<=0)return;const t=actx.currentTime;nz(t,.4,{f0:1800,f1:300,type:'bandpass',q:2,v:.8,dec:.8,att:.03});nz(t+.05,.25,{f0:900,f1:150,v:.7,dec:1.5});tone(t,.3,{f0:110,f1:35,v:.9});if(typeof wet==='function')wet(2)}
function sever(f,kind,dir){
  const m=f&&f.m;if(!m||!m.head)return;m._sev=m._sev||{};
  const pk=a=>R()<.5?a[0]:a[1];let part,par,pos,rad=.07;
  if(kind==='head'){part=m.head;par=m.torso;pos=[0,.88,0]}
  else if(kind==='hand'){const a=pk([m.armN,m.armF]);part=a.lo;par=a.p;pos=[0,-.405,0];rad=.055}
  else if(kind==='arm'){const a=pk([m.armN,m.armF]);part=a.p;par=m.torso;pos=[0,.66,a===m.armN?.33:-.33];rad=.075}
  else{const l=pk([m.legN,m.legF]);part=l.lo;par=l.p;pos=[0,-.51,0];rad=.085}
  if(!part||!part.visible||m._sev[part.uuid])return;m._sev[part.uuid]=1;
  part.updateWorldMatrix(true,true);const c=part.clone(true);S.add(c);part.matrixWorld.decompose(c.position,c.quaternion,c.scale);part.visible=false;
  const st=new THREE.Group();st.position.set(pos[0],pos[1],pos[2]);
  const r1=new THREE.Mesh(new THREE.SphereGeometry(rad,12,10),sevMat);r1.scale.set(1,.8,1);const r2=new THREE.Mesh(new THREE.SphereGeometry(rad*.45,8,6),boneMat);r2.position.y=kind==='head'?.04:-.01;st.add(r1,r2);par.add(st);
  (m._stumps=m._stumps||[]).push({st,t:kind==='head'?170:120,pw:kind==='head'?1.7:1.1,dir});
  c.userData={vx:dir*(.05+R()*.07),vy:.13+R()*.08,vz:(R()-.5)*.05,rx:(R()-.5)*.5,rz:(R()-.5)*.5,rest:false,floor:kind==='head'?.12:.07,l:3000};SV.push(c);
  c.getWorldPosition(_w);bloodBurst(_w.x,_w.y,_w.z,18,dir);mist(_w.x,_w.y,_w.z,8,dir);spurt(_w.x,_w.y,_w.z,dir,1.6);lensSplat(8,1.4);flashBlood(.8);camKick(1);shake=Math.max(shake,.6);rip();
}
function handBlood(a,at){const m=a.m;if(!m)return;const par=at.type==='k'?m.legN.lo:(at.type==='p'&&at.alt?m.armF.lo:m.armN.lo),y=at.type==='k'?-.5:-.43;
  for(const side of[1,-1]){const sp=new THREE.Sprite(woundMat),s=.05+R()*.05;sp.position.set(.03+R()*.03,y+(R()-.5)*.06,side*(.05+R()*.02));sp.scale.set(s,s,1);par.add(sp)}
  m._hbc=(m._hbc||0)+1;if(m.wd&&m.wd.length<30&&R()<.5)addWound(a,at.type==='k'?'legN':(at.type==='p'&&at.alt?'armF':'armN'),false)}
const _hX=hurt;
hurt=function(a,d,dmg,kb,up,zone){
  const h0=d.hp,ry=d._ry;let fy;if(ry!==undefined){fy=d.y;d.y=ry}
  try{_hX.call(this,a,d,dmg,kb,up,zone)}finally{if(ry!==undefined)d.y=fy}
  try{if(state==='fight'&&d.hp<h0-.01){const at=a.atk;
    if(at&&(at.type==='p'||at.type==='k'||at.type==='h')&&R()<.75)handBlood(a,at);
    if(d.hp<=0&&h0-d.hp>8&&R()<.3)sever(d,['hand','leg','hand','arm'][(R()*4)|0],a.face)}}catch(e){warn(e)}
};
/* 3. REALISTIC FACES + MUSCLE */
const BUFF={brute:1.4,omni:1,thunder:1,soldier:.9,superman:.95,homelander:.9,ironman:.5,maeve:.55,crimson:.8,solar:.6,bot:.8,bloodlord:.5,inferno:.8,frost:.6,tidebreaker:.8,feral:.9,webslinger:.35,darkknight:.6,flash:.3,atrain:.4,storm:.4,noir:.5,phaseshift:.4};
const NONHUM=new Set(['webslinger','bot','brute','inferno']),_tc={};
function skinTex(kind,col,flat){const k=kind+col+flat;if(_tc[k])return _tc[k];
  const c0=new THREE.Color(col),r=c0.r*255|0,g=c0.g*255|0,b=c0.b*255|0,lum=c0.r*.3+c0.g*.59+c0.b*.11;
  return _tc[k]=ctex(512,256,(cx)=>{const W=512,H=256;cx.fillStyle='rgb('+r+','+g+','+b+')';cx.fillRect(0,0,W,H);
    const gr=cx.createLinearGradient(0,0,W,0);gr.addColorStop(0,'rgba(0,0,0,.18)');gr.addColorStop(.25,'rgba(0,0,0,0)');gr.addColorStop(.75,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.18)');cx.fillStyle=gr;cx.fillRect(0,0,W,H);
    if(!flat)for(let i=0;i<5000;i++){cx.fillStyle='rgba('+(R()<.5?'0,0,0':'255,230,210')+','+R()*.07+')';cx.fillRect(R()*W,R()*H,1,1)}
    const blob=(u,v,rx,ry,c)=>{const x=u*W,y=v*H,gg=cx.createRadialGradient(x,y,0,x,y,rx);gg.addColorStop(0,c);gg.addColorStop(1,'rgba(0,0,0,0)');cx.save();cx.translate(x,y);cx.scale(1,ry/rx);cx.translate(-x,-y);cx.fillStyle=gg;cx.beginPath();cx.arc(x,y,rx,0,6.3);cx.fill();cx.restore()};
    if(kind==='skull'){for(const s of[-1,1]){blob(.5+s*.07,.47,34,12,'rgba(70,35,35,.2)');blob(.5+s*.065,.4,40,9,'rgba(50,30,25,.14)');if(!flat)blob(.5+s*.11,.56,40,26,'rgba(190,80,70,.11)')}blob(.5,.52,16,40,'rgba(255,230,210,.1)');blob(.5,.2,90,26,'rgba(255,235,215,.08)')}
    else{if(!flat)for(let i=0;i<3000;i++){const y=R()*H;if(y<H*.38&&R()<.7)continue;cx.fillStyle='rgba(20,12,10,'+(.06+R()*.2*(1-lum*.5))+')';cx.fillRect(R()*W,y,1,1.4)}
      blob(.5,.6,50,14,'rgba(60,20,20,.12)');blob(.5,.78,60,20,'rgba(0,0,0,.14)')}})}
function enhance(m,c){
  const b=Math.min(1.05,BUFF[c.id]===undefined?.5:BUFF[c.id]),fem=!!c.feminine,hum=!NONHUM.has(c.id),flat=fem||!hum,head=m.head,torso=m.torso,ch=head.children;
  const skinM=ch[0].material,skinDM=ch[3]?ch[3].material:skinM,dk=new THREE.MeshStandardMaterial({color:0x1a0e0c,roughness:.8});
  const ov=(x,y,z,sx,sy,sz,mat)=>{const o=oval(x,y,z,sx,sy,sz,mat);o.castShadow=false;return o};
  const T=o=>{torso.add(o);return o},H=o=>{head.add(o);return o};
  if(!(hum===false&&c.id==='bot')){ch[0].material=new THREE.MeshStandardMaterial({map:skinTex('skull',c.skin,flat),roughness:.58,envMapIntensity:.5});ch[1].material=new THREE.MeshStandardMaterial({map:skinTex('jaw',c.skin,flat),roughness:.6,envMapIntensity:.5})}
  const scl=new THREE.MeshStandardMaterial({color:0xefe9e1,roughness:.25});
  for(const q of ch)if(q.isMesh&&Math.abs(q.position.x-.105)<.002&&Math.abs(q.position.y-.025)<.002)q.material=scl;
  for(const s of[-1,1]){
    H(ov(.118,-.045,s*.016,.012,.014,.011,skinM));H(ov(.14,-.051,s*.008,.004,.004,.005,dk));
    H(ov(.085,-.02,s*.07,.035,.027,.027,skinM));H(ov(-.02,-.1,s*.085,.04,.04,.03,skinM));H(ov(0,0,s*.127,.011,.026,.006,skinDM));
    H(bx(.012,.0025,.032,dk,.112,.056,s*.05));
    const gl=new THREE.Mesh(new THREE.SphereGeometry(.0026,6,5),new THREE.MeshBasicMaterial({color:0xffffff}));gl.position.set(.1255,.0305,s*.0545);H(gl);
    T(ov(.02,.86,s*.045,.025,.07,.02,skinM))}
  H(ov(.108,.03,0,.012,.045,.012,skinM));if(!fem)T(ov(.07,.85,0,.012,.02,.012,skinM));
  if(m.lipU){const lm=new THREE.MeshStandardMaterial({color:new THREE.Color(c.skin).lerp(new THREE.Color(fem?0xb0303a:0x9a4a48),fem?.55:.4),roughness:.35});m.lipU.material=lm;m.lipL.material=lm}
  const suitM=torso.children[1].material,suit2M=torso.children[0].material;
  for(const s of[-1,1]){
    T(ov(.09,.6,s*.11,.09+.025*b,.085+.02*b,.115+.03*b,suitM));T(ov(.07,.4,s*.145,.05,.09,.04,suit2M));
    T(ov(-.04,.46,s*.27,.09+.03*b,.22,.07+.04*b,suitM));T(ov(-.01,.79,s*.12,.07+.03*b,.055+.02*b,.11,suitM));
    T(ov(0,.68,s*.325,.11+.03*b,.11+.03*b,.11+.03*b,suitM));
    for(let r=0;r<3;r++)T(ov(.115,.3-r*.085+.03,s*.04,.04,.034,.036+.008*b,suit2M))}
  T(ov(.19,.58,0,.006,.1,.004,dk));T(ov(.152,.22,0,.004,.12,.004,dk));for(let r=0;r<3;r++)T(ov(.153,.285-r*.085,0,.004,.004,.07,dk));
  for(const q of torso.children)if(q.geometry&&q.geometry.type==='CylinderGeometry'&&Math.abs(q.geometry.parameters.radiusTop-.07)<.001){q.scale.set(1+.45*b,1,1+.45*b)}
  for(const a of[m.armN,m.armF]){const am=a.p.children[0].material;
    a.p.add(ov(.03,-.2,0,.05+.03*b,.13,.05+.025*b,am),ov(-.03,-.2,0,.045+.02*b,.12,.05+.02*b,am),ov(0,-.03,0,.07+.035*b,.09,.07+.035*b,am));a.lo.add(ov(0,-.14,0,.055+.02*b,.14,.055+.02*b,am))}
  for(const l of[m.legN,m.legF]){const lm=l.p.children[0].material;
    l.p.add(ov(.04,-.27,0,.085+.03*b,.24,.085+.03*b,lm),ov(-.04,-.27,0,.07+.02*b,.22,.075+.025*b,lm));l.lo.add(ov(-.035,-.2,0,.065+.02*b,.15,.065+.02*b,lm))}
  m.body.scale.x*=1+.03*b;m.body.scale.z*=1+.06*b;
}
const _bX=build;build=function(c){const m=_bX(c);try{enhance(m,c)}catch(e){warn(e)}return m};
/* 4. FLIGHT + HEAD TRACKING */
const _pX=pose;
pose=function(f,win){_pX(f,win);try{
  const m=f.m,s=m.fl||(m.fl={lean:0}),fl=f.fly&&!f.down&&f.hp>0,vf=f.vx*f.face;m.root.rotation.x=0;
  let tl=0;if(fl){tl=cl(vf*9-f.vy*12,-.3,1.5);if(Math.abs(f.vx)<.012&&Math.abs(f.vy)<.01)tl=.05+Math.sin(frame*.05)*.03}
  s.lean+=(tl-s.lean)*.1;const q=cl(s.lean/1.1,0,1);
  if(fl){m.root.rotation.z=-f.face*s.lean;
    if(q>.05){const mx=(r,t)=>r+(t-r)*q;
      m.armN.p.rotation.z=mx(m.armN.p.rotation.z,3);m.armN.lo.rotation.z=mx(m.armN.lo.rotation.z,.06);m.armF.p.rotation.z=mx(m.armF.p.rotation.z,.3);m.armF.lo.rotation.z=mx(m.armF.lo.rotation.z,.25);
      m.legN.p.rotation.z=mx(m.legN.p.rotation.z,-.1);m.legN.lo.rotation.z=mx(m.legN.lo.rotation.z,-.04);m.legF.p.rotation.z=mx(m.legF.p.rotation.z,-.2);m.legF.lo.rotation.z=mx(m.legF.lo.rotation.z,-.12)}
    else{m.root.position.y+=Math.sin(frame*.06+f.x)*.035;m.root.rotation.x=Math.sin(frame*.045)*.025}}
  const o=f===P?B:P;if(o&&!f.down&&f.hp>0)m.head.rotation.z+=cl(Math.atan2((o.y+1.2)-(f.y+1.5),Math.abs(o.x-f.x)+.6)*.8,-.4,.5);
  if(f._snap){m.head.rotation.y+=f._snap*1.4;m.head.rotation.z+=f._snap*.9}
}catch(e){warn(e)}};
/* 5. PER-TICK */
const _hudX=hud;
hud=function(){_hudX();try{
  for(let i=AL.length-1;i>=0;i--){const q=AL[i];q.l--;q.o.material.opacity=Math.max(0,q.l/q.L);if(q.l<=0){S.remove(q.o);q.o.geometry.dispose();q.o.material.dispose();AL.splice(i,1)}}
  for(const c of SV){const u=c.userData;if(u.l<=0)continue;u.l--;
    if(!u.rest){u.vy-=.012;c.position.x+=u.vx;c.position.y+=u.vy;c.position.z+=u.vz;c.rotation.x+=u.rx;c.rotation.z+=u.rz;if(u.l%3===0)dripAt(c.position.x,c.position.y,c.position.z,0,0,.04);
      if(c.position.y<=u.floor){c.position.y=u.floor;addBloodStain(c.position.x,c.position.z,.9);bloodBurst(c.position.x,.1,c.position.z,3,0);if(Math.abs(u.vy)>.035){u.vy*=-.32;u.vx*=.6;u.vz*=.6;u.rx*=.6;u.rz*=.6}else u.rest=true}
      if(Math.abs(c.position.x)>8.5){c.position.x=Math.sign(c.position.x)*8.5;u.vx*=-.4}}}
  if(!P||!B)return;
  for(const f of[P,B]){const m=f.m;if(!m)continue;
    if(m._stumps)for(const s of m._stumps){if(s.t<=0)continue;s.t--;if(s.t%3===0){s.st.getWorldPosition(_w);const k=s.pw*(.35+.65*Math.max(0,Math.sin(s.t*.35))*(s.t/150+.3));for(let i=0;i<3;i++)dripAt(_w.x,_w.y,f.z,s.dir*(.01+R()*.04*k)+(R()-.5)*.02,.05+R()*.12*k,.03+R()*.04)}}
    if(m._hbc>2&&f.hp>0&&frame%22===0){(R()<.5?m.armN.lo:m.armF.lo).getWorldPosition(_w);dripAt(_w.x,_w.y-.4,f.z,0,0,.03)}}
  if(typeof koB!=='undefined'&&koB&&!X.fat){X.fat=1;const L=P.hp<=0?P:B,W=L===P?B:P,r=R();L._doom={t:0,kind:r<.45?'head':r<.65?'arm':r<.82?'hand':'leg',dir:Math.sign(L.x-W.x)||-L.face}}
  for(const f of[P,B]){const d=f._doom;if(!d)continue;d.t++;
    if(d.kind==='head'){if(d.t===2)crack();f._snap=Math.min(1,d.t/10);if(d.t===10){f._snap=0;sever(f,'head',d.dir)}}else if(d.t===3){crack();sever(f,d.kind,d.dir)}
    if(d.t===24&&R()<.6)sever(f,['hand','leg','arm'][(R()*3)|0],d.dir);if(d.t>60)f._doom=null}
}catch(e){warn(e)}};
const _nrX=newRound;
newRound=function(){_nrX();X.fat=0;for(const c of SV)S.remove(c);SV.length=0;for(const q of AL){S.remove(q.o)}AL.length=0};
window.__X={sever,zig,SV,enhance};
try{makePortraits();if(state==='select')drawMenu()}catch(e){warn(e)}
})();
