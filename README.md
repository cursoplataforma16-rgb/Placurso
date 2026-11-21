# Placurso

Plataforma educacional Placurso e motor ANNAN.

Fonte principal do projeto para integração com Netlify.
## Aplicação completa em /cursos

`curso-app/` tem a aplicação completa da Plataforma Curso (loja, aulas, painel CEO, ANNAN Online, Casa do ANNAN),
separada da Dionuel Alfaiataria. `scripts/add_curso_app.py` junta-a ao site no fim do build:
a função SEO serve-a em `/cursos` (a página inicial `/` e o painel `/ceo` ficam iguais).
Ferramentas da separação em `curso-app/_ferramentas/`.
