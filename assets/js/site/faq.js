/* Perguntas frequentes: cada pergunta é um botão que abre e fecha a resposta (aria-expanded), uma aberta por vez.
   A animação de abrir e fechar é do CSS (faq.css). Sem JS, as respostas ficam escondidas, então o script é
   carregado em todas as páginas que têm a seção. */
(()=>{
document.querySelectorAll('.faq').forEach(faq=>{
  const itens=[...faq.querySelectorAll('.faq__item')];
  const abrir=(item,abre)=>{item.classList.toggle('is-aberto',abre);item.querySelector('.faq__q').setAttribute('aria-expanded',String(abre))};
  itens.forEach(item=>{
    item.querySelector('.faq__q').addEventListener('click',()=>{
      const vaiAbrir=!item.classList.contains('is-aberto');
      itens.forEach(o=>{if(o!==item)abrir(o,false)});
      abrir(item,vaiAbrir);
    });
  });
});
})();
