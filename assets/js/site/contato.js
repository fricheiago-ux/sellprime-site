(()=>{
const cfg=window.SELLPRIME||{};
const link=msg=>'https://wa.me/'+cfg.whatsapp+'?text='+encodeURIComponent(msg);
const form=document.querySelector('form[data-form]');
const tipo=form?form.dataset.form:'corretor';
const saudacao={corretor:'Olá! Sou corretor(a) e quero conhecer a SellPrime.',proprietario:'Olá! Sou proprietário(a) e quero anunciar meu imóvel na SellPrime.'};
// botão "Falar pelo WhatsApp": abre conversa direta
document.querySelectorAll('[data-whatsapp]').forEach(a=>{a.href=link(saudacao[tipo]);a.target='_blank';a.rel='noopener'});
if(!form)return;
// botões dos planos escolhem o plano no formulário
document.querySelectorAll('[data-plano]').forEach(a=>a.addEventListener('click',()=>{
  const r=form.querySelector('input[name=plano][value="'+a.dataset.plano+'"]');if(r)r.checked=true}));
const todas={
  'f-nome':[v=>v.trim().length>=2,'Informe seu nome.'],
  'f-whats':[v=>v.replace(/\D/g,'').length>=10,'Informe um WhatsApp com DDD.'],
  'f-cidade':[v=>v.trim().length>=2,'Informe sua cidade de atuação.'],
  'f-local':[v=>v.trim().length>=3,'Informe a cidade e o bairro do imóvel.']
};
// só valida os campos que existem neste formulário
const regras=Object.fromEntries(Object.entries(todas).filter(([id])=>document.getElementById(id)));
function validar(id){
  const el=document.getElementById(id),[ok,msg]=regras[id],erro=form.querySelector('[data-erro-de="'+id+'"]'),bom=ok(el.value);
  el.setAttribute('aria-invalid',bom?'false':'true');erro.textContent=bom?'':msg;return bom}
Object.keys(regras).forEach(id=>document.getElementById(id).addEventListener('blur',()=>validar(id)));
form.addEventListener('submit',e=>{
  e.preventDefault();
  const todos=Object.keys(regras).map(validar);
  if(todos.includes(false)){form.querySelector('[aria-invalid=true]').focus();return}
  const d=new FormData(form),v=k=>(d.get(k)||'').trim();
  const linhas=tipo==='proprietario'
    ?[saudacao.proprietario,'','Nome: '+v('nome'),'WhatsApp: '+v('whatsapp'),'Tipo de imóvel: '+v('tipo'),'Cidade e bairro: '+v('local'),'Valor pretendido: '+(v('valor')||'não informado')]
    :['Olá! Sou corretor(a) e quero fazer parte da SellPrime.','','Nome: '+v('nome'),'WhatsApp: '+v('whatsapp'),'Cidade: '+v('cidade'),'CRECI: '+(v('creci')||'não informado'),'Plano: '+v('plano')];
  window.open(link(linhas.join('\n')),'_blank','noopener');
});
})();
