/* Seção 2 em três tempos (efeito de palavras que somem, do design system Elicyon, refeito com a copy da SellPrime). Os dois blocos de texto
   ficam um sobre o outro; o progresso é medido só no trecho em que o cartão fica fixo (centrado na tela):
   1) "Chega de planilhas de comissão, conversas soltas no WhatsApp, busca incessante por imóveis." fica legível, e some (palavra a palavra, ordem estável);
   2) aparece "Com a SellPrime você tem foco em atendimento de qualidade e mais negócios fechados.", também palavra a palavra;
   3) as palavras de ligação somem e encolhem, e "SellPrime", "qualidade" e "negócios" caminham para uma linha só:
      negócios + qualidade = SellPrime; o "+", o "=" e a casinha do logotipo (que sobe de baixo) entram juntos, no fim.
   Sem JS ou com movimento reduzido: os dois blocos aparecem empilhados, sem palco fixo. */
(()=>{
const sec=document.querySelector('.frase');if(!sec)return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const palco=sec.querySelector('.frase__palco'),b1=sec.querySelector('.frase__b1'),b2=sec.querySelector('.frase__b2');
const hlQ=sec.querySelector('[data-hl="q"]'),hlN=sec.querySelector('[data-hl="n"]'),marca=b2.querySelector('.frase__marca');
const eqN=sec.querySelector('.frase__eq-n'),eqQ=sec.querySelector('.frase__eq-q'),eqMais=sec.querySelector('.frase__eq-mais'),eqIg=sec.querySelector('.frase__eq-ig'),eqLogo=sec.querySelector('.frase__eq-logo'),casa=sec.querySelector('.frase__casa');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
/* "aleatório" estável: mesma ordem a cada visita */
const seed=[.62,.08,.91,.35,.77,.2,.5,.97,.14,.68,.43,.84,.27,.56,.03,.72,.39,.88,.17,.6];
let n=0;const r=()=>seed[n++%seed.length];
const pal1=[...b1.querySelectorAll('.frase__f')].map(el=>({el,r:r()}));                       // bloco 1: só some
const lig=[...b2.querySelectorAll('.frase__f,.frase__k2')].map(el=>({el,r:r(),re:r()}));      // bloco 2: aparece, depois some e encolhe
const fica=[hlQ,hlN,marca].map(el=>({el,r:r()}));                                              // bloco 2: aparece e caminha para a linha final
const vazia=[...b2.querySelectorAll('[data-vazia2]')].map(el=>({el,h:0}));
const fase=(p,a,b)=>clamp((p-a)/(b-a));
function estado(p){return{e1:fase(p,.06,.30),e2:fase(p,.24,.42),u:fase(p,.54,.72),v:fase(p,.58,.84),w:fase(p,.84,.97)}}
let alvo=null;
function medir(){lig.forEach(f=>{f.el.style.width='';f.w=f.el.getBoundingClientRect().width});vazia.forEach(v=>{v.el.style.height='';v.h=v.el.getBoundingClientRect().height});alvo=null}
/* a animação começa um pouco ANTES de o cartão parar (LEAD px antes), quando o texto já está inteiro à vista, e termina no mesmo ponto de antes */
const LEAD=140;
function prog(){const s=sec.getBoundingClientRect(),pad=parseFloat(getComputedStyle(sec).paddingTop)||0,pin=parseFloat(getComputedStyle(palco).top)||0,dist=s.height-pad-palco.offsetHeight;return clamp(((pin-pad)-s.top+LEAD)/Math.max(1,dist+LEAD))}
const entra=(e,rr)=>clamp((e-rr*.55)/.45);
function aplicar(st){
  pal1.forEach(f=>{f.el.style.opacity=(1-entra(st.e1,f.r)).toFixed(3)});
  lig.forEach(f=>{const sai=entra(st.u,f.re);f.el.style.opacity=(entra(st.e2,f.r)*(1-sai)).toFixed(3);if(f.w)f.el.style.width=(f.w*(1-sai)).toFixed(1)+'px'});
  fica.forEach(f=>{f.el.style.opacity=entra(st.e2,f.r).toFixed(3)});
  vazia.forEach(v=>{v.el.style.height=(v.h*(1-st.u)).toFixed(1)+'px'});
}
/* posição de cada peça com o bloco 2 já recolhido e onde ela deve parar na linha final; a peça anda (agora → final), junto com o recolhimento */
function calcularAlvo(){
  aplicar({e1:1,e2:1,u:1});
  const par=(a,b)=>{const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return[y.left-x.left,y.top-x.top]};
  alvo={q:par(hlQ,eqQ),n:par(hlN,eqN),l:par(marca,eqLogo)};
}
function render(){
  const p=prog(),st=estado(p);aplicar(st);
  if(st.v>0&&!alvo){calcularAlvo();aplicar(st)}
  const e3=1-Math.pow(1-st.v,3),mov=st.v>0&&alvo,chegou=st.v>=1;
  const pos=(el,a)=>{el.style.transform=mov?'translate('+(a[0]*e3).toFixed(1)+'px,'+(a[1]*e3).toFixed(1)+'px)':''};
  if(alvo){pos(hlQ,alvo.q);pos(hlN,alvo.n);pos(marca,alvo.l)}
  /* ao chegar, as peças em voo dão lugar às da linha final (mesmo lugar, tamanho e estilo) */
  if(chegou){hlQ.style.opacity=hlN.style.opacity=marca.style.opacity=0}
  eqQ.style.opacity=eqN.style.opacity=eqLogo.firstElementChild.style.opacity=chegou?1:0;
  eqMais.style.opacity=eqIg.style.opacity=st.w.toFixed(3);
  marca.style.setProperty('--ul',(1-clamp(st.v*2.2)).toFixed(3));   // o sublinhado some enquanto a palavra caminha
  const eh=1-Math.pow(1-st.w,3);if(casa){casa.style.opacity=eh.toFixed(3);casa.style.transform='translateY('+((1-eh)*60).toFixed(1)+'%)'}
}
sec.classList.add('frase--js');
const ini=()=>{medir();render()};
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(ini);
addEventListener('scroll',render,{passive:true});addEventListener('resize',ini);
})();
