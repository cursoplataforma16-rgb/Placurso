# Plataforma Curso (separada da Dionuel Alfaiataria)

Site da Plataforma Curso extraído do site antigo que servia as duas marcas.
Mantém o ANNAN Online (`annan-online-bridge.js`) e a Casa do ANNAN (`annan-drive/`) como estão hoje.

- Publicar no Netlify: pasta raiz, sem build (`netlify.toml`).
- `_ferramentas/`: scripts que fizeram a separação (`separar.mjs` + `cfg.mjs`) e o teste (`smoke.py`).
- Ainda aponta para a base Supabase partilhada; a base própria do Curso está por reativar.
