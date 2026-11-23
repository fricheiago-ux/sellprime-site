/* Entrada dos blocos ao rolar, igual em todas as páginas (padrão Spectra, design system seção 07).
   1. Marca sozinho os blocos comuns (rótulo, título, texto de abertura, cartões, botões, faixas, colunas do rodapé),
      além dos que já vêm com class="reveal" no HTML. Não mexe em quem tem animação própria: primeira dobra de cada
      página, frase em três tempos, frentes em 3D, página do imóvel, esquema do Quem somos e resultados da busca.
      Bloco dentro de outro bloco já marcado não é marcado de novo (entra junto com o de fora).
   2. Quando 10% do bloco entra na tela, ele aparece (CSS em base.css: sobe 32px, 0,9 s). Os que entram juntos
      vêm em cascata, de cima para baixo e da esquerda para a direita, 100 ms de diferença, no máximo 400 ms.
   3. Terminada a entrada, a classe sai (com temporizador, sem depender do fim da transição) e o bloco volta às
      transições dele (hover do botão etc.).
   Movimento reduzido: o CSS já mostra tudo parado; aqui só não marca nada. */
(()=>{
const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
const AUTO=['.eyebrow','h2','.lead','.sec-topo','.cat','.card','.btn','.faixa__txt > *','.faixa__foto','.qs__nota','.faq__item','.site-footer__col','.site-footer__marca','.site-footer__base'];
const FORA='.hero,.hero-h,.hero-p,.corr,.frase,.eco,.im,.esq,.resultados,.site-header,.menu-painel,.grade,dialog';
const marcados=new Set(document.querySelectorAll('.reveal'));
if(!reduz){
  document.querySelectorAll(AUTO.map(s=>'main '+s+', .site-footer '+s.replace(/^\.site-footer /,'')).join(',')).forEach(el=>{
    if(el.closest(FORA))return;
    for(let p=el.parentElement;p;p=p.parentElement)if(marcados.has(p))return;
    marcados.add(el);
  });
}
const els=[...marcados].filter(el=>!el.closest(FORA)||el.classList.contains('reveal'));
if(reduz||!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}
els.forEach(e=>e.classList.add('reveal'));
const solta=e=>{e.classList.remove('reveal','in');e.style.removeProperty('--d')};
const io=new IntersectionObserver(es=>{
  const novos=es.filter(e=>e.isIntersecting).map(e=>e.target)
    .sort((a,b)=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return Math.abs(ra.top-rb.top)>8?ra.top-rb.top:ra.left-rb.left});
  novos.forEach((el,i)=>{
    const d=Math.min(i,4)*100;el.style.setProperty('--d',d+'ms');el.classList.add('in');io.unobserve(el);
    setTimeout(()=>solta(el),900+d+150);
  });
},{threshold:.1});
els.forEach(e=>io.observe(e));
})();
