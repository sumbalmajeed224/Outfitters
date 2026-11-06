/* Hero: outfit seated on a chair, motion + parallax */
(() => {
  const { gsap, splitChars, reduce, fine, fmt, byId } = OF;
  const root = document.getElementById('hero2'); if (!root) return;
  const $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => [...r.querySelectorAll(s)];

  // pin labels from real data
  [['pj', 'f0354-101'], ['pt', 'f0831-108'], ['ps', 'f0448-112']].forEach(([id, pid]) => {
    const p = byId[pid], el = document.getElementById(id); if (!p || !el) return;
    el.href = 'product.html?id=' + pid; $('em', el).textContent = `${p.title} — ${fmt(p.price)}`; el.setAttribute('aria-label', `${p.title}, ${fmt(p.price)}`);
  });

  const eyebrow = $('.h2-eyebrow'), the = $('.h2-the'), ord = $('.h2-ord');
  const chT = [...splitChars(the), ...splitChars(ord)];
  const paths = $$('.h2-chair .draw'); paths.forEach(p => { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = 1; p.style.strokeDashoffset = 1; });
  gsap.set(chT, { yPercent: 115, opacity: 0 });
  gsap.set(eyebrow, { opacity: 0, letterSpacing: '1.2em' });
  gsap.set('.h2-jacket', { y: '-130%', opacity: 0, rotate: -10 });
  gsap.set('.h2-trousers', { y: '-90%', opacity: 0, rotate: 4 });
  gsap.set('.h2-shoe', { y: '-260%', opacity: 0, scale: .6 });
  gsap.set(['.h2-corner', '.h2-down', '.h2-strip', '.h2-pin'], { opacity: 0 });
  gsap.set('.h2-chair .fillable', { fillOpacity: 0 });

  const intro = () => {
    const t = gsap.timeline({ defaults: { ease: 'expo.out' } });
    t.to(eyebrow, { opacity: 1, letterSpacing: '.6em', duration: 1.8 }, 0)
      .to(chT, { yPercent: 0, opacity: 1, duration: 1.5, stagger: .035 }, .05)
      .to(paths, { strokeDashoffset: 0, duration: 1.6, stagger: .08, ease: 'power3.inOut' }, .3)
      .to('.h2-chair .fillable', { fillOpacity: 1, duration: 1.2 }, 1.2)
      .to('.h2-jacket', { y: 0, opacity: 1, rotate: 0, duration: 1.6, ease: 'bounce.out' }, 1.1)
      .to('.h2-trousers', { y: 0, opacity: 1, rotate: 0, duration: 1.5, ease: 'power3.out' }, 1.45)
      .to('.h2-shoe', { y: 0, opacity: 1, scale: 1, duration: 1.3, stagger: .12, ease: 'elastic.out(1,.6)' }, 1.9)
      .to('.h2-pin', { opacity: 1, scale: 1, duration: .8, stagger: .15, ease: 'back.out(2)' }, 2.6)
      .to(['.h2-corner', '.h2-down', '.h2-strip'], { opacity: 1, y: 0, duration: 1.2, stagger: .08 }, 1.4)
      .add(float, 2.6);
  };
  function float() {
    if (reduce) return;
    gsap.to('.h2-jacket', { y: -6, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.h2-trousers', { y: -3, duration: 3.1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.h2-shoe.a', { y: -4, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.h2-shoe.b', { y: -5, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  // side strips
  $$('.h2-strip').forEach((s, i) => { const sp = s.firstElementChild; sp.innerHTML += sp.innerHTML; gsap.to(sp, { xPercent: i ? 50 : -50, duration: 40, ease: 'none', repeat: -1 }); if (i) gsap.set(sp, { xPercent: -50 }); });

  // pointer parallax
  if (fine && !reduce) {
    const layers = [['.h2-jacket', 12], ['.h2-trousers', 8], ['.h2-shoe', 16], ['.h2-chair', 4], ['.h2-title', -10]];
    const q = layers.map(([s, d]) => ({ d, x: gsap.quickTo(s, 'x', { duration: 1, ease: 'power3' }), y: gsap.quickTo(s, 'y', { duration: 1, ease: 'power3' }) }));
    // float tweens animate y; use xPercent-free approach: only drive x here to avoid fighting with float
    root.addEventListener('pointermove', e => { const nx = e.clientX / innerWidth - .5; q.forEach(l => l.x(nx * l.d * 2)); });
    root.addEventListener('pointerleave', () => q.forEach(l => l.x(0)));
  }

  // scroll parallax
  gsap.to('.h2-title', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.h2-eyebrow', { yPercent: -120, opacity: 0, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: '60% top', scrub: true } });
  gsap.to('.h2-stage', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } });

  // scroll hint → runway
  $('.h2-down').addEventListener('click', e => { e.preventDefault(); const t = document.getElementById('runway'); OF.lenis ? OF.lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: 'smooth' }); });

  if (OF.sstore.get('of_t')) { setTimeout(intro, 900); } else setTimeout(intro, 200);
})();
