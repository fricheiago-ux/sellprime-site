/* Base das cenas 3D (hero e frentes): renderizador com tom de cinema, ambiente de estúdio gerado por código
   (reflexos reais em tinta laqueada, ouro e vidro), cantos chanfrados e chão com reflexo.
   Nada é baixado: o "estúdio" que alimenta os reflexos é desenhado aqui mesmo. */
(()=>{
window.spCena=function(canvas,opc={}){
  const T=THREE,raio=opc.raio||5;
  const col=h=>new T.Color(h).convertSRGBToLinear();
  const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setClearColor(0x000000,0);renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(30,1,.1,100);
  const root=new T.Group();scene.add(root);

  /* estúdio: domo em degradê + painéis de luz (valores acima de 1 = luz forte) */
  const estudio=new T.Scene();
  estudio.add(new T.Mesh(new T.SphereGeometry(30,32,16),new T.ShaderMaterial({side:T.BackSide,
    vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec3 vP;void main(){float h=vP.y*.5+.5;vec3 top=vec3(1.1,1.04,.92),mid=vec3(.72,.7,.64),bot=vec3(.34,.35,.34);vec3 c=h>.5?mix(mid,top,(h-.5)*2.):mix(bot,mid,h*2.);gl_FragColor=vec4(c,1.);\n#include <encodings_fragment>\n}'})));
  const painel=(x,y,z,w,h,c)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c,side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);estudio.add(m)};
  painel(-9,11,11,11,6,new T.Color(8,7.4,6.6));
  painel(13,5,3,2.6,12,new T.Color(3.4,3.7,3.9));
  painel(0,15,-9,13,3,new T.Color(3.2,3,2.6));
  painel(-13,2,-6,1.6,9,new T.Color(3,2.2,1.1));
  const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(estudio,.02).texture;pm.dispose();

  scene.add(new T.HemisphereLight(0xf3f0e9,0x143a46,.25));
  const sun=new T.DirectionalLight(0xfff3df,.9);sun.position.set(5,10,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.radius=4;sun.shadow.bias=-.0004;
  const sc=sun.shadow.camera;sc.left=-8;sc.right=8;sc.top=8;sc.bottom=-8;sc.near=1;sc.far=34;scene.add(sun);

  /* materiais */
  const phys=(c,o)=>new T.MeshPhysicalMaterial(Object.assign({color:col(c)},o));
  const mats={
    petrol:phys('#143a46',{roughness:.3,metalness:.05,clearcoat:1,clearcoatRoughness:.07}),
    dark:phys('#0c232b',{roughness:.34,metalness:.1,clearcoat:.8,clearcoatRoughness:.1}),
    gold:phys('#b89b4d',{roughness:.2,metalness:1,envMapIntensity:1.25}),
    cream:phys('#f3f0e9',{roughness:.5,metalness:0,clearcoat:.3,clearcoatRoughness:.3}),
    glass:phys('#7f9aa3',{roughness:.04,metalness:.15,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.6}),
    ground:phys('#d8d3c6',{roughness:.55,metalness:0,clearcoat:.5,clearcoatRoughness:.35}),
    groundOuro:phys('#a98d43',{roughness:.34,metalness:.9,envMapIntensity:1.1}),
    groundPetrol:phys('#123541',{roughness:.38,metalness:.55,clearcoat:.5,clearcoatRoughness:.3}),
    amarelo:phys('#d9ae3e',{roughness:.34,metalness:.3,clearcoat:.9,clearcoatRoughness:.12,envMapIntensity:1.05})
  };
  const mesh=(g,m,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;return o};

  /* caixa de cantos chanfrados: a base fica em y=0, centrada em x e z */
  function rbox(w,h,d,b=.05){
    const bs=Math.min(b,w/3,h/3,d/3),iw=w-2*bs,ih=h-2*bs,id=d-2*bs;
    const s=new T.Shape();s.moveTo(-iw/2,-ih/2);s.lineTo(iw/2,-ih/2);s.lineTo(iw/2,ih/2);s.lineTo(-iw/2,ih/2);s.closePath();
    const g=new T.ExtrudeGeometry(s,{depth:id,bevelEnabled:true,bevelThickness:bs,bevelSize:bs,bevelSegments:5,curveSegments:1});
    g.translate(0,h/2,-id/2);return g}

  /* chão: base de ouro acetinado (opc.chao='ouro') ou disco claro; reflexo opcional (opc.reflexo>0) */
  const ouro=opc.chao==='ouro',petrol=opc.chao==='petroleo',comRefl=!ouro&&!petrol&&opc.reflexo!==0,tipoChao=ouro?mats.groundOuro:petrol?mats.groundPetrol:mats.ground;
  const grosso=ouro||petrol,ground=mesh(new T.CylinderGeometry(raio,raio,grosso?.2:.14,96),tipoChao,0,grosso?-.1:-.07,0);ground.castShadow=false;scene.add(ground);
  let rt=null,refl=null;
  if(comRefl){
    rt=new T.WebGLRenderTarget(4,4,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat});
    refl=new T.Mesh(new T.CircleGeometry(raio,96),new T.ShaderMaterial({transparent:true,depthWrite:false,
      uniforms:{tRef:{value:rt.texture},res:{value:new T.Vector2(1,1)},forca:{value:opc.reflexo==null?.3:opc.reflexo}},
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform sampler2D tRef;uniform vec2 res;uniform float forca;varying vec2 vUv;void main(){vec2 uv=gl_FragCoord.xy/res;vec2 o=1.5/res;vec4 c=texture2D(tRef,uv)*.36+(texture2D(tRef,uv+vec2(o.x,0.))+texture2D(tRef,uv-vec2(o.x,0.))+texture2D(tRef,uv+vec2(0.,o.y))+texture2D(tRef,uv-vec2(0.,o.y)))*.16;float d=length(vUv-.5)*2.;float m=1.-smoothstep(.4,1.,d);gl_FragColor=vec4(c.rgb,c.a*forca*m);\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n}'}));
    refl.rotation.x=-Math.PI/2;refl.position.y=.004;scene.add(refl)}

  const v2=new T.Vector2();
  function tamanho(){
    const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return false;
    renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));renderer.setSize(w,h,false);
    if(rt){renderer.getDrawingBufferSize(v2);rt.setSize(v2.x,v2.y);refl.material.uniforms.res.value.copy(v2)}
    camera.aspect=w/h;camera.updateProjectionMatrix();return true}
  function desenhar(){
    if(rt){
      // cena espelhada no plano do chão, sem o chão e sem sombras
      refl.visible=false;ground.visible=false;root.scale.y=-1;renderer.shadowMap.enabled=false;
      renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,camera);renderer.setRenderTarget(null);
      root.scale.y=1;ground.visible=true;refl.visible=true;renderer.shadowMap.enabled=true}
    renderer.render(scene,camera)}
  return {T,renderer,scene,camera,root,mats,mesh,rbox,col,sun,tamanho,desenhar,ground,refl}
};
/* só desenha enquanto a cena está na tela (poupa o celular) */
window.spVisivel=(el,fn)=>{let v=true;if('IntersectionObserver' in window)new IntersectionObserver(es=>{v=es[0].isIntersecting;if(v)fn()},{rootMargin:'200px'}).observe(el);return()=>v};
})();
