/* Tela ilustrada do painel: escala para caber, entra em sequência e um cartão do CRM anda de etapa em etapa. */
(()=>{
const caixa=document.getElementById('tela-caixa'),tela=document.getElementById('tela');if(!caixa||!tela)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function escala(){caixa.style.setProperty('--k',Math.min(1,caixa.clientWidth/1000).toFixed(4))}
escala();addEventListener('resize',escala);
// atrasos escalonados da entrada
tela.querySelectorAll('.app-side li').forEach((e,i)=>e.style.setProperty('--e',i*70+'ms'));
tela.querySelectorAll('.app-imovel>*').forEach((e,i)=>e.style.setProperty('--e',300+i*160+'ms'));
tela.querySelector('.app-crm').style.setProperty('--e','700ms');
tela.querySelectorAll('.crm-col').forEach((e,i)=>e.style.setProperty('--e',850+i*110+'ms'));
const mov=document.getElementById('crm-mov'),chip=document.getElementById('crm-chip'),board=document.getElementById('crm-board');
const etapas=['Novo contato','Em conversa','Visita marcada','Vendido'],cols=[...board.querySelectorAll('.crm-col')];
let e=0,timer=null;
function ir(i){const c=cols[i],dx=c.offsetLeft-cols[0].offsetLeft;mov.style.transform='translateX('+dx+'px)';chip.textContent=etapas[i];mov.classList.toggle('fim',i===3)}
function passo(){
  e++;
  if(e>3){mov.classList.add('some');setTimeout(()=>{mov.style.transition='none';e=0;ir(0);requestAnimationFrame(()=>requestAnimationFrame(()=>{mov.style.transition='';mov.classList.remove('some')}))},500);return}
  ir(e)}
function iniciar(){tela.classList.add('em');if(reduce){ir(3);return}timer=setInterval(passo,2300)}
if(!('IntersectionObserver' in window)){iniciar();return}
new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();setTimeout(iniciar,300)}},{threshold:.3}).observe(caixa);
})();
