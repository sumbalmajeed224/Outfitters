/* Hero: "The Jacket Reveal" — first-person jacket opening, rendered from the campaign photo.
   The two jacket halves (cut along the zipper) are warped apart on a canvas: their outer edges stay pinned to
   the frame, the hands/zipper travel outward, and the scene behind is revealed. Camera pulls back, depth parallax. */
(() => {
  const { gsap, reduce, fine, fmt, byId, splitWords } = OF;
  const root = document.getElementById('reveal'); if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const cv = $('#rvCanvas'), ctx = cv.getContext('2d');
  const E = window.REVEAL_EDGES;
  const img = new Image(); img.src = 'assets/hero/reveal.webp';

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = t => t * t * (3 - 2 * t);
  const interp = (arr, y) => { const ys = E.y; let lo = 0, hi = ys.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ys[m] <= y) lo = m; else hi = m; } const f = (y - ys[lo]) / (ys[hi] - ys[lo] || 1); return arr[lo] + (arr[hi] - arr[lo]) * f; };

  const state = { open: 0, zoom: 1.2, mx: 0, my: 0, tx: 0, ty: 0 };
  let IW, IH, base, pl, pr, w = 0, h = 0, dpr = 1, visible = true, raf = 0, ready = false, lastOpen = 0, blur = 0;
  const DX = 250;                 // source px each half travels when "closed"
  const XH = 120;                 // width of the pinned/stretching zone at the outer edge
  const supportsFilter = 'filter' in ctx;

  const pin = $('#rvPin');
  const p = byId['f0396-101'];
  if (p) { pin.href = 'product.html?id=' + p.id; $('em', pin).textContent = `${p.title} — ${fmt(p.price)}`; pin.setAttribute('aria-label', `${p.title}, ${fmt(p.price)}`); }

  function prepare() {
    IW = img.naturalWidth; IH = img.naturalHeight;
    const mk = () => { const c = document.createElement('canvas'); c.width = IW; c.height = IH; return c; };
    // panels: image clipped along the zipper edge
    pl = mk(); pr = mk();
    let c = pl.getContext('2d'); c.beginPath(); c.moveTo(-2, -2);
    E.y.forEach((y, i) => c.lineTo(E.L[i], y)); c.lineTo(-2, IH + 2); c.closePath(); c.clip(); c.drawImage(img, 0, 0);
    c = pr.getContext('2d'); c.beginPath(); c.moveTo(IW + 2, -2);
    E.y.forEach((y, i) => c.lineTo(E.R[i], y)); c.lineTo(IW + 2, IH + 2); c.closePath(); c.clip(); c.drawImage(img, 0, 0);
    // base plate: the scene, with the panel zones smeared from the nearest scene pixel (never visible, avoids halos)
    base = mk(); const b = base.getContext('2d'); b.drawImage(img, 0, 0);
    const d = b.getImageData(0, 0, IW, IH), px = d.data;
    for (let y = 0; y < IH; y++) {
      const l = Math.round(interp(E.L, y)) + 2, r = Math.round(interp(E.R, y)) - 2;
      const sl = Math.min(IW - 1, l + 16) * 4 + y * IW * 4, sr = Math.max(0, r - 16) * 4 + y * IW * 4;
      for (let x = 0; x < l; x++) { const o = (y * IW + x) * 4; px[o] = px[sl]; px[o + 1] = px[sl + 1]; px[o + 2] = px[sl + 2]; }
      for (let x = r; x < IW; x++) { const o = (y * IW + x) * 4; px[o] = px[sr]; px[o + 1] = px[sr + 1]; px[o + 2] = px[sr + 2]; }
    }
    b.putImageData(d, 0, 0);
  }

  function size() {
    const r = cv.getBoundingClientRect(); w = r.width; h = r.height; dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  }

  function drawPanel(side, dx, yoff) {
    const src = side === 'L' ? pl : pr;
    const step = 2;
    ctx.imageSmoothingEnabled = false;
    if (side === 'L') {
      for (let x = 0; x < XH; x += step) {
        const x2 = Math.min(XH, x + step), d1 = x + dx * sm(x / XH), d2 = x2 + dx * sm(x2 / XH);
        ctx.drawImage(src, x, 0, x2 - x, IH, d1, yoff, d2 - d1 + 1.6, IH);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(src, XH, 0, IW / 2 - XH, IH, XH + dx, yoff, IW / 2 - XH + .8, IH);
    } else {
      for (let u = 0; u < XH; u += step) {
        const u2 = Math.min(XH, u + step), d1 = IW - u2 - dx * sm(u2 / XH), d2 = IW - u - dx * sm(u / XH);
        ctx.drawImage(src, IW - u2, 0, u2 - u, IH, d1 - 1.6, yoff, d2 - d1 + 1.6, IH);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(src, IW / 2, 0, IW / 2 - XH, IH, IW / 2 - dx, yoff, IW / 2 - XH + .8, IH);
    }
  }

  function render() {
    if (!ready || !w) return;
    const cw = cv.width, ch = cv.height, s = cw / IW, z = state.zoom;
    const scroll = clamp(scrollY / Math.max(1, root.offsetHeight), 0, 1);
    const open = state.open, dx = DX * (1 - open) + scroll * DX * .45;
    const cam = depth => ctx.setTransform(s * z, 0, 0, s * z, cw / 2 - IW * s * z / 2 + state.mx * depth * dpr, ch / 2 - IH * s * z / 2 + (state.my + scroll * -20) * depth * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cw, ch);
    ctx.imageSmoothingQuality = 'high';
    cam(5); ctx.drawImage(base, 0, 0);
    // motion blur on the leather while it moves
    const vel = Math.abs(open - lastOpen) * 60; lastOpen = open; blur += (Math.min(vel * 4, 2) - blur) * .3;
    if (supportsFilter && blur > .15) ctx.filter = `blur(${(blur * dpr).toFixed(2)}px)`;
    cam(16);
    const sway = Math.sin(open * Math.PI);
    drawPanel('L', dx, sway * 7); drawPanel('R', dx, -sway * 6);
    ctx.filter = 'none';
    // vignette that lifts as the jacket opens
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createRadialGradient(cw / 2, ch / 2, ch * .22, cw / 2, ch / 2, ch * .78);
    g.addColorStop(0, 'rgba(10,8,6,0)'); g.addColorStop(1, `rgba(10,8,6,${(.34 * (1 - open) + .12).toFixed(3)})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    // hotspot follows the model's jacket
    const px = (cw / 2 - IW * s * z / 2 + state.mx * 5 * dpr + 603 * s * z) / dpr, py = (ch / 2 - IH * s * z / 2 + (state.my + scroll * -20) * 5 * dpr + 548 * s * z) / dpr;
    pin.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px)`;
  }

  const loop = () => { raf = 0; state.mx += (state.tx - state.mx) * .06; state.my += (state.ty - state.my) * .06; render(); if (visible) raf = requestAnimationFrame(loop); };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  function copyIn() {
    const q = (s, r = root) => [...r.querySelectorAll(s)];
    const h1 = $('.rv-h1'); const words = splitWords(h1);
    gsap.set(words, { yPercent: 115 }); gsap.set(['.rv-eyebrow', '.rv-lede', '.rv-actions', '.rv-spec'], { opacity: 0, y: 24 });
    gsap.timeline({ delay: reduce ? 0 : 2.2, defaults: { ease: 'expo.out' } })
      .to(words, { yPercent: 0, duration: 1.4, stagger: .09 })
      .to(['.rv-eyebrow', '.rv-lede', '.rv-actions', '.rv-spec'], { opacity: 1, y: 0, duration: 1.2, stagger: .12 }, .1)
      .fromTo(pin, { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: 1, ease: 'back.out(2.4)' }, 1.4);
  }

  function start() {
    prepare(); size(); ready = true; cv.classList.add('is-ready');
    if (reduce) { state.open = 1; state.zoom = 1; }
    render(); copyIn();
    if (!reduce) {
      const tl = gsap.timeline({ delay: .5 });
      tl.to(state, { open: 1, duration: 3.8, ease: 'power2.inOut' }, 0)
        .to(state, { zoom: 1, duration: 4.6, ease: 'power3.out' }, 0)
        .to(state, { zoom: 1.03, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 4.6);
    }
    kick();
    if (fine && !reduce) {
      root.addEventListener('pointermove', e => { const r = root.getBoundingClientRect(); state.tx = ((e.clientX - r.left) / r.width - .5) * -2; state.ty = ((e.clientY - r.top) / r.height - .5) * -1.4; });
      root.addEventListener('pointerleave', () => { state.tx = 0; state.ty = 0; });
    }
  }

  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }, { threshold: 0 }).observe(root);
  new ResizeObserver(() => { if (ready) { size(); render(); } }).observe(cv);
  root.querySelectorAll('a[href="#runway"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = document.getElementById('runway'); OF.lenis ? OF.lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: 'smooth' }); }));
  (img.decode ? img.decode() : new Promise(r => { img.onload = r; })).then(start).catch(() => { img.onload = start; });
})();
