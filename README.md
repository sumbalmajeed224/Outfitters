# Outfitters — Winter 26 redesign

A motion-first redesign of the Outfitters storefront, built with the brand's real product catalogue (names, prices, colours, sizes and photography pulled from the public `outfitters.com.pk` product feed).

Static site: no build step. Open `index.html` through any static server.

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Pages

| Page | File | Highlights |
| --- | --- | --- |
| Home | `index.html` | Preloader, pinned hero with the model cut out in front of giant type and drawn-on script callouts, velocity marquees, scrubbed manifesto, pinned horizontal category rail, pinned leather "composer", live "just landed" grid, glass spec panel with count-ups, paperclip outfit note |
| Shop | `shop.html` | 154 real products (men + women, 9 categories), Flip-animated filtering, search and sorting, URL-synced (`?g=men&c=outerwear`), tilt cards, hover image swap, quick-add sizes |
| Product | `product.html?id=…` | Sticky info panel, parallax gallery, circular-reveal lightbox, colour/size pickers, glass chips, accordion, "complete the look" |
| Lookbook | `lookbook.html` | Four editorial chapters (leather, denim, knit, layers), masked image reveals, count-up stats |
| Bag | `cart.html` + drawer | Persistent cart (localStorage), animated slide-in drawer, quantity controls |

## Motion system (`js/core.js`)

GSAP + ScrollTrigger + Flip and Lenis smooth scroll, all vendored in `vendor/`.
Page-curtain transitions between pages, custom cursor with context labels, magnetic buttons, split-text reveals, scrubbed word fade, mask reveals, parallax, count-ups, tilt cards, and a scroll-velocity marquee.
`prefers-reduced-motion` is respected (animations are fast-forwarded and smooth scroll is disabled).

## Structure

```
css/style.css, css/fonts.css   design system + self-hosted fonts
js/core.js                     layout injection, scroll, cursor, transitions, cart, motion helpers
js/home.js shop.js product.js lookbook.js cart.js   page scripts
js/data.js                     generated product catalogue (window.PRODUCTS)
assets/img                     product photography (+ hero-cutout.webp)
tools/                         refresh_catalogue.sh, build_data.py
```

## Refreshing the catalogue

```bash
bash tools/refresh_catalogue.sh
```

Re-fetches `outfitters.com.pk/products.json`, picks men's and women's winter-26 products in stock, rewrites `js/data.js` and downloads images.

## Notes

- This is a concept redesign. Checkout hands off to the real store (`outfitters.com.pk`); no payments are processed here.
- Product names, imagery and prices belong to Outfitters.
- `assets/img/hero-cutout.webp` is a background-removed version of the Faux Leather Jacket photo, used so the headline can sit behind the model.
