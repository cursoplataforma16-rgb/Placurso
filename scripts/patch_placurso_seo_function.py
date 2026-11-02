from pathlib import Path
import sys

SEO_FUNCTION = r'''// SEO e partilha públicos exclusivos do Placurso.
const SB = 'https://ebdrrsrvjsdjthatfbcd.supabase.co';
const ANON = 'sb_publishable_xCkqK8v-DGWq9qnfYSHfPQ_HW9dno1C';
const SITE = 'https://placurso.netlify.app';
const TYPES = ['ebook', 'combo', 'curso'];
const HEADERS = { apikey: ANON, Authorization: 'Bearer ' + ANON };
const esc = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const slug = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70) || 'produto';
const kz = v => String(Math.round(Number(v) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g,' ') + ' Kz';
const isDigital = p => !!p && TYPES.includes(p.tipo);
const productUrl = p => SITE + '/p/' + slug(p.nome) + '--' + p.id;

async function getProduct(value) {
  const raw = String(value || '').trim();
  if (!raw || raw.length > 180) return null;
  const uuid = raw.match(/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i);
  const code = raw.match(/^([a-z0-9]{2,6})$/i);
  if (!uuid && !code) return null;
  const q = new URL(SB + '/rest/v1/produtos');
  q.searchParams.set('select','id,nome,descricao,tipo,preco,preco_promocional,imagem_url,imagem_social,codigo,moeda,ativo,criado_em');
  q.searchParams.set('ativo','eq.true');
  q.searchParams.set('tipo','in.(ebook,combo,curso)');
  q.searchParams.set(uuid ? 'id' : 'codigo', uuid ? 'eq.' + uuid[1] : 'eq.' + code[1].toUpperCase());
  q.searchParams.set('limit','1');
  const response = await fetch(q,{headers:HEADERS});
  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) && rows.length && isDigital(rows[0]) ? rows[0] : null;
}

async function getDigitalProducts() {
  const q = new URL(SB + '/rest/v1/produtos');
  q.searchParams.set('select','id,nome,descricao,tipo,preco,preco_promocional,imagem_url,imagem_social,codigo,moeda,ativo,criado_em');
  q.searchParams.set('ativo','eq.true');
  q.searchParams.set('tipo','in.(ebook,combo,curso)');
  q.searchParams.set('order','criado_em.desc');
  q.searchParams.set('limit','100');
  const response = await fetch(q,{headers:HEADERS});
  if (!response.ok) return [];
  const rows = await response.json();
  return Array.isArray(rows) ? rows.filter(isDigital) : [];
}

function html(body,status=200) {
  return new Response(body,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
}

async function courseHome(request) {
  const response = await fetch(new URL('/index.html',request.url),{headers:{'Cache-Control':'no-cache'}});
  if (!response.ok) return Response.redirect(SITE + '/cursos',302);
  let page = await response.text();
  const title = 'Placurso — aprender, aplicar e crescer';
  const description = 'Cursos práticos no telemóvel com ANNAN, provas, certificados, livros e ferramentas digitais.';
  page = page.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i,'<title>' + esc(title) + '</title>');
  page = page.replace(/<meta\s+name=["']description["'][^>]*>/i,'<meta name="description" content="' + esc(description) + '">');
  page = page.replace(/<link\s+rel=["']canonical["'][^>]*>/i,'');
  page = page.replace(/<meta\s+(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+)["'][^>]*>/gi,'');
  page = page.replace('</head>','<link rel="canonical" href="' + SITE + '/cursos"><meta property="og:site_name" content="Placurso"><meta property="og:type" content="website"><meta property="og:title" content="' + esc(title) + '"><meta property="og:description" content="' + esc(description) + '"><meta property="og:url" content="' + SITE + '/cursos"><meta property="og:image" content="' + SITE + '/curso-og.png"><meta name="twitter:card" content="summary_large_image"></head>');
  return html(page);
}

async function productPage(p) {
  if (!p) return Response.redirect(SITE + '/cursos',302);
  const title = p.nome + ' | Placurso';
  const desc = String(p.descricao || 'Livro, curso ou ferramenta digital do Placurso.').replace(/\s+/g,' ').slice(0,180);
  const image = /^https?:\/\//i.test(p.imagem_social || '') ? p.imagem_social : (/^https?:\/\//i.test(p.imagem_url || '') ? p.imagem_url : SITE + '/curso-og.png');
  const price = p.preco_promocional && Number(p.preco_promocional) > 0 ? p.preco_promocional : p.preco;
  const canonical = productUrl(p);
  const detail = SITE + '/cursos?produto=' + encodeURIComponent(p.id);
  const schema = {'@context':'https://schema.org','@type':'Product',name:p.nome,description:desc,image,brand:{'@type':'Brand',name:'Placurso'},url:canonical,offers:{'@type':'Offer',price:Number(price || 0),priceCurrency:p.moeda || 'AOA',availability:'https://schema.org/InStock',url:detail,seller:{'@type':'Organization',name:'Placurso'}}};
  const json = JSON.stringify(schema).replace(/</g,'\\u003c');
  return html('<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(title) + '</title><meta name="description" content="' + esc(desc) + '"><link rel="canonical" href="' + esc(canonical) + '"><meta property="og:site_name" content="Placurso"><meta property="og:type" content="product"><meta property="og:title" content="' + esc(title) + '"><meta property="og:description" content="' + esc(desc) + '"><meta property="og:url" content="' + esc(canonical) + '"><meta property="og:image" content="' + esc(image) + '"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/curso-icon-192.png"><meta name="theme-color" content="#14284B"><script type="application/ld+json">' + json + '</script><style>*{box-sizing:border-box}body{margin:0;background:#f7f9fc;color:#14284b;font:16px/1.55 system-ui,Arial,sans-serif}main{max-width:680px;margin:8vh auto;padding:24px}article{background:white;border:1px solid #dbe4ed;border-radius:18px;overflow:hidden}img{display:block;width:100%;max-height:360px;object-fit:cover}section{padding:22px}h1{font-size:clamp(24px,5vw,36px);line-height:1.12}.price{font-size:24px;font-weight:800;margin:18px 0}.cta{display:block;text-align:center;text-decoration:none;color:white;background:#1b8a83;border-radius:10px;padding:14px;font-weight:700}</style></head><body><main><b>PLACURSO</b><article>' + (image ? '<img src="' + esc(image) + '" alt="' + esc(p.nome) + '">' : '') + '<section><p>Livro digital · curso · ferramenta</p><h1>' + esc(p.nome) + '</h1><p>' + esc(desc) + '</p><div class="price">' + esc(kz(price)) + '</div><a class="cta" href="' + esc(detail) + '">Ver no Placurso</a></section></article></main></body></html>');
}

async function bioPage() {
  const products = await getDigitalProducts();
  const cards = products.slice(0,12).map(p => '<a class="item" href="' + esc(productUrl(p)) + '"><b>' + esc(p.nome) + '</b><span>' + esc(kz(p.preco_promocional && Number(p.preco_promocional)>0 ? p.preco_promocional : p.preco)) + '</span></a>').join('');
  const page = '<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Placurso — aprender, aplicar e crescer</title><meta name="description" content="Cursos, livros e ferramentas digitais para aprender e aplicar."><link rel="canonical" href="' + SITE + '/ver"><meta property="og:site_name" content="Placurso"><meta property="og:title" content="Placurso — aprender, aplicar e crescer"><meta property="og:image" content="' + SITE + '/curso-og.png"><style>body{font:16px/1.5 system-ui;background:#14284b;color:white;margin:0;padding:24px}.wrap{max-width:640px;margin:auto}.item{display:flex;justify-content:space-between;gap:10px;padding:14px;margin:9px 0;border:1px solid #34506f;border-radius:10px;background:#1b3150;color:white;text-decoration:none}.item span{white-space:nowrap;color:#a7e2d6}.cta{display:block;text-align:center;padding:14px;background:#1b8a83;border-radius:9px;margin:14px 0;color:white;text-decoration:none}form{display:flex;gap:8px;margin:18px 0}input,button{padding:12px;border-radius:8px;border:0}input{flex:1;min-width:0}button{background:#1b8a83;color:white;font-weight:700}</style></head><body><main class="wrap"><h1>PLACURSO</h1><p>Aprender · Aplicar · Crescer</p><a class="cta" href="/cursos?aprender=1">Começar a aprender com ANNAN</a><form onsubmit="event.preventDefault();var v=this.code.value.trim();if(v)location.href='/p/'+encodeURIComponent(v)"><input name="code" maxlength="6" placeholder="Código do produto"><button>Abrir</button></form><h2>Livros, cursos e ferramentas</h2>' + (cards || '<p>Novos produtos em preparação.</p>') + '<a class="cta" href="/cursos">Conhecer a plataforma</a></main></body></html>';
  return html(page);
}

export default async request => {
  const url = new URL(request.url);
  try {
    if (/^\/cursos\/.*$/.test(url.pathname)) return await courseHome(request);
    if (/^\/(?:ver|bio|links)\/?$/.test(url.pathname)) return await bioPage();
    if (url.pathname.startsWith('/p/')) {
      const codeOrId = decodeURIComponent(url.pathname.slice(3).replace(/\/$/,''));
      if (/^(?:GRATIS|GRA|AULAS)$/i.test(codeOrId)) return Response.redirect(SITE + '/cursos?aprender=1&utm_source=codigo&utm_campaign=gratis',302);
      return await productPage(await getProduct(codeOrId));
    }
    return Response.redirect(SITE + '/cursos',302);
  } catch (_) {
    return Response.redirect(SITE + '/cursos',302);
  }
};

export const config = { path: ['/p/*','/cursos/*','/ver','/bio','/links'] };
'''


def patch(path: Path) -> None:
    if not path.is_file():
        raise SystemExit(f"SEO function missing: {path}")
    path.write_text(SEO_FUNCTION, encoding="utf-8")
    print("Placurso-only SEO function generated.")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("netlify/functions/seo.mjs")
    patch(target)
