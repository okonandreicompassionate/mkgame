<script>
/* ===== CINEMATIC STAGE UPGRADE: real HDRI lighting + Sponza ruined-temple stage ===== */
(()=>{
const A='assets/',envs={},orig=S.environment,hemi=S.children.find(o=>o.isHemisphereLight);
STG[2]=['RUINED TEMPLE','Sponza colonnade, golden hour'];
R.localClippingEnabled=true;
const pm=new THREE.PMREMGenerator(R);pm.compileEquirectangularShader();
const loadHdr=(k,f)=>new THREE.RGBELoader().setDataType(THREE.UnsignedByteType).load(A+f,t=>{t.mapping=THREE.EquirectangularReflectionMapping;envs[k]={env:pm.fromEquirectangular(t).texture,bg:t};if(curStage>=0)useEnv(curStage)},undefined,()=>console.warn('hdr missing',f));
loadHdr('dusk','pedestrian_overpass_1k.hdr');loadHdr('gold','royal_esplanade_1k.hdr');
const ENVMAP=[ 'dusk','dusk','gold','gold',null ];
function useEnv(n){const e=envs[ENVMAP[n]];S.environment=e?e.env:orig;S.background=(n===2&&temple.ready&&e)?e.bg:null}
// ---- temple (Sponza) ----
const temple={grp:new THREE.Group(),ready:false,started:false};temple.grp.visible=false;S.add(temple.grp);
const clip=[new THREE.Plane(new THREE.Vector3(0,0,-1),3.2)]; // cut away the camera-side colonnade
function loadTemple(){if(temple.started)return;temple.started=true;
 new THREE.GLTFLoader().load(A+'sponza.glb',g=>{
  const m=g.scene;m.updateMatrixWorld(true);let b=new THREE.Box3().setFromObject(m),sz=b.getSize(new THREE.Vector3());
  const s=(sz.x>60||sz.x<20)?40/sz.x:1;m.scale.setScalar(s);m.updateMatrixWorld(true);b=new THREE.Box3().setFromObject(m);const c=b.getCenter(new THREE.Vector3());
  m.position.set(-c.x,-b.min.y,-c.z);
  m.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;const ms=Array.isArray(o.material)?o.material:[o.material];
   for(const q of ms){q.clippingPlanes=clip;q.envMapIntensity=1.1;if(q.map&&q.map.anisotropy!==undefined)q.map.anisotropy=Math.min(4,R.capabilities.getMaxAnisotropy())}});
  temple.grp.add(m);
  // atmosphere: god-rays + floating dust
  const sh=ctex(64,256,gx=>{const l=gx.createLinearGradient(0,0,0,256);l.addColorStop(0,'rgba(255,230,180,.55)');l.addColorStop(1,'rgba(255,230,180,0)');gx.fillStyle=l;gx.fillRect(0,0,64,256);const h=gx.createLinearGradient(0,0,64,0);h.addColorStop(0,'#000');h.addColorStop(.5,'rgba(0,0,0,0)');h.addColorStop(1,'#000');gx.globalCompositeOperation='destination-out';gx.fillStyle=h;gx.fillRect(0,0,64,256)});
  for(const [x,z,r] of[[-5,-3.5,-.42],[1,-4,-.4],[6,-3,-.45]]){const p=new THREE.Mesh(new THREE.PlaneGeometry(3.2,13),new THREE.MeshBasicMaterial({map:sh,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide,opacity:.28}));p.position.set(x,6,z);p.rotation.z=r;temple.grp.add(p)}
  const n=260,pos=new Float32Array(n*3);for(let i=0;i<n;i++){pos[i*3]=-12+Math.random()*24;pos[i*3+1]=.2+Math.random()*7;pos[i*3+2]=-6+Math.random()*9}
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const dp=new THREE.Points(ge,new THREE.PointsMaterial({size:.06,map:dotTex,color:0xffe3b0,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));dp.frustumCulled=false;temple.grp.add(dp);
  stageAnim.push([2,()=>{for(let i=0;i<n;i++){const k=i*3;pos[k+1]+=.002+(i%4)*.001;pos[k]+=Math.sin(frame*.013+i)*.004+WIND*.004;if(pos[k+1]>7.5)pos[k+1]=.2}ge.attributes.position.needsUpdate=true}]);
  temple.ready=true;if(curStage===2)show(2);
 },undefined,e=>console.warn('Sponza failed to load (serve over http, not file://)',e))}
function show(n){const on=n===2&&temple.ready;temple.grp.visible=on;
 if(on)st3.children.forEach(o=>{if(!o.isLight)o.visible=false}); // retire the old procedural arena, keep torch lights
 else if(n===2)st3.children.forEach(o=>o.visible=true);
 key.color.set(on?0xffd9a8:0xaabfff);key.intensity=on?1.9:1.25;if(hemi)hemi.intensity=on?.55:.75;
 S.fog.near=on?10:14;S.fog.far=on?70:95;useEnv(n)}
const _ss=setStage;setStage=function(n){_ss(n);if(n===2)loadTemple();show(n)};
})();
</script>
