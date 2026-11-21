import sys, json, subprocess, time
from playwright.sync_api import sync_playwright
url=sys.argv[1] if len(sys.argv)>1 else '/'
shot=sys.argv[2] if len(sys.argv)>2 else 'shot.png'
erros=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':390,'height':844},user_agent='Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36')
    pg=ctx.new_page()
    if len(sys.argv)>3 and sys.argv[3]=='ceo': ctx.add_init_script("localStorage.setItem('mock_ceo','1')")
    def rota(r):
        u=r.request.url
        if u.endswith('/vendor/supabase-js.js') or u.endswith('/vendor/jspdf.js'): return r.fulfill(status=200,content_type='application/javascript',body=open('/home/claude/work/mock_supabase.js').read() if 'supabase-js' in u else '')
        if 'supabase.co' in u:
            if '/functions/v1/' in u: return r.fulfill(status=200,content_type='application/json',body='{}')
            if '/auth/v1/' in u: return r.fulfill(status=200,content_type='application/json',body='{}')
            return r.fulfill(status=200,content_type='application/json',body='[]')
        if u.startswith('http://127.0.0.1') or u.startswith('http://localhost'): return r.continue_()
        return r.abort()
    ctx.route('**/*',rota)
    pg.on('pageerror',lambda e:erros.append('PAGEERROR '+str(e)[:300]))
    pg.on('console',lambda m:erros.append('CONSOLE '+m.text[:300]) if m.type=='error' else None)
    pg.goto('http://127.0.0.1:8765'+url,wait_until='load')
    pg.wait_for_timeout(5000)
    pg.screenshot(path=shot)
    t=pg.inner_text('body')
    print('TEXTO:',t[:600].replace('\n',' | '))
    b.close()
print('ERROS:',len(erros))
for e in erros[:25]: print(e)
