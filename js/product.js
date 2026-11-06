(() => {
  const { $, $$, gsap, P, byId, fmt, imgSrc, cardHTML, cart, swatch, sortSizes, splitChars } = OF;
  const id = new URLSearchParams(location.search).get('id');
  const p = byId[id];
  if (!p) { location.replace('shop.html'); return; }
  document.title = `${p.title} — Outfitters`;
  const app = OF.boot(init);
  const LBL = { outerwear: 'Outerwear', hoodies: 'Hoodies', knitwear: 'Knitwear', denim: 'Denim', trousers: 'Trousers', tees: 'Tees', shirts: 'Shirts', footwear: 'Footwear', accessories: 'Extras' };
  const sel = { color: p.colors[0], size: null };

  function init() {
    const n = p.img.length;
    $('#gal').innerHTML = p.img.map((f, i) => `<figure data-cursor="Zoom"><img src="${imgSrc(f)}" alt="${p.title} — view ${i + 1}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}><span class="gn">0${i + 1} / 0${n}</span></figure>`).join('');
    const sizes = sortSizes(p.sizes);
    $('#info').innerHTML = `
      <div class="crumbs"><a href="index.html">Home</a> / <a href="shop.html?g=${p.gender}">${p.gender === 'men' ? 'Men' : 'Women'}</a> / <a href="shop.html?c=${p.cat}">${LBL[p.cat]}</a></div>
      <h1 class="disp" id="pTitle">${p.title}</h1>
      <div class="pp"><span>${fmt(p.price)}</span>${p.was ? `<s>${fmt(p.was)}</s>` : ''}${p.isNew ? '<span class="chip" style="font-size:10px;padding:6px 10px">New</span>' : ''}</div>
      ${p.blurb ? `<p style="opacity:.75;max-width:48ch">${p.blurb}</p>` : ''}
      <div><div class="lbl"><span>Colour</span><em id="cName">${sel.color}</em></div><div class="swr" id="swr">${p.colors.map((c, i) => `<button class="swb ${i ? '' : 'on'}" data-c="${c}" aria-label="${c}" data-magnetic><i style="background:${swatch(c)}"></i></button>`).join('')}</div></div>
      <div><div class="lbl"><span>Size</span><em id="sName">Select</em></div><div class="szr" id="szr">${sizes.map(s => `<button class="szb" data-s="${s}">${s}</button>`).join('') || '<span style="opacity:.6">Sold out</span>'}</div></div>
      <button class="btn solid block" id="add" data-magnetic ${sizes.length ? '' : 'disabled'}><span id="addT">Add to bag</span><span class="ar">+</span></button>
      <div class="chips">${p.comp ? `<span class="chip">${p.comp}</span>` : ''}${p.fit ? `<span class="chip">${p.fit} fit</span>` : ''}<span class="chip">${p.colors.length} colour${p.colors.length > 1 ? 's' : ''}</span><span class="chip">${LBL[p.cat]}</span></div>
      <div class="acc">
        <details open><summary>Details</summary><div class="bd">${p.blurb || 'Winter 26 collection.'}${p.fit ? `<br><br>Fit: ${p.fit}` : ''}</div></details>
        <details><summary>Composition</summary><div class="bd">${p.comp || 'See product label.'}</div></details>
        <details><summary>Delivery &amp; returns</summary><div class="bd">Orders, delivery and returns are handled by the Outfitters store. <a href="${p.url}" target="_blank" rel="noopener" style="text-decoration:underline">View this product on outfitters.com.pk ↗</a></div></details>
      </div>`;

    $('#swr').addEventListener('click', e => {
      const b = e.target.closest('.swb'); if (!b) return;
      $$('.swb').forEach(x => x.classList.toggle('on', x === b)); sel.color = b.dataset.c; $('#cName').textContent = sel.color;
      gsap.fromTo('#cName', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'expo.out' });
    });
    $('#szr').addEventListener('click', e => {
      const b = e.target.closest('.szb'); if (!b) return;
      $$('.szb').forEach(x => x.classList.toggle('on', x === b)); sel.size = b.dataset.s; $('#sName').textContent = sel.size;
    });
    $('#add').addEventListener('click', () => {
      if (!sel.size) {
        $$('.szb').forEach(b => { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); });
        OF.toast('Pick a size'); return;
      }
      cart.add(p.id, sel.color, sel.size);
      const t = $('#addT'); t.textContent = 'Added ✓';
      gsap.fromTo('#add', { scale: .96 }, { scale: 1, duration: .8, ease: 'elastic.out(1,.4)' });
      setTimeout(() => { t.textContent = 'Add to bag'; }, 1800);
    });

    // lightbox
    const lb = $('#lb');
    $('#gal').addEventListener('click', e => {
      const f = e.target.closest('figure'); if (!f) return;
      $('img', lb).src = $('img', f).src; gsap.set(lb, { display: 'block' }); gsap.fromTo(lb, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(150% at 50% 50%)', duration: 1, ease: 'expo.inOut' });
      OF.lenis && OF.lenis.stop();
    });
    const closeLb = () => { gsap.to(lb, { clipPath: 'circle(0% at 50% 50%)', duration: .7, ease: 'expo.inOut', onComplete: () => gsap.set(lb, { display: 'none' }) }); OF.lenis && OF.lenis.start(); };
    lb.addEventListener('click', closeLb); addEventListener('keydown', e => { if (e.key === 'Escape' && lb.style.display === 'block') closeLb(); });

    // related
    const order = ['outerwear', 'trousers', 'denim', 'footwear', 'knitwear', 'tees', 'shirts', 'hoodies', 'accessories'];
    const look = [];
    order.forEach(c => { if (c === p.cat) return; const x = P.find(q => q.gender === p.gender && q.cat === c && q.id !== p.id); if (x) look.push(x); });
    $('#lookRail').innerHTML = look.slice(0, 7).map(cardHTML).join('');
    let more = P.filter(q => q.cat === p.cat && q.id !== p.id && q.gender === p.gender);
    if (more.length < 4) more = more.concat(P.filter(q => q.cat === p.cat && q.id !== p.id && q.gender !== p.gender));
    $('#moreGrid').innerHTML = more.slice(0, 4).map(cardHTML).join('');
    if (!more.length) $('#moreSec').style.display = 'none';
    OF.initTilt(document);

    // entry animation
    const ch = splitChars($('#pTitle'));
    gsap.from(ch, { yPercent: 110, duration: 1.2, stagger: .025, ease: 'expo.out', delay: .45 });
    gsap.from('#info > *:not(h1)', { y: 40, opacity: 0, duration: 1, stagger: .07, ease: 'expo.out', delay: .6 });
    gsap.from('#gal figure:first-child img', { scale: 1.3, duration: 1.8, ease: 'expo.out' });
    $$('#gal figure img').forEach(im => gsap.fromTo(im, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    gsap.from('#gal figure:not(:first-child)', { clipPath: 'inset(12% 8% 12% 8%)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '#gal', start: 'top 20%' } });
    app.curtainIn();
  }
  app.go();
})();
