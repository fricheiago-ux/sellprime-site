/* Hero: uma cena só, com um zoom contínuo. A casa em 3D é, na verdade, o cartão de um imóvel dentro do
   aplicativo da SellPrime (iPhone). O zoom out começa já no primeiro scroll: a câmera recua enquanto a casa
   se constrói e o cartão vai se revelando como parte da tela do celular, com selos de vendida, em negociação
   e inativo. Three.js é carregado só depois da página. Sem WebGL, sem Three ou com movimento reduzido:
   fica o iPhone já pronto, parado. */
(()=>{
const hero=document.querySelector('.hero'),canvas=document.getElementById('hero-canvas'),stage=document.getElementById('hero-stage');
if(!hero||!canvas)return;
const visual=hero.querySelector('.hero-visual'),fallback=hero.querySelector('.hero-fallback');
const fone=document.getElementById('fone'),corpo=fone.querySelector('.fone__corpo'),lista=document.getElementById('app-lista');
const tiles=[...lista.querySelectorAll('.tile')],casa=document.getElementById('tile-casa'),foto=casa.querySelector('.tile__foto');
const outros=tiles.filter(t=>t!==casa);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop=matchMedia('(min-width:900px)');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),sm=(a,b,x)=>{const p=clamp((x-a)/(b-a));return p*p*(3-2*p)};
const lerp=(a,b,t)=>a+(b-a)*t,easeOut=t=>1-Math.pow(1-t,3);

/* ---------- geometria do iPhone (tamanho lógico 300x652): onde está o cartão da casa ---------- */
let K=.8,T0,tcx=0,tcy=0,tw=125;
function medir(){
  // posição do cartão em relação ao iPhone (soma dos deslocamentos até o elemento do iPhone)
  let x=0,y=0,el=casa;while(el&&el!==fone){x+=el.offsetLeft;y+=el.offsetTop;el=el.offsetParent}
  tw=casa.offsetWidth;tcx=x+tw/2;tcy=y+casa.offsetHeight/2;T0={x,y,w:tw,h:casa.offsetHeight};
  fone.style.setProperty('--ox',tcx+'px');fone.style.setProperty('--oy',tcy+'px');
}
function ajustar(){const r=visual.getBoundingClientRect();if(!r.width)return;K=Math.min(r.height*.94/652,r.width*.92/300);fone.style.setProperty('--k',K.toFixed(3))}
/* recorte: no início só o cartão da casa aparece; o recorte abre até mostrar o iPhone inteiro */
function recorte(t){
  const x0=lerp(T0.x,0,t),y0=lerp(T0.y,0,t),x1=lerp(300-T0.x-T0.w,0,t),y1=lerp(652-T0.y-T0.h,0,t),r=lerp(18,48,t);
  corpo.style.clipPath='inset('+y0.toFixed(1)+'px '+x1.toFixed(1)+'px '+y1.toFixed(1)+'px '+x0.toFixed(1)+'px round '+r.toFixed(1)+'px)'}
/* selos (a casa por último) */
function selos(p){outros.forEach((t,i)=>t.classList.toggle('on',p>.6+i*.012));casa.classList.toggle('on',p>.78)}
function estatico(){
  hero.classList.add('hero--static');canvas.style.display='none';if(fallback)fallback.style.display='none';
  ajustar();medir();fone.style.transform='scale('+K+')';corpo.style.clipPath='none';selos(1);fone.style.opacity=1}
addEventListener('resize',()=>{ajustar();medir()});

/* ---------- outros tipos de imóvel nos cartões "vazios" ----------
   Cada modelo (imoveis3d.js) é desenhado uma vez numa cena à parte, vira uma imagem e a cena é descartada.
   Roda só quando o navegador está livre, para não atrasar a primeira tela. Sem isso, o cartão mantém o símbolo. */
async function outrosImoveis(){
  if(!window.spImoveis3D||!spTemWebGL())return;
  try{
    await spThree();
    const cv=document.createElement('canvas');cv.style.cssText='position:fixed;left:-9999px;top:0;width:320px;height:320px;pointer-events:none';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);
    const C=spCena(cv,{raio:3.3,chao:'ouro'}),T=C.T;C.tamanho();C.camera.fov=30;C.camera.updateProjectionMatrix();
    const modelos=window.spImoveis3D(C),az=.7,el=.28,dist=3.7/Math.tan(15*Math.PI/180);   // mesmo ângulo do fim do zoom da casa; 7,4 unidades de largura
    modelos.slice(0,outros.length).forEach((m,i)=>{
      const g=m.construir();g.scale.setScalar((g.userData.esc||1)*1.28);C.root.add(g);
      C.camera.position.set(Math.sin(az)*dist*Math.cos(el),Math.sin(el)*dist+1.2,Math.cos(az)*dist*Math.cos(el));C.camera.lookAt(0,1.2,0);C.camera.updateMatrixWorld();
      C.desenhar();
      const o=document.createElement('canvas');o.width=o.height=320;o.getContext('2d').drawImage(cv,0,0,cv.width,cv.height,0,0,320,320);
      const img=document.createElement('img');img.className='tile__foto tile__foto--imovel';img.alt='';img.decoding='async';
      img.onload=()=>outros[i].classList.add('com-3d');img.src=o.toDataURL('image/png');outros[i].appendChild(img);
      C.root.remove(g);g.traverse(n=>{if(n.geometry)n.geometry.dispose()})});
    C.renderer.dispose();if(C.renderer.forceContextLoss)C.renderer.forceContextLoss();cv.remove();
  }catch(e){console.error(e)}
}
const quandoLivre=fn=>('requestIdleCallback' in window)?requestIdleCallback(fn,{timeout:2500}):setTimeout(fn,1200);
if(reduce){estatico();quandoLivre(outrosImoveis);return}
ajustar();medir();
/* primeira tela: o cartão azul (com o contorno dourado da casa) já nasce no lugar e aparece com um fade; antes, a marca
   dourada sobre o fundo claro dava lugar ao cartão de uma vez só */
(function aberturaSuave(){
  const cw=canvas.clientWidth;if(!cw)return;
  const S0=.5*cw/(tw*.7),bx=tcx-150,by=tcy-326;
  fone.style.transform='translate('+(-bx).toFixed(1)+'px,'+(-by).toFixed(1)+'px) scale('+S0.toFixed(4)+')';
  recorte(0);if(fallback)fallback.style.display='none';fone.style.opacity=1;
  /* enquanto o cartão gira, o celular fica sem fundo (classe .intro); volta ao normal no fim do giro ou na primeira rolagem */
  fone.classList.add('intro');const fim=()=>fone.classList.remove('intro');
  casa.addEventListener('animationend',e=>{if(e.animationName==='cartao-vira')fim()});setTimeout(fim,2600);addEventListener('scroll',fim,{once:true,passive:true})})();

/* ---------- 3D ---------- */
async function iniciar(){
  const C=spCena(canvas,{raio:3.3,chao:'ouro'}),T=C.T,M=C.mats,DIR=-1,WH=2.4,TILE=7.4;   // TILE: largura do cartão em unidades do mundo
  const {root,rbox,mesh,camera}=C;
  const rboxC=(w,h,d,b)=>{const g=rbox(w,h,d,b);g.translate(0,-h/2,0);return g};
  const walls=mesh(rbox(4,WH,3,.07),M.petrol);root.add(walls);
  const sh=new T.Shape();sh.moveTo(-2.3,0);sh.lineTo(2.3,0);sh.lineTo(0,1.68);sh.closePath();
  const roofG=new T.ExtrudeGeometry(sh,{depth:3.3,bevelEnabled:true,bevelThickness:.07,bevelSize:.07,bevelSegments:4,curveSegments:1});roofG.translate(0,0,-1.65);
  const roof=mesh(roofG,M.dark,0,WH,0);root.add(roof);
  const door=mesh(rbox(.85,1.4,.12,.035),M.gold,0,0,1.5);root.add(door);
  const knob=mesh(new T.SphereGeometry(.055,32,24),M.cream,.28,.72,1.6);root.add(knob);
  const windowAt=x=>{const g=new T.Group();g.position.set(x,1.45,1.5);
    g.add(mesh(rboxC(.75,.75,.1,.02),M.glass,0,.375,0));
    g.add(mesh(rboxC(.82,.06,.14,.02),M.gold,0,.375,0));g.add(mesh(rboxC(.06,.82,.14,.02),M.gold,0,.375,0));
    g.add(mesh(rboxC(.86,.07,.16,.02),M.gold,0,-.37,.01));return g};
  const w1=windowAt(-1.2),w2=windowAt(1.2);root.add(w1,w2);
  const chim=mesh(rbox(.4,1.1,.4,.04),M.dark,1.25,WH+.55,-.5);root.add(chim);

  const track=()=>desktop.matches?hero:stage;
  const progress=()=>{if(window.__forcaP!=null)return window.__forcaP;const r=track().getBoundingClientRect();return clamp(-r.top/Math.max(1,r.height-innerHeight))};
  function size(){if(C.tamanho())camera.fov=30,camera.updateProjectionMatrix()}
  /* a casa se constrói depressa (até ~.3) enquanto a câmera já recua */
  function pose(p){
    const g=sm(0,.04,p);C.ground.visible=g>.002;C.ground.scale.set(.001+g,1,.001+g);
    walls.scale.y=Math.max(.001,sm(.01,.08,p));walls.visible=p>.012;
    const r=clamp((p-.07)/.09);roof.position.y=WH+5*(1-easeOut(r));roof.visible=p>.07;
    const d=sm(.14,.19,p),wi=sm(.16,.21,p),ch=sm(.19,.24,p);
    door.scale.set(1,Math.max(.001,d),1);knob.scale.setScalar(Math.max(.001,d));door.visible=knob.visible=d>.002;
    [w1,w2].forEach(w=>{w.scale.setScalar(Math.max(.001,wi));w.visible=wi>.002});chim.scale.y=Math.max(.001,ch);chim.visible=ch>.002}
  /* zoom: escala do iPhone (s) e distância da câmera andam juntas, então a casa sempre coincide com o cartão */
  const e_=p=>sm(.03,.6,p);
  function zoom(p){
    const cw=canvas.clientWidth,ch=canvas.clientHeight,e=e_(p);
    const S0=.5*cw/(tw*.7),s=S0*Math.pow(K/S0,e);              // escala geométrica: zoom suave
    const k=sm(0,.3,p),az=DIR*(.9-1.6*k),el=.45-.17*k;           // giro curto, termina cedo
    const dist=(ch/2)*TILE/(Math.tan(camera.fov*Math.PI/360)*tw*s);
    camera.position.set(Math.sin(az)*dist*Math.cos(el),Math.sin(el)*dist+1.2,Math.cos(az)*dist*Math.cos(el));camera.lookAt(0,1.2,0);camera.updateMatrixWorld();
    // o cartão acompanha a casa: no início no centro da cena, no fim na posição normal dentro do iPhone
    const bx=tcx-150,by=tcy-326,tx=lerp(0,bx*K,e)-bx,ty=lerp(0,by*K,e)-by;
    fone.style.transform='translate('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px) scale('+s.toFixed(4)+')';
    canvas.style.transform='translate('+lerp(0,bx*K,e).toFixed(1)+'px,'+lerp(0,by*K,e).toFixed(1)+'px)';
    recorte(sm(.08,.5,p));
    return e}
  /* miniatura do cartão: a mesma imagem que o 3D mostra no fim do zoom (recorte quadrado, fundo transparente) */
  function miniatura(){
    try{pose(.4);zoom(.62);canvas.style.transform='none';C.desenhar();
      const f=canvas.width/canvas.clientWidth,lado=tw*K,s=Math.round(lado*f),o=document.createElement('canvas');o.width=o.height=Math.min(s,512);
      const cx=canvas.clientWidth/2,cy=canvas.clientHeight/2;
      o.getContext('2d').drawImage(canvas,Math.round((cx-lado/2)*f),Math.round((cy-lado/2)*f),s,s,0,0,o.width,o.height);
      foto.src=o.toDataURL('image/png')}catch(e){foto.removeAttribute('src')}}
  const visivel=spVisivel(canvas,()=>render());
  function render(){
    if(!visivel())return;
    const p=progress();
    pose(p);zoom(p);selos(p);
        const fade=sm(.56,.64,p);canvas.style.opacity=String(1-fade);foto.style.opacity=String(fade);
    if(fade<1)C.desenhar();
  }
  size();fone.style.opacity=1;if(fallback)fallback.style.opacity=0;
  miniatura();
  quandoLivre(outrosImoveis);
  canvas.classList.add('on');render();
  addEventListener('scroll',render,{passive:true});
  addEventListener('resize',()=>{size();render()});
  desktop.addEventListener('change',()=>{size();ajustar();medir();render()});
  window.__heroDbg={render,progress,C};
}
spQuandoCarregar(()=>{
  if(!spTemWebGL()){estatico();return}
  spThree().then(iniciar).catch(e=>{console.error(e);estatico()});
});
})();
