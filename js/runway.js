/* <runway-section> — "Try the Look." 3D ring carousel built with Outfitters pieces */
(() => {
  const { byId, fmt, imgSrc, cart, sortSizes, reduce, P, cardHTML, toast } = OF;
  const app = OF.boot(() => {});

  const LOOKS = [
    { name: 'Leather Edit', n: 1, pieces: [['f0396-101', 50, 27], ['f0874-109', 47, 64], ['f0423-112', 46, 93]] },
    { name: 'Noir Pleat', n: 2, pieces: [['f0454-201', 50, 27], ['f0789-208', 48, 62], ['f0375-212', 45, 95]] },
    { name: 'Campus Suede', n: 3, pieces: [['f0392-101', 50, 27], ['f0866-109', 48, 64], ['f0437-112', 47, 95]] },
    { name: 'Trench Season', n: 4, pieces: [['f0460-201', 50, 31], ['f0763-208', 48, 76], ['f0382-212', 50, 95]] },
    { name: 'Field Green', n: 5, pieces: [['f0333-101', 50, 27], ['f0830-108', 48, 64], ['f0448-112', 46, 95]] },
    { name: 'Soft Fur', n: 6, pieces: [['f0459-201', 50, 26], ['f0789-208', 50, 64], ['f0373-212', 47, 95]] }
  ];
  const CAT_LABEL = { outerwear: 'Outerwear', hoodies: 'Hoodies', knitwear: 'Knitwear', denim: 'Denim', trousers: 'Trousers', tees: 'Tees', shirts: 'Shirts', footwear: 'Footwear', accessories: 'Extras' };
  const FOCUS = { outerwear: '50% 24%', hoodies: '50% 24%', knitwear: '50% 24%', tees: '50% 24%', shirts: '50% 24%', denim: '50% 68%', trousers: '50% 68%', footwear: '50% 50%', accessories: '50% 50%' };
  const ARROW_L = '<svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M25 7H1M7 1L1 7l6 6"/></svg>';
  const ARROW_R = '<svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7h24M19 1l6 6-6 6"/></svg>';
  const PLUS = '<svg class="i-plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 4v16M4 12h16"/></svg>';
  const CHECK = '<svg class="i-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad2 = n => String(n).padStart(2, '0');

  class RunwaySection extends HTMLElement {
    connectedCallback() { if (this._ready) return; this._ready = true; this.build(); this.start(); }
    disconnectedCallback() { cancelAnimationFrame(this.raf); clearTimeout(this.timer); this.io && this.io.disconnect(); this.ro && this.ro.disconnect(); removeEventListener('keydown', this._esc); }

    build() {
      this.classList.add('rw', 'rw--js');
      this.looks = LOOKS.map(l => ({ ...l, items: l.pieces.map(([id, x, y]) => ({ p: byId[id], x, y })).filter(i => i.p) }));
      const L = this.looks;
      const total = l => l.items.reduce((a, i) => a + i.p.price, 0);
      this.innerHTML = `
      <div class="rw__sticky"><div class="rw__grid">
        <div class="rw__left">
          <div class="rw__head"><div class="rw__intro"><h1 class="rw__title">Try the <em>look.</em></h1><p class="rw__sub">Six Winter 26 looks, styled head to toe. Pick a figure, tap a dot, shop the piece.</p></div><span class="rw__tagline">Outfitters · Winter 26</span><span class="rw__sr" aria-live="polite" aria-atomic="true" data-live></span></div>
          <div class="rw__stage" data-stage tabindex="0" role="region" aria-roledescription="carousel" aria-label="Try the Look — use arrow keys or swipe to change look" data-cursor="Drag">
            <div class="rw__actors" data-actors>${Array.from({ length: 6 }, (_, i) => `<div class="rw__model" data-model data-i="${i}" aria-hidden="true"><span class="rw__shadow"></span><img src="${imgSrc2(L[i].n, 640)}" srcset="${imgSrc2(L[i].n, 640)} 640w, ${imgSrc2(L[i].n, 1080)} 1080w" sizes="(min-width:750px) 420px, 320px" alt="${L[i].name}" width="720" height="1280" decoding="async" draggable="false"><button class="rw__hit" data-go="${i}" aria-label="Look ${i + 1}: ${L[i].name}" tabindex="-1"></button></div>`).join('')}</div>
            <div class="rw__heroes" data-heroes>${L.map((l, i) => `<div class="rw__hero ${i ? '' : 'is-on'}" data-hero data-i="${i}" aria-hidden="${i ? 'true' : 'false'}"><span class="rw__shadow"></span><img src="${imgSrc2(l.n, 1080)}" alt="${l.name}: ${l.items.map(x => x.p.title).join(', ')}" width="1080" height="1920" decoding="async" draggable="false"><button class="rw__zoom" data-zoom data-cursor="View" aria-label="View look: ${l.name}" tabindex="${i ? -1 : 0}"></button></div>`).join('')}</div>
            <span class="rw__sweep"></span>
          </div>
          <div class="rw__controls">
            <button class="rw__icon" data-prev aria-label="Previous look">${ARROW_L}</button>
            <div class="rw__ticks">${L.map((l, i) => `<button class="rw__tick" data-tick="${i}" aria-current="${i === 0}" aria-label="Look ${i + 1}: ${l.name}"><span class="rw__tick-bar"></span><span class="rw__tick-label">${pad2(i + 1)}<span class="rw__tick-name">&nbsp;&nbsp;${l.name}</span></span></button>`).join('')}</div>
            <button class="rw__icon rw__auto" data-auto aria-pressed="false" aria-label="Autoplay"><svg class="i-play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12.5-7.5z"/></svg><svg class="i-pause" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z"/></svg></button>
            <button class="rw__icon" data-next aria-label="Next look">${ARROW_R}</button>
          </div>
          <div class="rw__lb" data-lb role="region" aria-label="View look" aria-hidden="true">
            <div class="rw__lb-stage" data-lb-stage></div>
            <div class="rw__lb-top"><p class="rw__lb-cap"><span class="rw__lb-kicker" data-lb-kicker></span><span class="rw__lb-name" data-lb-name></span></p><button class="rw__lb-close" data-close aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>
            <p class="rw__lb-hint">Tap a dot to shop the piece</p>
          </div>
        </div>
        <aside class="rw__panel has-rule"><div class="rw__panel-inner">
          <div class="rw__panel-head"><h2 class="rw__panel-title">In this look</h2><span class="rw__label" data-pieces>${L[0].items.length} pieces</span></div>
          ${L.map((l, i) => `<div class="rw__look-panel ${i ? '' : 'is-in'}" data-panel="${i}" ${i ? 'hidden' : ''}>
            <div class="rw__mhead"></div>
            <ul class="rw__items" role="list">${l.items.map((it, k) => rowHTML(it.p, i, k + 1)).join('')}</ul>
            <div class="rw__bundle"><p class="rw__msg" data-msg role="status" aria-live="polite"></p>
              <div class="rw__bundle-row"><div class="rw__bundle-copy"><span class="rw__bundle-title">Complete the look</span><span class="rw__bundle-note">Pick a size for each piece</span></div><div class="rw__bundle-price"><strong>${fmt(total(l))}</strong></div></div>
              <button class="rw__cta" data-all><span class="rw__cta-add">Add full look to bag</span><span class="rw__cta-done">Full look in your bag</span><svg class="ar" width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7h24M19 1l6 6-6 6"/></svg></button>
            </div></div>`).join('')}
        </div></aside>
      </div></div>`;
      const $ = (s, r = this) => r.querySelector(s), $$ = (s, r = this) => [...r.querySelectorAll(s)];
      this.$ = $; this.$$ = $$;
      this.stage = $('[data-stage]');
      this.bodies = $$('[data-model]'); this.bodiesAll = [];
      const actors = $('[data-actors]');
      // 12 bodies: 6 originals + 6 clones
      this.bodies.forEach(b => { const c = b.cloneNode(true); c.dataset.clone = ''; $('img', c).loading = 'lazy'; actors.appendChild(c); });
      this.bodies = $$('[data-model]');
      this.heroes = $$('[data-hero]'); this.ticks = $$('[data-tick]'); this.panels = $$('[data-panel]');
      this.lb = $('[data-lb]');
      this.mheads = $$('.rw__mhead'); this.panels.forEach((p, i) => { $('.rw__mhead', p).innerHTML = `<span>${L[i].name}</span>`; });
    }

    start() {
      const $ = this.$, $$ = this.$$, L = this.looks;
      const N = this.bodies.length, n = 6, TAU = Math.PI * 2, step = TAU / N;
      const K = 95, C = 2 * Math.sqrt(K);
      let cur = reduce ? 0 : -1.15, target = 0, vel = 0, index = 0, still = false, visible = false, dragging = false, playing = false, engaged = false, panelHover = false, zoomed = false;
      let W = 0, H = 0, modelH = 560, mobile = false, last = 0, raf = 0;
      const fs = 1.08;
      const live = $('[data-live]');
      const blurCache = new Map();

      const measure = () => {
        const r = this.stage.getBoundingClientRect(); W = r.width; H = r.height;
        mobile = innerWidth < 750;
        modelH = Math.max(200, Math.round((H - 34 - 18) / fs));
        this.stage.style.setProperty('--model-h', modelH + 'px');
        this.stage.style.setProperty('--hx', (W / 2) + 'px'); this.stage.style.setProperty('--hy', '34px'); this.stage.style.setProperty('--fs', fs);
        this.heroes.forEach(h => { h.style.setProperty('--model-h', modelH + 'px'); });
        render();
      };
      const put = (el, x, bottom, scale, op, blur, z) => {
        const w = modelH * .5625;
        if (x + w * scale / 2 < -4 || x - w * scale / 2 > W + 4) op = 0;
        el.style.transform = `translate3d(${x.toFixed(1)}px,${(-bottom).toFixed(1)}px,0) translateX(-50%) scale(${scale.toFixed(4)})`;
        el.style.opacity = op.toFixed(3); el.style.zIndex = z;
        el.style.visibility = op < .01 ? 'hidden' : 'visible';
        el.style.pointerEvents = op < .5 ? 'none' : 'auto';
        const b = Math.round(blur * 10) / 10;
        if (blurCache.get(el) !== b) { blurCache.set(el, b); el.style.filter = b > .05 ? `blur(${b}px)` : ''; }
      };
      const render = () => {
        if (!W) return;
        const cx = W * .5, R = (mobile ? .72 : .62) * W, Pp = (mobile ? 1.9 : 1.65) * W, floor = H - 34, horizon = .36 * H;
        this.bodies.forEach((b, a) => {
          let phi = (((a - cur) * step) % TAU + TAU) % TAU; if (phi > Math.PI) phi -= TAU;
          const z = R * (1 - Math.cos(phi)), persp = Pp / (Pp + z), sl = Math.abs(phi) / step;
          const scale = persp * (1 + (fs - 1) * clamp(1 - sl, 0, 1));
          const x = cx + R * Math.sin(phi) * persp, feet = horizon + (floor - horizon) * persp;
          const blur = sl <= 1 ? 1.8 * sl : Math.min(1.8 + (sl - 1) * 2, 6.5);
          let op = clamp((Math.cos(phi) + .55) / .3, 0, 1);
          if (still && sl < .02) op = 0;
          put(b, x, H - feet, scale, op, blur, Math.round(scale * 1000));
        });
      };
      const setStill = v => { if (still === v) return; still = v; this.classList.toggle('rw--still', v); };
      const loop = ts => {
        raf = 0;
        if (!visible || document.hidden) { last = 0; return; }
        const dt = last ? Math.min(.034, (ts - last) / 1000) : 1 / 60; last = ts;
        if (reduce) { cur = target; vel = 0; }
        else { const h = dt / 3; for (let s = 0; s < 3; s++) { const acc = -K * (cur - target) - C * vel; vel += acc * h; cur += vel * h; } }
        const settled = Math.abs(cur - target) <= .0005 && Math.abs(vel) <= .0005;
        if (settled) { cur = target; vel = 0; if (!dragging) setStill(true); } else setStill(false);
        render();
        if (!settled || dragging) raf = requestAnimationFrame(loop); else last = 0;
      };
      const kick = () => { if (!raf && visible) raf = requestAnimationFrame(loop); };
      this.raf = 0;

      /* ---------- index / navigation ---------- */
      const setIndex = (i, silent) => {
        const changed = i !== index || silent;
        index = i; kick();
        this.bodies.forEach((b, a) => {
          let k = (((a - Math.round(target)) % N) + N) % N; if (k > N / 2) k -= N;
          const ok = k !== 0 && Math.abs(k) <= 2; const hit = b.querySelector('.rw__hit');
          hit.tabIndex = ok ? 0 : -1; b.setAttribute('aria-hidden', ok ? 'false' : 'true');
        });
        if (!changed) return;
        if (!silent) { closePopup(true); }
        this.style.setProperty('--rw-progress', ((i + 1) / n).toFixed(3));
        this.heroes.forEach((h, j) => { h.classList.toggle('is-on', j === i); h.setAttribute('aria-hidden', j === i ? 'false' : 'true'); $('.rw__zoom', h).tabIndex = j === i ? 0 : -1; });
        this.ticks.forEach((t, j) => { t.setAttribute('aria-current', j === i); t.classList.toggle('is-past', j < i); });
        this.panels.forEach((p, j) => { p.hidden = j !== i; p.classList.remove('is-in'); });
        const pan = this.panels[i]; void pan.offsetWidth; pan.classList.add('is-in');
        const pc = $('[data-pieces]'); pc.textContent = `${L[i].items.length} pieces`; pc.classList.remove('is-swap'); void pc.offsetWidth; pc.classList.add('is-swap');
        $$('.is-hot').forEach(e => e.classList.remove('is-hot'));
        if (!silent && !reduce) { this.stage.classList.remove('is-sweep'); void this.stage.offsetWidth; this.stage.classList.add('is-sweep'); }
        if (!silent) live.textContent = `Look ${i + 1}: ${L[i].name}`;
        restartBar();
      };
      const moveTo = T => { target = T; setStill(false); setIndex(((T % n) + n) % n); };
      const next = () => moveTo(Math.round(target) + 1), prev = () => moveTo(Math.round(target) - 1);
      const go = i => { let d = (((i - index) % n) + n) % n; if (d > 3) d -= 6; moveTo(Math.round(target) + d); };

      /* ---------- autoplay ---------- */
      const SPEED = 5000;
      const restartBar = () => {
        this.ticks.forEach(t => t.classList.remove('is-run')); void this.offsetWidth;
        if (playing) this.ticks[index].classList.add('is-run');
        clearTimeout(this.timer);
        if (playing) this.timer = setTimeout(() => {
          if (playing && visible && !dragging && !document.hidden && !panelHover && !zoomed && !engaged) next(); else restartBar();
        }, SPEED);
      };
      const play = v => { playing = v; this.classList.toggle('is-playing', v); $('[data-auto]').setAttribute('aria-pressed', v); restartBar(); };
      const engage = () => { engaged = true; if (playing) play(false); };

      /* ---------- popup ---------- */
      const openPopup = () => {
        if (zoomed) return; engage();
        const hero = this.heroes[index], lbStage = $('[data-lb-stage]');
        const l = L[index];
        const hh = Math.max(160, Math.min(lbStage.clientHeight || 400, (lbStage.clientWidth || 300) / .5625));
        lbStage.innerHTML = `<div class="rw__lb-model" style="--model-h:${hh}px"><div class="rw__fig"><span class="rw__shadow"></span><img src="${imgSrc2(l.n, 1080)}" alt="${l.name}" draggable="false">${l.items.map((it, k) => `<button class="rw__pin" data-pin="${k + 1}" data-tip="${it.p.title}" style="left:${it.x}%;top:${it.y}%;--pi:${k + 1}" aria-label="${k + 1}: ${it.p.title}"><span class="rw__pin-dot">${k + 1}</span></button>`).join('')}</div></div>`;
        $('[data-lb-kicker]').textContent = `Look ${pad2(index + 1)}`; $('[data-lb-name]').textContent = l.name;
        const model = $('.rw__lb-model', lbStage), fig = $('.rw__fig', model);
        const a = hero.getBoundingClientRect();
        zoomed = true; this.classList.add('rw--zoom'); this.lb.setAttribute('aria-hidden', 'false');
        if (!reduce) {
          const b = fig.getBoundingClientRect();
          model.style.transformOrigin = '0 100%'; model.style.transition = 'none';
          model.style.transform = `translate3d(${a.left - b.left}px,${a.bottom - b.bottom}px,0) scale(${a.height / b.height})`;
          void model.offsetWidth; model.style.transition = ''; model.style.transform = '';
        }
        $('[data-close]').focus({ preventScroll: true });
      };
      const closePopup = instant => {
        if (!zoomed) return; zoomed = false;
        const lbStage = $('[data-lb-stage]'), model = $('.rw__lb-model', lbStage);
        if (model && !instant && !reduce) {
          const hero = this.heroes[index], a = hero.getBoundingClientRect(), fig = $('.rw__fig', model), b = fig.getBoundingClientRect();
          model.style.transform = `translate3d(${a.left - b.left}px,${a.bottom - b.bottom}px,0) scale(${a.height / b.height})`;
        }
        this.classList.remove('rw--zoom'); this.lb.setAttribute('aria-hidden', 'true');
        setTimeout(() => { if (!zoomed) lbStage.innerHTML = ''; }, instant ? 0 : 950);
        $$('.is-hot').forEach(e => e.classList.remove('is-hot'));
        if (this.lb.contains(document.activeElement)) this.stage.focus({ preventScroll: true });
      };
      this._esc = e => { if (e.key === 'Escape') closePopup(); };
      addEventListener('keydown', this._esc);

      /* ---------- hot linking ---------- */
      const hot = (nn, scroll) => {
        $$('.is-hot').forEach(e => e.classList.remove('is-hot'));
        const pin = $(`.rw__lb [data-pin="${nn}"]`); pin && pin.classList.add('is-hot');
        const card = $(`[data-panel="${index}"] [data-card="${nn}"]`);
        if (card) {
          card.classList.add('is-hot');
          if (scroll) {
            const list = card.parentElement;
            if (list.scrollHeight > list.clientHeight + 2) list.scrollTo({ top: card.offsetTop - list.offsetTop - 12, behavior: reduce ? 'auto' : 'smooth' });
            else { const r = card.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight - 140) scrollBy({ top: r.top - innerHeight * .3, behavior: reduce ? 'auto' : 'smooth' }); }
          }
        }
      };

      /* ---------- bag logic ---------- */
      const panel = () => this.panels[index];
      const markAdded = li => { li.classList.add('is-added'); li.classList.remove('is-picking'); $('[data-add]', li).setAttribute('aria-label', 'Added to bag: ' + li.dataset.title); $('.rw__picker', li).hidden = true; $('[data-add]', li).removeAttribute('aria-expanded'); };
      const checkComplete = pan => {
        const cards = $$('.rw__item', pan);
        if (cards.length >= 2 && cards.every(c => c.classList.contains('is-added'))) { pan.classList.add('is-complete'); $('[data-msg]', pan).textContent = ''; }
      };
      const addCard = li => {
        const sel = $('input:checked', li); if (!sel) return false;
        const p = byId[li.dataset.id]; cart.add(p.id, p.colors[0], sel.value); markAdded(li); checkComplete(li.closest('.rw__look-panel')); return true;
      };
      this.addEventListener('click', e => {
        const t = e.target;
        if (t.closest('[data-close]')) return closePopup();
        if (this.classList.contains('rw--zoom') && !t.closest('.rw__lb-model') && !t.closest('.rw__lb-top')) return closePopup();
        if (t.closest('[data-zoom]')) return openPopup();
        if (t.closest('[data-next]')) return next();
        if (t.closest('[data-prev]')) return prev();
        const tk = t.closest('[data-tick]'); if (tk) return go(+tk.dataset.tick);
        if (t.closest('[data-auto]')) { if (!playing) engaged = false; return play(!playing); }
        const pin = t.closest('[data-pin]'); if (pin) { engage(); return hot(+pin.dataset.pin, true); }
        const hit = t.closest('.rw__hit');
        if (hit) {
          const a = this.bodies.indexOf(hit.parentElement); let k = (((a - Math.round(target)) % N) + N) % N; if (k > N / 2) k -= N;
          if (k !== 0 && Math.abs(k) < 6) moveTo(Math.round(target) + k); else openPopup(); return;
        }
        const add = t.closest('[data-add]');
        if (add) {
          engage(); const li = add.closest('.rw__item'); if (li.classList.contains('is-added')) return;
          const pk = $('.rw__picker', li), open = pk.hidden;
          pk.hidden = !open; li.classList.toggle('is-picking', open); add.setAttribute('aria-expanded', open);
          if (open) { const f = $('input', pk); f && f.focus({ preventScroll: true }); }
          return;
        }
        const conf = t.closest('[data-confirm]');
        if (conf) {
          engage(); const li = conf.closest('.rw__item');
          if (!addCard(li)) { conf.classList.remove('rw__shake'); void conf.offsetWidth; conf.classList.add('rw__shake'); toast('Pick a size'); }
          return;
        }
        if (t.closest('[data-all]')) {
          engage(); const pan = panel(); if (pan.classList.contains('is-complete')) return;
          const cards = $$('.rw__item', pan).filter(c => !c.classList.contains('is-added'));
          const pending = [];
          cards.forEach(c => { if (!addCard(c)) pending.push(c); });
          const msg = $('[data-msg]', pan);
          if (pending.length) {
            pending.forEach(c => { $('.rw__picker', c).hidden = false; c.classList.add('is-picking'); $('[data-add]', c).setAttribute('aria-expanded', 'true'); });
            msg.textContent = `Pick a size for: ${pending.map(c => c.dataset.title).join(', ')}`;
            pending[0].scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
          } else msg.textContent = '';
        }
      });
      this.addEventListener('change', e => { if (e.target.closest('.rw__panel')) engage(); });
      this.addEventListener('pointerover', e => { const c = e.target.closest && e.target.closest('.rw__item'); if (c && e.pointerType === 'mouse' && c.dataset.card) hot(+c.dataset.card); });
      this.addEventListener('pointerout', e => { const c = e.target.closest && e.target.closest('.rw__item'); if (c && !c.contains(e.relatedTarget) && !zoomed) c.classList.remove('is-hot'); });
      const pn = $('.rw__panel');
      pn.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') panelHover = true; });
      pn.addEventListener('pointerleave', () => { panelHover = false; restartBar(); });

      /* ---------- drag / swipe / keys / wheel ---------- */
      const st = this.stage; let sx = 0, sy = 0, t0 = 0, pid = null, samples = [], moved = false, suppress = 0, wheelAcc = 0, wheelLock = 0;
      const unit = () => Math.max(120, W * .3);
      st.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (e.target.closest('.rw__lb')) return;
        sx = e.clientX; sy = e.clientY; t0 = target; pid = e.pointerId; samples = [{ x: e.clientX, t: performance.now() }]; moved = false;
      });
      st.addEventListener('pointermove', e => {
        if (pid !== e.pointerId) return;
        if (e.pointerType === 'mouse' && !(e.buttons & 1)) { endDrag(e); return; }
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!dragging) {
          if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { pid = null; return; }
          if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) { dragging = true; moved = true; this.classList.add('rw--dragging'); try { st.setPointerCapture(pid); } catch (_) {} engage(); }
          else return;
        }
        samples.push({ x: e.clientX, t: performance.now() }); if (samples.length > 6) samples.shift();
        target = t0 - dx / unit(); setStill(false); kick();
      });
      const endDrag = e => {
        if (pid !== e.pointerId) return; pid = null;
        if (!dragging) return;
        dragging = false; this.classList.remove('rw--dragging'); suppress = performance.now() + 60;
        const dx = e.clientX - sx, a = samples[0], b = samples[samples.length - 1];
        const vx = b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0; const from = Math.round(t0);
        if (innerWidth < 750) moveTo(from + ((Math.abs(dx) > 30 || Math.abs(vx) > .3) ? (dx > 0 ? -1 : 1) : 0));
        else {
          let i = Math.round(target - vx * 160 / unit());
          if (i === from && Math.abs(vx) > .3) i = from + (vx > 0 ? -1 : 1);
          moveTo(clamp(i, from - 2, from + 2));
        }
      };
      st.addEventListener('pointerup', endDrag); st.addEventListener('pointercancel', endDrag);
      st.addEventListener('click', e => { if (performance.now() < suppress) { e.stopPropagation(); e.preventDefault(); } }, true);
      st.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); engage(); next(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); engage(); prev(); } });
      st.addEventListener('wheel', e => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; e.preventDefault();
        if (performance.now() < wheelLock) return; wheelAcc += e.deltaX;
        if (Math.abs(wheelAcc) > 45) { engage(); wheelAcc > 0 ? next() : prev(); wheelAcc = 0; wheelLock = performance.now() + 520; }
      }, { passive: false });

      /* ---------- lifecycle ---------- */
      this.io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }, { threshold: 0 });
      this.io.observe(this);
      let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(measure, 120); });
      this.ro = new ResizeObserver(() => measure()); this.ro.observe(this.stage);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

      measure(); setIndex(0, true); setStill(false); render();
      const revealIO = new IntersectionObserver(es => { if (es[0].isIntersecting) { revealIO.disconnect(); requestAnimationFrame(() => requestAnimationFrame(() => { this.classList.add('is-revealed'); kick(); })); } }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
      if (reduce) { this.classList.add('is-revealed'); } else revealIO.observe(this);
      target = 0; kick();
      if (!reduce) play(true);
    }
  }

  const MODEL_SHOT = new Set(['f0396-101', 'f0874-109', 'f0454-201', 'f0392-101', 'f0866-109', 'f0460-201', 'f0763-208', 'f0333-101', 'f0830-108', 'f0459-201']);
  function zoomStyle(p) {
    if (!MODEL_SHOT.has(p.id)) return '';
    return ['denim', 'trousers'].includes(p.cat) ? '--z:1.9;--o:50% 66%' : '--z:2.1;--o:50% 24%';
  }
  function imgSrc2(n, w) { return `assets/runway/look-${n}${w === 640 ? '-640' : ''}.webp`; }
  function rowHTML(p, li, k) {
    const sizes = sortSizes(p.sizes), uid = `sz-${li}-${k}`;
    const label = /^\d+$/.test(sizes[0] || '') && p.cat === 'footwear' ? 'Shoe size' : (p.cat === 'denim' ? 'Waist' : 'Size');
    return `<li class="rw__item" data-card="${k}" data-id="${p.id}" data-title="${p.title}" style="--i:${k}">
      <a class="rw__media" href="product.html?id=${p.id}" tabindex="-1" aria-hidden="true"><img src="${imgSrc(p.img[0])}" alt="" loading="lazy" style="${zoomStyle(p)}"><span class="rw__num">${k}</span></a>
      <div class="rw__info"><span class="rw__type">Outfitters · ${CAT_LABEL[p.cat]}</span><a class="rw__name" href="product.html?id=${p.id}">${p.title}</a><span class="rw__price">${fmt(p.price)}</span></div>
      <button class="rw__add" data-add aria-expanded="false" aria-controls="pk-${uid}" aria-label="Choose size: ${p.title}">${PLUS}${CHECK}</button>
      <div class="rw__picker" id="pk-${uid}" hidden><fieldset class="rw__opt"><legend>${label}</legend><div class="rw__pills">${sizes.map(s => `<label class="rw__pill"><input type="radio" name="${uid}" value="${s}"><span>${s}</span></label>`).join('')}</div></fieldset><button class="rw__confirm" data-confirm>Add to bag<span class="rw__sr"> — ${p.title}</span></button></div></li>`;
  }

  customElements.define('runway-section', RunwaySection);
  app.go(); app.curtainIn();

  /* ---------- below the runway ---------- */
  const CATS = ['outerwear', 'hoodies', 'knitwear', 'denim', 'trousers', 'tees', 'shirts', 'footwear', 'accessories'];
  document.getElementById('hmTiles').innerHTML = CATS.map((c, i) => {
    const list = P.filter(p => p.cat === c), rep = list.find(p => p.img.length > 2) || list[0];
    return `<a class="cat" href="shop.html?c=${c}" data-cursor="Explore"><span class="no">0${i + 1}</span><div class="im"><img src="${imgSrc(rep.img[0])}" alt="${CAT_LABEL[c]}" loading="lazy"></div><div class="lbl"><b>${CAT_LABEL[c]}</b><span>${list.length}</span></div></a>`;
  }).join('');
  const pick = (g, nn) => { const out = [], seen = new Set(); const l = P.filter(p => p.gender === g && p.cat !== 'accessories'); l.forEach(p => { if (out.length < nn && !seen.has(p.cat)) { seen.add(p.cat); out.push(p); } }); l.forEach(p => { if (out.length < nn && !out.includes(p)) out.push(p); }); return out; };
  const grid = document.getElementById('hmGrid');
  const draw = (g, anim) => {
    const swap = () => { grid.innerHTML = pick(g, 8).map(cardHTML).join(''); OF.initTilt(grid); OF.gsap.from(grid.children, { y: 60, opacity: 0, duration: .9, stagger: .06, ease: 'expo.out', clearProps: 'all' }); };
    anim ? OF.gsap.to(grid.children, { y: -24, opacity: 0, duration: .3, stagger: .02, onComplete: swap }) : swap();
  };
  draw('men');
  document.querySelectorAll('#hmTabs .tab').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('#hmTabs .tab').forEach(x => x.classList.toggle('on', x === b)); draw(b.dataset.g, true); }));
})();
