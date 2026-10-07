/* Vitrine de imóveis (página do proprietário). Dados ILUSTRATIVOS em imoveis-data.js.
   - filtros (tipo, cidade, valor, quartos, busca) refazem a lista;
   - modo "Destaques": carrossel em que o cartão do meio cresce e os vizinhos recuam e giram um pouco; setas, arrastar, teclado;
   - modo "Lista": índice tipográfico com pré-visualização da foto;
   - clicar no cartão do meio (ou numa linha da lista) abre um painel que nasce da posição do cartão, com texto, ficha e fotos;
     o botão ↗ leva à página do imóvel (imovel.html?id=...). */
(()=>{
const DADOS=window.SELLPRIME_IMOVEIS||[];
const trilho=document.getElementById('vit-trilho');if(!DADOS.length||!trilho)return;
const $=id=>document.getElementById(id);
const palco=$('vit-palco'),lista=$('vit-lista'),listaw=$('vit-listaw'),prev=$('vit-prev'),pos=$('vit-pos'),vazio=$('vit-vazio'),conta=$('vf-conta'),rodape=$('vit-rodape');
const ant=$('vit-ant'),prox=$('vit-prox'),chips=$('vf-chips');
const selCidade=$('vf-cidade'),selValor=$('vf-valor'),selQuartos=$('vf-quartos'),busca=$('vf-busca');
const modal=$('vmodal'),painel=modal.querySelector('.vmodal__painel');
const reduzir=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const curto=n=>n>=1e6?'R$ '+(n/1e6).toLocaleString('pt-BR',{maximumFractionDigits:2})+' mi':'R$ '+Math.round(n/1e3)+' mil';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const faixas={'':null,a:[0,5e5],b:[5e5,1e6],c:[1e6,2e6],d:[2e6,Infinity]};
const estado={tipo:'Todos',cidade:'',valor:'',quartos:0,busca:'',modo:'destaques'};
let vis=[],ativo=0,arrastou=false,ultimoFoco=null;

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
  trilho.innerHTML=vis.map((d,k)=>'<li class="vcard" data-k="'+k+'"><button type="button" class="vcard__bt" aria-label="'+esc(d.nome+', '+d.cidade+'. Ver detalhes')+'">'
    +'<span class="vcard__foto"><img src="'+esc(d.imgs[0])+'" alt="" width="1200" height="900" decoding="async" draggable="false"'+(k>4?' loading="lazy"':'')+'><span class="vcard__tipo">'+esc(d.tipo)+'</span><span class="vcard__preco">'+curto(d.preco)+'</span></span>'
    +'<span class="vcard__cap"><b>'+esc(d.nome)+'</b><i>'+esc(d.cidade+' · '+d.bairro)+'</i></span></button></li>').join('');
  lista.innerHTML=vis.map((d,k)=>'<li><button type="button" class="vlinha" data-k="'+k+'"><span class="vlinha__n">'+num(k+1)+'</span><span class="vlinha__nome">'+esc(d.nome)+'</span><span class="vlinha__preco">'+curto(d.preco)+'</span><span class="vlinha__local">'+esc(d.cidade+' · '+d.bairro+' · '+d.tipo)+'</span></button></li>').join('');
  if(vis.length)prev.innerHTML='<img src="'+esc(vis[0].imgs[0])+'" alt="" width="1200" height="900">';
  ativo=0;trilho.scrollLeft=0;efeito();
}
function irPara(k,suave=true){const c=trilho.children[k];if(!c)return;trilho.scrollTo({left:c.offsetLeft+c.offsetWidth/2-trilho.clientWidth/2,behavior:suave&&!reduzir?'smooth':'auto'})}

/* ---------- efeito do carrossel ---------- */
let quadro=0;
function efeito(){
  quadro=0;const cs=[...trilho.children];if(!cs.length)return;
  const cx=trilho.scrollLeft+trilho.clientWidth/2;let melhor=0,md=1e9;
  const passo=cs[0].offsetWidth+(parseFloat(getComputedStyle(trilho).columnGap)||24);
  cs.forEach((c,k)=>{
    const d=(c.offsetLeft+c.offsetWidth/2-cx)/passo,a=Math.abs(d);if(a<md){md=a;melhor=k}
    const s=1-.14*clamp(a,0,1.15),r=reduzir?0:clamp(-d*10,-14,14);
    const bt=c.firstElementChild;bt.style.transform='perspective(1100px) rotateY('+r.toFixed(2)+'deg) scale('+s.toFixed(3)+')';
    bt.style.opacity=(1-.35*clamp(a,0,1)).toFixed(3);bt.style.setProperty('--cap',(1-clamp(a*1.4)).toFixed(3));
  });
  if(melhor!==ativo||!pos.textContent){ativo=melhor}
  cs.forEach((c,k)=>c.classList.toggle('is-ativo',k===ativo));
  pos.textContent=num(ativo+1)+' / '+num(vis.length);
  ant.disabled=ativo<=0;prox.disabled=ativo>=vis.length-1;
}
trilho.addEventListener('scroll',()=>{if(!quadro)quadro=requestAnimationFrame(efeito)},{passive:true});
addEventListener('resize',()=>{efeito();if(vis.length)irPara(ativo,false)});
ant.addEventListener('click',()=>irPara(Math.max(0,ativo-1)));
prox.addEventListener('click',()=>irPara(Math.min(vis.length-1,ativo+1)));
trilho.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();irPara(Math.min(vis.length-1,ativo+1))}else if(e.key==='ArrowLeft'){e.preventDefault();irPara(Math.max(0,ativo-1))}});

/* arrastar com o mouse (no toque, o próprio dedo rola) */
let drag=null;
trilho.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,s:trilho.scrollLeft};arrastou=false});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>5&&!arrastou){arrastou=true;trilho.classList.add('arrastando')}if(arrastou)trilho.scrollLeft=drag.s-dx});
addEventListener('pointerup',()=>{if(!drag)return;drag=null;if(arrastou){trilho.classList.remove('arrastando');irPara(ativo);setTimeout(()=>{arrastou=false},0)}});
trilho.addEventListener('click',e=>{
  const li=e.target.closest('.vcard');if(!li||arrastou)return;const k=+li.dataset.k;
  if(k!==ativo){irPara(k);return}
  abrir(k,li.querySelector('.vcard__foto'));
});

/* ---------- modos: destaques / lista ---------- */
document.querySelectorAll('.vit__modos button').forEach(b=>b.addEventListener('click',()=>{
  estado.modo=b.dataset.modo;document.querySelectorAll('.vit__modos button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  palco.hidden=!vis.length||estado.modo!=='destaques';listaw.hidden=!vis.length||estado.modo!=='lista';pos.hidden=estado.modo!=='destaques';
  if(estado.modo==='destaques'){efeito();irPara(ativo,false)}
}));
function previa(k){const d=vis[k];if(!d)return;const im=prev.querySelector('img');if(im&&im.getAttribute('src')!==d.imgs[0]){im.style.opacity=0;setTimeout(()=>{im.src=d.imgs[0];im.style.opacity=1},120)}}
lista.addEventListener('mouseover',e=>{const b=e.target.closest('.vlinha');if(b)previa(+b.dataset.k)});
lista.addEventListener('focusin',e=>{const b=e.target.closest('.vlinha');if(b)previa(+b.dataset.k)});
lista.addEventListener('click',e=>{const b=e.target.closest('.vlinha');if(b)abrir(+b.dataset.k,b)});

/* ---------- painel de detalhes ---------- */
function preencher(k){
  const d=vis[k];
  $('vm-eyebrow').textContent='Imóvel '+num(k+1)+' / '+num(vis.length);$('vm-titulo').textContent=d.nome;$('vm-desc').textContent=d.descricao;
  $('vm-tags').innerHTML='<a class="vm__ir" id="vm-ir" href="imovel.html?id='+encodeURIComponent(d.id)+'" aria-label="Ver a página do imóvel '+esc(d.nome)+'">↗</a><span class="vm__tag">'+esc(d.cidade+' · '+d.bairro)+'</span><span class="vm__tag">'+esc(d.tipo)+'</span>';
  $('vm-preco').textContent=brl(d.preco);
  $('vm-destaques').innerHTML=d.destaques.map(x=>'<li>'+esc(x)+'</li>').join('');
  const f=[['Área',d.area+' m²']];if(d.quartos)f.push(['Quartos',d.quartos]);if(d.suites)f.push(['Suítes',d.suites]);if(d.vagas)f.push(['Vagas',d.vagas]);
  $('vm-ficha').innerHTML=f.map(([a,b])=>'<div><dt>'+a+'</dt><dd>'+b+'</dd></div>').join('');
  $('vm-galeria').innerHTML=d.imgs.map((s,i)=>'<figure><img src="'+esc(s)+'" alt="'+esc(d.nome+', foto '+(i+1))+'" width="1200" height="900" loading="lazy" decoding="async"><figcaption>'+esc(d.nome+' · '+d.cidade)+'</figcaption></figure>').join('');
}
function abrir(k,origem){
  ultimoFoco=document.activeElement;preencher(k);
  modal.hidden=false;document.body.style.overflow='hidden';painel.scrollTop=0;
  const a=origem.getBoundingClientRect(),b=painel.getBoundingClientRect();
  if(!reduzir){
    painel.animate([{transformOrigin:'top left',transform:'translate('+(a.left-b.left)+'px,'+(a.top-b.top)+'px) scale('+(a.width/b.width)+','+(a.height/b.height)+')',opacity:.2,borderRadius:'22px'},{transformOrigin:'top left',transform:'none',opacity:1,borderRadius:'24px'}],{duration:560,easing:'cubic-bezier(.2,.7,.2,1)'});
    modal.querySelector('.vmodal__fundo').animate([{opacity:0},{opacity:1}],{duration:400});
    painel.querySelector('.vm').animate([{opacity:0},{opacity:0,offset:.35},{opacity:1}],{duration:560});
  }
  modal.dataset.k=k;modal.querySelector('.vmodal__fechar').focus({preventScroll:true});
}
function fechar(){
  if(modal.hidden)return;
  const k=+modal.dataset.k,alvo=estado.modo==='destaques'?trilho.children[k]?.querySelector('.vcard__foto'):lista.children[k]?.firstElementChild;
  const fim=()=>{modal.hidden=true;document.body.style.overflow='';if(ultimoFoco&&ultimoFoco.focus)ultimoFoco.focus({preventScroll:true})};
  if(reduzir||!alvo){fim();return}
  const a=alvo.getBoundingClientRect(),b=painel.getBoundingClientRect();
  const anim=painel.animate([{transformOrigin:'top left',transform:'none',opacity:1},{transformOrigin:'top left',transform:'translate('+(a.left-b.left)+'px,'+(a.top-b.top)+'px) scale('+(a.width/b.width)+','+(a.height/b.height)+')',opacity:0}],{duration:420,easing:'cubic-bezier(.5,0,.3,1)',fill:'forwards'});
  modal.querySelector('.vmodal__fundo').animate([{opacity:1},{opacity:0}],{duration:420,fill:'forwards'});
  anim.onfinish=()=>{fim();painel.getAnimations().forEach(x=>x.cancel());modal.querySelector('.vmodal__fundo').getAnimations().forEach(x=>x.cancel())};
}
modal.querySelector('.vmodal__fechar').addEventListener('click',fechar);
$('vm-cta').addEventListener('click',()=>{modal.hidden=true;document.body.style.overflow=''});
modal.querySelector('.vmodal__fundo').addEventListener('click',fechar);
addEventListener('keydown',e=>{
  if(modal.hidden)return;
  if(e.key==='Escape'){fechar();return}
  if(e.key==='Tab'){const f=[...painel.querySelectorAll('a[href],button:not([disabled])')];if(!f.length)return;const p=f[0],u=f[f.length-1];
    if(e.shiftKey&&document.activeElement===p){e.preventDefault();u.focus()}else if(!e.shiftKey&&document.activeElement===u){e.preventDefault();p.focus()}}
});

aplicar();
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>{efeito();irPara(0,false)});
})();
