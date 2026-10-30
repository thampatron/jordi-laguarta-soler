(function(){
  var root=document.documentElement;
  var CL=[["Rice","--rice",[199,244,100]],["Soybean","--soy",[255,107,107]],["Cotton","--cotton",[85,98,112]],["Maize","--maize",[78,205,196]],["Millets","--millet",[212,160,23]],["Pulses","--pulse",[158,27,27]],["Sugarcane","--sugar",[196,77,255]],["Trees","--trees",[53,130,33]],["Water","--water",[26,91,171]]];
  var W=1600,H=1385,cls=null,pal=null,maps=[];
  function parse(s){s=s.trim(); if(s[0]==='#'){var n=parseInt(s.slice(1),16);return [n>>16&255,n>>8&255,n&255];} var m=s.match(/[\d.]+/g)||[0,0,0]; return [+m[0],+m[1],+m[2]];}
  function css(v){return parse(getComputedStyle(root).getPropertyValue(v));}
  function palette(){pal=CL.map(function(c){return css(c[1]);}); pal.non=css('--noncrop'); pal.border=css('--border');}
  function M(cv){this.cv=cv; this.ctx=cv.getContext('2d'); this.out=this.ctx.createImageData(W,H); this.sel=-1;}
  M.prototype.draw=function(k){
    if(!cls) return; if(k===undefined) k=this.sel; var o=this.out.data;
    for(var p=0,n=cls.length;p<n;p++){var c=cls[p],j=p*4,col;
      if(c===255){o[j+3]=0;continue}
      if(c<9) col=(k<0||c===k)?pal[c]:pal.non; else if(c===20) col=pal.non; else col=pal.border;
      o[j]=col[0];o[j+1]=col[1];o[j+2]=col[2];o[j+3]=255;}
    this.ctx.putImageData(this.out,0,0);
  };
  function bindButtons(list, map, items){
    items.forEach(function(it){
      var b=it.el, idx=it.cls;
      b.addEventListener('click',function(e){ e.preventDefault(); map.sel=(map.sel===idx)?-1:idx; sync(); map.draw(); });
      b.addEventListener('mouseenter',function(){ if(map.sel<0) map.draw(idx); });
      b.addEventListener('mouseleave',function(){ if(map.sel<0) map.draw(); });
      b.addEventListener('focus',function(){ if(map.sel<0) map.draw(idx); });
      b.addEventListener('blur',function(){ if(map.sel<0) map.draw(); });
    });
    function sync(){ items.forEach(function(it){ it.el.setAttribute('aria-pressed', String(it.cls===map.sel)); }); }
  }
  /* legend lists: <ul data-legend-for="canvasId"> */
  Array.prototype.forEach.call(document.querySelectorAll('canvas[data-cropmap]'),function(cv){
    var m=new M(cv); maps.push(m);
    var lg=document.querySelector('[data-legend-for="'+cv.id+'"]');
    if(lg){ var items=[];
      CL.forEach(function(c,i){ var li=document.createElement('li'), b=document.createElement('button'); b.type='button'; b.id=cv.id+'-k'+i; b.setAttribute('aria-pressed','false'); b.style.setProperty('--c','var('+c[1]+')'); b.innerHTML='<i></i>'+c[0]; li.appendChild(b); lg.appendChild(li); items.push({el:b,cls:i}); });
      bindButtons(lg,m,items); }
    var rl=document.querySelector('[data-rows-for="'+cv.id+'"]');
    if(rl){ var R=[["Sugarcane",.96,6],["Rice",.95,0],["Soybean",.95,1],["Cotton",.91,2],["Pulses",.81,5],["Maize",.79,3],["Millets",.60,4]], its=[];
      R.forEach(function(r,i){ var li=document.createElement('li'), b=document.createElement('button'); b.type='button'; b.id=cv.id+'-r'+i; b.setAttribute('aria-pressed','false');
        b.innerHTML='<span class="nm">'+r[0]+'</span><span class="track"><span class="dot" style="left:'+((r[1]-.5)/.5*100).toFixed(1)+'%; --c:var('+CL[r[2]][1]+')"></span></span><span class="val">'+r[1].toFixed(2)+'</span>';
        li.appendChild(b); rl.appendChild(li); its.push({el:b,cls:r[2]}); });
      bindButtons(rl,m,its); }
  });
  if(!maps.length) return;
  var src=maps[0].cv.getAttribute('data-src');
  var img=new Image();
  img.onload=function(){
    var t=document.createElement('canvas'); t.width=W; t.height=H; var x=t.getContext('2d'); x.drawImage(img,0,0,W,H);
    var d; try{ d=x.getImageData(0,0,W,H).data; }catch(e){ maps.forEach(function(m){m.ctx.drawImage(img,0,0,W,H);}); return; }
    cls=new Uint8Array(W*H);
    for(var p=0;p<cls.length;p++){var j=p*4; if(d[j+3]<128){cls[p]=255;continue}
      var r=d[j],g=d[j+1],b=d[j+2],k=23;
      for(var q=0;q<CL.length;q++){var c=CL[q][2]; if(r===c[0]&&g===c[1]&&b===c[2]){k=q;break;}}
      if(k===23&&r===235&&g===235&&b===235) k=20; cls[p]=k;}
    palette(); maps.forEach(function(m){m.draw();});
  };
  img.src=src;
  function re(){ if(cls){ palette(); maps.forEach(function(m){m.draw();}); } }
  var mq=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)'); if(mq&&mq.addEventListener) mq.addEventListener('change',re);
  new MutationObserver(re).observe(root,{attributes:true,attributeFilter:['data-theme']});
})();
/* phone menu */
(function(){ var n=document.querySelector('.nav'), b=document.querySelector('.menu-btn'); if(!n||!b) return;
  function close(){ n.classList.remove('open'); b.setAttribute('aria-expanded','false'); }
  b.addEventListener('click',function(){ var o=n.classList.toggle('open'); b.setAttribute('aria-expanded',String(o)); });
  Array.prototype.forEach.call(n.querySelectorAll('.links a'),function(a){ a.addEventListener('click',close); });
  document.addEventListener('click',function(e){ if(n.classList.contains('open')&&!n.contains(e.target)) close(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&n.classList.contains('open')){ close(); b.focus(); } }); })();
