(()=>{
// Página de criar conta. PROVISÓRIO até a plataforma do Pedro Paulo ser ligada:
// valida os campos e mostra um aviso, sem enviar nada para lugar nenhum.
const form=document.getElementById('cad-form');
if(!form)return;
const aviso=document.getElementById('cad-aviso');
const AVISO='A plataforma está em fase final de preparação. Em breve o cadastro e o login ficam disponíveis por aqui.';

// modo "entrar" (cadastro.html?modo=entrar) troca os textos da mesma página
const entrar=new URLSearchParams(location.search).get('modo')==='entrar';
// perfil proprietário (cadastro.html?perfil=proprietario) só muda a foto; o link de troca entrar/criar conta mantém o perfil
const prop=document.documentElement.dataset.perfil==='proprietario';
if(prop&&!entrar)document.getElementById('cad-troca').href='cadastro.html?modo=entrar&perfil=proprietario';
if(entrar){
  document.querySelectorAll('[data-entrar]').forEach(el=>{
    const alvo=el.matches('.cad__troca')?el.querySelector('span'):el;
    alvo.textContent=el.dataset.entrar});
  document.getElementById('cad-troca').href='cadastro.html'+(prop?'?perfil=proprietario':'');
  document.getElementById('c-senha').setAttribute('autocomplete','current-password');
  document.title='Entrar | SellPrime';
}

// mostrar e esconder a senha
const olho=form.querySelector('.cad__olho'),senha=document.getElementById('c-senha');
olho.addEventListener('click',()=>{
  const ver=senha.type==='password';
  senha.type=ver?'text':'password';
  olho.setAttribute('aria-pressed',ver);
  olho.setAttribute('aria-label',ver?'Esconder senha':'Mostrar senha')});

const regras={
  'c-email':[v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),'Informe um e-mail válido.'],
  'c-senha':[v=>v.length>=8,'A senha precisa ter pelo menos 8 caracteres.']
};
function validar(id){
  const el=document.getElementById(id),[ok,msg]=regras[id],erro=form.querySelector('[data-erro-de="'+id+'"]'),bom=ok(el.value);
  el.setAttribute('aria-invalid',bom?'false':'true');erro.textContent=bom?'':msg;return bom}
Object.keys(regras).forEach(id=>document.getElementById(id).addEventListener('blur',e=>{if(e.target.value)validar(id)}));

function avisar(){aviso.textContent=AVISO;aviso.hidden=false}
form.addEventListener('submit',e=>{
  e.preventDefault();
  const ok=Object.keys(regras).map(validar).every(Boolean);
  if(!ok){form.querySelector('[aria-invalid=true]').focus();return}
  avisar()});
document.querySelectorAll('[data-provedor]').forEach(b=>b.addEventListener('click',avisar));
})();
