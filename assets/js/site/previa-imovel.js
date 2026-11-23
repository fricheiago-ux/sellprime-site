/* PADRÃO DO SITE para abrir um imóvel: popup de prévia (home, resultados da busca e vitrine do proprietário).
   Molde: o painel que já existia na vitrine do proprietário. Ele nasce do cartão clicado e volta para ele ao fechar.
   Conteúdo (pedido do Iago, 22/11/2026): fotos, preço, local, ficha (área, quartos, vagas), o botão
   "Ver página completa", que leva ao login (a página completa só aparece para quem entrou), e o mapa
   (mapa-busca.js) já aberto na cidade do imóvel, com o contorno acendendo em dourado, no espaço livre abaixo do botão.
   Uso: SellPrimePrevia.abrir(imovel, elementoDeOrigem, {eyebrow:'Imóvel 03 / 10', alvo:()=>elementoParaVoltar})
   ou, sem JS extra, um botão com data-previa="id-do-imovel" (o clique é ouvido aqui).
   Precisa de imoveis-data.js (base única). Esc, clique fora e o X fecham; o foco fica preso no painel. */
(()=>{
const LOGIN='cadastro.html?modo=entrar';
const reduzir=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
let modal,painel,fundo,ultimoFoco=null,origemAtual=null,alvoFn=null;

function montar(){
  if(modal)return;
  document.body.insertAdjacentHTML('beforeend',
  '<div class="pv" id="pv" hidden><div class="pv__fundo"></div>'
  +'<div class="pv__painel" role="dialog" aria-modal="true" aria-labelledby="pv-titulo">'
  +'<button type="button" class="pv__fechar" aria-label="Fechar">✕</button>'
  +'<div class="pv__grade"><div class="pv__info">'
  +'<p class="pv__eyebrow" id="pv-eyebrow"></p><h3 class="pv__titulo" id="pv-titulo"></h3>'
  +'<div class="pv__tags" id="pv-tags"></div><p class="pv__preco" id="pv-preco"></p>'
  +'<dl class="pv__ficha" id="pv-ficha"></dl>'
  +'<a class="btn pv__cta" href="'+LOGIN+'">Ver página completa <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>'
  +'<p class="pv__nota">Imóvel, fotos e valores ilustrativos.</p>'
  +'<div class="pv__mapa" id="pv-mapa" aria-label="Onde fica o imóvel"></div>'
  +'</div><div class="pv__galeria" id="pv-galeria"></div></div></div></div>');
  modal=document.getElementById('pv');painel=modal.querySelector('.pv__painel');fundo=modal.querySelector('.pv__fundo');
  modal.querySelector('.pv__fechar').addEventListener('click',fechar);
  fundo.addEventListener('click',fechar);
  addEventListener('keydown',e=>{
    if(modal.hidden)return;
    if(e.key==='Escape'){fechar();return}
    if(e.key==='Tab'){const f=[...painel.querySelectorAll('a[href],button:not([disabled])')];if(!f.length)return;const p=f[0],u=f[f.length-1];
      if(e.shiftKey&&document.activeElement===p){e.preventDefault();u.focus()}else if(!e.shiftKey&&document.activeElement===u){e.preventDefault();p.focus()}}
  });
}
function preencher(d,eyebrow){
  const $=id=>document.getElementById(id);
  $('pv-eyebrow').textContent=eyebrow||d.tipo;
  $('pv-titulo').textContent=d.nome;
  $('pv-tags').innerHTML='<span class="pv__tag">'+esc(d.bairro+', '+d.cidade+(d.uf?' ('+d.uf+')':''))+'</span><span class="pv__tag">'+esc(d.tipo)+'</span>';
  $('pv-preco').textContent=brl(d.preco);
  const f=[['Área',d.area+' m²'],['Quartos',d.quartos||'—'],['Vagas',d.vagas||'Sem vaga']];
  $('pv-ficha').innerHTML=f.map(([a,b])=>'<div><dt>'+a+'</dt><dd>'+esc(b)+'</dd></div>').join('');
  $('pv-galeria').innerHTML=d.imgs.map((s,i)=>'<figure><img src="'+esc(s)+'" alt="'+esc(d.nome+', '+((d.legendas&&d.legendas[i])||'foto '+(i+1)))+'" width="1800" height="1208"'+(i>1?' loading="lazy"':'')+' decoding="async">'
    +'<figcaption>'+esc((d.legendas&&d.legendas[i])||'')+'</figcaption></figure>').join('');
}
function abrir(d,origem,opts={}){
  if(!d)return;montar();
  ultimoFoco=document.activeElement;origemAtual=origem||null;alvoFn=opts.alvo||null;
  preencher(d,opts.eyebrow);
  modal.hidden=false;document.body.style.overflow='hidden';painel.scrollTop=0;
  if(!reduzir&&origem){
    const a=origem.getBoundingClientRect(),b=painel.getBoundingClientRect();
    painel.animate([{transformOrigin:'top left',transform:'translate('+(a.left-b.left)+'px,'+(a.top-b.top)+'px) scale('+(a.width/b.width)+','+(a.height/b.height)+')',opacity:.2,borderRadius:'22px'},{transformOrigin:'top left',transform:'none',opacity:1,borderRadius:'24px'}],{duration:560,easing:'cubic-bezier(.2,.7,.2,1)'});
    fundo.animate([{opacity:0},{opacity:1}],{duration:400});
    painel.querySelector('.pv__grade').animate([{opacity:0},{opacity:0,offset:.35},{opacity:1}],{duration:560});
  }
  modal.querySelector('.pv__fechar').focus({preventScroll:true});
  mostrarMapa(d);
}
/* mapa: criado uma vez (baixa o d3 e os contornos só agora) e reaproveitado nos próximos imóveis */
let mapa=null;
async function mostrarMapa(d){
  if(!window.SellPrimeMapa)return;
  try{
    await new Promise(r=>setTimeout(r,reduzir?0:560)); /* depois de o painel terminar de abrir */
    if(modal.hidden)return;
    if(!mapa)mapa=await SellPrimeMapa.criar(document.getElementById('pv-mapa'));
    mapa.mostrar({direto:true,cidades:[{cidade:d.cidade,uf:d.uf,n:1}],bairro:d.bairro,rotulo:d.bairro+', '+d.cidade});
  }catch(e){document.getElementById('pv-mapa').hidden=true}
}
function fechar(){
  if(!modal||modal.hidden)return;
  const alvo=(alvoFn&&alvoFn())||origemAtual;
  const fim=()=>{modal.hidden=true;document.body.style.overflow='';painel.getAnimations().forEach(x=>x.cancel());fundo.getAnimations().forEach(x=>x.cancel());if(ultimoFoco&&ultimoFoco.focus)ultimoFoco.focus({preventScroll:true})};
  const r=alvo&&alvo.getBoundingClientRect();
  if(reduzir||!r||!r.width){fim();return}
  const b=painel.getBoundingClientRect();
  const anim=painel.animate([{transformOrigin:'top left',transform:'none',opacity:1},{transformOrigin:'top left',transform:'translate('+(r.left-b.left)+'px,'+(r.top-b.top)+'px) scale('+(r.width/b.width)+','+(r.height/b.height)+')',opacity:0}],{duration:420,easing:'cubic-bezier(.5,0,.3,1)',fill:'forwards'});
  fundo.animate([{opacity:1},{opacity:0}],{duration:420,fill:'forwards'});
  anim.onfinish=fim;setTimeout(()=>{if(!modal.hidden)fim()},700); /* segurança, caso o fim da animação não chegue */
}
window.SellPrimePrevia={abrir,fechar};

/* botões com data-previa="id" em qualquer página */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-previa]');if(!b)return;
  const d=(window.SELLPRIME_IMOVEIS||[]).find(x=>x.id===b.dataset.previa);if(!d)return;
  e.preventDefault();
  const card=b.closest('[data-previa-origem]')||b;
  abrir(d,card.querySelector('[data-previa-foto]')||card,{alvo:()=>card.querySelector('[data-previa-foto]')||card});
});
})();
