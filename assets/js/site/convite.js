/* Convite para o cadastro: o fundo cinza se abre das margens ao rolar; quando o painel aparece (35% dele na tela, uma vez só), cada benefício "roda" (círculo
   girando, 0,7 s) e ganha o ✓, um depois do outro; no fim sobe o cartão de boas-vindas. Mesmo ritmo do bloco
   "Workbench" do design system. Movimento reduzido: tudo já marcado. Serve para qualquer .conv da página. */
(()=>{
const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.conv').forEach(conv=>{
  /* abertura do fundo: margens 6% -> 0 e cantos 50px -> 24px conforme o topo da seção sobe 70% da tela */
  if(!reduz&&!conv.classList.contains('conv--emenda')){
    const abre=()=>{const cp=Math.max(0,Math.min(1,(innerHeight-conv.getBoundingClientRect().top)/(innerHeight*.7)));
      conv.style.setProperty('--conv-margem',((1-cp)*6).toFixed(3)+'%');conv.style.setProperty('--conv-raio',(24+(1-cp)*26).toFixed(1)+'px')};
    addEventListener('scroll',abre,{passive:true});addEventListener('resize',abre);abre();
  }
  /* seta do quadro da esquerda: sobe até o lugar dela conforme a seção entra na tela (--conv-p vai de 0 a 1; valores em
     convite.css). Vale nos dois sentidos da rolagem. O título não anima. */
  const cham=conv.querySelector('.conv__chamada');
  if(cham&&!reduz){
    const anima=()=>cham.style.setProperty('--conv-p',Math.max(0,Math.min(1,(innerHeight*1.05-cham.getBoundingClientRect().top)/(innerHeight*.5))).toFixed(3));
    addEventListener('scroll',anima,{passive:true});addEventListener('resize',anima);anima();
  }
  const itens=[...conv.querySelectorAll('.conv__item')],res=conv.querySelector('.conv__resultado'),painel=conv.querySelector('.conv__painel');
  const fim=()=>{itens.forEach(i=>{i.classList.remove('is-rodando');i.classList.add('is-feito')});if(res)res.classList.add('is-pronto')};
  if(reduz||!('IntersectionObserver' in window)){fim();return}
  const rodar=()=>{
    let t=0;
    itens.forEach(i=>{
      setTimeout(()=>i.classList.add('is-rodando'),t);
      t+=700;
      setTimeout(()=>{i.classList.remove('is-rodando');i.classList.add('is-feito')},t);
      t+=150;
    });
    setTimeout(()=>{if(res)res.classList.add('is-pronto')},t+150);
  };
  const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){io.disconnect();rodar()}},{threshold:.35});
  io.observe(painel||conv);
});
/* Partículas: "SellPrime" em Fraunces itálico, amostrada num canvas escondido; os pontos vão de posições aleatórias
   às letras conforme o bloco passa de 80% da tela até o fim dele passar 25% (como no design system). Cor do petróleo
   (esquerda) ao dourado (direita), porque o fundo aqui é claro. Só desenha enquanto está na tela. */
document.querySelectorAll('.conv__pontos').forEach(stage=>{
  const canvas=stage.querySelector('canvas'),ctx=canvas&&canvas.getContext&&canvas.getContext('2d');if(!ctx)return;
  const ini=[20,58,70],fim=[184,155,77],ease=t=>1-Math.pow(1-t,3),clamp=x=>Math.max(0,Math.min(1,x));
  let W=0,H=0,parts=[],dpr=1,alvo=reduz?1:0,prog=reduz?1:0,vis=false,rodando=false;
  function build(){const rc=stage.getBoundingClientRect();if(rc.width<2)return;dpr=Math.min(2,devicePixelRatio||1);W=canvas.width=Math.round(rc.width*dpr);H=canvas.height=Math.round(rc.height*dpr);
    const oc=document.createElement('canvas');oc.width=W;oc.height=H;const o=oc.getContext('2d');o.fillStyle='#000';o.textAlign='center';o.textBaseline='middle';
    const fs=Math.min(W*0.15,H*0.78);o.font='italic 400 '+fs+'px Fraunces, serif';o.fillText('SellPrime',W/2,H/2);
    const data=o.getImageData(0,0,W,H).data,step=Math.max(4,Math.round(W/300)),pts=[];
    for(let y=0;y<H;y+=step)for(let x=0;x<W;x+=step)if(data[(y*W+x)*4+3]>128)pts.push([x,y]);
    parts=pts.map(([tx,ty])=>{const t=tx/W,c=ini.map((v,i)=>Math.round(v+(fim[i]-v)*t));return{tx,ty,sx:Math.random()*W,sy:Math.random()*H,ph:Math.random()*6.28,col:'rgb('+c.join(',')+')',s:Math.max(1.4,dpr*1.3)}});
    desenhar(performance.now())}
  function desenhar(now){if(!W)return;const a=ease(Math.min(1,prog/0.62));ctx.clearRect(0,0,W,H);const t=now*0.001;
    for(const p of parts){const d=(1-a)*16,x=p.sx+(p.tx-p.sx)*a+Math.cos(t+p.ph)*d,y=p.sy+(p.ty-p.sy)*a+Math.sin(t+p.ph)*d;ctx.globalAlpha=0.16+0.84*a;ctx.fillStyle=p.col;ctx.fillRect(x,y,p.s,p.s)}
    ctx.globalAlpha=1}
  function quadro(now){rodando=false;if(!vis||reduz)return;prog+=(alvo-prog)*0.12;desenhar(now);rodando=true;requestAnimationFrame(quadro)}
  const medir=()=>{if(reduz)return;const h=innerHeight,r=stage.getBoundingClientRect();alvo=clamp((h*1.0-r.top)/(h*.35+r.height*.7))};
  addEventListener('scroll',medir,{passive:true});
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis){if(!W)build();medir();if(!rodando&&!reduz){rodando=true;requestAnimationFrame(quadro)}}}).observe(stage);
  (document.fonts&&document.fonts.load?document.fonts.load('italic 400 100px Fraunces').catch(()=>{}):Promise.resolve()).then(build);
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(build,200)});
});
})();
