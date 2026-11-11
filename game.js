import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const canvas = document.querySelector('#game-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bbdb6);
scene.fog = new THREE.Fog(0x9bbdb6, 24, 105);
const camera = new THREE.PerspectiveCamera(52, 1, .1, 180);
camera.position.set(0, 5.3, 10.7);
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.13;

scene.add(new THREE.HemisphereLight(0xc8e6e1, 0x4d4d3d, 2.0));
const sun = new THREE.DirectionalLight(0xffe6ad, 3.2);
sun.position.set(-7, 13, 6); sun.castShadow = true;
sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left=-18; sun.shadow.camera.right=18; sun.shadow.camera.top=20; sun.shadow.camera.bottom=-12;
scene.add(sun);
const fill = new THREE.DirectionalLight(0x8ac7d3,1.3); fill.position.set(7,5,-12); scene.add(fill);
const mat = (color, roughness=.8, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const mats = {
 road:mat(0x303b3d), asphalt:mat(0x3c4748), line:mat(0xdacb9d,.65), sand:mat(0xbda77f),
 gold:mat(0xffbd38,.22,.78), gold2:mat(0xffe08a,.25,.5), skin:mat(0xc98d65), coat:mat(0xe4aa37),
 dark:mat(0x253136), pants:mat(0x283e46), white:mat(0xe7e6d9), red:mat(0xc65240), teal:mat(0x287675),
 glass:mat(0x38575a,.4,.15), buildingA:mat(0x788780), buildingB:mat(0xc09c73), buildingC:mat(0x61777a),
 police:mat(0x304b60), lightBlue:mat(0x79c4d2), barrier:mat(0xd88442), green:mat(0x425f4f)
};
const boxGeo = new THREE.BoxGeometry(1,1,1);
const sphereGeo = new THREE.SphereGeometry(1,16,12);
function mesh(geo, material, parent=scene){const m=new THREE.Mesh(geo,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(parent,material,x,y,z,sx,sy,sz){const m=mesh(boxGeo,material,parent);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;}
function cylinder(parent,material,x,y,z,rt,rb,h,seg=10){const m=mesh(new THREE.CylinderGeometry(rt,rb,h,seg),material,parent);m.position.set(x,y,z);return m;}

// Road and scenery: repeating handmade roadside blocks keep the chase continuous.
const ground = box(scene,mats.sand,0,-.58,-36,200,.22,180); ground.castShadow=false;
const road = box(scene,mats.road,0,-.43,-37,8.5,.18,150); road.castShadow=false;
for(const x of [-4.25,4.25]){const curb=box(scene,mats.line,x,-.32,-37,.18,.18,150);curb.castShadow=false;}
for(const x of [-1.4,1.4]){
  for(let i=0;i<14;i++){const dash=box(scene,mats.line,x,-.32,-i*8-4,.075,.025,3.8);dash.castShadow=false;}
}
const scenery=[];
const buildingMats=[mats.buildingA,mats.buildingB,mats.buildingC];
for(let i=0;i<38;i++){
  const side=i%2?1:-1, z=-i*8-4, h=4+Math.random()*10, w=2.8+Math.random()*3;
  const g=new THREE.Group(); scene.add(g); g.position.set(side*(7+Math.random()*5),0,z);
  const body=box(g,buildingMats[i%3],0,h/2,0,w,h,4+Math.random()*3); body.castShadow=false;
  const roof=box(g,mat(0x596a65),0,h+.1,0,w*.85,.22,3.8);roof.castShadow=false;
  const winMat=mat(i%2?0x38565b:0x5d7471,.5);
  for(let y=1.3;y<h-1;y+=1.8)for(let x=-w/2+.6;x<w/2-.35;x+=1.1){const win=box(g,winMat,x,y,2.03,.42,.8,.06);win.castShadow=false;}
  if(i%4===0){const sign=box(g,mat(0xe1b548),side<0?w*.28:-w*.28,h*.58,2.1,1.3,.55,.09);sign.castShadow=false;}
  scenery.push(g);
}
// Distant low skyline and warm sun disk
const sunDisk=mesh(new THREE.SphereGeometry(4,24,16),new THREE.MeshBasicMaterial({color:0xffd18a}),scene);sunDisk.position.set(-20,17,-90);
for(let i=0;i<18;i++){
  const h=7+Math.random()*17,w=4+Math.random()*8;
  const b=box(scene,mat([0x78918c,0x93a69a,0x6a8583][i%3]),-50+i*6,h/2,-95,w,h,5);b.castShadow=false;
}

// Runner model, intentionally graphic and readable at phone size.
const runner = new THREE.Group(); scene.add(runner); runner.position.set(0,0,1.1);
const torso = box(runner,mats.coat,0,1.25,0,.72,.95,.42);
const belt=box(runner,mats.dark,0,.86,.01,.74,.12,.44);
const head=mesh(sphereGeo,mats.skin,runner);head.position.set(0,1.97,0);head.scale.set(.34,.38,.32);
const hair=mesh(new THREE.SphereGeometry(.35,14,9),mats.dark,runner);hair.position.set(0,2.16,-.015);hair.scale.set(1,.52,1.02);
const scarf=box(runner,mat(0xf1cf6b),0,1.78,.2,.55,.12,.08);
const legs=[];
for(const x of [-.22,.22]){const leg=box(runner,mats.pants,x,.45,0,.25,.66,.28);legs.push(leg);const boot=box(runner,mats.dark,x,.12,.07,.29,.2,.42);}
const arms=[];
for(const x of [-.48,.48]){const arm=box(runner,mats.coat,x,1.35,0,.22,.68,.25);arms.push(arm);}
// gold glowing token in the runner's hand
const handGold=mesh(new THREE.OctahedronGeometry(.2,0),mats.gold2,runner);handGold.position.set(.56,1.25,.04);handGold.visible=false;
const shadow=mesh(new THREE.CircleGeometry(.55,24),new THREE.MeshBasicMaterial({color:0x162123,transparent:true,opacity:.35}),scene);shadow.rotation.x=-Math.PI/2;shadow.position.set(0,-.315,1.1);shadow.scale.set(1.3,.66,1);

// The pursuers are distant shapes/spotlights rather than real-world symbols.
const chaser=new THREE.Group();scene.add(chaser);chaser.position.set(0,0,-8);
const heliBody=mesh(new THREE.SphereGeometry(.65,14,10),mats.dark,chaser);heliBody.scale.set(1.35,.62,.9);heliBody.position.y=5.1;
const heliGlass=mesh(new THREE.SphereGeometry(.38,12,8),mats.lightBlue,chaser);heliGlass.scale.set(1,.65,.6);heliGlass.position.set(.55,5.25,.45);
const rotor=box(chaser,mats.dark,0,5.85,0,2.8,.055,.12);
const skid1=box(chaser,mats.dark,-.55,4.72,0,.08,.08,1.4), skid2=box(chaser,mats.dark,.55,4.72,0,.08,.08,1.4);
const spotlight=new THREE.SpotLight(0xffe8a4,24,28,.32,.5,1.2);spotlight.position.set(0,4.8,0);spotlight.target.position.set(0,0,5);chaser.add(spotlight,spotlight.target);

const lanes=[-2.8,0,2.8];
let objects=[];
function makeCoin(lane,z){const g=new THREE.Group();scene.add(g);g.position.set(lanes[lane],.83,z);const coin=mesh(new THREE.CylinderGeometry(.31,.31,.09,18),mats.gold,g);coin.rotation.x=Math.PI/2;const core=mesh(new THREE.OctahedronGeometry(.19),mats.gold2,g);g.userData={kind:'coin',taken:false};objects.push(g);return g;}
function makeBarrier(lane,z,kind='barrier'){
 const g=new THREE.Group();scene.add(g);g.position.set(lanes[lane],0,z);g.userData={kind,taken:false};
 if(kind==='agent'){
   const body=box(g,mats.police,0,.92,0,.7,.95,.42), face=mesh(sphereGeo,mats.skin,g);face.position.y=1.58;face.scale.set(.29,.32,.28);
   const cap=box(g,mats.dark,0,1.9,0,.62,.13,.55);box(g,mats.white,0,.96,.22,.16,.22,.05);
   const arm1=box(g,mats.police,-.48,1.05,0,.2,.65,.23);arm1.rotation.z=-.22;
   const arm2=box(g,mats.police,.48,1.05,0,.2,.65,.23);arm2.rotation.z=.22;
   const badge=mesh(new THREE.OctahedronGeometry(.1),mats.gold2,g);badge.position.set(-.12,1.1,.24);
 }else if(kind==='low'){
   box(g,mats.barrier,0,.62,0,1.62,1.12,.42);
   for(let x=-.5;x<=.5;x+=1)box(g,mats.white,x,.62,.22,.28,.96,.035).rotation.z=-.34;
   cylinder(g,mats.dark,-.65,.18,0,.11,.11,.36);cylinder(g,mats.dark,.65,.18,0,.11,.11,.36);
 }else{
   box(g,mats.dark,0,.72,0,1.35,1.4,.75);
   box(g,mats.red,0,1.45,.02,1.38,.12,.79);
   box(g,mats.gold2,0,.72,.41,.42,.2,.035);
 }
 objects.push(g);return g;
}
function makeBurst(x,y,z){
 const g=new THREE.Group();scene.add(g);g.position.set(x,y,z);
 for(let i=0;i<8;i++){const p=mesh(new THREE.OctahedronGeometry(.09+Math.random()*.09),i%2?mats.gold:mats.gold2,g);p.position.set((Math.random()-.5)*.8,Math.random()*.8,(Math.random()-.5)*.7);p.userData.v=new THREE.Vector3((Math.random()-.5)*2,1+Math.random()*2,(Math.random()-.5)*1.5);}
 bursts.push({group:g,life:.8});
}
const bursts=[];
function clearObjects(){for(const o of objects)scene.remove(o);objects=[];for(const b of bursts)scene.remove(b.group);bursts.length=0;}

const countryNames=['UNITED STATES','FRANCE','JAPAN','BRAZIL','UNITED KINGDOM','INDIA','AUSTRALIA','CANADA'];
let state='ready',lane=1,dist=0,gold=0,heat=10,speed=17,spawnTimer=1.5,coinTimer=1,produceCooldown=0,jumpY=0,jumpV=0,animTime=0,score=0,toastTimer=0,countryTimer=0,countryIndex=0,lastTime=0,muted=true,audioCtx=null;
const ui={distance:document.querySelector('#distance'),gold:document.querySelector('#gold'),heat:document.querySelector('#heat-fill'),heatValue:document.querySelector('#heat-value'),wanted:document.querySelector('#wanted-level'),start:document.querySelector('#start-screen'),over:document.querySelector('#game-over'),country:document.querySelector('#country-toast'),countryName:document.querySelector('#country-name'),toast:document.querySelector('#toast'),finalD:document.querySelector('#final-distance'),finalG:document.querySelector('#final-gold')};
function playTone(freq=520,dur=.07,type='sine',volume=.035){if(muted)return;try{audioCtx ||= new AudioContext();const o=audioCtx.createOscillator(),gain=audioCtx.createGain();o.type=type;o.frequency.value=freq;gain.gain.setValueAtTime(volume,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.connect(gain);gain.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur);}catch{}}
function showToast(text){ui.toast.textContent=text;ui.toast.classList.add('show');toastTimer=1.05;}
function updateHud(){ui.distance.textContent=String(Math.floor(dist)).padStart(3,'0');ui.gold.textContent=String(gold).padStart(3,'0');ui.heat.style.width=`${Math.max(4,heat)}%`;ui.heatValue.textContent=heat<35?'LOW':heat<70?'RISING':'CRITICAL';ui.heatValue.style.color=heat<35?'#a6e2b9':heat<70?'#ffd36a':'#ff7160';ui.wanted.textContent=String(1+Math.floor(heat/23)).padStart(2,'0');}
function startGame(){
 clearObjects();state='playing';dist=0;gold=0;heat=10;speed=17;spawnTimer=1.2;coinTimer=.25;produceCooldown=.4;jumpY=0;jumpV=0;lane=1;runner.position.x=0;runner.position.y=0;ui.start.hidden=true;ui.over.hidden=true;document.body.classList.add('game-live');updateHud();
 for(let i=0;i<3;i++){for(let j=0;j<5;j++)makeCoin(i,-13-j*5-(i%2)*2);}
 countryIndex=0;countryTimer=2.7;
}
function endGame(){if(state!=='playing')return;state='over';ui.finalD.textContent=`${Math.floor(dist)}m`;ui.finalG.textContent=`${gold}`;ui.over.hidden=false;document.body.classList.remove('game-live');playTone(110,.35,'sawtooth',.06);}
function move(dir){if(state!=='playing')return;lane=Math.max(0,Math.min(2,lane+dir));playTone(260,.045,'triangle',.015);}
function jump(){if(state!=='playing'||jumpY>0.02)return;jumpV=7.6;playTone(360,.08,'sine',.02);}
function produceGold(){if(state!=='playing'||produceCooldown>0)return;produceCooldown=.48;gold+=5;heat=Math.min(100,heat+7.5);score+=5;handGold.visible=true;setTimeout(()=>handGold.visible=false,240);makeBurst(runner.position.x+.4,1.25,runner.position.z);showToast('GOLD RUSH +5');playTone(780,.13,'sine',.045);playTone(1040,.11,'sine',.025);updateHud();}
function spawnPattern(){
 const r=Math.random(),l=Math.floor(Math.random()*3),z=-70;
 if(r<.26){for(let i=0;i<3;i++)makeCoin((l+i)%3,z-i*4);}
 else if(r<.5){makeBarrier(l,z,Math.random()<.54?'low':'agent');for(let i=0;i<4;i++)makeCoin((l+1)%3,z-3-i*3);}
 else if(r<.68){makeBarrier(l,z,'block');makeBarrier((l+1)%3,z-5,'low');for(let i=0;i<3;i++)makeCoin((l+2)%3,z-4-i*3);}
 else if(r<.82){for(let i=0;i<7;i++)makeCoin(l,z-i*3.1);}
 else {makeBarrier(l,z,'agent');makeBarrier((l+2)%3,z,'low');for(let i=0;i<4;i++)makeCoin((l+1)%3,z-3-i*3);}
}
function collide(){
 for(const o of objects){if(o.userData.taken)continue;const z=o.position.z;if(Math.abs(z-runner.position.z)<1.02&&Math.abs(o.position.x-runner.position.x)<1.05){
  if(o.userData.kind==='coin'){o.userData.taken=true;scene.remove(o);gold+=1;heat=Math.max(0,heat-.2);playTone(920,.07,'sine',.025);updateHud();}
  else if(o.userData.kind==='agent'||o.userData.kind==='barrier'||o.userData.kind==='low'||o.userData.kind==='block'){
   if(jumpY<.95){makeBurst(runner.position.x,.75,runner.position.z);endGame();return;}
   o.userData.taken=true;scene.remove(o);gold+=2;showToast('CLEAN GETAWAY +2');
  }
 }}
}
function update(dt){
 if(state!=='playing')return;
 animTime+=dt;dist+=speed*dt*.36;speed=Math.min(25,17+dist*.017);heat=Math.max(5,heat-dt*.42);produceCooldown=Math.max(0,produceCooldown-dt);
 spawnTimer-=dt;if(spawnTimer<=0){spawnPattern();spawnTimer=Math.max(1.2,2.35-dist*.003)+Math.random()*.5;}
 coinTimer-=dt;if(coinTimer<=0){makeCoin(Math.floor(Math.random()*3),-75);coinTimer=2.9+Math.random()*1.8;}
 for(const o of objects){o.position.z+=speed*dt;if(o.userData.kind==='coin'){o.rotation.y+=dt*2.7;o.position.y=.82+Math.sin(animTime*4+o.position.z)*.11;}}
 objects=objects.filter(o=>{if(o.position.z>8){scene.remove(o);return false;}return true;});
 runner.position.x=THREE.MathUtils.damp(runner.position.x,lanes[lane],10,dt);
 jumpV-=20*dt;jumpY=Math.max(0,jumpY+jumpV*dt);if(jumpY===0)jumpV=0;runner.position.y=jumpY;shadow.position.x=runner.position.x;shadow.material.opacity=.35-jumpY*.12;shadow.scale.set(1.3+jumpY*.2,.66+jumpY*.1,1);
 const running=jumpY<.05;legs[0].rotation.x=running?Math.sin(animTime*13)*.75:0;legs[1].rotation.x=running?-Math.sin(animTime*13)*.75:0;arms[0].rotation.x=running?-Math.sin(animTime*13)*.45:0;arms[1].rotation.x=running?Math.sin(animTime*13)*.45:0;
 runner.rotation.z=THREE.MathUtils.damp(runner.rotation.z,(lanes[lane]-runner.position.x)*-.09,7,dt);runner.rotation.x=jumpY>0?.15:0;
 for(const g of scenery){g.position.z+=speed*dt;if(g.position.z>20)g.position.z-=304;}
 for(const b of bursts){b.life-=dt;b.group.children.forEach(p=>{p.position.addScaledVector(p.userData.v,dt);p.userData.v.y-=4*dt;p.scale.multiplyScalar(.99);});if(b.life<=0){scene.remove(b.group);bursts.splice(bursts.indexOf(b),1);}}
 rotor.rotation.y+=dt*18;chaser.position.x=THREE.MathUtils.damp(chaser.position.x,runner.position.x*.48,1.4,dt);chaser.position.z=-8+Math.sin(animTime*1.3)*.65;chaser.position.y=Math.sin(animTime*2)*.25;
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.classList.remove('show');}
 if(countryTimer>0){countryTimer-=dt;if(countryTimer<=0){ui.countryName.textContent=countryNames[countryIndex++%countryNames.length];ui.country.classList.add('show');setTimeout(()=>ui.country.classList.remove('show'),2100);countryTimer=10+Math.random()*7;}}
 if(Math.floor(dist)%35===0&&Math.floor(dist)!==score){score=Math.floor(dist);updateHud();}
 collide();updateHud();
}
function render(){const w=innerWidth,h=innerHeight;const dpr=Math.min(devicePixelRatio,1.7);if(canvas.width!==Math.floor(w*dpr)||canvas.height!==Math.floor(h*dpr)){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}camera.position.x=THREE.MathUtils.damp(camera.position.x,runner.position.x*.15,2,1/60);camera.lookAt(runner.position.x*.12,1.1,-7.2);renderer.render(scene,camera);}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.04,(t-lastTime)/1000||0);lastTime=t;update(dt);render();}
requestAnimationFrame(loop);

document.querySelector('#play-button').addEventListener('click',startGame);
document.querySelector('#replay-button').addEventListener('click',startGame);
document.querySelector('#sound-btn').addEventListener('click',e=>{muted=!muted;e.currentTarget.textContent=muted?'♫':'♪';if(!muted)playTone(620,.08);});
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();if(e.repeat)return;if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')move(-1);if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')move(1);if(e.key==='ArrowUp'||e.key===' ')jump();if(e.key.toLowerCase()==='g'||e.key.toLowerCase()==='e')produceGold();if(e.key==='Enter'&&(state==='ready'||state==='over'))startGame();});
document.querySelectorAll('[data-action]').forEach(btn=>{btn.addEventListener('pointerdown',e=>{e.preventDefault();const a=btn.dataset.action;if(a==='left')move(-1);if(a==='right')move(1);if(a==='jump')jump();if(a==='gold')produceGold();});});
let touchStart=null;canvas.addEventListener('touchstart',e=>{if(state!=='playing')return;touchStart=[e.changedTouches[0].clientX,e.changedTouches[0].clientY];},{passive:true});canvas.addEventListener('touchend',e=>{if(!touchStart||state!=='playing')return;const dx=e.changedTouches[0].clientX-touchStart[0],dy=e.changedTouches[0].clientY-touchStart[1];if(Math.abs(dx)>28)move(dx>0?1:-1);else if(dy<-25)jump();touchStart=null;},{passive:true});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);});
