/* Página de um imóvel (exemplo ilustrativo): lê ?id= e preenche com os dados de imoveis-data.js.
   Selo giratório "Imóvel prime" no canto da foto (molde do selo do site do Caio: o texto gira, a casinha fica parada).
   "Onde fica": o mapa animado voa do Brasil até a cidade quando aparece na tela.
   Os cartões de "Outros imóveis" abrem o popup de prévia padrão (previa-imovel.js). */
(()=>{
const DADOS=window.SELLPRIME_IMOVEIS||[],corpo=document.getElementById('im-corpo');if(!corpo)return;
const id=new URLSearchParams(location.search).get('id'),d=DADOS.find(x=>x.id===id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
if(!d){corpo.innerHTML='<div class="im__nao"><h1 class="im__titulo">Esse imóvel não está na vitrine.</h1><a class="btn" href="proprietario.html#vitrine">Voltar à vitrine</a></div>';document.title='Imóvel não encontrado | SellPrime';return}
document.title=d.nome+' | SellPrime';
const f=[['Área',d.area+' m²']];if(d.quartos)f.push(['Quartos',d.quartos]);if(d.suites)f.push(['Suítes',d.suites]);if(d.vagas)f.push(['Vagas',d.vagas]);
const outros=DADOS.filter(x=>x.id!==d.id).slice(0,3);
const cfg=window.SELLPRIME||{},zap='https://wa.me/'+cfg.whatsapp+'?text='+encodeURIComponent('Olá! Vi a página de exemplo "'+d.nome+'" na SellPrime e quero anunciar o meu imóvel.');
corpo.innerHTML=
 '<figure class="im__capa"><img src="'+esc(d.imgs[0])+'" alt="'+esc(d.nome+', '+d.cidade)+'" width="1200" height="900" fetchpriority="high">'+'<span class="selo" aria-hidden="true"><svg class="selo__disco" viewBox="0 0 300 300"><defs><path id="selo-trilha" d="M150,150 m-112,0 a112,112 0 1,1 224,0 a112,112 0 1,1 -224,0"/></defs>'+'<text class="selo__texto"><textPath href="#selo-trilha" textLength="703.7" lengthAdjust="spacing">IMÓVEL PRIME • IMÓVEL PRIME • </textPath></text></svg>'+'<img class="selo__casa" src="assets/img/marca/logo-casa-petrol.svg" alt="" width="40" height="39"></span></figure>'
+'<div class="im__topo"><div><h1 class="im__titulo">'+esc(d.nome)+'</h1><p class="im__local">'+esc(d.cidade+' · '+d.bairro+' · '+d.tipo)+'</p></div><p class="im__preco">'+brl(d.preco)+'</p></div>'
+'<dl class="im__ficha">'+f.map(([a,b])=>'<div><dt>'+a+'</dt><dd>'+b+'</dd></div>').join('')+'</dl>'
+'<div class="im__corpo"><p class="im__desc">'+esc(d.descricao)+'</p><div><p class="im__sub">Neste imóvel</p><ul class="im__lista">'+d.destaques.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div></div>'
+'<div class="im__onde"><p class="im__sub">Onde fica</p><div class="im__mapa" id="im-mapa" aria-label="Mapa: '+esc(d.cidade)+'"></div></div>'
+'<div class="im__galeria">'+d.imgs.slice(1).map((s,i)=>'<img src="'+esc(s)+'" alt="'+esc(d.nome+', foto '+(i+2))+'" width="1200" height="900" loading="lazy" decoding="async">').join('')+'</div>'
+'<div class="im__cta"><div><h2>Gostou? O seu imóvel pode ficar assim.</h2><p>Esta é uma página de exemplo. Anuncie o seu e veja como ele aparece para os corretores da rede.</p></div><div class="im__acoes"><a class="btn" href="proprietario.html#anunciar">Quero anunciar meu imóvel</a><a class="btn btn--ghost" href="'+zap+'" target="_blank" rel="noopener">Falar pelo WhatsApp</a></div></div>'
+'<div class="im__mais"><h2>Outros imóveis na vitrine</h2><ul class="im__maisgrade">'+outros.map(o=>'<li data-previa-origem><a href="imovel.html?id='+encodeURIComponent(o.id)+'" data-previa="'+esc(o.id)+'"><figure><img src="'+esc(o.imgs[0])+'" alt="" width="1200" height="900" loading="lazy" decoding="async"></figure><b>'+esc(o.nome)+'</b><span>'+esc(o.cidade+' · '+o.bairro)+'</span></a></li>').join('')+'</ul></div>';
/* mapa "Onde fica": roda o voo quando aparece na tela */
const caixa=document.getElementById('im-mapa');
if(caixa&&window.SellPrimeMapa&&'IntersectionObserver' in window){
  const io=new IntersectionObserver(async es=>{if(!es[0].isIntersecting)return;io.disconnect();
    try{const m=await SellPrimeMapa.criar(caixa);m.mostrar({uf:d.uf,cidades:[{cidade:d.cidade,uf:d.uf,n:1}]})}catch(err){}},{threshold:.35});
  io.observe(caixa);
}
})();
