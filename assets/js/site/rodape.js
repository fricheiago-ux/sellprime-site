/* Rodapé: e-mail vem do config.js; sem e-mail definido, o ícone fica apagado (não inventar endereço). */
(()=>{
const cfg=window.SELLPRIME||{},mail=document.querySelector('[data-rodape-email]');
if(mail&&cfg.email){const a=document.createElement('a');a.href='mailto:'+cfg.email;a.setAttribute('aria-label','Enviar e-mail');a.innerHTML=mail.innerHTML;mail.replaceWith(a)}
})();
