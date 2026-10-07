/* Página de um imóvel (exemplo ilustrativo): lê ?id= e preenche com os dados de imoveis-data.js. */
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
 '<figure class="im__capa"><img src="'+esc(d.imgs[0])+'" alt="'+esc(d.nome+', '+d.cidade)+'" width="1200" height="900" fetchpriority="high"></figure>'
+'<div class="im__topo"><div><h1 class="im__titulo">'+esc(d.nome)+'</h1><p class="im__local">'+esc(d.cidade+' · '+d.bairro+' · '+d.tipo)+'</p></div><p class="im__preco">'+brl(d.preco)+'</p></div>'
+'<dl class="im__ficha">'+f.map(([a,b])=>'<div><dt>'+a+'</dt><dd>'+b+'</dd></div>').join('')+'</dl>'
+'<div class="im__corpo"><p class="im__desc">'+esc(d.descricao)+'</p><div><p class="im__sub">Neste imóvel</p><ul class="im__lista">'+d.destaques.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div></div>'
+'<div class="im__galeria">'+d.imgs.slice(1).map((s,i)=>'<img src="'+esc(s)+'" alt="'+esc(d.nome+', foto '+(i+2))+'" width="1200" height="900" loading="lazy" decoding="async">').join('')+'</div>'
+'<div class="im__cta"><div><h2>Gostou? O seu imóvel pode ficar assim.</h2><p>Esta é uma página de exemplo. Anuncie o seu e veja como ele aparece para os corretores da rede.</p></div><div class="im__acoes"><a class="btn" href="proprietario.html#anunciar">Quero anunciar meu imóvel</a><a class="btn btn--ghost" href="'+zap+'" target="_blank" rel="noopener">Falar pelo WhatsApp</a></div></div>'
+'<div class="im__mais"><h2>Outros imóveis na vitrine</h2><ul class="im__maisgrade">'+outros.map(o=>'<li><a href="imovel.html?id='+encodeURIComponent(o.id)+'"><figure><img src="'+esc(o.imgs[0])+'" alt="" width="1200" height="900" loading="lazy" decoding="async"></figure><b>'+esc(o.nome)+'</b><span>'+esc(o.cidade+' · '+o.bairro)+'</span></a></li>').join('')+'</ul></div>';
})();
