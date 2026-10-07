/* Grifo dourado em "ecossistema" (duas linhas finas). A seta e o eyebrow manuscrito saíram em 07/10/2026:
   o eyebrow agora é o mesmo das outras seções, na fonte do manual. Só liga a animação do traço depois que as fontes carregam. */
(()=>{
const txt=document.getElementById('hero-text');if(!txt)return;
let ligado=false;
function iniciar(){if(ligado)return;ligado=true;txt.classList.add('grifo-on')}
/* requestAnimationFrame some em aba escondida; o temporizador garante que o grifo sempre apareça */
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>{requestAnimationFrame(iniciar);setTimeout(iniciar,300)});
})();
