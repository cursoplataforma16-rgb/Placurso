from __future__ import annotations

from pathlib import Path
import shutil
import sys


def main() -> None:
    public = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('public')
    ceo = public / 'ceo.html'
    if not ceo.is_file():
        raise SystemExit('CEO page missing before social integration patch.')

    source = Path(__file__).resolve().parent / 'placurso_social_integrations.js'
    if not source.is_file():
        raise SystemExit('Social integration module missing.')
    shutil.copy2(source, public / 'placurso-social-integrations.js')

    html = ceo.read_text(encoding='utf-8')
    script_marker = '<script src="/placurso-social-integrations.js"></script>'
    if script_marker not in html:
        anchor = '<script src="/placurso-growth-center.js"></script>'
        if anchor not in html:
            raise SystemExit('CEO growth center anchor missing.')
        html = html.replace(anchor, anchor + '\n' + script_marker, 1)

    dashboard_anchor = '<div id="growth"></div>'
    dashboard_replacement = '<div id="growth"></div><div id="social-integrations"></div>'
    if dashboard_anchor in html and 'id="social-integrations"' not in html:
        html = html.replace(dashboard_anchor, dashboard_replacement, 1)

    render_anchor = "window.renderPlacursoGrowthCenter($('growth'));"
    render_replacement = render_anchor + "\n    if(window.PlacursoSocialIntegrations&&typeof window.PlacursoSocialIntegrations.render==='function')await window.PlacursoSocialIntegrations.render($('social-integrations'));"
    if render_anchor in html and 'PlacursoSocialIntegrations.render' not in html:
        html = html.replace(render_anchor, render_replacement, 1)

    if 'placurso-social-integrations.js' not in html or 'social-integrations' not in html or 'PlacursoSocialIntegrations.render' not in html:
        raise SystemExit('Social integration center was not injected correctly.')

    ceo.write_text(html, encoding='utf-8')
    print('Placurso social integration center injected into CEO page.')


if __name__ == '__main__':
    main()
