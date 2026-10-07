/* Depoimentos (molde da seção de clientes da referência Nebula): círculos concêntricos, avatares ilustrados em órbita elíptica,
   avatar ativo no centro com anel luminoso, falas que se alternam a cada 4,2 s; mouse pausa e clique escolhe. Conteúdo ILUSTRATIVO. */
(()=>{
const anel=document.getElementById('dep-anel'),centro=document.getElementById('dep-centro'),ca=document.getElementById('dep-centro-av'),orb=document.getElementById('dep-orbita');
const quotes=[...document.querySelectorAll('#dep-lista .quote')];if(!anel||!quotes.length)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* avatar ilustrado: silhueta sobre uma das cores do manual (petróleo, dourado, creme); sem fotos de pessoas */
const AV=c=>'<span class="av av--'+c+'" aria-hidden="true"><svg><use href="#sp-avatar"/></svg></span>';
const N=quotes.length,nodes=[];let ativo=0,ang=0,gira=!reduce;
const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('class','dep__aneis');svg.setAttribute('aria-hidden','true');
const c1=document.createElementNS(NS,'circle'),c2=document.createElementNS(NS,'circle');c1.setAttribute('class','c1');c2.setAttribute('class','c2');svg.append(c1,c2);anel.appendChild(svg);
quotes.forEach((q,i)=>{const d=document.createElement('i');d.innerHTML=AV(q.dataset.av);
  d.addEventListener('mouseenter',()=>{gira=false});d.addEventListener('mouseleave',()=>{gira=!reduce});d.addEventListener('click',()=>marcar(i));anel.appendChild(d);nodes.push(d)});
function marcar(i){ativo=i;quotes.forEach((q,j)=>q.classList.toggle('is-ativo',j===i));nodes.forEach((n,j)=>n.classList.toggle('on',j===i));
  centro.style.opacity='0';setTimeout(()=>{ca.className='av av--'+quotes[i].dataset.av;centro.style.opacity='1'},220)}
function layout(){const w=orb.clientWidth,h=orb.clientHeight,R=Math.min(150,w*.3),cx=w/2,cy=h/2;
  svg.setAttribute('viewBox','0 0 '+w+' '+h);
  [[c1,R*1.05],[c2,R*1.75]].forEach(([c,r])=>{c.setAttribute('cx',cx);c.setAttribute('cy',cy);c.setAttribute('r',r)});
  nodes.forEach((n,i)=>{const a=ang+i/N*Math.PI*2,x=Math.cos(a)*R,y=Math.sin(a)*R*.85,sc=.78+.22*((Math.sin(a)+1)/2);
    n.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) scale('+sc.toFixed(3)+')';n.style.zIndex=Math.round(sc*40)})}
let visivel=true;if('IntersectionObserver' in window)new IntersectionObserver(es=>{visivel=es[0].isIntersecting}).observe(orb);
(function laco(){requestAnimationFrame(laco);if(!visivel||document.hidden)return;if(gira)ang+=.0042;layout()})();
marcar(0);
if(!reduce)setInterval(()=>{if(gira&&visivel)marcar((ativo+1)%N)},4200);
})();
