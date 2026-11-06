/* Hero: WINTER — faded word behind a jacket-on-chair cutout; entrance + parallax */
(() => {
  const { gsap, splitChars, reduce, fine, fmt, byId } = OF;
  const root = document.getElementById('winter'); if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  [['wp1', 'f0396-101'], ['wp2', 'f0874-109'], ['wp3', 'f0423-112']].forEach(([id, pid]) => {
    const p = byId[pid], el = document.getElementById(id); if (!p || !el) return;
    el.href = 'product.html?id=' + pid; $('em', el).textContent = `${p.title} — ${fmt(p.price)}`; el.setAttribute('aria-label', `${p.title}, ${fmt(p.price)}`);
  });
  const word = $('.wh-word'); const chars = splitChars(word);
  gsap.set(chars, { yPercent: 110, opacity: 0 });
  gsap.set('.wh-img', { y: 70, opacity: 0, scale: .96, transformOrigin: '50% 100%' });
  gsap.set('.wh-stage .sh', { opacity: 0 });
  gsap.set(['.wh-copy > *', '.wh-spec > *'], { opacity: 0, y: 24 });
  gsap.set('.wh-pin', { opacity: 0, scale: .4 });
  const t = gsap.timeline({ delay: reduce ? 0 : .25, defaults: { ease: 'expo.out' } });
  t.to(chars, { yPercent: 0, opacity: 1, duration: 1.9, stagger: .09 }, 0)
    .to('.wh-img', { y: 0, opacity: 1, scale: 1, duration: 1.8 }, .35)
    .to('.wh-stage .sh', { opacity: 1, duration: 1.6 }, .9)
    .to(['.wh-copy > *', '.wh-spec > *'], { opacity: 1, y: 0, duration: 1.2, stagger: .08 }, 1.0)
    .to('.wh-pin', { opacity: 1, scale: 1, duration: .9, stagger: .15, ease: 'back.out(2.2)' }, 1.9);

  if (!reduce) {
    gsap.to('.wh-word', { yPercent: -22, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.wh-stage', { yPercent: 5, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } });
    if (fine) {
      const wx = gsap.quickTo('.wh-word', 'x', { duration: 1.2, ease: 'power3' }), sx = gsap.quickTo('.wh-img', 'x', { duration: 1.2, ease: 'power3' });
      root.addEventListener('pointermove', e => { const n = e.clientX / innerWidth - .5; wx(n * -36); sx(n * 14); });
      root.addEventListener('pointerleave', () => { wx(0); sx(0); });
    }
  }
  root.querySelectorAll('a[href="#runway"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const tg = document.getElementById('runway'); OF.lenis ? OF.lenis.scrollTo(tg, { duration: 1.6 }) : tg.scrollIntoView({ behavior: 'smooth' }); }));
})();
