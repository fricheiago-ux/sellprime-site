/* PROPRIETÁRIO, primeira seção: corredor de imóveis. Os cartões avançam em 3D na direção de quem olha, em loop;
   começa num mergulho rápido (2600 px/s) e desacelera em 1,8 s até um passeio calmo. A legenda mostra o imóvel que
   está passando. Pausa sozinho fora da tela ou com a aba escondida; botão de pausa para quem quiser parar.
   Dados: imoveis-base.js, a base única (só imóveis à venda; a SellPrime é só venda). */
(()=>{
const D=(window.SELLPRIME_BASE||[]).filter(i=>i.fin==='venda'),sec=document.querySelector('.corr'),palco=document.getElementById('corr-palco');
const leg=document.getElementById('corr-leg'),num=document.getElementById('corr-num'),nome=document.getElementById('corr-nome'),local=document.getElementById('corr-local');
const reduzido=matchMedia('(prefers-reduced-motion:reduce)').matches;
const DIST=4200;                 /* profundidade do corredor (px) */
let largo=innerWidth>=900;
/* um cartão por imóvel à venda (a foto principal), alternando parede esquerda e direita; se houver menos de 16,
   completa com a segunda foto dos primeiros */
const fotos=D.map((i,n)=>({i,n,f:i.fotos[0]}));for(let n=0;fotos.length<16&&n<D.length;n++)fotos.push({i:D[n],n,f:D[n].fotos[1]||D[n].fotos[0]});
const cards=fotos.map((o,k)=>{
  const el=document.createElement('div');el.className='corr__card';
  el.innerHTML=`<img src="assets/img/imoveis/${o.i.id}/${o.f}-thumb.webp?v=1" alt="" decoding="async">`;
  palco.appendChild(el);
  const lado=k%2?1:-1;
  return {el,o,lado,z:-k*(DIST/fotos.length),x:0,y:0,r:0,sx:(k*37%9)/9,sy:(k*53%7)/7};
});
const posiciona=()=>{largo=innerWidth>=900;const w=innerWidth;cards.forEach(c=>{
  if(largo){c.x=c.lado*(w*.23+c.sx*w*.08);c.y=(c.sy-.5)*170;c.r=-c.lado*22}
  else{c.x=c.lado*(w*.2+c.sx*w*.06);c.y=(c.sy-.5)*90;c.r=-c.lado*14}
})};
posiciona();addEventListener('resize',posiciona);
let atual=-1;
const legenda=c=>{const n=c.o.n;if(n===atual)return;atual=n;leg.classList.add('is-troca');setTimeout(()=>{num.textContent=String(n+1).padStart(2,'0')+' / '+String(D.length).padStart(2,'0');nome.textContent=c.o.i.titulo;local.textContent=c.o.i.bairro+', '+c.o.i.cidade+' ('+c.o.i.uf+')';leg.classList.remove('is-troca')},200)};
const desenha=()=>{let melhor=null;cards.forEach(c=>{
  const z=c.z;let a=1;
  if(z<-DIST+900)a=Math.max(0,(z+DIST)/900);       /* nasce no fundo */
  if(z>150)a=Math.max(0,1-(z-150)/350);             /* some antes de passar pela câmera */
  c.el.style.opacity=a.toFixed(3);
  c.el.style.transform=`translate3d(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${c.r}deg)`;
  if(z<150&&z>-900&&(!melhor||z>melhor.z))melhor=c;
});if(melhor)legenda(melhor)};
/* velocidade: abre rápido (mergulho) e desacelera até um cruzeiro calmo */
const RAPIDO=2600,CRUZEIRO=largo?150:110,ABERTURA=1800;
let t0=null,ult=null,pausado=false,visivel=true,rodando=false;
const passo=t=>{rodando=false;if(pausado||!visivel||document.hidden)return;
  if(t0===null){t0=t;ult=t}
  const dt=Math.min(.05,(t-ult)/1000);ult=t;
  const k=Math.min(1,(t-t0)/ABERTURA),e=1-Math.pow(1-k,3);
  const v=RAPIDO+(CRUZEIRO-RAPIDO)*e;
  cards.forEach(c=>{c.z+=v*dt;if(c.z>500)c.z-=DIST});
  desenha();
  if(!sec.classList.contains('is-texto')&&t-t0>650)sec.classList.add('is-texto');
  rodando=true;requestAnimationFrame(passo)};
const liga=()=>{if(!rodando&&!pausado&&visivel&&!document.hidden){ult=performance.now();rodando=true;requestAnimationFrame(t=>{ult=t;passo(t)})}};
/* começa com os cartões "atrás", para o mergulho inicial atravessar o corredor */
cards.forEach(c=>c.z-=DIST*.35);cards.forEach(c=>{if(c.z<-DIST)c.z+=DIST});
if(reduzido){cards.forEach((c,k)=>c.z=-300-k*220);desenha();sec.classList.add('is-texto');document.getElementById('corr-pausa').hidden=true;return}
desenha();
new IntersectionObserver(es=>{visivel=es[0].isIntersecting;liga()}).observe(sec);
document.addEventListener('visibilitychange',liga);
const bp=document.getElementById('corr-pausa');
bp.addEventListener('click',()=>{pausado=!pausado;bp.setAttribute('aria-pressed',String(pausado));bp.setAttribute('aria-label',pausado?'Continuar a animação':'Pausar a animação');bp.innerHTML=pausado?'<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9-5.5z"/></svg>':'<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" rx="1"/><rect x="8.5" y="1" width="3.5" height="12" rx="1"/></svg>';liga()});
liga();
})();
