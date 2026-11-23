/* PROPRIETÁRIO, seção "Cada imóvel ganha uma página própria": no mockup da página da Cobertura Jurerê, o mapa
   animado (mapa-busca.js) faz o voo do Brasil até Florianópolis quando o mockup aparece na tela, e repete toda vez
   que ele sai e volta. Clicar no mockup abre a página do imóvel de verdade (imovel.html), onde o mapa também está. */
(()=>{
const caixa=document.getElementById('mock-mapa');if(!caixa||!window.SellPrimeMapa||!('IntersectionObserver' in window))return;
const d=(window.SELLPRIME_IMOVEIS||[]).find(x=>x.id==='cobertura-jurere');if(!d)return;
let mapa=null,rodou=false;
new IntersectionObserver(async es=>{
  const e=es[0];if(!e.isIntersecting){rodou=false;return}
  if(rodou)return;rodou=true;
  try{if(!mapa)mapa=await SellPrimeMapa.criar(caixa);mapa.mostrar({uf:d.uf,cidades:[{cidade:d.cidade,uf:d.uf,n:1}]})}catch(err){}
},{threshold:.5}).observe(caixa);
})();
