/* ============================================================
   AIGENCI — PROPUESTA SPA  ·  Comportamiento
   ============================================================ */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- STICKERS ---------- */
  var SHAPES = {
    sparkle:'<path d="M12 1l1.6 6.4L20 9l-6.4 1.6L12 17l-1.6-6.4L4 9l6.4-1.6z"/>',
    plus:'<path d="M12 3v18M3 12h18" stroke-width="3" stroke-linecap="round" fill="none"/>',
    wave:'<path d="M2 12c2.5-5 5.5-5 8 0s5.5 5 8 0" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    dot:'<circle cx="12" cy="12" r="6"/>',
    star:'<path d="M12 2l2.6 6.5L21 9l-5 4.2L17.5 21 12 16.8 6.5 21 8 13.2 3 9l6.4-.5z"/>'
  };
  function mkSticker(shape, color, size, opacity, top, left, anim, delay){
    var el = document.createElement('div');
    el.className = 'sticker';
    el.style.cssText = 'top:'+top+';left:'+left+';width:'+size+'px;height:'+size+'px;opacity:'+opacity+
      ';animation:'+anim+' '+(anim==='floatX'?7:6)+'s var(--ease) infinite;animation-delay:'+delay+'s';
    el.innerHTML = '<svg viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="'+color+'" stroke="'+color+'">'+SHAPES[shape]+'</svg>';
    return el;
  }
  function decorate(){
    if(reduce) return;
    var darkSpecs = [
      ['sparkle','#5FCFFA',26,.9,'18%','86%','floatY',-1.2],
      ['star','#FD327B',20,.85,'64%','8%','floatY',-3.1],
      ['plus','#FFFFFF',18,.5,'30%','40%','floatX',-2.4],
      ['dot','#5FCFFA',12,.7,'78%','70%','floatY',-0.6]
    ];
    document.querySelectorAll('[data-stickers="dark"]').forEach(function(zone){
      darkSpecs.forEach(function(s){ zone.appendChild(mkSticker.apply(null,s)); });
    });
    var lightSpecs = [
      [['dot','#6F4C9E',13,.15,'12%','92%','floatY',-1.5],['sparkle','#FD327B',20,.14,'74%','4%','floatY',-2.8]],
      [['plus','#5FCFFA',18,.16,'20%','6%','floatX',-1.1],['star','#6F4C9E',18,.13,'68%','94%','floatY',-3.4]],
      [['wave','#FD327B',24,.15,'16%','90%','floatX',-0.7],['dot','#5FCFFA',12,.16,'80%','8%','floatY',-2.2]]
    ];
    var lightZones = document.querySelectorAll('.sec');
    lightZones.forEach(function(zone, i){
      var set = lightSpecs[i % lightSpecs.length];
      set.forEach(function(s){ zone.appendChild(mkSticker.apply(null,s)); });
    });
  }

  /* ---------- COLLAPSIBLE SECTIONS ---------- */
  function chevronSVG(){
    return '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
  }
  function makeCollapsible(){
    document.querySelectorAll('.sec').forEach(function(sec){
      var head = sec.querySelector('.sec-head');
      if(!head) return;
      var btn = document.createElement('button');
      btn.className = 'sec-toggle';
      btn.type = 'button';
      btn.setAttribute('aria-expanded','true');
      while(head.firstChild){ btn.appendChild(head.firstChild); }
      var chev = document.createElement('span');
      chev.className = 'chevron';
      chev.innerHTML = chevronSVG();
      btn.appendChild(chev);
      head.replaceWith(btn);

      var wrap = sec.querySelector('.wrap');
      var body = document.createElement('div');
      body.className = 'sec-body';
      var inner = document.createElement('div');
      inner.className = 'inner';
      var nodes = [];
      var found = false;
      Array.prototype.forEach.call(wrap.childNodes, function(n){
        if(n === btn){ found = true; return; }
        if(found) nodes.push(n);
      });
      nodes.forEach(function(n){ inner.appendChild(n); });
      body.appendChild(inner);
      wrap.appendChild(body);

      btn.addEventListener('click', function(){
        var collapsed = sec.classList.toggle('collapsed');
        btn.setAttribute('aria-expanded', String(!collapsed));
      });
    });
  }

  /* ---------- SECTION NAV SCROLLSPY ---------- */
  function scrollspy(){
    var pills = Array.prototype.slice.call(document.querySelectorAll('.nav-pills a'));
    if(!pills.length) return;
    var map = {};
    pills.forEach(function(p){
      var id = p.getAttribute('href').slice(1);
      map[id] = p;
      p.addEventListener('click', function(e){
        var sec = document.getElementById(id);
        if(sec && sec.classList.contains('collapsed')){
          var btn = sec.querySelector('.sec-toggle');
          if(btn) btn.click();
        }
      });
    });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          pills.forEach(function(p){ p.classList.remove('active'); });
          var p = map[en.target.id];
          if(p) p.classList.add('active');
        }
      });
    },{rootMargin:'-45% 0px -50% 0px',threshold:0});
    Object.keys(map).forEach(function(id){
      var sec = document.getElementById(id);
      if(sec) io.observe(sec);
    });
  }

  /* ---------- ANIMATED COUNTERS ---------- */
  function easeOutCubic(t){ return 1 - Math.pow(1-t, 3); }
  function runCounter(el){
    var target = parseFloat(el.getAttribute('data-target'));
    var decimals = parseInt(el.getAttribute('data-decimals')||'0',10);
    var prefix = el.getAttribute('data-prefix')||'';
    function fmt(v,d){ return d>0 ? v.toFixed(d) : Math.round(v).toLocaleString('es-MX'); }
    if(reduce){ el.textContent = prefix + fmt(target, decimals); return; }
    var dur = 1400, start = null;
    function tick(ts){
      if(start===null) start = ts;
      var t = Math.min((ts-start)/dur, 1);
      var v = target * easeOutCubic(t);
      el.textContent = prefix + fmt(v, decimals);
      if(t<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function counters(){
    var els = document.querySelectorAll('[data-target]');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ runCounter(en.target); io.unobserve(en.target); }
      });
    },{threshold:0.4});
    els.forEach(function(el){ io.observe(el); });
  }

  /* ---------- REVEAL ---------- */
  function reveals(){
    var els = document.querySelectorAll('.reveal');
    if(reduce){ els.forEach(function(el){ el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    },{threshold:0.12,rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){ io.observe(el); });
  }

  /* ---------- JOURNEY CONNECTORS ---------- */
  function connectJourney(){
    document.querySelectorAll('.journey').forEach(function(j){
      var steps = j.querySelectorAll('.jstep');
      steps.forEach(function(st, i){
        if(i === steps.length-1) return;
        var rail = document.createElement('span'); rail.className = 'jconn';
        var arr = document.createElement('span'); arr.className = 'jconn-arrow';
        st.appendChild(rail); st.appendChild(arr);
      });
    });
  }

  /* ---------- WHATSAPP CTAS ---------- */
  function initWhatsApp(){
    var NUM = '522211747545';
    document.querySelectorAll('[data-wa]').forEach(function(el){
      var msg = el.getAttribute('data-wa') || '';
      el.setAttribute('href', 'https://wa.me/' + NUM + '?text=' + encodeURIComponent(msg));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /* ---------- INIT ---------- */
  function init(){
    makeCollapsible();
    connectJourney();
    scrollspy();
    counters();
    reveals();
    decorate();
    initWhatsApp();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
