/* Passo a passo: ao entrar na tela, os passos acendem em sequência (nó, linha e texto); no fim tudo vira ouro. */
(()=>{
const lista=document.getElementById('passos-lista');if(!lista)return;
const passos=[...lista.querySelectorAll('.passo')],ATRASO=1250;
const todos=()=>{passos.forEach(p=>p.classList.add('is-active'));lista.classList.add('is-complete')};
if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){todos();return}
const io=new IntersectionObserver(es=>{if(!es[0].isIntersecting)return;io.disconnect();
  passos.forEach((p,i)=>setTimeout(()=>p.classList.add('is-active'),i*ATRASO));
  setTimeout(()=>lista.classList.add('is-complete'),(passos.length-1)*ATRASO+1500)},{threshold:.35});
io.observe(lista);
})();
