/* PROPRIETÁRIO, cortina de comparação "antes e depois" (mudou em 23/11, a pedido do Iago).
   1. Quando a cortina aparece INTEIRA na tela (ou o máximo que cabe, se for mais alta que a tela), a alça corre
      sozinha uma vez: do "antes" até o "depois" (1,4 s) e volta para o meio (0,7 s).
   2. Depois disso, a pessoa arrasta a alça para onde quiser (mouse ou dedo), clica/toca em qualquer ponto da
      cortina para levar a alça até lá, ou usa as setas do teclado com a alça em foco.
   Se a pessoa mexer antes da animação, a animação não roda mais. Movimento reduzido: sem animação, alça no meio.
   --fecha (CSS) é quanto do "depois" ainda está coberto, da direita para a esquerda: 100% = só o antes. */
(()=>{
const c=document.getElementById('compara'),alca=document.getElementById('compara-alca');if(!c||!alca)return;
const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
let pos=0,mexeu=false,animou=false,raf=0;
function poe(p){pos=clamp(p);c.style.setProperty('--fecha',(100-pos).toFixed(2)+'%');
  alca.setAttribute('aria-valuenow',Math.round(pos));alca.setAttribute('aria-valuetext',pos<15?'Antes':pos>85?'Com a SellPrime':'Metade antes, metade depois')}
poe(reduz?50:0);

/* animação automática (uma vez) */
const curva=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function anima(de,ate,ms){return new Promise(ok=>{const t0=performance.now();
  const passo=t=>{if(mexeu){ok();return}const k=Math.min(1,(t-t0)/ms);poe(de+(ate-de)*curva(k));if(k<1)raf=requestAnimationFrame(passo);else ok()};
  raf=requestAnimationFrame(passo)})}
async function roda(){if(animou||mexeu||reduz)return;animou=true;
  await anima(0,100,1400);if(mexeu)return;await new Promise(r=>setTimeout(r,300));if(mexeu)return;await anima(100,50,700)}
if(!reduz&&'IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>{const e=es[0];
    const precisa=Math.min(1,innerHeight/Math.max(1,e.boundingClientRect.height))*.98;/* "inteira", ou o máximo que cabe */
    if(e.intersectionRatio>=precisa){io.disconnect();roda()}
  },{threshold:[...Array(21)].map((_,i)=>i/20)});
  io.observe(c);
}

/* arrastar e clicar */
const paraPos=x=>{const r=c.getBoundingClientRect();return (x-r.left)/r.width*100};
let arrastando=false;
c.addEventListener('pointerdown',e=>{if(e.button>0)return;mexeu=true;cancelAnimationFrame(raf);arrastando=true;
  c.setPointerCapture(e.pointerId);poe(paraPos(e.clientX))});
c.addEventListener('pointermove',e=>{if(arrastando)poe(paraPos(e.clientX))});
const solta=()=>{arrastando=false};
c.addEventListener('pointerup',solta);c.addEventListener('pointercancel',solta);

/* teclado */
alca.addEventListener('keydown',e=>{const passo=e.shiftKey?20:5;let n=null;
  if(e.key==='ArrowLeft'||e.key==='ArrowDown')n=pos-passo;else if(e.key==='ArrowRight'||e.key==='ArrowUp')n=pos+passo;
  else if(e.key==='Home')n=0;else if(e.key==='End')n=100;
  if(n===null)return;e.preventDefault();mexeu=true;cancelAnimationFrame(raf);poe(n)});
})();
