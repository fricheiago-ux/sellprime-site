/* Cabeçalho único: troca a cor ao rolar, marca a página atual, abre os submenus e o menu do celular.
   Submenu: com mouse, abre ao passar por cima do grupo (e fecha com uma folga de 180 ms, para não sumir no caminho);
   no toque e no teclado, abre pela setinha. Esc ou clique fora fecham. */
(()=>{
/* cor do cabeçalho: azul no topo, creme depois de rolar (classe .is-rolado, estilos em header.css) */
const cab=document.querySelector('.site-header');
if(cab){const cor=()=>cab.classList.toggle('is-rolado',scrollY>24);addEventListener('scroll',cor,{passive:true});cor()}
const pag=(location.pathname.split('/').pop()||'index.html').replace('.html','')||'index';
document.querySelectorAll('[data-pagina]').forEach(g=>{
  if(!g.dataset.pagina.split(' ').includes(pag))return;
  g.classList.add('is-atual');
  const l=g.querySelector('.nav__link,.mp__titulo');if(l&&l.getAttribute('href')===pag+'.html')l.setAttribute('aria-current','page');
});

const grupos=[...document.querySelectorAll('.nav__grupo')].filter(g=>g.querySelector('.nav__abre'));
const fecharTodos=(menos)=>grupos.forEach(g=>{if(g!==menos){g.classList.remove('is-aberto');g.querySelector('.nav__abre').setAttribute('aria-expanded','false')}});
const abrir=g=>{fecharTodos(g);g.classList.add('is-aberto');g.querySelector('.nav__abre').setAttribute('aria-expanded','true')};
grupos.forEach(g=>{
  const bt=g.querySelector('.nav__abre');let t;
  bt.addEventListener('click',()=>g.classList.contains('is-aberto')?fecharTodos():abrir(g));
  g.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse')return;clearTimeout(t);abrir(g)});
  g.addEventListener('pointerleave',e=>{if(e.pointerType!=='mouse')return;t=setTimeout(()=>{g.classList.remove('is-aberto');bt.setAttribute('aria-expanded','false')},180)});
  g.addEventListener('focusout',e=>{if(!g.contains(e.relatedTarget)){g.classList.remove('is-aberto');bt.setAttribute('aria-expanded','false')}});
  g.querySelectorAll('.sub a').forEach(a=>a.addEventListener('click',()=>fecharTodos()));
});
document.addEventListener('click',e=>{if(!e.target.closest('.nav__grupo'))fecharTodos()});
let y0=scrollY;addEventListener('scroll',()=>{if(Math.abs(scrollY-y0)>40){y0=scrollY;fecharTodos()}},{passive:true});addEventListener('scroll',()=>{if(!grupos.some(g=>g.classList.contains('is-aberto')))y0=scrollY},{passive:true});
addEventListener('keydown',e=>{if(e.key!=='Escape')return;const g=grupos.find(x=>x.classList.contains('is-aberto'));if(g){fecharTodos();g.querySelector('.nav__abre').focus()}});

/* menu do celular */
const btn=document.querySelector('.menu-btn'),painel=document.getElementById('menu-painel');
if(!btn||!painel)return;
const fechar=()=>{painel.hidden=true;btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label','Abrir menu');document.body.style.overflow=''};
const abrirP=()=>{painel.hidden=false;btn.setAttribute('aria-expanded','true');btn.setAttribute('aria-label','Fechar menu');document.body.style.overflow='hidden'};
btn.addEventListener('click',()=>painel.hidden?abrirP():fechar());
painel.addEventListener('click',e=>{if(e.target.closest('a'))fechar()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!painel.hidden){fechar();btn.focus()}});
matchMedia('(min-width:900px)').addEventListener('change',e=>{if(e.matches)fechar()});
})();
