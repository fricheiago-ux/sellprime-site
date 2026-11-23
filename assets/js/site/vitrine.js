/* Vitrine de imóveis (página do proprietário). Dados ILUSTRATIVOS em imoveis-data.js.
   - filtros (tipo, cidade, valor, quartos, busca) refazem a lista;
   - modo "Destaques": duas fileiras de cartões que passam sozinhas em sentidos opostos (param com o mouse por cima);
   - modo "Lista": índice tipográfico com pré-visualização da foto;
   - clicar num cartão (ou numa linha da lista) abre o popup de prévia padrão do site (previa-imovel.js),
     que nasce da posição do cartão. Dados: base única (imoveis-base.js, lida por imoveis-data.js). */
(()=>{
const DADOS=window.SELLPRIME_IMOVEIS||[];
const trilho=document.getElementById('vit-trilho');if(!DADOS.length||!trilho)return;
const $=id=>document.getElementById(id);
const palco=$('vit-palco'),lista=$('vit-lista'),listaw=$('vit-listaw'),prev=$('vit-prev'),pos=$('vit-pos'),vazio=$('vit-vazio'),conta=$('vf-conta'),rodape=$('vit-rodape');
const chips=$('vf-chips');
const selCidade=$('vf-cidade'),selValor=$('vf-valor'),selQuartos=$('vf-quartos'),busca=$('vf-busca');
const reduzir=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const curto=n=>n>=1e6?'R$ '+(n/1e6).toLocaleString('pt-BR',{maximumFractionDigits:2})+' mi':'R$ '+Math.round(n/1e3)+' mil';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const faixas={'':null,a:[0,5e5],b:[5e5,1e6],c:[1e6,2e6],d:[2e6,Infinity]};
const estado={tipo:'Todos',cidade:'',valor:'',quartos:0,busca:'',modo:'destaques'};
let vis=[],ultimoFoco=null;

/* ---------- filtros ---------- */
const tipos=['Todos',...new Set(DADOS.map(d=>d.tipo))];
chips.innerHTML=tipos.map(t=>'<button type="button" class="vf__chip" data-tipo="'+esc(t)+'" aria-pressed="'+(t==='Todos')+'">'+esc(t)+'</button>').join('');
[...new Set(DADOS.map(d=>d.cidade))].sort((a,b)=>a.localeCompare(b,'pt')).forEach(c=>selCidade.insertAdjacentHTML('beforeend','<option>'+esc(c)+'</option>'));
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function filtrar(){
  const f=faixas[estado.valor],q=norm(estado.busca.trim());
  return DADOS.filter(d=>(estado.tipo==='Todos'||d.tipo===estado.tipo)&&(!estado.cidade||d.cidade===estado.cidade)&&(!f||(d.preco>=f[0]&&d.preco<f[1]))
    &&(!estado.quartos||d.quartos>=estado.quartos)&&(!q||norm(d.nome+' '+d.bairro+' '+d.cidade+' '+d.tipo).includes(q)));
}
chips.addEventListener('click',e=>{const b=e.target.closest('.vf__chip');if(!b)return;estado.tipo=b.dataset.tipo;chips.querySelectorAll('.vf__chip').forEach(c=>c.setAttribute('aria-pressed',c===b));aplicar()});
selCidade.addEventListener('change',()=>{estado.cidade=selCidade.value;aplicar()});
selValor.addEventListener('change',()=>{estado.valor=selValor.value;aplicar()});
selQuartos.addEventListener('change',()=>{estado.quartos=+selQuartos.value;aplicar()});
busca.addEventListener('input',()=>{estado.busca=busca.value;aplicar()});
function limpar(){Object.assign(estado,{tipo:'Todos',cidade:'',valor:'',quartos:0,busca:''});selCidade.value='';selValor.value='';selQuartos.value='0';busca.value='';chips.querySelectorAll('.vf__chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.tipo==='Todos'));aplicar()}
$('vf-limpar').addEventListener('click',limpar);$('vit-limpar2').addEventListener('click',limpar);

/* ---------- montagem ---------- */
const num=n=>String(n).padStart(2,'0');
function aplicar(){
  vis=filtrar();
  conta.textContent=vis.length===1?'1 imóvel':vis.length+' imóveis';
  const vz=!vis.length;vazio.hidden=!vz;palco.hidden=vz||estado.modo!=='destaques';listaw.hidden=vz||estado.modo!=='lista';rodape.hidden=false;
  fileiras(vis);
  lista.innerHTML=vis.map((d,k)=>'<li><button type="button" class="vlinha" data-k="'+k+'"><span class="vlinha__n">'+num(k+1)+'</span><span class="vlinha__nome">'+esc(d.nome)+'</span><span class="vlinha__preco">'+curto(d.preco)+'</span><span class="vlinha__local">'+esc(d.cidade+' · '+d.bairro+' · '+d.tipo)+'</span></button></li>').join('');
  if(vis.length)prev.innerHTML='<img src="'+esc(vis[0].imgs[0])+'" alt="" width="1200" height="900">';
}
/* ---------- destaques: duas fileiras que passam sozinhas, uma para cada lado (molde da seção de depoimentos da
   referência Spectra, pedido do Iago em 22/11/2026). Cada fileira repete os imóveis até cobrir duas telas e anda
   em loop (CSS em vitrine-trilhas.css, velocidade constante calculada aqui). Para com o mouse por cima ou com o
   foco do teclado; no toque, tocar no cartão abre a prévia. ---------- */
const VEL=[52,46];/* px por segundo: a de cima um pouco mais rápida, como na referência (40 s e 45 s) */
function cartao(d,k){return '<li class="vt__item"><button type="button" class="vt__card" data-k="'+k+'" aria-label="'+esc(d.nome+', '+d.cidade+'. Ver prévia')+'">'
  +'<span class="vt__foto"><img src="'+esc((d.thumbs||d.imgs)[0])+'" alt="" width="800" height="600" decoding="async" loading="lazy" draggable="false"><span class="vt__tipo">'+esc(d.tipo)+'</span><span class="vt__preco">'+curto(d.preco)+'</span></span>'
  +'<span class="vt__cap"><b>'+esc(d.nome)+'</b><i>'+esc(d.cidade+' · '+d.bairro)+'</i></span></button></li>'}
function fileiras(lista){
  trilho.innerHTML='';if(!lista.length)return;
  const idx=lista.map((d,k)=>k);
  [idx,idx.slice(Math.ceil(idx.length/2)).concat(idx.slice(0,Math.ceil(idx.length/2)))].forEach((ordem,f)=>{
    const li=document.createElement('li');li.className='vt__fileira vt__fileira--'+(f?'dir':'esq');
    const faixa=document.createElement('ul');faixa.className='vt__faixa';
    let base=[];while(base.length<Math.max(8,ordem.length))base=base.concat(ordem);
    const html=base.map(k=>cartao(lista[k],k)).join('');
    faixa.innerHTML=html+html.replace(/<button /g,'<button tabindex="-1" aria-hidden="true" ');/* 2ª metade: cópia só visual, para o loop emendar */
    li.appendChild(faixa);trilho.appendChild(li);
  });
  requestAnimationFrame(velocidade);
}
function velocidade(){[...trilho.querySelectorAll('.vt__faixa')].forEach((u,f)=>{const meia=u.scrollWidth/2;u.style.setProperty('--dur',(meia/VEL[f]).toFixed(1)+'s')})}
addEventListener('resize',()=>{clearTimeout(velocidade.t);velocidade.t=setTimeout(velocidade,200)});
let ultimaOrigem=null;
trilho.addEventListener('click',e=>{const b=e.target.closest('.vt__card');if(!b)return;ultimaOrigem=b.querySelector('.vt__foto');abrir(+b.dataset.k,ultimaOrigem)});

/* ---------- modos: destaques / lista ---------- */
document.querySelectorAll('.vit__modos button').forEach(b=>b.addEventListener('click',()=>{
  estado.modo=b.dataset.modo;document.querySelectorAll('.vit__modos button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  palco.hidden=!vis.length||estado.modo!=='destaques';listaw.hidden=!vis.length||estado.modo!=='lista';
  if(estado.modo==='destaques')velocidade();
}));
function previa(k){const d=vis[k];if(!d)return;const im=prev.querySelector('img');if(im&&im.getAttribute('src')!==d.imgs[0]){im.style.opacity=0;setTimeout(()=>{im.src=d.imgs[0];im.style.opacity=1},120)}}
lista.addEventListener('mouseover',e=>{const b=e.target.closest('.vlinha');if(b)previa(+b.dataset.k)});
lista.addEventListener('focusin',e=>{const b=e.target.closest('.vlinha');if(b)previa(+b.dataset.k)});
lista.addEventListener('click',e=>{const b=e.target.closest('.vlinha');if(b)abrir(+b.dataset.k,b)});

/* ---------- prévia do imóvel: popup padrão do site (previa-imovel.js), que nasce do cartão e volta para ele ---------- */
function abrir(k,origem){
  const d=vis[k];if(!d||!window.SellPrimePrevia)return;
  SellPrimePrevia.abrir(d,origem,{eyebrow:'Imóvel '+num(k+1)+' / '+num(vis.length),
    alvo:()=>estado.modo==='destaques'?ultimaOrigem:lista.children[k]?.firstElementChild});
}

aplicar();
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(velocidade);
})();
