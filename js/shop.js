(() => {
  const { $, $$, gsap, P, cardHTML, splitChars, reduce } = OF;
  const app = OF.boot(init);
  const CATS = ['outerwear', 'hoodies', 'knitwear', 'denim', 'trousers', 'tees', 'shirts', 'footwear', 'accessories'];
  const LBL = { all: 'All', outerwear: 'Outerwear', hoodies: 'Hoodies', knitwear: 'Knitwear', denim: 'Denim', trousers: 'Trousers', tees: 'Tees', shirts: 'Shirts', footwear: 'Footwear', accessories: 'Extras' };
  const SUB = {
    outerwear: 'Faux leather, suede, denim and quilted layers for the cold.', hoodies: 'Heavyweight fleece, relaxed cuts.', knitwear: 'Sweaters and cardigans, soft and structured.',
    denim: 'Wide, baggy and straight — washed down.', trousers: 'Cargos, wide legs and everything in between.', tees: 'Graphic, plain and boxy.', shirts: 'Overshirts and button-ups.', footwear: 'Boots, flats, heels and sneakers.', accessories: 'Bags, belts, caps and jewellery.'
  };
  const DEFAULT_SUB = 'Faux leather, denim, knitwear and layers. Filter, sort, and watch the grid rearrange.';
  const sp = new URLSearchParams(location.search);
  const state = { g: ['men', 'women'].includes(sp.get('g')) ? sp.get('g') : 'all', c: CATS.includes(sp.get('c')) ? sp.get('c') : 'all', sort: 'featured', q: '' };
  const grid = $('#shopGrid');
  let cards = [];

  function init() {
    grid.innerHTML = P.map(cardHTML).join('');
    cards = $$('.card', grid); cards.forEach((c, i) => { c.dataset.i = i; });
    OF.initTilt(grid);
    drawBar(); title(true); apply(false);
    $('#q').addEventListener('input', e => { state.q = e.target.value.trim().toLowerCase(); apply(true); });
    $('#sort').addEventListener('change', e => { state.sort = e.target.value; apply(true); });
    $('#clear').addEventListener('click', () => { state.g = 'all'; state.c = 'all'; state.q = ''; $('#q').value = ''; drawBar(); title(); apply(true); });
    gsap.from('.bar', { yPercent: -100, opacity: 0, duration: 1, ease: 'expo.out', delay: .4 });
    reveal();
    app.curtainIn();
  }

  function reveal() {
    const vis = cards.filter(c => !c.classList.contains('hidden'));
    gsap.set(vis, { opacity: 0, y: 70 });
    ScrollTrigger.batch(vis, { start: 'top 94%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, stagger: .06, ease: 'expo.out', clearProps: 'opacity,transform' }) });
  }

  function drawBar() {
    const n = (g, c) => P.filter(p => (g === 'all' || p.gender === g) && (c === 'all' || p.cat === c)).length;
    $('#gGrp').innerHTML = ['all', 'men', 'women'].map(g => `<button class="tab ${state.g === g ? 'on' : ''}" data-g="${g}">${g === 'all' ? 'All' : g[0].toUpperCase() + g.slice(1)}</button>`).join('');
    $('#cGrp').innerHTML = ['all', ...CATS].map(c => `<button class="tab ${state.c === c ? 'on' : ''}" data-c="${c}">${LBL[c]}<sup>${n(state.g, c)}</sup></button>`).join('');
  }
  $('#bar').addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (!b) return;
    if (b.dataset.g) state.g = b.dataset.g;
    if (b.dataset.c) state.c = b.dataset.c;
    drawBar(); title(); apply(true);
  });

  function title(first) {
    const el = $('#shopTitle');
    const t = state.c !== 'all' ? LBL[state.c] : state.g !== 'all' ? (state.g === 'men' ? 'Men' : 'Women') : 'Shop';
    el.textContent = t; delete el.dataset.split;
    el.style.setProperty('--tsize', Math.min(19, 88 / (t.length * .95)) + 'vw');
    const ch = splitChars(el);
    gsap.from(ch, { yPercent: 115, duration: 1.2, stagger: .04, ease: 'expo.out', delay: first ? .5 : 0 });
    $('#shopEy').textContent = state.c !== 'all' && state.g !== 'all' ? (state.g === 'men' ? 'Men' : 'Women') : 'All products';
    $('#shopSub').textContent = SUB[state.c] || DEFAULT_SUB;
  }

  const prod = el => P.find(p => p.id === el.dataset.id);
  const match = p => (state.g === 'all' || p.gender === state.g) && (state.c === 'all' || p.cat === state.c) &&
    (!state.q || (p.title + ' ' + p.cat + ' ' + p.colors.join(' ')).toLowerCase().includes(state.q));

  function apply(animate) {
    ScrollTrigger.getAll().filter(t => t.vars && t.vars.once).forEach(t => t.kill());
    gsap.set(cards, { clearProps: 'opacity,transform,y' });
    const flip = animate && !reduce ? Flip.getState(cards) : null;
    cards.forEach(el => el.classList.toggle('hidden', !match(prod(el))));
    const arr = [...cards].sort((a, b) => {
      const A = prod(a), B = prod(b);
      if (state.sort === 'low') return A.price - B.price;
      if (state.sort === 'high') return B.price - A.price;
      if (state.sort === 'new') return (B.isNew - A.isNew) || (a.dataset.i - b.dataset.i);
      return a.dataset.i - b.dataset.i;
    });
    arr.forEach(el => grid.appendChild(el));
    const n = cards.filter(c => !c.classList.contains('hidden')).length;
    $('#countLine').textContent = `${n} product${n === 1 ? '' : 's'}`;
    $('#shopCount').textContent = `${n} items`;
    $('#empty').style.display = n ? 'none' : 'block';
    const qs = [state.g !== 'all' ? 'g=' + state.g : '', state.c !== 'all' ? 'c=' + state.c : ''].filter(Boolean).join('&');
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
    if (flip) {
      Flip.from(flip, {
        duration: 1, ease: 'expo.inOut', absolute: true, stagger: { each: .008, from: 'start' }, scale: false,
        onEnter: els => gsap.fromTo(els, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: .9, delay: .35, stagger: .02, ease: 'expo.out' }),
        onLeave: els => gsap.to(els, { opacity: 0, scale: .9, duration: .35 }),
        onComplete: () => ScrollTrigger.refresh()
      });
    } else ScrollTrigger.refresh();
  }
  app.go();
})();
