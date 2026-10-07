(()=>{
const lista=(window.SELLPRIME_IMOVEIS||[]).slice(0,14),grid=document.getElementById('imoveis-grid'),vazio=document.getElementById('imoveis-vazio');
if(!grid||lista.length<3)return;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
grid.innerHTML=lista.map((i,n)=>`<li class="imovel reveal in"><a href="${esc(i.link||'#contato')}"><div class="imovel__foto"><img src="${esc(i.miniatura||i.foto)}" alt="${esc(i.alt||i.titulo)}" width="800" height="600" loading="lazy" decoding="async"></div><h3 class="imovel__titulo">${esc(i.titulo)}</h3><p class="imovel__detalhe">${esc(i.detalhe||'')}</p></a></li>`).join('');
grid.hidden=false;vazio.hidden=true;
})();
