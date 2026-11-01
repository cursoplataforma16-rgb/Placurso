from datetime import date
from html import escape
from pathlib import Path
import shutil
import sys
import xml.etree.ElementTree as ET

from patch_aads_unit import AADS_UNIT

BASE = "https://placurso.netlify.app"
CALC_PATH = "/ferramentas/calculadora-margem/"
GUIDE_PATH = "/guias/calcular-margem-lucro/"
CALC_TITLE = "Calculadora de margem e preço | Placurso"
GUIDE_TITLE = "Como calcular margem de lucro e definir o preço de venda | Placurso"

STYLE = """
:root{color-scheme:dark;--bg:#101a2b;--panel:#18263a;--panel2:#20324a;--text:#f4f6fa;--muted:#bdc8d8;--accent:#e0b568;--line:#344863}
*{box-sizing:border-box}
body{margin:0;padding-top:160px;background:var(--bg);color:var(--text);font:16px/1.65 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
a{color:#f0c77f;text-underline-offset:3px}
a:focus,button:focus,input:focus,select:focus{outline:3px solid #e0b568;outline-offset:2px}
header,main,footer{width:min(100% - 32px,900px);margin-inline:auto}
header{padding:30px 0 12px}
.brand{font-weight:800;letter-spacing:.04em;text-decoration:none;color:var(--text)}
nav{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;font-size:.95rem}
main{padding:22px 0 64px}
.eyebrow{color:var(--accent);font-size:.78rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase}
h1{font-size:clamp(2rem,5vw,3.25rem);line-height:1.12;letter-spacing:-.03em;margin:.35em 0}
h2{line-height:1.25;margin-top:2rem}
.lead{font-size:1.12rem;color:var(--muted);max-width:72ch}
.card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:clamp(18px,4vw,30px);margin:24px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:15px}
label{display:block;font-weight:650;font-size:.94rem;margin-bottom:7px}
input,select{width:100%;min-height:48px;background:#0e1929;color:var(--text);border:1px solid #536781;border-radius:9px;padding:10px 12px;font:inherit}
.help{color:var(--muted);font-size:.86rem;margin:.4rem 0 0}
.results{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:12px}
.result{background:var(--panel2);border-radius:10px;padding:14px}
.result span{display:block;color:var(--muted);font-size:.84rem}
.result strong{display:block;font-size:1.12rem;margin-top:4px;overflow-wrap:anywhere}
.error{border:1px solid #ef9a9a;background:#40252b;color:#fff;padding:12px;border-radius:9px;margin:14px 0}
.note{border-left:3px solid var(--accent);padding:12px 16px;background:#1b293b;color:var(--muted)}
.actions{display:flex;gap:12px;flex-wrap:wrap;margin:22px 0}
.button{display:inline-flex;align-items:center;justify-content:center;background:var(--accent);color:#182235;padding:12px 18px;border-radius:9px;font-weight:750;text-decoration:none}
.button.secondary{background:transparent;color:var(--text);border:1px solid var(--line)}
article{max-width:76ch}
article p,article li{color:#dbe2eb}
footer{border-top:1px solid var(--line);padding:22px 0 38px;color:var(--muted);font-size:.9rem}
small{color:var(--muted)}
"""

def ad_block() -> str:
    return AADS_UNIT

def page_shell(title: str, description: str, canonical: str, body: str, schema: dict | None = None) -> str:
    jsonld = ""
    if schema:
        import json
        jsonld = '<script type="application/ld+json">' + json.dumps(schema, ensure_ascii=False) + '</script>'
    return f'''<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title>
<meta name="description" content="{escape(description, quote=True)}">
<link rel="canonical" href="{escape(canonical, quote=True)}">
<meta name="theme-color" content="#101a2b">
<meta property="og:site_name" content="Placurso">
<meta property="og:type" content="website">
<meta property="og:title" content="{escape(title, quote=True)}">
<meta property="og:description" content="{escape(description, quote=True)}">
<meta property="og:url" content="{escape(canonical, quote=True)}">
<meta property="og:image" content="{BASE}/curso-og.png">
<meta name="twitter:card" content="summary_large_image">
{jsonld}
<style>{STYLE}</style>
</head>
<body>
<header>
<a class="brand" href="{BASE}/">PLACURSO · APRENDER · APLICAR · CRESCER</a>
<nav aria-label="Navegação principal">
<a href="{BASE}/cursos">Cursos</a>
<a href="{BASE}{CALC_PATH}">Calculadora de margem</a>
<a href="{BASE}{GUIDE_PATH}">Guias práticos</a>
</nav>
</header>
{body}
<footer>
<p>Placurso — formação prática, ferramentas digitais e aprendizagem com ANNAN.</p>
<p>Os cálculos são estimativas para apoio à gestão. Confirme impostos, custos legais e condições comerciais aplicáveis ao seu negócio.</p>
<a href="{BASE}/cursos">Explorar cursos e aprendizagem</a>
</footer>
{ad_block()}
</body>
</html>
'''

def calculator_page() -> str:
    body = f'''
<main>
<p class="eyebrow">Ferramenta gratuita · Pequenos negócios</p>
<h1>Calculadora de margem e preço</h1>
<p class="lead">Descubra quanto custa cada unidade, quanto ganha por venda e que preço precisa de praticar para atingir a margem desejada. Pensada para quem vende produtos ou serviços em Angola e na comunidade lusófona.</p>
<div class="actions">
<a class="button secondary" href="{BASE}{GUIDE_PATH}">Aprender a calcular a margem</a>
<a class="button secondary" href="{BASE}/cursos">Ver cursos práticos</a>
</div>
<section class="card" aria-labelledby="inputs-heading">
<h2 id="inputs-heading">Introduza os seus valores</h2>
<form id="margin-calculator">
<div class="grid">
<div><label for="currency">Moeda</label><select id="currency" name="currency"><option value="AOA" selected>Kwanza (AOA)</option><option value="USD">Dólar (USD)</option><option value="EUR">Euro (EUR)</option><option value="ZAR">Rand (ZAR)</option><option value="BRL">Real (BRL)</option></select><p class="help">Escolha a moeda dos valores introduzidos.</p></div>
<div><label for="unit-cost">Custo de compra ou produção por unidade</label><input id="unit-cost" name="unitCost" type="number" min="0" step="0.01" value="5000" inputmode="decimal" required><p class="help">Quanto paga para adquirir ou produzir uma unidade.</p></div>
<div><label for="unit-expenses">Outras despesas por unidade</label><input id="unit-expenses" name="unitExpenses" type="number" min="0" step="0.01" value="500" inputmode="decimal" required><p class="help">Embalagem, transporte, entrega ou outros custos directos.</p></div>
<div><label for="fee-percent">Taxa variável sobre a venda (%)</label><input id="fee-percent" name="feePercent" type="number" min="0" max="99.99" step="0.01" value="5" inputmode="decimal" required><p class="help">Comissão de pagamento, plataforma ou intermediário.</p></div>
<div><label for="sale-price">Preço de venda actual por unidade</label><input id="sale-price" name="salePrice" type="number" min="0" step="0.01" value="8000" inputmode="decimal" required><p class="help">O preço que cobra actualmente. Pode deixar 0 se ainda não definiu um preço.</p></div>
<div><label for="target-margin">Margem de lucro pretendida (%)</label><input id="target-margin" name="targetMarginPercent" type="number" min="0" max="99.99" step="0.01" value="25" inputmode="decimal" required><p class="help">Percentagem do preço final que pretende conservar como lucro.</p></div>
</div>
<div id="calculator-error" class="error" role="alert" hidden></div>
</form>
</section>
<section class="card" aria-live="polite" aria-atomic="true">
<h2>Resultado da simulação</h2>
<div id="calculator-results" class="results">
<div class="result"><span>Custo total por unidade</span><strong id="result-cost">—</strong></div>
<div class="result"><span>Taxa descontada na venda</span><strong id="result-fee">—</strong></div>
<div class="result"><span>Lucro estimado por unidade</span><strong id="result-profit">—</strong></div>
<div class="result"><span>Margem sobre a venda</span><strong id="result-margin">—</strong></div>
<div class="result"><span>Markup sobre o custo</span><strong id="result-markup">—</strong></div>
<div class="result"><span>Preço de equilíbrio</span><strong id="result-break-even">—</strong></div>
<div class="result"><span>Preço para a margem pretendida</span><strong id="result-target">—</strong></div>
</div>
<p class="help">O preço de equilíbrio cobre os custos e a taxa indicada, sem lucro. O preço recomendado é a simulação para a margem escolhida.</p>
</section>
<section class="card">
<h2>Como usar os resultados</h2>
<p>Compare o preço de venda com o preço de equilíbrio. Se o preço actual estiver abaixo desse valor, a venda gera prejuízo depois dos custos e da taxa indicados. O preço para a margem pretendida ajuda a definir uma meta; confirme sempre se o mercado aceita esse preço.</p>
<p class="note">Esta ferramenta não inclui automaticamente impostos, custos fixos mensais, perdas, descontos, devoluções ou variações cambiais. Distribua esses custos pelas unidades quando forem relevantes.</p>
</section>
<section>
<h2>Continue a aprender</h2>
<p>Depois de calcular o preço, aprofunde gestão, finanças, marketing e organização do negócio através de percursos práticos com o ANNAN.</p>
<a class="button" href="{BASE}/cursos">Explorar formação gratuita</a>
</section>
<script src="/js/placurso-margin-calculator-core.js" defer></script>
<script src="/js/placurso-margin-calculator.js" defer></script>
</main>
'''
    schema = {
        "@context":"https://schema.org",
        "@type":"WebApplication",
        "name":"Calculadora de margem e preço — Placurso",
        "applicationCategory":"FinanceApplication",
        "operatingSystem":"Any",
        "inLanguage":"pt",
        "description":"Ferramenta gratuita para estimar custo unitário, margem de lucro, markup e preço de venda."
    }
    return page_shell(CALC_TITLE, "Calcule custo unitário, taxa, lucro, margem e preço de venda para o seu pequeno negócio. Ferramenta gratuita Placurso com kwanza AOA e outras moedas.", BASE + CALC_PATH, body, schema)

def guide_page() -> str:
    body = f'''
<main>
<article>
<p class="eyebrow">Guia de gestão · Preços e lucro</p>
<h1>Como calcular a margem de lucro e definir o preço de venda</h1>
<p class="lead">Saber quanto entra na caixa não chega. Para perceber se uma venda compensa, subtraia todos os custos directos e as taxas que incidem sobre o preço.</p>
<div class="actions"><a class="button" href="{BASE}{CALC_PATH}">Abrir calculadora gratuita</a><a class="button secondary" href="{BASE}/cursos">Aprender gestão no Placurso</a></div>

<h2>1. Comece pelo custo real por unidade</h2>
<p>Some o custo de compra ou produção às despesas directamente relacionadas com cada unidade: embalagem, transporte, entrega ou comissões fixas. O resultado é o custo que precisa de recuperar antes de obter lucro.</p>
<p><strong>Exemplo:</strong> compra ou produção de 5.000 AOA + 500 AOA de despesas por unidade = <strong>5.500 AOA de custo total</strong>.</p>

<h2>2. O que é margem de lucro?</h2>
<p>A <strong>margem de lucro</strong> mostra que percentagem do preço de venda fica como lucro depois de pagar o custo e as taxas variáveis.</p>
<p>Fórmula: <strong>margem = lucro ÷ preço de venda × 100</strong>.</p>

<h2>3. Margem não é o mesmo que markup</h2>
<p>O <strong>markup</strong> compara o lucro com o custo; a margem compara o lucro com o preço de venda. Os dois indicadores são úteis, mas respondem a perguntas diferentes. Uma margem de 25% não significa acrescentar apenas 25% ao custo.</p>

<h2>4. Exemplo com uma taxa de venda</h2>
<p>Imagine um custo total de 5.500 AOA, uma taxa variável de 5% e uma margem pretendida de 25%. O preço para atingir essa margem é calculado assim:</p>
<p><strong>Preço = custo ÷ (1 − taxa − margem)</strong></p>
<p><strong>5.500 ÷ (1 − 0,05 − 0,25) = 7.857,14 AOA</strong>.</p>
<p>Este é um valor matemático de referência. Antes de aplicar o preço, avalie a concorrência, a procura, os impostos e os custos fixos do negócio.</p>

<h2>5. Faça a simulação com os seus números</h2>
<p>Altere o custo, as despesas, a taxa e a margem pretendida. A calculadora apresenta lucro estimado, margem, markup, preço de equilíbrio e preço para a meta definida.</p>
<div class="actions"><a class="button" href="{BASE}{CALC_PATH}">Calcular a minha margem</a></div>

<h2>6. Evite erros comuns</h2>
<ul>
<li>Confundir dinheiro recebido com lucro.</li>
<li>Esquecer transporte, embalagem, taxas ou perdas.</li>
<li>Definir preços apenas copiando concorrentes.</li>
<li>Usar uma margem demasiado alta sem verificar a procura.</li>
<li>Ignorar impostos e custos fixos mensais.</li>
</ul>
<p class="note">O resultado da calculadora é uma estimativa de gestão, não substitui contabilidade, aconselhamento fiscal ou análise do mercado.</p>

<h2>Próximo passo</h2>
<p>Treine outras competências de gestão e negócio com os recursos práticos da Plataforma Curso.</p>
<a class="button secondary" href="{BASE}/cursos">Ver cursos e ferramentas Placurso</a>
</article>
</main>
'''
    schema = {
        "@context":"https://schema.org",
        "@type":"Article",
        "headline":"Como calcular a margem de lucro e definir o preço de venda",
        "inLanguage":"pt",
        "description":"Guia prático sobre custo unitário, margem, markup e preço de venda."
    }
    return page_shell(GUIDE_TITLE, "Aprenda a calcular custo unitário, margem de lucro, markup e preço de venda com exemplos em kwanzas. Guia prático e calculadora gratuita Placurso.", BASE + GUIDE_PATH, body, schema)

def write_sitemap(public: Path) -> None:
    ET.register_namespace("", "http://www.sitemaps.org/schemas/sitemap/0.9")
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    root = ET.Element(ns + "urlset")
    today = date.today().isoformat()
    for path in ["/", "/cursos", CALC_PATH, GUIDE_PATH]:
        item = ET.SubElement(root, ns + "url")
        ET.SubElement(item, ns + "loc").text = BASE + path
        ET.SubElement(item, ns + "lastmod").text = today
    ET.indent(root, space="  ")
    ET.ElementTree(root).write(public / "sitemap.xml", encoding="utf-8", xml_declaration=True)

def build(public: Path) -> None:
    public.mkdir(parents=True, exist_ok=True)
    calc_dir = public / CALC_PATH.strip("/")
    guide_dir = public / GUIDE_PATH.strip("/")
    js_dir = public / "js"
    calc_dir.mkdir(parents=True, exist_ok=True)
    guide_dir.mkdir(parents=True, exist_ok=True)
    js_dir.mkdir(parents=True, exist_ok=True)

    (calc_dir / "index.html").write_text(calculator_page(), encoding="utf-8")
    (guide_dir / "index.html").write_text(guide_page(), encoding="utf-8")
    root = Path(__file__).resolve().parent
    shutil.copy2(root / "margin_calculator_core.js", js_dir / "placurso-margin-calculator-core.js")
    shutil.copy2(root / "margin_calculator_ui.js", js_dir / "placurso-margin-calculator.js")

    (public / "robots.txt").write_text(
        "User-agent: *\nAllow: /\n\nSitemap: " + BASE + "/sitemap.xml\n",
        encoding="utf-8",
    )
    write_sitemap(public)
    print("OK: calculadora de margem e guia prático gerados.")
    print("OK: sitemap.xml e robots.txt gerados.")
    print("OK: A-Ads 2459988, uma unidade por página nova.")

if __name__ == "__main__":
    destination = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("public")
    build(destination)
