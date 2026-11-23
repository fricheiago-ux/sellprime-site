/* HOME, "Quem somos": a seção se abre das margens para a tela cheia ao rolar, e o esquema animado tem a SellPrime
   em partículas no centro.
   Movimento copiado do design system (lá feito com GSAP; aqui com a animação nativa do navegador, sem biblioteca):
   - quando o esquema chega a 76% da tela (uma vez só): as linhas se desenham (1,1 s, uma após a outra a cada 0,08 s)
     e os blocos aparecem crescendo de 90% (0,6 s, a cada 0,08 s);
   - um traço dourado (22% da linha) corre por cada linha sem parar (2,6 s, começos defasados em 0,45 s);
   - o ponto creme do centro pulsa (cresce 1,7x e some até 25%, vai e volta em 1,3 s);
   - partículas: os pontos vão de posições aleatórias às letras de "SellPrime" conforme o centro passa de 80% da tela
     até o fim dele passar 25%; cor do creme (esquerda) ao dourado (direita). Sem interação com o mouse.
   Há dois desenhos (deitado no computador, em pé no celular); só o que está visível anima.
   Fora da tela, tudo pausa. Movimento reduzido: esquema montado e parado, palavra já formada. */
(()=>{
const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=t=>1-Math.pow(1-t,3);
const inOut='cubic-bezier(.45,0,.55,1)',out='cubic-bezier(.33,1,.68,1)',seno='cubic-bezier(.37,0,.63,1)';

/* abertura da seção: margens de 6% e cantos de 50px que somem conforme o topo dela sobe 70% da tela */
const qs=document.getElementById('quem-somos');
if(qs&&!reduz){
  const abre=()=>{const cp=clamp((innerHeight-qs.getBoundingClientRect().top)/(innerHeight*.7));
    qs.style.setProperty('--qs-margem',((1-cp)*6).toFixed(3)+'%');qs.style.setProperty('--qs-raio',((1-cp)*50).toFixed(1)+'px')};
  addEventListener('scroll',abre,{passive:true});addEventListener('resize',abre);abre();
}

document.querySelectorAll('#quem-somos .esq').forEach(esq=>{
  const svg=esq.querySelector('svg'),stage=esq.querySelector('.esq__palco'),canvas=stage.querySelector('canvas');
  const flows=[...svg.querySelectorAll('.flow')],nodes=[...svg.querySelectorAll('.snode')],dashes=[...svg.querySelectorAll('.flow-dash')],pulse=svg.querySelector('.pulse');
  let vis=false,montado=false;const loops=[];

  /* ---------- esquema ---------- */
  if(!reduz){
    flows.forEach(f=>{const L=f.getTotalLength();f.style.strokeDasharray=L;f.style.strokeDashoffset=L});
    nodes.forEach(n=>{n.style.opacity=0;n.style.transform='scale(.9)'});
    dashes.forEach((d,i)=>{const L=d.getTotalLength(),seg=L*.22;d.style.strokeDasharray=seg+' '+(L-seg);d.style.strokeDashoffset=L;
      loops.push(d.animate([{strokeDashoffset:L},{strokeDashoffset:-L}],{duration:2600,delay:i*450,iterations:Infinity,easing:'linear'}))});
    if(pulse)loops.push(pulse.animate([{transform:'scale(1)',opacity:1},{transform:'scale(1.7)',opacity:.25}],{duration:1300,iterations:Infinity,direction:'alternate',easing:seno}));
    loops.forEach(a=>a.pause());
  }else dashes.forEach(d=>{const L=d.getTotalLength(),seg=L*.22;d.style.strokeDasharray=seg+' '+(L-seg);d.style.strokeDashoffset=L*.5});
  const montar=()=>{
    if(montado||reduz)return;montado=true;
    flows.forEach((f,i)=>f.animate([{strokeDashoffset:f.style.strokeDashoffset},{strokeDashoffset:0}],{duration:1100,delay:i*80,easing:inOut,fill:'forwards'}));
    nodes.forEach((n,i)=>n.animate([{opacity:0,transform:'scale(.9)'},{opacity:1,transform:'scale(1)'}],{duration:600,delay:100+i*80,easing:out,fill:'forwards'}));
  };
  const checar=()=>{if(!vis)return;if(svg.getBoundingClientRect().top<=innerHeight*.76)montar()};
  addEventListener('scroll',checar,{passive:true});

  /* ---------- partículas no centro ---------- */
  const ctx=canvas.getContext&&canvas.getContext('2d');
  if(!ctx)document.documentElement.classList.add('no-canvas');
  let W=0,H=0,parts=[],dpr=1,targetP=reduz?1:0,scrollP=reduz?1:0,rodando=false;
  const cream=[243,240,233],gold=[184,155,77];
  function build(){if(!ctx)return;const rc=stage.getBoundingClientRect();if(rc.width<2)return;dpr=Math.min(2,devicePixelRatio||1);W=canvas.width=Math.round(rc.width*dpr);H=canvas.height=Math.round(rc.height*dpr);
    const oc=document.createElement('canvas');oc.width=W;oc.height=H;const o=oc.getContext('2d');o.fillStyle='#fff';o.textAlign='center';o.textBaseline='middle';
    const fs=Math.min(W*0.15,H*0.78);o.font='italic 400 '+fs+'px Fraunces, serif';o.fillText('SellPrime',W/2,H/2);
    const data=o.getImageData(0,0,W,H).data,step=Math.max(4,Math.round(W/300)),pts=[];
    for(let y=0;y<H;y+=step)for(let x=0;x<W;x+=step)if(data[(y*W+x)*4+3]>128)pts.push([x,y]);
    parts=pts.map(([tx,ty])=>{const t=tx/W,c=cream.map((v,i)=>Math.round(v+(gold[i]-v)*t));return{tx,ty,sx:Math.random()*W,sy:Math.random()*H,ph:Math.random()*6.28,col:'rgb('+c.join(',')+')',s:Math.max(1.4,dpr*1.3)}});
    desenhar(performance.now())}
  function desenhar(now){if(!W)return;const a=ease(Math.min(1,scrollP/0.62));ctx.clearRect(0,0,W,H);const t=now*0.001;
    for(let i=0;i<parts.length;i++){const p=parts[i],drift=(1-a)*16,x=p.sx+(p.tx-p.sx)*a+Math.cos(t+p.ph)*drift,y=p.sy+(p.ty-p.sy)*a+Math.sin(t+p.ph)*drift;ctx.globalAlpha=0.16+0.84*a;ctx.fillStyle=p.col;ctx.fillRect(x,y,p.s,p.s)}
    ctx.globalAlpha=1}
  function render(now){rodando=false;if(!vis||reduz)return;scrollP+=(targetP-scrollP)*0.08;desenhar(now);rodando=true;requestAnimationFrame(render)}
  const medir=()=>{if(reduz)return;const h=innerHeight,r=stage.getBoundingClientRect();targetP=clamp((h*.8-r.top)/(h*.55+r.height))};
  addEventListener('scroll',medir,{passive:true});

  /* liga e desliga conforme o esquema está na tela (o desenho escondido nunca "entra") */
  new IntersectionObserver(es=>{
    vis=es[0].isIntersecting;
    loops.forEach(a=>vis?a.play():a.pause());
    if(vis){if(!W)build();medir();checar();if(ctx&&!rodando&&!reduz){rodando=true;requestAnimationFrame(render)}}
  }).observe(esq);
  (document.fonts&&document.fonts.load?document.fonts.load('italic 400 100px Fraunces').catch(()=>{}):Promise.resolve()).then(build);
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(build,200)});
});
})();
