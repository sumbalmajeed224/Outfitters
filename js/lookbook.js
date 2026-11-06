(() => {
  const { $, $$, gsap, P, imgSrc, fmt, splitChars } = OF;
  const app = OF.boot(init);
  const CHAPTERS = [
    { no: '01', t: 'Leather', copy: 'Grainy faux leather with snap flaps, zip pockets and a ribbed hem. Drop shoulders, loose through the body.', list: () => P.filter(p => /leather|suede/i.test(p.title) && p.cat === 'outerwear'), cat: 'outerwear', hero: 'f0396-101' },
    { no: '02', t: 'Denim', copy: 'Wide, baggy and straight legs, washed down to something worn-in from day one.', list: () => P.filter(p => p.cat === 'denim'), cat: 'denim' },
    { no: '03', t: 'Knit', copy: 'Sweaters and cardigans in dark winter tones — soft, structured, made for stacking.', list: () => P.filter(p => p.cat === 'knitwear'), cat: 'knitwear' },
    { no: '04', t: 'Layers', copy: 'Heavyweight hoodies and easy overlayers for when the temperature drops again.', list: () => P.filter(p => p.cat === 'hoodies'), cat: 'hoodies' }
  ];
  function init() {
    $('#chapters').innerHTML = CHAPTERS.map((c, i) => {
      const l = c.list(); const hero = (c.hero && l.find(p => p.id === c.hero)) || l.find(p => p.img[1]) || l[0];
      return `<section class="chap ${i % 2 ? 'flip' : ''} ${i % 2 ? 'light' : ''}">
        <div class="ph" data-mask data-cursor="Shop"><a href="product.html?id=${hero.id}"><img src="${imgSrc(hero.img[c.hero ? 0 : (i % 2 ? 0 : 1)] || hero.img[0])}" alt="${hero.title}" loading="lazy"></a></div>
        <div class="tx"><div class="no" data-reveal>${c.no}</div><h2 class="disp" data-split-in>${c.t}</h2><p data-reveal>${c.copy}</p>
          <div class="mini" data-stagger>${l.slice(0, 4).map(p => `<a href="product.html?id=${p.id}" title="${p.title} — ${fmt(p.price)}" data-cursor="View"><img src="${imgSrc(p.img[0])}" alt="${p.title}" loading="lazy"></a>`).join('')}</div>
          <a class="btn ${i % 2 ? 'dark' : ''}" href="shop.html?c=${c.cat}" data-magnetic>Shop ${c.t.toLowerCase()} <span class="ar">→</span></a></div></section>`;
    }).join('');
    const cols = new Set(P.flatMap(p => p.colors)).size;
    $('#stats').innerHTML = [[P.length, 'Pieces'], [9, 'Categories'], [cols, 'Colourways'], [2, 'Collections']].map(([n, l]) => `<div><b><span data-count="${n}">0</span></b><span>${l}</span></div>`).join('');
    const ch = splitChars($('#lbTitle')); gsap.from(ch, { yPercent: 110, duration: 1.4, stagger: .05, ease: 'expo.out', delay: .5 });
    gsap.fromTo('.lb-hero .bg', { yPercent: -8, scale: 1.2 }, { yPercent: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: '.lb-hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('#lbTitle', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.lb-hero', start: 'top top', end: 'bottom top', scrub: true } });
    app.curtainIn();
  }
  app.go();
  // chapter parallax after DOM exists
  addEventListener('load', () => {
    $$('.chap .ph img').forEach(im => gsap.fromTo(im, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: im.closest('.ph'), start: 'top bottom', end: 'bottom top', scrub: true } }));
    ScrollTrigger.refresh();
  });
})();
