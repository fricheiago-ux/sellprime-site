/* Formato de leitura da BASE ÚNICA (imoveis-base.js, que precisa ser carregado ANTES deste arquivo): aqui os imóveis
   ganham o formato que a vitrine do proprietário, a página do imóvel e o popup de prévia usam (nome, imgs, thumbs,
   destaques, legendas). A SellPrime é só venda: imóveis de aluguel ficam de fora.
   Destaques: os escritos à mão na base, quando existem; senão, montados com os dados (vista, varanda, sol, pet). */
(()=>{
const SOL={manha:'Sol da manhã',tarde:'Sol da tarde',dia:'Sol o dia todo'};
const FOTO={fachada:'Fachada',sala:'Sala',cozinha:'Cozinha',quarto:'Quarto',quarto2:'Quarto',banheiro:'Banheiro',detalhe:'Detalhe',varanda:'Varanda',quintal:'Quintal',servico:'Área de serviço'};
window.SELLPRIME_IMOVEIS=(window.SELLPRIME_BASE||[]).filter(i=>i.fin==='venda').map(i=>{
  const pasta='assets/img/imoveis/'+i.id+'/';
  const destaques=i.destaques?i.destaques.slice():[];
  if(!i.destaques){
  if(i.vista)destaques.push(i.vista);
  if(i.varanda)destaques.push('Varanda');
  if(SOL[i.sol])destaques.push(SOL[i.sol]);
  if(i.pet)destaques.push('Aceita pet');
  }
  return{id:i.id,nome:i.titulo,tipo:i.tipo,cidade:i.cidade,uf:i.uf,bairro:i.bairro,preco:i.preco,area:i.area,
    quartos:i.quartos,suites:i.suites,vagas:i.vagas,descricao:i.desc,destaques,
    imgs:i.fotos.map(f=>pasta+f+'.webp?v=1'),thumbs:i.fotos.map(f=>pasta+f+'-thumb.webp?v=1'),
    legendas:i.fotos.map(f=>FOTO[f]||'')};
});
})();
