/* Carrega o Three.js (cópia local) uma única vez, só quando alguma cena 3D pedir. */
(()=>{
let p=null;
window.spThree=()=>p||(p=new Promise((ok,no)=>{
  if(window.THREE)return ok();
  const s=document.createElement('script');s.src='assets/js/vendor/three.min.js?v=1';s.onload=ok;s.onerror=no;document.head.appendChild(s)}));
window.spTemWebGL=()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl')||c.getContext('experimental-webgl'))}catch(e){return false}};
window.spQuandoCarregar=fn=>{if(document.readyState==='complete')setTimeout(fn,0);else addEventListener('load',()=>setTimeout(fn,0),{once:true})};
})();
