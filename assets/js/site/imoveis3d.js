/* Ilustrações 3D de outros tipos de imóvel para os cartões do aplicativo (hero). Cada modelo é uma lista de caixas
   chanfradas nos mesmos materiais da casa (petróleo, escuro, ouro, creme, vidro), sobre a mesma base de ouro.
   spImoveis3D(C) devolve os modelos; hero.js desenha cada um uma vez, tira a "foto" e descarta a cena. */
(()=>{
window.spImoveis3D=function(C){
  const T=C.T,M=C.mats,{rbox,mesh}=C;
  const R=(g,w,h,d,m,x=0,y=0,z=0,b=.04)=>{const o=mesh(rbox(w,h,d,b),m,x,y,z);g.add(o);return o};
  /* prisma extrudado: a forma fica no plano XY e a profundidade corre em Z (centrada) */
  const ext=(g,pts,depth,m,x=0,y=0,z=0)=>{
    const s=new T.Shape();pts.forEach(([a,b],i)=>i?s.lineTo(a,b):s.moveTo(a,b));s.closePath();
    const geo=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:2,curveSegments:1});
    geo.translate(0,0,-depth/2);const o=mesh(geo,m,x,y,z);g.add(o);return o};
  const novo=esc=>{const g=new T.Group();g.userData.esc=esc||1;return g};

  const modelos=[];

  /* prédio residencial alto: varandas de ouro e janelas escuras */
  modelos.push({nome:'predio',construir(){const g=novo(.68);
    R(g,2.1,3.9,1.9,M.cream,0,0,0,.06);
    for(let i=0;i<6;i++){const y=.5+i*.58;R(g,2.3,.07,2.15,M.gold,0,y,0,.02);for(let j=0;j<3;j++)R(g,.38,.34,.05,M.dark,-.65+j*.65,y+.13,.96,.02)}
    R(g,2.25,.14,2.05,M.dark,0,3.9,0,.04);R(g,.05,.5,.05,M.gold,.6,4.04,0,.01);R(g,.5,.62,.06,M.gold,0,0,.96,.02);return g}});

  /* escritório corporativo: torre de vidro sobre embasamento, com caixilhos e uma faixa dourada */
  modelos.push({nome:'escritorio',construir(){const g=novo(.66);
    R(g,3.6,.9,2.6,M.dark,0,0,0,.05);R(g,2.5,2.9,2.0,M.glass,0,.9,0,.05);
    for(let i=-3;i<=3;i++)R(g,.045,2.9,.05,M.petrol,i*.37,.9,1.02,.01);
    for(let j=1;j<=5;j++)R(g,2.52,.04,.06,M.petrol,0,.9+j*.48,1.02,.01);
    R(g,2.55,.07,2.05,M.gold,0,2.2,0,.02);R(g,1.5,.4,1.2,M.petrol,0,3.8,0,.05);R(g,.7,.6,.06,M.gold,0,0,1.31,.02);return g}});

  /* fazenda: celeiro de duas águas, silo e um campo */
  modelos.push({nome:'fazenda',construir(){const g=novo(.9);
    R(g,2.4,1.3,1.8,M.petrol,.4,0,.1,.05);
    ext(g,[[-1.3,0],[1.3,0],[1.1,.55],[0,1],[-1.1,.55]],2.0,M.dark,.4,1.3,.1);
    R(g,.9,.95,.06,M.cream,.4,0,1.02,.02);
    [.75,-.75].forEach(a=>{const b=mesh(rbox(.05,1.15,.04,.01),M.gold,.4,.47,1.07);b.rotation.z=a;g.add(b)});
    const silo=mesh(new T.CylinderGeometry(.5,.5,2.4,40),M.cream,-1.6,1.2,-.2);g.add(silo);
    const topo=mesh(new T.SphereGeometry(.5,40,20,0,Math.PI*2,0,Math.PI/2),M.dark,-1.6,2.4,-.2);g.add(topo);
    [.6,1.5].forEach(y=>{const t=mesh(new T.TorusGeometry(.5,.03,12,40),M.gold,-1.6,y,-.2);t.rotation.x=Math.PI/2;g.add(t)});
    R(g,1.3,.05,1.0,M.amarelo,1.5,0,1.35,.02);return g}});

  /* loja de rua: vitrine, toldo listrado e letreiro */
  modelos.push({nome:'loja',construir(){const g=novo(.98);
    R(g,3.4,1.5,2.2,M.cream,0,0,0,.05);R(g,3.5,.12,2.3,M.dark,0,1.5,0,.03);
    R(g,2.2,.9,.05,M.glass,-.4,.18,1.12,.02);R(g,2.3,.05,.07,M.gold,-.4,1.08,1.12,.01);R(g,.55,.95,.06,M.gold,1.2,0,1.12,.02);
    R(g,1.5,.3,.08,M.dark,-.3,1.2,1.14,.02);R(g,.9,.06,.09,M.gold,-.3,1.32,1.15,.01);
    const toldo=new T.Group();toldo.position.set(-.3,1.12,1.55);toldo.rotation.x=.22;g.add(toldo);
    R(toldo,3.0,.1,1.0,M.petrol,0,0,0,.03);for(let i=-5;i<=5;i+=2)R(toldo,.27,.11,1.02,M.cream,i*.26,0,0,.01);return g}});

  /* casa moderna: dois volumes, o de cima em balanço, com vidro e ripas douradas */
  modelos.push({nome:'casa-moderna',construir(){const g=novo(.98);
    R(g,3.2,1.2,2.2,M.cream,-.1,0,0,.05);R(g,3.3,.1,2.3,M.dark,-.1,1.2,0,.03);
    R(g,2.0,1.1,2.0,M.petrol,.55,1.3,.3,.05);R(g,2.1,.1,2.1,M.dark,.55,2.4,.3,.03);
    R(g,1.8,.8,.05,M.glass,-.6,.2,1.12,.02);R(g,1.2,.7,.05,M.glass,.55,1.5,1.33,.02);
    for(let i=0;i<5;i++)R(g,.06,1.1,.06,M.gold,-.2+i*.16,1.3,1.35,.01);R(g,.5,.9,.06,M.gold,.95,0,1.12,.02);return g}});

  /* galpão: dente de serra no telhado, portões grandes */
  modelos.push({nome:'galpao',construir(){const g=novo(1);
    R(g,3.4,1.25,2.2,M.cream,0,0,0,.05);
    [-1.13,0,1.13].forEach(x=>{ext(g,[[-.565,0],[.565,0],[.565,.6]],2.25,M.dark,x,1.25,0);R(g,.04,.5,2.0,M.glass,x+.57,1.3,0,.01)});
    R(g,1.2,.95,.06,M.petrol,-.6,0,1.12,.02);R(g,1.3,.05,.08,M.gold,-.6,.95,1.12,.01);R(g,.8,.9,.06,M.petrol,.9,0,1.12,.02);R(g,.8,.14,.05,M.gold,1.2,1.05,1.12,.01);return g}});

  /* terreno: lote demarcado com marcos e placa */
  modelos.push({nome:'terreno',construir(){const g=novo(1);
    R(g,3.8,.08,3.0,M.cream,0,0,0,.03);
    R(g,3.4,.04,.06,M.gold,0,.08,1.3,.01);R(g,3.4,.04,.06,M.gold,0,.08,-1.3,.01);R(g,.06,.04,2.6,M.gold,1.65,.08,0,.01);R(g,.06,.04,2.6,M.gold,-1.65,.08,0,.01);
    [[-1.7,1.35],[1.7,1.35],[-1.7,-1.35],[1.7,-1.35]].forEach(([x,z])=>R(g,.12,.5,.12,M.petrol,x,.08,z,.02));
    R(g,.07,1.5,.07,M.dark,.9,.08,.8,.01);R(g,1.1,.7,.07,M.gold,.9,.9,.8,.02);R(g,.7,.06,.08,M.dark,.9,1.3,.84,.01);R(g,.7,.06,.08,M.dark,.9,1.1,.84,.01);return g}});

  /* casas geminadas: três casas coladas, cores alternadas */
  modelos.push({nome:'geminadas',construir(){const g=novo(1);
    [-1,0,1].forEach((i,k)=>{const x=i*1.15,c=k===1?M.petrol:M.cream;
      R(g,1.05,1.3,1.9,c,x,0,0,.04);ext(g,[[-.62,0],[.62,0],[0,.7]],2.0,M.dark,x,1.3,0);
      R(g,.3,.62,.05,M.gold,x-.22,0,.97,.02);R(g,.3,.3,.05,M.glass,x+.22,.5,.97,.02);R(g,.34,.3,.05,M.glass,x,.95,.97,.02)});return g}});

  /* prédio médio com cobertura recuada e terraço */
  modelos.push({nome:'predio-medio',construir(){const g=novo(.96);
    R(g,3.0,2.1,1.9,M.cream,0,0,0,.05);
    for(let i=0;i<2;i++){for(let j=0;j<4;j++)R(g,.5,.42,.05,M.petrol,-1.05+j*.7,.3+i*.9,.97,.02);R(g,3.05,.06,.3,M.gold,0,.78+i*.9,1.05,.01)}
    R(g,3.1,.1,2.0,M.dark,0,2.1,0,.03);R(g,1.7,.85,1.5,M.petrol,.55,2.2,.1,.05);R(g,1.1,.5,.05,M.glass,.55,2.4,.87,.02);R(g,1.8,.07,1.6,M.dark,.55,3.05,.1,.03);return g}});

  return modelos;
};
})();
