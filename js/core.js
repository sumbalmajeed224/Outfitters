/* OUTFITTERS core: layout injection, smooth scroll, cursor, transitions, cart, motion helpers */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const P = window.PRODUCTS || [];
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const fmt = n => 'Rs. ' + Number(n).toLocaleString('en-US');
  const imgSrc = f => 'assets/img/' + f;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const sstore = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  gsap.registerPlugin(ScrollTrigger, window.Flip);
  gsap.config({ nullTargetWarn: false });
  if (reduce) gsap.globalTimeline.timeScale(100);

  /* ---------- swatch colours ---------- */
  const SW = [['dark brown', '#3a261b'], ['brown', '#6b4630'], ['chocolate', '#3e2a22'], ['coffee', '#4b3326'], ['tan', '#b58a5c'], ['camel', '#b78d5e'], ['mushroom', '#a89a8a'], ['taupe', '#8c7f73'], ['beige', '#d6c4a6'], ['sand', '#d8c8a8'], ['stone', '#c9c0b0'], ['khaki', '#a39a6b'], ['olive', '#5f6b45'], ['green', '#3f6a4b'], ['jet black', '#0c0c0b'], ['black', '#101010'], ['charcoal', '#33353a'], ['anthracite', '#2b2d31'], ['grey', '#8b8e93'], ['gray', '#8b8e93'], ['silver', '#b9bcc0'], ['off white', '#ece7da'], ['ecru', '#e6dfcd'], ['ivory', '#efe9d8'], ['cream', '#efe6cf'], ['white', '#f5f5f2'], ['navy', '#1d2540'], ['dark blue', '#1e3350'], ['indigo', '#2c3e66'], ['light blue', '#9ab6d3'], ['ice', '#c4d6e5'], ['blue', '#3b5f91'], ['teal', '#2c6a6a'], ['maroon', '#5c1f2b'], ['burgundy', '#5a1b2a'], ['wine', '#582233'], ['red', '#a82a2a'], ['rust', '#a4502b'], ['orange', '#d2742f'], ['mustard', '#c59a2b'], ['yellow', '#e0c24c'], ['pink', '#d9a3b0'], ['rose', '#c98c99'], ['purple', '#5b3f72'], ['lilac', '#b3a1c9'], ['lavender', '#b3a1c9']];
  const swatch = name => {
    const n = (name || '').toLowerCase();
    for (const [k, v] of SW) if (n.includes(k)) return v;
    let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) % 360;
    return `hsl(${h} 25% 45%)`;
  };

  /* ---------- text splitting ---------- */
  function splitWords(el) {
    if (el.dataset.split) return $$('.wi', el);
    el.dataset.split = '1';
    const walk = (node, out) => {
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) { out.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = t;
            w.appendChild(i); out.appendChild(w);
          });
        } else if (n.nodeType === 1) {
          const c = n.cloneNode(false); out.appendChild(c); walk(n, c);
        }
      });
    };
    const tmp = document.createElement('div'); walk(el, tmp);
    el.setAttribute('aria-label', el.textContent);
    el.innerHTML = tmp.innerHTML;
    return $$('.wi', el);
  }
  function splitChars(el) {
    if (el.dataset.split) return $$('.ch', el);
    el.dataset.split = '1';
    const txt = el.textContent; el.setAttribute('aria-label', txt); el.textContent = '';
    txt.split(/(\s+)/).forEach(tok => {
      if (!tok) return;
      if (/^\s+$/.test(tok)) { el.appendChild(document.createTextNode(' ')); return; }
      const wd = document.createElement('span'); wd.className = 'cw'; wd.setAttribute('aria-hidden', 'true');
      [...tok].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; wd.appendChild(s); });
      el.appendChild(wd);
    });
    return $$('.ch', el);
  }

  /* ---------- product card ---------- */
  const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const sortSizes = a => [...a].sort((x, y) => { const i = SIZE_ORDER.indexOf(x), j = SIZE_ORDER.indexOf(y); return (i < 0 ? 99 : i) - (j < 0 ? 99 : j) || String(x).localeCompare(y, undefined, { numeric: true }); });
  function cardHTML(p) {
    const qa = sortSizes(p.sizes).slice(0, 6).map(s => `<button data-qa="${p.id}" data-size="${s}" aria-label="Add size ${s}">${s}</button>`).join('');
    return `<a class="card" href="product.html?id=${p.id}" data-id="${p.id}" data-g="${p.gender}" data-c="${p.cat}" data-cursor="View">
      <div class="ph">
        ${p.isNew ? '<span class="badge">New</span>' : (p.was ? '<span class="badge sale">Sale</span>' : '')}
        <img src="${imgSrc(p.img[0])}" alt="${p.title}" loading="lazy" width="760" height="1140">
        ${p.img[1] ? `<img class="b" src="${imgSrc(p.img[1])}" alt="" loading="lazy" width="760" height="1140">` : ''}
        ${qa ? `<div class="qa"><small>Quick add</small>${qa}</div>` : ''}
      </div>
      <div class="inf"><div><h3>${p.title}</h3><p>${p.colors.slice(0, 2).join(' / ')}${p.colors.length > 2 ? ' +' + (p.colors.length - 2) : ''}</p></div>
      <div class="pr">${fmt(p.price)}${p.was ? `<s>${fmt(p.was)}</s>` : ''}</div></div></a>`;
  }

  /* ---------- cart ---------- */
  const cart = {
    items: store.get('of_cart', []),
    save() { store.set('of_cart', this.items); this.render(); },
    key: i => `${i.id}|${i.color}|${i.size}`,
    add(id, color, size, qty = 1) {
      const f = this.items.find(i => this.key(i) === `${id}|${color}|${size}`);
      if (f) f.qty += qty; else this.items.push({ id, color, size, qty });
      this.save(); toast('Added to bag');
      const c = $('.bagbtn .count'); if (c) gsap.fromTo(c, { scale: 1.8 }, { scale: 1, duration: .8, ease: 'elastic.out(1,.4)' });
    },
    setQty(k, q) { const i = this.items.find(x => this.key(x) === k); if (!i) return; i.qty = Math.max(0, q); this.items = this.items.filter(x => x.qty > 0); this.save(); },
    count() { return this.items.reduce((a, i) => a + i.qty, 0); },
    total() { return this.items.reduce((a, i) => a + (byId[i.id]?.price || 0) * i.qty, 0); },
    lineHTML(i) {
      const p = byId[i.id]; if (!p) return '';
      const k = this.key(i);
      return `<div class="li" data-k="${k}"><a href="product.html?id=${p.id}"><img src="${imgSrc(p.img[0])}" alt="${p.title}"></a>
        <div><h4>${p.title}</h4><p>${i.color} · ${i.size}</p><div class="qty"><button data-q="-1" aria-label="Decrease">−</button><span>${i.qty}</span><button data-q="1" aria-label="Increase">+</button></div><button class="rm" data-q="rm">Remove</button></div>
        <div style="font-weight:700">${fmt(p.price * i.qty)}</div></div>`;
    },
    render() {
      const n = this.count();
      $$('.bagbtn .count').forEach(c => c.textContent = n);
      const box = $('.drawer .items');
      if (box) {
        box.innerHTML = this.items.length ? this.items.map(i => this.lineHTML(i)).join('') : '<div class="empty"><p class="serif">Your bag is empty.</p><p style="opacity:.6;margin:10px 0 24px">The winter edit is waiting.</p><a class="btn dark" href="shop.html">Shop now <span class="ar">→</span></a></div>';
        $('.drawer .tot span:last-child').textContent = fmt(this.total());
        $('.drawer .foot').style.display = this.items.length ? '' : 'none';
      }
      if (window.__renderCartPage) window.__renderCartPage();
    }
  };
  window.OF = { $, $$, gsap, reduce, fine, P, byId, fmt, imgSrc, splitWords, splitChars, cardHTML, cart, swatch, sortSizes, store, sstore };

  function toast(msg) {
    const t = $('.toast'); $('.toast b', t).textContent = msg;
    gsap.killTweensOf(t);
    gsap.timeline().to(t, { yPercent: 0, y: 0, xPercent: -50, duration: .7, ease: 'expo.out' }).to(t, { y: 160, duration: .6, ease: 'expo.in' }, '+=1.8');
  }
  OF.toast = toast;

  /* ---------- layout ---------- */
  const NAV = [['Shop', 'shop.html'], ['Men', 'shop.html?g=men'], ['Women', 'shop.html?g=women'], ['Outerwear', 'shop.html?c=outerwear'], ['Lookbook', 'lookbook.html']];
  function injectLayout() {
    document.body.insertAdjacentHTML('afterbegin', `
      <div class="cursor"><span></span></div>
      <div class="curtain" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><b>Outfitters</b></div>
      <header class="hdr"><a class="logo" href="index.html" data-magnetic aria-label="Outfitters home">Outfitters</a>
        <nav class="nav">${NAV.map(([t, h]) => `<a href="${h}" data-t="${t}"><span>${t}</span></a>`).join('')}</nav>
        <div class="hdr-r"><button class="bagbtn" data-magnetic aria-label="Open bag">Bag <span class="count">0</span></button><button class="burger" aria-label="Menu"><i></i><i></i></button></div></header>
      <div class="menu" aria-hidden="true"><ul>${NAV.map(([t, h]) => `<li><a href="${h}"><span>${t}</span></a></li>`).join('')}</ul><small>Concept redesign · Winter 26 · Products from outfitters.com.pk</small></div>
      <div class="scrim"></div>
      <aside class="drawer" aria-label="Shopping bag"><header><h3>Bag</h3><button class="close" aria-label="Close bag" style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">Close ✕</button></header><div class="items"></div>
        <div class="foot"><div class="tot"><span>Subtotal</span><span>Rs. 0</span></div><a class="btn dark block" href="cart.html">View bag &amp; checkout <span class="ar">→</span></a></div></aside>
      <div class="toast"><i></i><b></b></div>`);
    const f = document.createElement('footer'); f.className = 'ftr';
    const cats = ['outerwear', 'hoodies', 'knitwear', 'denim', 'trousers', 'tees', 'shirts', 'footwear', 'accessories'];
    f.innerHTML = `<div class="top"><div><h4>Newsletter</h4><p class="serif" style="font-size:clamp(28px,3vw,44px);line-height:1;max-width:14ch">Cold weather, early access.</p><form class="nl" onsubmit="event.preventDefault();OF.toast('You’re on the list');this.reset()"><input type="email" placeholder="Email address" aria-label="Email" required><button>Join →</button></form></div>
      <div><h4>Shop</h4><ul>${cats.slice(0, 5).map(c => `<li><a href="shop.html?c=${c}">${c[0].toUpperCase() + c.slice(1)}</a></li>`).join('')}</ul></div>
      <div><h4>More</h4><ul>${cats.slice(5).map(c => `<li><a href="shop.html?c=${c}">${c[0].toUpperCase() + c.slice(1)}</a></li>`).join('')}<li><a href="lookbook.html">Lookbook</a></li></ul></div>
      <div><h4>Store</h4><ul><li><a href="https://outfitters.com.pk" target="_blank" rel="noopener">outfitters.com.pk ↗</a></li><li><a href="cart.html">Bag</a></li></ul></div></div>
      <div class="word disp" data-foot>Outfitters</div>
      <div class="bot"><span>© Outfitters — concept redesign, Winter 26</span><span>Product names, images and prices from outfitters.com.pk</span></div>`;
    document.body.appendChild(f);
  }

  /* ---------- smooth scroll ---------- */
  let lenis;
  function initScroll() {
    if (reduce || typeof Lenis === 'undefined') return;
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    OF.lenis = lenis;
  }

  /* ---------- header behaviour ---------- */
  function initHeader() {
    const h = $('.hdr'); let last = 0;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => {
      const y = s.scroll();
      if (document.body.classList.contains('menu-open')) return;
      h.classList.toggle('hide', y > last && y > 160);
      last = y;
    } });
    // menu
    const menu = $('.menu'), burger = $('.burger'); let open = false;
    const links = $$('.menu li a span');
    burger.addEventListener('click', () => {
      open = !open; document.body.classList.toggle('menu-open', open);
      lenis && (open ? lenis.stop() : lenis.start());
      if (open) { gsap.set(menu, { visibility: 'visible' }); gsap.timeline().to(menu, { clipPath: 'inset(0 0 0% 0)', duration: .9, ease: 'expo.inOut' }).fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: .9, stagger: .07, ease: 'expo.out' }, '-=.4'); }
      else gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'expo.inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
    });
    // drawer
    const drawer = $('.drawer'), scrim = $('.scrim');
    const openD = () => { gsap.set(scrim, { visibility: 'visible' }); gsap.to(scrim, { opacity: 1, duration: .5 }); gsap.to(drawer, { xPercent: 0, x: 0, duration: .8, ease: 'expo.out' }); gsap.fromTo('.drawer .li', { x: 40, opacity: 0 }, { x: 0, opacity: 1, stagger: .08, delay: .25, duration: .7, ease: 'expo.out' }); lenis && lenis.stop(); };
    const closeD = () => { gsap.to(scrim, { opacity: 0, duration: .5, onComplete: () => gsap.set(scrim, { visibility: 'hidden' }) }); gsap.to(drawer, { xPercent: 102, duration: .7, ease: 'expo.inOut' }); lenis && lenis.start(); };
    OF.openBag = openD;
    $('.bagbtn').addEventListener('click', openD);
    $('.drawer .close').addEventListener('click', closeD); scrim.addEventListener('click', closeD);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeD(); });
    drawer.addEventListener('click', e => qtyHandler(e));
    gsap.set(drawer, { xPercent: 102 });
  }
  function qtyHandler(e) {
    const b = e.target.closest('[data-q]'); if (!b) return;
    const li = b.closest('.li'); const k = li.dataset.k; const cur = cart.items.find(i => cart.key(i) === k);
    const q = b.dataset.q;
    if (q === 'rm') cart.setQty(k, 0); else cart.setQty(k, cur.qty + Number(q));
  }
  OF.qtyHandler = qtyHandler;

  /* ---------- cursor ---------- */
  function initCursor() {
    if (!fine) return;
    const c = $('.cursor'), lab = $('span', c);
    const x = gsap.quickTo(c, 'x', { duration: .35, ease: 'power3' }), y = gsap.quickTo(c, 'y', { duration: .35, ease: 'power3' });
    addEventListener('pointermove', e => { x(e.clientX); y(e.clientY); });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor]');
      const a = e.target.closest('a,button,input,select,summary');
      if (t) { lab.textContent = t.dataset.cursor; c.classList.add('big'); c.classList.remove('hov'); }
      else { c.classList.remove('big'); c.classList.toggle('hov', !!a); }
    });
  }

  /* ---------- magnetic ---------- */
  function initMagnetic(root = document) {
    if (!fine) return;
    $$('[data-magnetic]', root).forEach(el => {
      if (el.dataset.mg) return; el.dataset.mg = 1;
      const xt = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), yt = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); xt((e.clientX - r.left - r.width / 2) * .35); yt((e.clientY - r.top - r.height / 2) * .35); });
      el.addEventListener('pointerleave', () => { xt(0); yt(0); });
    });
  }

  /* ---------- page transition ---------- */
  function initTransitions() {
    const cur = $('.curtain'), bars = $$('i', cur), word = $('b', cur);
    const internal = a => a.origin === location.origin && !a.target && !a.hasAttribute('download') && /\.html$|\/$/.test(a.pathname) && !(a.pathname === location.pathname && a.search === location.search);
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      if (!internal(a)) return;
      e.preventDefault();
      const href = a.href; sstore.set('of_t', '1');
      gsap.set(cur, { pointerEvents: 'auto' });
      gsap.timeline({ onComplete: () => { location.href = href; } })
        .to(bars, { scaleY: 1, duration: .6, stagger: .06, ease: 'expo.inOut', transformOrigin: 'bottom' })
        .to(word, { opacity: 1, duration: .3 }, '-=.3');
    });
    addEventListener('pageshow', e => { if (e.persisted) { gsap.set(bars, { scaleY: 0 }); gsap.set(word, { opacity: 0 }); gsap.set(cur, { pointerEvents: 'none' }); } });
  }
  function curtainIn(done) {
    const cur = $('.curtain'), bars = $$('i', cur), word = $('b', cur);
    if (sstore.get('of_t')) {
      sstore.del('of_t');
      gsap.set(bars, { scaleY: 1 }); gsap.set(word, { opacity: 1 });
      gsap.timeline({ delay: .15 }).to(word, { opacity: 0, duration: .3 }).to(bars, { scaleY: 0, transformOrigin: 'top', duration: .8, stagger: .06, ease: 'expo.inOut' }, '-=.1').add(() => done && done(), '-=.45');
    } else done && done();
  }

  /* ---------- scroll motion helpers ---------- */
  function initMotion(root = document) {
    // headline split reveal
    $$('[data-split-in]', root).forEach(el => {
      const w = splitWords(el);
      gsap.from(w, { yPercent: 115, rotate: 4, duration: 1.2, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-chars-in]', root).forEach(el => {
      const c = splitChars(el);
      gsap.from(c, { yPercent: 110, duration: 1.1, stagger: { each: .035, from: 'start' }, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    // scrub words
    $$('[data-scrub]', root).forEach(el => {
      const w = splitWords(el);
      gsap.fromTo(w, { opacity: .14, yPercent: 0 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: .6 } });
    });
    // generic reveal
    $$('[data-reveal]', root).forEach(el => {
      gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    $$('[data-stagger]', root).forEach(el => {
      gsap.from(el.children, { y: 70, opacity: 0, duration: 1.1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    // image mask reveal
    $$('[data-mask]', root).forEach(el => {
      gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 88%' } });
      const im = $('img', el); if (im) gsap.fromTo(im, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    // parallax
    $$('[data-parallax]', root).forEach(el => {
      const s = parseFloat(el.dataset.parallax) || .15;
      gsap.to(el, { yPercent: s * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // count up
    $$('[data-count]', root).forEach(el => {
      const to = parseFloat(el.dataset.count), o = { v: 0 }; const dec = el.dataset.dec ? Number(el.dataset.dec) : 0;
      gsap.to(o, { v: to, duration: 2.2, ease: 'expo.out', onUpdate: () => { el.firstChild.textContent = o.v.toFixed(dec); }, scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    // marquee
    $$('.marquee', root).forEach(m => {
      if (m.dataset.on) return; m.dataset.on = 1;
      const tr = $('.track', m); const one = tr.innerHTML; tr.innerHTML = one + one + one + one;
      const dir = m.dataset.dir === 'r' ? 1 : -1;
      const tw = gsap.fromTo(tr, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: 32, ease: 'none', repeat: -1 });
      let lastY = scrollY;
      gsap.ticker.add(() => { const d = Math.abs(scrollY - lastY); lastY = scrollY; tw.timeScale(gsap.utils.interpolate(tw.timeScale(), 1 + Math.min(d / 6, 7), .12)); });
    });
  }

  function initTilt(root = document) {
    if (!fine) return;
    $$('.card', root).forEach(c => {
      if (c.dataset.tilt) return; c.dataset.tilt = 1;
      const ph = $('.ph', c);
      const rx = gsap.quickTo(ph, 'rotationX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(ph, 'rotationY', { duration: .6, ease: 'power3' });
      gsap.set(ph, { transformPerspective: 900 });
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 8); rx(-((e.clientY - r.top) / r.height - .5) * 8); });
      c.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* quick-add delegation */
  document.addEventListener('click', e => {
    const q = e.target.closest('[data-qa]');
    if (!q) return;
    e.preventDefault(); e.stopPropagation();
    const p = byId[q.dataset.qa]; cart.add(p.id, p.colors[0], q.dataset.size);
  }, true);

  function initFooter() {
    const w = $('[data-foot]'); const c = splitChars(w);
    gsap.from(c, { yPercent: 100, duration: 1.4, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: w, start: 'top 95%' } });
  }

  /* ---------- boot ---------- */
  OF.initMotion = initMotion; OF.initTilt = initTilt; OF.initMagnetic = initMagnetic;
  OF.boot = function (page) {
    injectLayout(); initScroll(); initHeader(); initCursor(); initTransitions(); cart.render();
    initMagnetic(); initFooter();
    const go = () => { initMotion(); initTilt(); page && page(); ScrollTrigger.refresh(); };
    addEventListener('load', () => ScrollTrigger.refresh());
    return { go, curtainIn };
  };
})();
