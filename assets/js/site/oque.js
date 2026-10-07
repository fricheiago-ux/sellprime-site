/* "O que é a SellPrime": ao entrar na tela os nós saem do centro e o núcleo desinclina (mesmo comportamento da referência).
   No toque, tocar num nó faz o mesmo que passar o mouse. */
(()=>{
const g=document.getElementById('orbita');if(!g)return;
const nos=[...g.querySelectorAll('.no')];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function render(){
  const h=innerHeight,r=g.getBoundingClientRect(),spread=reduce?1:clamp((h-r.top)/(h*.75));
  nos.forEach(n=>{const nx=n.offsetLeft+n.offsetWidth/2,ny=n.offsetTop+n.offsetHeight/2;
    n.style.translate=((g.clientWidth/2-nx)*(1-spread)*.72)+'px '+((g.clientHeight/2-ny)*(1-spread)*.72)+'px'});
  g.style.setProperty('--spin',(1-spread)*50+'deg');
  g.style.setProperty('--tilt',(1-spread)*-35+'deg');
  g.style.setProperty('--esc',(.8+spread*.2).toFixed(3));
}
addEventListener('scroll',render,{passive:true});addEventListener('resize',render);render();
nos.forEach(n=>n.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;n.classList.add('is-ativo');setTimeout(()=>n.classList.remove('is-ativo'),1300)}));
})();
