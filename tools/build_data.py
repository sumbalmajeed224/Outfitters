import json,glob,re,html,subprocess,collections
ps={}
for f in glob.glob('tools/.cache/p*.json'):
    try:
        for p in json.load(open(f))['products']: ps[p['id']]=p
    except: pass
ps=list(ps.values())
def g(p):
    t=set(x.lower() for x in p['tags'])
    if t&{'kids','boys','girls','junior-new-again'}: return None
    if 'men' in t: return 'men'
    if 'women' in t: return 'women'
CAT={'OUTERWEAR':'outerwear','SWEATSHIRTS':'hoodies','SWEATERS':'knitwear','JEANS':'denim','TROUSERS':'trousers','TEES':'tees','SHIRTS/BLOUSES':'shirts','SHIRTS':'shirts','CLOSED SHOES':'footwear','BAGS':'accessories','CAPS & HATS':'accessories','BELTS & BRACES':'accessories','JEWELLERY':'accessories','SCARVES & FOULARDS':'accessories'}
LIM={('men','outerwear'):22,('women','outerwear'):18,('men','hoodies'):16,('women','hoodies'):16,('men','knitwear'):12,('women','knitwear'):16,('men','denim'):14,('women','denim'):14,('men','trousers'):14,('women','trousers'):14,('men','tees'):14,('women','tees'):14,('men','shirts'):14,('women','shirts'):12,('men','footwear'):12,('women','footwear'):12,('men','accessories'):14,('women','accessories'):14}
ok=[p for p in ps if g(p) and p['product_type'] in CAT and 'WS-26' in p['tags'] and any(v['available'] for v in p['variants']) and len(p['images'])>=3]
ok.sort(key=lambda p:p['updated_at'],reverse=True)
must=['f0354-101','f0396-101']
sel=[];cnt=collections.Counter()
order=[p for p in ok if p['handle'] in must]+[p for p in ok if p['handle'] not in must]
seen=set()
for p in order:
    k=(g(p),CAT[p['product_type']])
    if k not in LIM or cnt[k]>=LIM[k]: continue
    key=(p['title'],k)
    if key in seen and p['handle'] not in must: continue
    seen.add(key);cnt[k]+=1;sel.append(p)
def strip(h):
    h=re.sub(r'<br\s*/?>|</p>|</li>','\n',h or '');h=re.sub(r'<[^>]+>','',h);return html.unescape(h)
out=[];dl=[]
for p in sel:
    k=(g(p),CAT[p['product_type']])
    imgs=p['images'][:4]
    files=[]
    for i,im in enumerate(imgs):
        fn=f"{p['handle']}-{i+1}.jpg";files.append(fn)
        dl.append((im['src'].split('?')[0]+'?width=%d'%(1000 if i==0 else 760),fn))
    vs=p['variants']
    desc=strip(p['body_html']);lines=[l.strip() for l in desc.split('\n') if l.strip()]
    fit=next((l.split(':',1)[1].strip() for l in lines if l.upper().startswith('FIT:')),'')
    comp=next((l for l in lines if '%' in l),'')
    blurb=next((l for l in lines if len(l)>40 and not l.upper().startswith(('FIT','COMPOS','MACHINE'))),'')
    price=min(float(v['price']) for v in vs);cmp_=max(float(v['compare_at_price'] or 0) for v in vs)
    out.append(dict(id=p['handle'],title=p['title'],gender=k[0],cat=k[1],price=int(price),was=int(cmp_) if cmp_>price else 0,
      colors=list(dict.fromkeys(v['option1'] for v in vs if v['option1'])),sizes=list(dict.fromkeys(v['option2'] for v in vs if v['option2'] and v['available'])),
      fit=fit,comp=comp,blurb=blurb,img=files,isNew=any('new' in t.lower() for t in p['tags']),url='https://outfitters.com.pk/products/'+p['handle']))
print(len(out),cnt)
open('tools/.cache/dl.txt','w').write('\n'.join(f"{u}\t{f}" for u,f in dl))
open('js/data.js','w').write('window.PRODUCTS='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
