/* Home: busca sem trocar de página. Clicar num cartão abre o popup de prévia padrão (previa-imovel.js). A SellPrime é só venda (decisão do Iago, 22/11/2026): imóveis de aluguel do banco
   de exemplos ficam de fora da home e não há escolha Comprar/Alugar. Ao buscar, os resultados (mapa + cartões) entram logo abaixo da primeira dobra e as demais seções continuam abaixo deles;
   a primeira dobra (filtros e foto) não muda. "Limpar busca" devolve a home padrão. O endereço (URL) não muda. */
(()=>{
const D=(window.SELLPRIME_BASE||[]).filter(i=>i.fin==='venda'),$=s=>document.querySelector(s);
const form=$('#busca');if(!form)return;
const padrao=$('#home-padrao'),res=$('#resultados'),grade=$('#res-grade'),cont=$('#res-cont'),chips=$('#res-chips'),vazio=$('#res-vazio');
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const brl=n=>'R$ '+Number(n).toLocaleString('pt-BR');
const preco=i=>brl(i.preco)+(i.fin==='aluguel'?' por mês':'');
const plural=(n,um,varios)=>n+' '+(n===1?um:varios);

const cartao=(i,n)=>`<article class="cartao" style="--i:${n}" data-previa-origem>
<button class="cartao__abrir" type="button" data-previa="${i.id}" aria-label="Ver prévia: ${esc(i.titulo)}"></button>
<div class="cartao__foto" data-previa-foto><img src="assets/img/imoveis/${i.id}/${i.fotos[0]}-thumb.webp?v=1" alt="${esc(i.titulo)}, ${esc(i.bairro)}, ${esc(i.cidade)}" width="800" height="537" loading="lazy" decoding="async"><span class="cartao__selo">${i.fin==='aluguel'?'Aluguel':'Venda'}</span></div>
<div class="cartao__corpo"><p class="cartao__preco">${preco(i)}</p><h3 class="cartao__titulo">${esc(i.titulo)}</h3><p class="cartao__local">${esc(i.bairro)}, ${esc(i.cidade)} (${i.uf})</p>
<ul class="cartao__ficha"><li>${i.area} m²</li><li>${plural(i.quartos,'quarto','quartos')}</li><li>${i.vagas?plural(i.vagas,'vaga','vagas'):'Sem vaga'}</li></ul></div></article>`;
const pinta=(el,lista)=>{el.classList.remove('grade--entra');el.innerHTML=lista.map(cartao).join('');void el.offsetWidth;el.classList.add('grade--entra')};

/* vitrine padrão (provisória até a seção de destaques ser desenhada) */
const dest=$('#destaques-grade');if(dest)pinta(dest,D.slice(0,8));

/* opções que dependem dos dados */
const dl=$('#busca-lugares');
if(dl)dl.innerHTML=[...new Set(D.flatMap(i=>[i.cidade,i.bairro+', '+i.cidade,(window.SellPrimeMapa&&SellPrimeMapa.NOMEUF[i.uf])||i.uf]))].sort((a,b)=>a.localeCompare(b,'pt-BR')).map(v=>`<option value="${esc(v)}">`).join('');
const FAIXAS=[500000,800000,1200000,2500000,5000000];
const selPreco=form.elements.preco;
const faixas=()=>{selPreco.innerHTML='<option value="">Qualquer valor</option>'+FAIXAS.map(v=>`<option value="${v}">Até ${brl(v)}</option>`).join('')};
faixas();

/* mais filtros */
const btnMais=$('#busca-mais-btn'),mais=$('#busca-mais');
btnMais.addEventListener('click',()=>{const abre=mais.hidden;mais.hidden=!abre;btnMais.setAttribute('aria-expanded',String(abre));btnMais.querySelector('span').textContent=abre?'Menos filtros':'Mais filtros'});

/* mapa dos resultados (mapa-busca.js): criado na primeira busca, quando a área de resultados aparece */
const NOMEUF=(window.SellPrimeMapa&&SellPrimeMapa.NOMEUF)||{};
let mapa=null;
const mostrarMapa=async(lista,bairro)=>{
  if(!window.SellPrimeMapa)return;
  const g={};lista.forEach(i=>{const k=i.cidade+'|'+i.uf;g[k]=g[k]||{cidade:i.cidade,uf:i.uf,n:0};g[k].n++});
  try{if(!mapa)mapa=await SellPrimeMapa.criar($('#res-mapa'));
    mapa.mostrar({cidades:Object.values(g),bairro,rotulo:bairro&&lista.length?bairro+', '+lista[0].cidade+' · '+plural(lista.length,'imóvel','imóveis'):''})}
  catch(err){$('#res-mapa').hidden=true}
};

const buscar=()=>{
  const e=form.elements,f={onde:norm(e.onde.value),tipo:e.tipo.value,quartos:+e.quartos.value||0,preco:+e.preco.value||0,area:+e.area.value||0,vagas:+e.vagas.value||0,pet:e.pet.checked,varanda:e.varanda.checked};
  const palavras=f.onde.split(/[\s,]+/).filter(Boolean);
  const lista=D.filter(i=>{
    const alvo=norm([i.bairro,i.cidade,i.uf,NOMEUF[i.uf]||'',i.titulo].join(' '));
    return palavras.every(p=>alvo.includes(p))&&(!f.tipo||i.tipo===f.tipo)&&i.quartos>=f.quartos&&(!f.preco||i.preco<=f.preco)&&(!f.area||i.area<=f.area)&&i.vagas>=f.vagas&&(!f.pet||i.pet)&&(!f.varanda||i.varanda);
  });
  const c=[];
  if(e.onde.value.trim())c.push(e.onde.value.trim());
  if(f.tipo)c.push(f.tipo);
  if(f.quartos)c.push(f.quartos+'+ quartos');
  if(f.preco)c.push('Até '+brl(f.preco));
  if(f.area)c.push('Até '+f.area+' m²');
  if(f.vagas)c.push(f.vagas+'+ vagas');
  if(f.pet)c.push('Aceita pet');
  if(f.varanda)c.push('Com varanda');
  chips.innerHTML=c.map(t=>`<li class="chip">${esc(t)}</li>`).join('');
  cont.textContent=lista.length?plural(lista.length,'imóvel encontrado','imóveis encontrados'):'Nenhum imóvel encontrado';
  vazio.hidden=lista.length>0;
  pinta(grade,lista);
  res.hidden=false; /* as seções da home continuam abaixo dos resultados (pedido do Iago, 23/11/2026) */
  /* bairro: quando todos os resultados são do mesmo bairro e ele foi digitado, o selo do mapa diz o bairro */
  const b=lista.length&&lista.every(i=>i.bairro===lista[0].bairro)&&f.onde&&norm(lista[0].bairro).split(' ').every(p=>f.onde.includes(p))?lista[0].bairro:'';
  mostrarMapa(lista,b);
  res.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
};
form.addEventListener('submit',ev=>{ev.preventDefault();buscar()});
/* se alguém buscar antes de o script carregar, o navegador manda o formulário pelo endereço (?onde=...):
   aqui a busca é refeita com esses valores e o endereço volta ao normal */
{const q=new URLSearchParams(location.search);if(q.has('onde')){['onde','tipo','quartos','area','vagas'].forEach(n=>{if(form.elements[n])form.elements[n].value=q.get(n)||''});history.replaceState(null,'',location.pathname);buscar()}}
/* categorias: cada cartão mostra quantos imóveis tem e, ao clicar, aplica o filtro e busca */
const passa=c=>D.filter(i=>(!c.dataset.catTipo||i.tipo===c.dataset.catTipo)&&(c.dataset.catExtra!=='varanda'||i.varanda)).length;
document.querySelectorAll('.cat__btn').forEach(c=>{
  const n=passa(c),alvo=c.querySelector('[data-cat-conta]');if(alvo)alvo.textContent=plural(n,'imóvel','imóveis');
  c.addEventListener('click',()=>{
    form.reset();
    faixas();
    form.elements.tipo.value=c.dataset.catTipo;
    if(c.dataset.catExtra==='varanda')form.elements.varanda.checked=true;
    buscar();
  });
});
$('#res-limpar').addEventListener('click',()=>{form.reset();faixas();res.hidden=true;scrollTo({top:0,behavior:'smooth'})});
})();
