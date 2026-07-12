(function(){
  var btn=document.querySelector('.hamburger'), nav=document.querySelector('header nav');
  if(btn&&nav){
    var p=document.createElement('nav'); p.id='m-nav'; p.setAttribute('aria-label','Mobile menu');
    p.innerHTML=nav.innerHTML; document.body.appendChild(p);
    var open=false;
    function set(o){open=o;p.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);document.documentElement.style.overflow=o?'hidden':'';}
    btn.addEventListener('click',function(){set(!open);});
    p.addEventListener('click',function(e){if(e.target.closest('a'))set(false);});
  }
  var answers=Array.prototype.slice.call(document.querySelectorAll('.faq-a'));
  answers.forEach(function(a,i){ if(i>0) a.style.display='none'; });
  answers.forEach(function(a){
    var col=a.parentElement, rowEl=col&&col.parentElement;
    if(!rowEl) return;
    rowEl.style.cursor='pointer';
    rowEl.addEventListener('click',function(){ a.style.display=(a.style.display==='none')?'block':'none'; });
  });
})();