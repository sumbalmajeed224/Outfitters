(() => {
  const { $, $$, gsap, P, byId, fmt, imgSrc, cardHTML, splitChars, sstore, reduce } = OF;
  const app = OF.boot(init);

  /* ----- hero initial state (hidden until intro) ----- */
  const big = $$('.hero .big span');
  const bigChars = big.flatMap(el => splitChars(el));
  const prepHero = () => {
    gsap.set(bigChars, { yPercent: 110, opacity: 0 });
    gsap.set('#fig img', { clipPath: 'inset(100% 0 0 0)' });
    $$('.co path').forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    gsap.set('.co circle', { scale: 0, transformOrigin: 'center', transformBox: 'fill-box' });
    gsap.set('.co .lab', { opacity: 0, y: 14 });
    gsap.set(['#hmeta', '.hero .tr', '.hero .scrollhint'], { opacity: 0, y: 30 });
  };
  prepHero();

  function heroIntro() {
    const t = gsap.timeline({ defaults: { ease: 'expo.out' } });
    t.to(bigChars, { yPercent: 0, opacity: 1, duration: 1.5, stagger: .045 }, 0)
      .to('#fig img', { clipPath: 'inset(0% 0 0 0)', duration: 1.7, ease: 'expo.inOut' }, .1)
      .from('#fig img', { y: 90, duration: 2.2 }, .1)
      .to('.co circle', { scale: 1, duration: .6, stagger: .18 }, 1.3)
      .to('.co path', { strokeDashoffset: 0, duration: 1.2, stagger: .18, ease: 'power3.inOut' }, 1.3)
      .to('.co .lab', { opacity: 1, y: 0, duration: 1, stagger: .18 }, 1.7)
      .to(['#hmeta', '.hero .tr', '.hero .scrollhint'], { opacity: 1, y: 0, duration: 1.2, stagger: .12 }, 1.2);
    return t;
  }

  /* ----- preloader ----- */
  function start() {
    const pre = $('#pre');
    const lenis = OF.lenis;
    const arrived = sstore.get('of_t');
    if (arrived || sstore.get('of_pre') || reduce) {
      pre.remove(); sstore.set('of_pre', '1');
      app.curtainIn(heroIntro); return;
    }
    sstore.set('of_pre', '1');
    lenis && lenis.stop();
    const n = $('#pcn'), bar = $('.pbar i', pre), o = { v: 0 };
    gsap.set('.pw span', { yPercent: 110 });
    gsap.timeline()
      .to('.pw span', { yPercent: 0, stagger: .06, duration: .9, ease: 'expo.out' })
      .to(o, { v: 100, duration: 1.8, ease: 'power2.inOut', onUpdate: () => { n.textContent = Math.round(o.v); } }, 0)
      .to(bar, { scaleX: 1, duration: 1.8, ease: 'power2.inOut' }, 0)
      .to('.pw span', { yPercent: -110, stagger: .03, duration: .6, ease: 'expo.in' }, '+=.1')
      .to(pre, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=.25')
      .add(() => { pre.remove(); lenis && lenis.start(); heroIntro(); }, '-=.7');
  }

  /* ----- page content ----- */
  const CATS = ['outerwear', 'hoodies', 'knitwear', 'denim', 'trousers', 'tees', 'shirts', 'footwear', 'accessories'];
  const CAT_LABEL = { outerwear: 'Outerwear', hoodies: 'Hoodies', knitwear: 'Knitwear', denim: 'Denim', trousers: 'Trousers', tees: 'Tees', shirts: 'Shirts', footwear: 'Footwear', accessories: 'Extras' };
  const REP = { outerwear: 'f0396-101', hoodies: null, knitwear: null, denim: null, trousers: null, tees: null, shirts: null, footwear: null, accessories: null };

  function buildRail() {
    $('#railTrack').innerHTML = CATS.map((c, i) => {
      const list = P.filter(p => p.cat === c);
      const rep = byId[REP[c]] || list.find(p => p.img.length > 2) || list[0];
      return `<a class="cat" href="shop.html?c=${c}" data-cursor="Explore"><span class="no">0${i + 1}</span><div class="im"><img src="${imgSrc(rep.img[0])}" alt="${CAT_LABEL[c]}" loading="lazy"></div><div class="lbl"><b>${CAT_LABEL[c]}</b><span>${list.length}</span></div></a>`;
    }).join('');
  }

  function pickMix(g, n) {
    const list = P.filter(p => p.gender === g);
    const out = [], seen = new Set();
    list.forEach(p => { if (out.length < n && !seen.has(p.cat) && p.cat !== 'accessories') { seen.add(p.cat); out.push(p); } });
    list.forEach(p => { if (out.length < n && !out.includes(p) && p.cat !== 'accessories') out.push(p); });
    return out.slice(0, n);
  }
  function renderGrid(g, animate) {
    const grid = $('#homeGrid');
    const swap = () => {
      grid.innerHTML = pickMix(g, 8).map(cardHTML).join('');
      OF.initTilt(grid);
      gsap.from(grid.children, { y: 80, opacity: 0, duration: 1, stagger: .07, ease: 'expo.out', clearProps: 'all' });
    };
    if (animate) gsap.to(grid.children, { y: -30, opacity: 0, duration: .35, stagger: .03, onComplete: swap }); else swap();
  }

  function buildNotes() {
    const jacket = byId['f0454-201'], trou = byId['f0758-208'], shoe = byId['f0375-212'];
    if (!jacket) return;
    const img = $('#paperImg'); img.src = imgSrc(jacket.img[0]); img.alt = 'Model in a black faux leather jacket, brown wide-leg trousers and sandals';
    $('#paperTags').innerHTML = `
      <div class="tagl" style="right:3%;top:16%;text-align:right;align-items:flex-end">jacket<small>${jacket.title}</small></div>
      <svg width="120" height="50" viewBox="0 0 120 50" style="right:23%;top:22%"><path d="M118 8 C 80 6 50 18 6 40"/><path d="M6 40 l10 -2 M6 40 l3 -10"/></svg>
      <div class="tagl" style="left:3%;top:52%">trousers<small>${trou ? trou.title : 'Wide leg'}</small></div>
      <svg width="110" height="40" viewBox="0 0 110 40" style="left:24%;top:55%"><path d="M4 20 C 40 6 70 8 106 24"/><path d="M106 24 l-10 -6 M106 24 l-8 8"/></svg>
      <div class="tagl" style="right:5%;bottom:6%;text-align:right;align-items:flex-end">shoes<small>${shoe ? shoe.title : 'Heels'}</small></div>
      <svg width="100" height="50" viewBox="0 0 100 50" style="right:26%;bottom:8%"><path d="M96 30 C 60 38 30 30 6 10"/><path d="M6 10 l10 2 M6 10 l2 10"/></svg>`;
    $('#noteList').innerHTML = [jacket, trou, shoe].filter(Boolean).map(p => `<li><a href="product.html?id=${p.id}" data-cursor="View"><span>${p.title}<br><small>${p.cat === 'outerwear' ? 'Jacket' : p.cat === 'footwear' ? 'Shoes' : 'Trousers'}</small></span><b>${fmt(p.price)}</b></a></li>`).join('');
    // animate arrows + labels on enter
    const paths = $$('#paperTags svg path');
    paths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    gsap.timeline({ scrollTrigger: { trigger: '#paper', start: 'top 65%' } })
      .from('#paperTags .tagl', { opacity: 0, y: 16, stagger: .25, duration: .9, ease: 'expo.out' })
      .to(paths, { strokeDashoffset: 0, duration: 1, stagger: .25, ease: 'power2.inOut' }, 0.2);
    gsap.to('#paper', { rotate: 1, ease: 'none', scrollTrigger: { trigger: '#paper', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  function init() {
    buildRail(); renderGrid('men'); buildNotes();
    $$('#homeTabs .tab').forEach(b => b.addEventListener('click', () => {
      $$('#homeTabs .tab').forEach(x => x.classList.toggle('on', x === b)); renderGrid(b.dataset.g, true);
    }));
    // fill spec rows from real product data
    const jk = byId['f0396-101'];
    if (jk) { const s = $$('.spec .row span:last-child'); }

    /* hero: pin + pull apart on scroll */
    gsap.set('#fig', { transformOrigin: '50% 35%' }); gsap.set('.toast', { xPercent: -50, y: 160 });
    gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=110%', pin: true, scrub: .8, anticipatePin: 1 } })
      .to('.big.a', { xPercent: -24, ease: 'none' }, 0)
      .to('.big.b', { xPercent: 24, ease: 'none' }, 0)
      .to('#fig', { scale: 1.22, yPercent: 7, ease: 'none' }, 0)
      .to('#cos', { opacity: 0, duration: .3, ease: 'none' }, 0)
      .to(['#hmeta', '.hero .tr', '.hero .scrollhint'], { opacity: 0, y: -30, duration: .4, ease: 'none' }, 0.1);

    /* rail: horizontal pin (desktop) */
    const mm = gsap.matchMedia();
    mm.add('(min-width:801px)', () => {
      const track = $('#railTrack');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth + 0);
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#rail', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
      $$('.cat .im').forEach(im => gsap.fromTo(im, { xPercent: -5 }, { xPercent: 5, ease: 'none', scrollTrigger: { trigger: '#rail', start: 'top top', end: () => '+=' + dist(), scrub: 1 } }));
    });

    /* composer */
    gsap.timeline({ scrollTrigger: { trigger: '#comp', start: 'top top', end: '+=160%', pin: true, scrub: .8, anticipatePin: 1 } })
      .fromTo('.comp .t span', { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .25, ease: 'none', duration: .5 }, 0)
      .fromTo('#cc', { yPercent: 130, scale: .8 }, { yPercent: 0, scale: 1, ease: 'none', duration: 1 }, 0)
      .fromTo('#cl', { xPercent: -190, rotate: -14, opacity: 0 }, { xPercent: 0, rotate: -5, opacity: 1, ease: 'none', duration: .9 }, .25)
      .fromTo('#cr', { xPercent: 190, rotate: 14, opacity: 0 }, { xPercent: 0, rotate: 5, opacity: 1, ease: 'none', duration: .9 }, .3)
      .fromTo('.comp .cap', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: .15, ease: 'none', duration: .4 }, .9)
      .to('.comp .t', { scale: 1.12, ease: 'none', duration: .6 }, 1);

    /* glass spec */
    gsap.fromTo('.spec .bgim', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#spec', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('#glass', { y: 120, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '#spec', start: 'top 55%' } });
    gsap.from('.spec .pill', { scale: .6, opacity: 0, stagger: .3, duration: 1, ease: 'elastic.out(1,.6)', scrollTrigger: { trigger: '#spec', start: 'top 35%' } });
    gsap.to('.spec .pill', { y: -24, ease: 'none', scrollTrigger: { trigger: '#spec', start: 'top bottom', end: 'bottom top', scrub: 1 } });

    start();
  }
  app.go();
})();
