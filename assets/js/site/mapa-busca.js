/* Mapa animado da busca (molde: protótipo de 19/11 em _nao-publicar/rascunhos/mapa-busca/).
   Usado em dois lugares: nos resultados da busca da home e no popup de prévia do imóvel.
   A câmera parte do Brasil, destaca o estado, aproxima, desenha os municípios e chega à cidade (com um selo
   "Cidade · N imóveis"). Busca por estado para no estado, com as cidades que têm imóvel destacadas; busca que
   cobre vários estados fica no Brasil, com esses estados destacados. Bairro: vai até a cidade (o IBGE não tem
   contorno de bairro; o mapa de ruas depende da plataforma do Pedro).
   Peso: a biblioteca d3 (assets/js/vendor/d3.min.js) e os contornos (assets/data/mapa/) só baixam na primeira
   vez que um mapa aparece. Contornos: API de malhas do IBGE (dados públicos).
   Uso: const m=await SellPrimeMapa.criar(caixa); m.mostrar({uf:'GO',cidades:[{cidade:'Goiânia',uf:'GO',n:2}]})
   Com direto:true (popup do imóvel) o mapa já abre na cidade, sem o voo, e só o contorno dela acende em dourado. */
(()=>{
const UF={SP:35,MG:31,DF:53,PR:41,GO:52,RJ:33,BA:29,ES:32,SC:42};
const NOMEUF={SP:'São Paulo',MG:'Minas Gerais',DF:'Distrito Federal',PR:'Paraná',GO:'Goiás',RJ:'Rio de Janeiro',BA:'Bahia',ES:'Espírito Santo',SC:'Santa Catarina'};
/* código IBGE de cada cidade da base ilustrativa */
const MUN={'São Paulo':'3550308','Belo Horizonte':'3106200','Brasília':'5300108','Curitiba':'4106902','Goiânia':'5208707','Rio de Janeiro':'3304557','Salvador':'2927408','Vitória':'3205309',
  'Campinas':'3509502','Barueri':'3505708','Campos do Jordão':'3509700','Teresópolis':'3305802','Florianópolis':'4205407'};
const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
const T=ms=>reduz?0:ms;
const espera=ms=>new Promise(r=>setTimeout(r,T(ms)));
let d3p=null,brp=null;const ufs={};
const carregarD3=()=>d3p||(d3p=window.d3?Promise.resolve():new Promise((ok,erro)=>{const s=document.createElement('script');s.src='assets/js/vendor/d3.min.js?v=1';s.onload=ok;s.onerror=erro;document.head.appendChild(s)}));
const json=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.json()});
const brasil=()=>brp||(brp=json('assets/data/mapa/brasil-uf.json?v=1'));
const estado=uf=>ufs[uf]||(ufs[uf]=json('assets/data/mapa/uf-'+uf+'.json?v=1'));
const plural=n=>n+(n===1?' imóvel':' imóveis');

async function criar(caixa){
  await carregarD3();const br=await brasil();const d3=window.d3;
  caixa.classList.add('mapa');
  caixa.innerHTML='<svg role="img" aria-label="Mapa do Brasil"></svg><div class="mapa__rotulo"></div><span class="mapa__etapa">Brasil</span>';
  const svg=d3.select(caixa.querySelector('svg')),g=svg.append('g'),gUF=g.append('g'),gMun=g.append('g');
  const rot=caixa.querySelector('.mapa__rotulo'),etapa=caixa.querySelector('.mapa__etapa');
  const proj=d3.geoMercator(),path=d3.geoPath(proj);let W=0,H=0,alvoRot=null,vez=0;
  const zoom=d3.zoom().scaleExtent([1,400]).on('zoom',e=>{g.attr('transform',e.transform);posRotulo(e.transform)});
  svg.call(zoom).on('wheel.zoom',null).on('dblclick.zoom',null).on('mousedown.zoom',null).on('touchstart.zoom',null);/* só a animação move o mapa */
  gUF.selectAll('path').data(br.features).join('path').attr('class','mapa__uf');
  function medir(){W=caixa.clientWidth;H=caixa.clientHeight;if(!W||!H)return;svg.attr('viewBox',[0,0,W,H]);proj.fitExtent([[16,16],[W-16,H-16]],br);
    gUF.selectAll('path').attr('d',path);gMun.selectAll('path').attr('d',path)}
  medir();
  new ResizeObserver(()=>{const t=d3.zoomTransform(svg.node());medir();svg.call(zoom.transform,t)}).observe(caixa);
  function posRotulo(t){if(!alvoRot)return;const[x,y]=t.apply(path.centroid(alvoRot));rot.style.left=x+'px';rot.style.top=y+'px'}
  /* leva a câmera até caber a forma; com temporizador de segurança (se esta transição não terminar, põe a câmera no fim) */
  const voar=(feat,folga,dur)=>{medir();const[[x0,y0],[x1,y1]]=path.bounds(feat);
    const k=Math.min(400,folga/Math.max((x1-x0)/W,(y1-y0)/H));
    const t=d3.zoomIdentity.translate(W/2-k*(x0+x1)/2,H/2-k*(y0+y1)/2).scale(k);
    let acabou=false;
    const fim=svg.transition().duration(T(dur)).ease(d3.easeCubicInOut).call(zoom.transform,t).end().catch(()=>{}).then(()=>{acabou=true});
    const seg=new Promise(r=>setTimeout(()=>{if(!acabou){acabou=true;svg.interrupt();svg.call(zoom.transform,t)}r()},T(dur)+400));
    return Promise.race([fim,seg])};
  const BR={type:'FeatureCollection',features:br.features};

  async function mostrar(alvo={}){
    const eu=++vez,vivo=()=>eu===vez;
    /* direto (popup do imóvel): sem o voo do Brasil até a cidade; o mapa já abre na cidade e só o contorno dela
       se acende em dourado, numa animação breve (pedido do Iago, 23/11/2026) */
    const D=ms=>alvo.direto?0:ms,pausa=ms=>alvo.direto?Promise.resolve():espera(ms);
    rot.classList.remove('in');alvoRot=null;
    const cidades=alvo.cidades||[],estados=[...new Set(cidades.map(c=>c.uf))].filter(u=>UF[u]);
    const uf=alvo.uf||(estados.length===1?estados[0]:null);
    gMun.selectAll('path').classed('in',false);
    /* 1. Brasil, com o(s) estado(s) destacado(s) */
    etapa.textContent='Brasil';
    if(!alvo.direto){await voar(BR,.95,700);if(!vivo())return}
    gMun.selectAll('path').remove();
    const marcar=uf?[UF[uf]]:estados.map(u=>UF[u]);
    gUF.selectAll('path').classed('is-ativo',f=>marcar.includes(+f.properties.codarea)).classed('is-apagado',f=>marcar.length>0&&!marcar.includes(+f.properties.codarea));
    if(!uf){if(cidades.length){rot.textContent=plural(cidades.reduce((a,c)=>a+c.n,0))+' em '+estados.length+' estados';rot.classList.add('in','is-fixo')}return}
    rot.classList.remove('is-fixo');
    await pausa(450);if(!vivo())return;
    /* 2. aproxima do estado e desenha os municípios */
    etapa.textContent=NOMEUF[uf]||uf;
    const ufFeat=br.features.find(f=>+f.properties.codarea===UF[uf]);
    const mun=await estado(uf);if(!vivo())return;
    const voo=alvo.direto?Promise.resolve():voar(ufFeat,.86,1300);
    const p=gMun.selectAll('path').data(mun.features).join('path').attr('class','mapa__mun').attr('d',path);
    const codigos=cidades.filter(c=>c.uf===uf).map(c=>MUN[c.cidade]).filter(Boolean);
    await voo;if(!vivo())return;
    p.classed('in',true).classed('is-cidade',f=>codigos.includes(f.properties.codarea));
    if(codigos.length!==1){
      if(codigos.length){alvoRot=ufFeat;posRotulo(d3.zoomTransform(svg.node()));rot.textContent=NOMEUF[uf]+' · '+plural(cidades.reduce((a,c)=>a+c.n,0));rot.classList.add('in')}
      return}
    await pausa(350);if(!vivo())return;
    /* 3. chega à cidade */
    const c=cidades.find(x=>MUN[x.cidade]===codigos[0]),cid=mun.features.find(f=>f.properties.codarea===codigos[0]);
    etapa.textContent=alvo.bairro?alvo.bairro+', '+c.cidade:c.cidade;
    await voar(cid,.55,D(1400));if(!vivo())return;
    if(alvo.direto){const el=p.filter(f=>f===cid).node();if(el){el.classList.remove('is-local');void el.getBoundingClientRect();el.classList.add('is-local')}}
    alvoRot=cid;posRotulo(d3.zoomTransform(svg.node()));
    rot.textContent=alvo.rotulo||(c.cidade+' · '+plural(c.n));rot.classList.add('in');
  }
  return{mostrar};
}
window.SellPrimeMapa={criar,UF,NOMEUF};
})();
