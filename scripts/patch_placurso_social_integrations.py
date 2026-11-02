from __future__ import annotations

from pathlib import Path
import shutil
import sys


def patch(public: Path) -> None:
    ceo = public / "ceo.html"
    source = Path(__file__).resolve().parent / "placurso_social_integrations.js"
    if not ceo.is_file():
        raise SystemExit("CEO page missing before social OAuth patch.")
    if not source.is_file():
        raise SystemExit("Social OAuth UI module missing.")

    shutil.copy2(source, public / "placurso-social-integrations.js")
    html = ceo.read_text(encoding="utf-8")

    script_marker = '<script src="/placurso-social-integrations.js"></script>'
    if script_marker not in html:
        anchor = '<script src="/placurso-growth-center.js"></script>'
        if anchor not in html:
            raise SystemExit("CEO growth center script anchor missing.")
        html = html.replace(anchor, anchor + "\n" + script_marker, 1)

    dashboard_anchor = '<div id="growth"></div>'
    dashboard_replacement = '<div id="growth"></div><div id="social-integrations"></div>'
    if 'id="social-integrations"' not in html:
        if dashboard_anchor not in html:
            raise SystemExit("CEO growth dashboard anchor missing.")
        html = html.replace(dashboard_anchor, dashboard_replacement, 1)

    render_anchor = "window.renderPlacursoGrowthCenter($('growth'));"
    render_replacement = (
        render_anchor
        + "\n    if(window.PlacursoSocialIntegrations&&typeof window.PlacursoSocialIntegrations.render==='function')"
        + "await window.PlacursoSocialIntegrations.render($('social-integrations'));"
    )
    if "PlacursoSocialIntegrations.render" not in html:
        if render_anchor not in html:
            raise SystemExit("CEO Growth Center render anchor missing.")
        html = html.replace(render_anchor, render_replacement, 1)

    required = (
        'src="/placurso-social-integrations.js"',
        'id="social-integrations"',
        "PlacursoSocialIntegrations.render",
    )
    for marker in required:
        if marker not in html:
            raise SystemExit("Social OAuth module was not injected: " + marker)

    ceo.write_text(html, encoding="utf-8")
    print("Placurso social OAuth controls injected into CEO page.")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("public")
    patch(target)
