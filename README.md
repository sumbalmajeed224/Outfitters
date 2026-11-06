# Outfitters — Winter 26 redesign

A motion-first redesign of the Outfitters storefront, built with the brand's real product catalogue (names, prices, colours, sizes and photography pulled from the public `outfitters.com.pk` product feed).

Static site: no build step. Open `index.html` through any static server.

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Pages

| Page | File | Highlights |
| --- | --- | --- |
| Home | `index.html` | **Hero:** a big faded WINTER word behind a cut-out jacket-jeans-boots outfit seated on a chair, with product hotspots, entrance animation and parallax. **Then Try the Look** runway: a `<runway-section>` custom element with six full-body Outfitters looks on a turning 3D ring (spring physics, depth blur), 5-second autoplay with 01–06 progress ticks, drag/swipe/keys, a "View look" popup with numbered pins, an "In this look" panel with size pickers and a full-look add-to-bag, then the category edit and new arrivals |
| Shop | `shop.html` | 250 real products (men + women, 9 categories), Flip-animated filtering, search and sorting, URL-synced (`?g=men&c=outerwear`), tilt cards, hover image swap, quick-add sizes |
| Product | `product.html?id=…` | Sticky info panel, parallax gallery, circular-reveal lightbox, colour/size pickers, glass chips, accordion, "complete the look" |
| Lookbook | `lookbook.html` | Four editorial chapters (leather, denim, knit, layers), masked image reveals, count-up stats |
| Bag | `cart.html` + drawer | Persistent cart (localStorage), animated slide-in drawer, quantity controls |

## Motion system (`js/core.js`)

GSAP + ScrollTrigger + Flip and Lenis smooth scroll, all vendored in `vendor/`.
Page-curtain transitions between pages, custom cursor with context labels, magnetic buttons, split-text reveals, scrubbed word fade, mask reveals, parallax, count-ups, tilt cards, and a scroll-velocity marquee.
`prefers-reduced-motion` is respected (animations are fast-forwarded and smooth scroll is disabled).

## Structure

```
css/style.css, css/runway.css, css/fonts.css   design system, runway styles, self-hosted fonts
js/core.js                     layout injection, scroll, cursor, transitions, cart, motion helpers
js/runway.js shop.js product.js lookbook.js cart.js   page scripts
js/data.js                     generated product catalogue (window.PRODUCTS)
assets/img                     product photography
assets/runway                  background-removed model cut-outs for the runway (look-N.webp)
assets/hero/chair.webp         cut-out of the seated outfit for the hero
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
- `assets/runway/look-*.webp` are background-removed, floor-aligned versions of Outfitters model photos so the figures can stand on the white stage.
- Runway pieces beyond the featured jacket are styling suggestions from the catalogue; the bundle total is the plain sum of the three prices.
