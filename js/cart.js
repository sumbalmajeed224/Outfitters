(() => {
  const { $, gsap, byId, fmt, cart } = OF;
  const app = OF.boot(init);
  function render() {
    const list = $('#cartList'), sum = $('#cartSum');
    if (!list) return;
    if (!cart.items.length) {
      list.innerHTML = '<div style="padding:80px 0"><p class="serif" style="font-size:clamp(40px,6vw,90px);line-height:1">Your bag is empty.</p><p style="opacity:.6;margin:18px 0 34px">The winter edit is waiting.</p><a class="btn" href="shop.html">Start shopping <span class="ar">→</span></a></div>';
      sum.style.display = 'none'; $('#cartPg').style.gridTemplateColumns = '1fr'; return;
    }
    sum.style.display = ''; $('#cartPg').style.gridTemplateColumns = '';
    list.innerHTML = cart.items.map(i => cart.lineHTML(i)).join('');
    const t = cart.total();
    sum.innerHTML = `<h3>Summary</h3><div class="r"><span>Subtotal (${cart.count()} items)</span><span>${fmt(t)}</span></div><div class="r"><span>Delivery</span><span>At checkout</span></div><div class="r t"><span>Total</span><span>${fmt(t)}</span></div>
      <a class="btn solid block" href="${byId[cart.items[0].id].url}" target="_blank" rel="noopener">Continue on outfitters.com.pk <span class="ar">↗</span></a>
      <small>This is a concept redesign — payment happens on the real Outfitters store. Open each item there to order:</small>
      <div style="display:flex;flex-direction:column;gap:6px;font-size:13px">${cart.items.map(i => `<a href="${byId[i.id].url}" target="_blank" rel="noopener" style="text-decoration:underline;opacity:.75">${byId[i.id].title} ↗</a>`).join('')}</div>`;
  }
  window.__renderCartPage = render;
  function init() {
    render();
    $('#cartList').addEventListener('click', OF.qtyHandler);
    const ch = OF.splitChars($('#bagTitle')); gsap.from(ch, { yPercent: 115, duration: 1.2, stagger: .06, ease: 'expo.out', delay: .4 });
    gsap.from('.cartpg > *', { y: 60, opacity: 0, duration: 1, stagger: .15, ease: 'expo.out', delay: .6 });
    app.curtainIn();
  }
  app.go();
})();
