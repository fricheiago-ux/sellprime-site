/* As 4 frentes em 3D: quatro objetos num anel; a rolagem gira o anel e traz a frente ativa para perto da câmera.
   Sem WebGL ou com movimento reduzido: sem cena, só os cartões. */
(()=>{
const sec=document.querySelector('.eco'),canvas=document.getElementById('eco-canvas'),list=document.getElementById('eco-list'),label=document.getElementById('eco-label');
if(!sec||!canvas||!list)return;
const cards=[...list.querySelectorAll('.card')];
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
spQuandoCarregar(()=>{if(!spTemWebGL())return;spThree().then(iniciar).catch(e=>console.error(e))});

function iniciar(){
  const C=spCena(canvas,{raio:4.3,chao:'ouro'}),T=C.T,M=C.mats,{root,rbox,mesh,camera}=C;
  const ring=new T.Group();root.add(ring);
  const R=2.9,slots=[];
  for(let i=0;i<4;i++){const g=new T.Group(),a=i*Math.PI/2;g.position.set(Math.sin(a)*R,0,Math.cos(a)*R);g.rotation.y=a;ring.add(g);slots.push(g)}
  /* materiais foscos para esta cena: sem reflexo forte (o Iago não gostou do brilho no funil) */
  const mat=(hex,r=.72,m=0,env=.35,extra={})=>new T.MeshStandardMaterial(Object.assign({color:C.col(hex),roughness:r,metalness:m,envMapIntensity:env},extra));
  const petrolF=mat('#1d5366',.62,0,.7),darkF=mat('#0e2d38',.65,0,.5),creamF=mat('#f3f0e9',.85),goldS=mat('#b89b4d',.45,.5,.7),
        vidro=mat('#1f4f5e',.4,.1,.5),aceso=mat('#f0cf6a',.5,0,.2,{emissive:C.col('#e6b93f'),emissiveIntensity:1}),
        telaM=mat('#1f5a6c',.5,0,.2,{emissive:C.col('#1f5a6c'),emissiveIntensity:.35}),cinza=mat('#8b9096',.8);
  const ball=(r,m,x,y,z)=>mesh(new T.SphereGeometry(r,48,32),m,x,y,z);
  const anim=[]; // funções chamadas a cada quadro com o tempo em segundos
  const plinto=(g,w,d)=>g.add(mesh(rbox(w,.12,d,.05),darkF));

  /* 0 · leads: funil fosco; esferas de ouro descem e somem na boca dele, em ciclo */
  {const g=slots[0];
   const perfil=[[.0,0],[.3,0],[.3,.55],[.34,.6],[1.2,2.1],[1.26,2.14],[1.2,2.18],[1.1,2.16],[.26,.68],[.0,.62]].map(([x,y])=>new T.Vector2(x,y));
   const fun=mesh(new T.LatheGeometry(perfil,72),petrolF.clone());fun.material.side=T.DoubleSide;g.add(fun);
   const aro=mesh(new T.TorusGeometry(1.2,.045,16,96),goldS,0,2.16,0);aro.rotation.x=Math.PI/2;g.add(aro);
   plinto(g,1.9,1.9);
   const bolas=[[-.55,.19],[.5,.16],[.05,.14],[.7,.17]].map(([x0,r],k)=>{const b=ball(r,goldS,x0,3.6,0);g.add(b);return{b,x0,k}});
   anim.push(t=>bolas.forEach(({b,x0,k})=>{const u=((t/2.8)+k/4)%1;b.position.set(x0*(1-u*.9),3.9-u*1.55,(k%2?.2:-.2)*(1-u));b.scale.setScalar(Math.max(.001,Math.min(1,u*10)*(u>.82?1-(u-.82)/.18:1)))}))}

  /* 1 · páginas: cartão em pé com um prédio de janelas que acendem */
  {const g=slots[1];plinto(g,3.0,2.3);
   const ESC=1.55,pred=new T.Group();pred.scale.setScalar(ESC);pred.position.set(0,.12*(1-ESC),.05*(1-ESC));g.add(pred);
   g.add(mesh(rbox(2.7,2.45,.1,.04),creamF,0,.12,-.95));g.add(mesh(rbox(2.7,.2,.13,.04),goldS,0,2.37,-.95));
   pred.add(mesh(rbox(.86,1.5,.62,.05),petrolF,0,.12,.05));
   pred.add(mesh(rbox(.56,.42,.46,.04),darkF,0,1.62,.05));pred.add(mesh(rbox(.04,.35,.04,.01),goldS,0,2.04,.05));
   pred.add(mesh(rbox(.55,.85,.5,.05),darkF,.66,.12,.05));
   pred.add(mesh(rbox(.2,.32,.04,.02),goldS,0,.12,.37));
   const jan=[];for(let r=0;r<5;r++)for(let c=0;c<3;c++){const w=mesh(rbox(.14,.17,.03,.01),vidro,-.25+c*.25,.58+r*.23,.37);w.castShadow=false;pred.add(w);jan.push(w)}
   for(let r=0;r<3;r++)for(let c=0;c<2;c++){const w=mesh(rbox(.12,.15,.03,.01),vidro,.54+c*.24,.36+r*.24,.31);w.castShadow=false;pred.add(w);jan.push(w)}
   let ult=-1;anim.push(t=>{const s=Math.floor(t/1.4);if(s===ult)return;ult=s;jan.forEach((w,i)=>{w.material=((i*7+s*13+(i%3)*s)%5<2)?aceso:vidro})})}

  /* 2 · comunicação: celular com conversa e balões de mensagem flutuando */
  {const g=slots[2];plinto(g,1.9,1.9);
   g.add(mesh(rbox(.6,.1,.5,.04),darkF,0,.12,0));
   const cel=new T.Group();cel.position.set(0,.22,0);g.add(cel);
   cel.add(mesh(rbox(1.0,1.95,.14,.12),darkF));
   const tela=new T.Mesh(new T.PlaneGeometry(.86,1.8),telaM);tela.position.set(0,.975,.075);cel.add(tela);
   cel.add(mesh(rbox(.3,.07,.02,.02),mat('#000000'),0,1.84,.085));
   [[-.1,1.45,.5,cinza],[.12,1.18,.46,goldS],[-.12,.92,.54,creamF],[.1,.66,.4,goldS]].forEach(([x,y,w,m])=>{cel.add(mesh(rbox(w,.17,.02,.06),m,x,y,.09))});
   cel.add(mesh(rbox(.3,.04,.02,.01),goldS,0,.14,.085));
   const bal=(w,h,m,x,y,z,inv)=>{const b=new T.Group();b.position.set(x,y,z);b.add(mesh(rbox(w,h,.12,.09),m));const tail=mesh(rbox(.17,.17,.12,.02),m,inv?w/2-.12:-w/2+.12,-.07,0);tail.rotation.z=Math.PI/4;b.add(tail);g.add(b);return b};
   const b1=bal(1.0,.55,goldS,1.1,2.1,.2,true),b2=bal(.95,.5,creamF,-1.1,1.55,.25,false),b3=bal(.85,.46,petrolF,1.05,.95,.25,true);
   const pts=[0,1,2].map(i=>{const s=ball(.05,petrolF,-.2+i*.2,0,.075);b2.add(s);s.position.set(-.2+i*.2,0,.08);return s});
   anim.push(t=>{[b1,b2,b3].forEach((b,i)=>{b.position.y+=0;b.rotation.z=Math.sin(t*1.1+i*2)*.05;b.userData.y0??=b.position.y;b.position.y=b.userData.y0+Math.sin(t*1.5+i*1.7)*.08});
     pts.forEach((s,i)=>s.scale.setScalar(.6+.5*Math.max(0,Math.sin(t*5-i*.9))))})}

  /* 3 · CRM: gráfico com eixos, linhas de referência, barras e linha de tendência (para não parecer um prédio) */
  {const g=slots[3];plinto(g,2.9,1.5);
   g.add(mesh(rbox(2.5,2.2,.06,.03),creamF,0,.12,-.45));
   for(let k=1;k<=4;k++){const l=mesh(rbox(2.3,.025,.025,.01),cinza,0,.12+k*.46,-.4);l.castShadow=false;g.add(l)}
   g.add(mesh(rbox(2.4,.05,.07,.02),darkF,0,.12,-.3));g.add(mesh(rbox(.05,2.0,.07,.02),darkF,-1.17,.12,-.3));
   const xs=[-.78,-.26,.26,.78],hs=[.65,1.05,1.5,1.95],topos=[];
   xs.forEach((x,i)=>{g.add(mesh(rbox(.34,hs[i],.34,.04),i===3?goldS:petrolF,x,.12,-.1));topos.push(new T.Vector3(x,.12+hs[i]+.1,.2))});
   topos.slice(0,-1).forEach((p,i)=>{const a=p,b2=topos[i+1],d=new T.Vector3().subVectors(b2,a),len=d.length(),c=new T.Mesh(new T.CylinderGeometry(.03,.03,len,12),goldS);c.position.copy(a).addScaledVector(d,.5);c.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());c.castShadow=true;g.add(c)});
   const pontos=topos.map(p=>{const s=ball(.075,goldS,p.x,p.y,p.z);g.add(s);return s});
   anim.push(t=>pontos.forEach((s,i)=>s.scale.setScalar(1+.25*Math.max(0,Math.sin(t*2.4-i*.8)))))}

  const nomes=cards.map(c=>c.querySelector('h3').textContent);
  function size(){if(C.tamanho())camera.fov=camera.aspect<.9?38:30,camera.updateProjectionMatrix()}
  const itens=[...list.querySelectorAll('.eco__item')];
  /* progresso de chegada de cada cartão (0 = ainda abaixo, 1 = já encaixado em cima do anterior) */
  function chegadas(){
    const vh=innerHeight,passo=vh*.44+8,topo=parseFloat(getComputedStyle(list).getPropertyValue('--over'))||0;
    return itens.map((li,i)=>{if(i===0)return 1;const c=li.querySelector('.card');const alvo=c.getBoundingClientRect().height>0?parseFloat(getComputedStyle(c).top)||0:0;
      return clamp((alvo+passo-li.getBoundingClientRect().top)/passo)})}
  function idx(){const ch=chegadas();return ch[1]+ch[2]+ch[3]}
  let ativo=-1;
  const visivel=spVisivel(canvas,()=>render());
  function render(){
    if(!visivel())return;
    const ch=chegadas(),f=ch[1]+ch[2]+ch[3];ring.rotation.y=-f*Math.PI/2;
    cards.forEach((c,i)=>{const p=i<3?ch[i+1]:0,rot=(i%2?1.6:-1.6)*p;c.style.transform='scale('+(1-p*.07).toFixed(4)+') rotate('+rot.toFixed(2)+'deg)';c.style.filter=p>.02?'blur('+(p*3).toFixed(1)+'px)':'none';c.style.opacity=(1-p*.3).toFixed(3)});
    slots.forEach((g,i)=>{const d=Math.abs(i-f),far=clamp((2-d)/.6),s=(.55+.6*clamp(1-d))*far;g.scale.setScalar(Math.max(.001,s));g.visible=far>.01});
    const n=Math.round(f);if(n!==ativo){ativo=n;cards.forEach((c,i)=>c.classList.toggle('on',i===n));label.textContent=nomes[n]}
    const dist=Math.max(10,4.3/(Math.tan(camera.fov*Math.PI/360)*camera.aspect));camera.position.set(0,3.9+dist*.05,dist);camera.lookAt(0,1.3,1.0);
    C.desenhar();
  }
  sec.classList.add('eco--3d');size();render();
  const t0=performance.now();
  (function tick(){requestAnimationFrame(tick);if(!visivel()||document.hidden)return;const t=(performance.now()-t0)/1000;anim.forEach(f=>f(t));render()})();
  addEventListener('scroll',render,{passive:true});addEventListener('resize',()=>{size();render()});
  window.__ecoDbg={render,idx,C};
}
})();
