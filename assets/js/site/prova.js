/* Números da rede: contam de 0 até o valor quando a linha entra na tela (2 s, uma vez), como na referência.
   ATENÇÃO: os valores em data-alvo no HTML são ILUSTRATIVOS. Trocar pelos números reais antes de publicar. */
(()=>{
const lista=document.getElementById('prova-nums');if(!lista)return;
const els=[...lista.querySelectorAll('.prova__n')];
const fmt=n=>Math.round(n).toLocaleString('pt-BR');
const final=e=>fmt(+e.dataset.alvo)+(e.dataset.sufixo||'');
if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){els.forEach(e=>e.textContent=final(e));return}
const io=new IntersectionObserver(es=>{if(!es[0].isIntersecting)return;io.disconnect();
  const t0=performance.now(),dur=2000;
  (function passo(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
    els.forEach(el=>el.textContent=fmt(+el.dataset.alvo*e)+(p<1?'':(el.dataset.sufixo||'')));
    if(p<1)requestAnimationFrame(passo)})(t0)},{threshold:.5});
io.observe(lista);
})();
