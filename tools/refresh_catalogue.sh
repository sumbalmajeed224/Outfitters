#!/usr/bin/env bash
# Re-pull the product catalogue from the public Shopify feed, rebuild js/data.js and download images.
# Run from the repo root:  bash tools/refresh_catalogue.sh
set -euo pipefail
mkdir -p tools/.cache assets/img
for i in $(seq 1 20); do curl -sS -m 60 "https://outfitters.com.pk/products.json?limit=250&page=$i" -o "tools/.cache/p$i.json" & done; wait
python3 -I tools/build_data.py
cd assets/img && xargs -P 16 -L 1 sh -c 'curl -sS -m 60 -o "$1" "$0"' < ../../tools/.cache/dl.txt
