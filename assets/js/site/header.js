(()=>{
const btn=document.querySelector('.menu-btn'),painel=document.getElementById('menu-painel');
if(!btn||!painel)return;
const fechar=()=>{painel.hidden=true;btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label','Abrir menu');document.body.style.overflow=''};
const abrir=()=>{painel.hidden=false;btn.setAttribute('aria-expanded','true');btn.setAttribute('aria-label','Fechar menu');document.body.style.overflow='hidden'};
btn.addEventListener('click',()=>painel.hidden?abrir():fechar());
painel.addEventListener('click',e=>{if(e.target.closest('a'))fechar()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!painel.hidden){fechar();btn.focus()}});
matchMedia('(min-width:900px)').addEventListener('change',e=>{if(e.matches)fechar()});
})();
