# Formato novo dos infoprodutos da Plataforma Curso (22/11/2026)

Decisão do CEO: cada infoproduto resolve UM problema num dia, funciona no telemóvel sem Internet, traz as ferramentas dentro, tem teste no fim de cada parte e leva a pessoa de volta à plataforma. Os cursos são personalizados pela necessidade de cada aluno.

## Regras
1. Um problema, um resultado que se aplica hoje. Leitura de 15 a 30 minutos, 3 a 5 partes de 4 a 8 minutos.
2. Cada parte: explicação curta → passos → ferramenta ou lista para preencher (com exemplo já preenchido) → teste de 3 perguntas com explicação. A parte só conta como concluída com 2 de 3 certas.
3. Pelo menos 2 ferramentas (`ferramenta`, `checklist` ou `cartoes`) por produto.
4. "Como foi feito": fontes reais de organismos públicos, universidades ou organizações internacionais de pelo menos 2 países (preferência: Finlândia, Singapura, Japão, Coreia do Sul, Estónia, Suíça, Alemanha, Países Baixos, Canadá, Reino Unido, EUA). Nunca inventar fontes, números ou testemunhos. Todas as fontes vão também para `fontes_investigacao`.
5. Fim: botão para a plataforma (desafio do dia, teste psicotécnico ou aulas) e partilha com link.
6. Preço até 2 500 Kz, mostrado em dólares; kwanzas e meticais como alternativa.
7. Nunca "Dionuel", "Angola" nem "Luanda". Sem emojis. Português de Portugal, sempre "você", sem brasileirismos. Sem promessas de resultado garantido.
8. Imprimível (botão Imprimir / guardar PDF).

## Como se produz
O motor (fabrica-livro / fabrica-agente) produz só um JSON neste formato. `scripts/montar_guias.py` valida (marca, respostas dos testes) e monta-o no modelo único `curso-app/guias/_modelo.html`, publicado em `/guias/<id>`. Exemplo completo: `curso-app/guias/entrevista-num-dia.json`.

```json
{
  "id": "slug-do-guia",
  "tipo": "Guia prático com ferramentas",
  "titulo": "até 60 caracteres, promessa concreta",
  "subtitulo": "o que tem dentro, numa frase",
  "minutos": 25,
  "promessa": "No fim terá ... (pode usar **negrito**)",
  "para_quem": "quem tem este problema",
  "partilha": "frase para partilhar",
  "metodo": "uma frase honesta sobre as fontes e o que o guia não promete",
  "partes": [
    { "titulo": "...", "minutos": 5, "blocos": [
      { "tipo": "texto", "paragrafos": ["..."] },
      { "tipo": "subtitulo", "texto": "..." },
      { "tipo": "destaque", "texto": "..." },
      { "tipo": "lista", "itens": ["..."] },
      { "tipo": "passos", "itens": ["..."] },
      { "tipo": "checklist", "titulo": "...", "dica": "...", "itens": ["..."] },
      { "tipo": "cartoes", "titulo": "...", "itens": [{ "frente": "...", "verso": "..." }] },
      { "tipo": "ferramenta", "titulo": "...", "dica": "...", "modelo": "texto com {campo}",
        "campos": [{ "id": "campo", "rotulo": "...", "ajuda": "...", "linhas": 1, "exemplo": "..." }] },
      { "tipo": "quiz", "perguntas": [{ "p": "...", "o": ["a", "b", "c"], "c": 1, "e": "porquê" }] }
    ]}
  ],
  "fontes": [{ "pais": "...", "org": "...", "ideia": "o que se usou", "url": "https://..." }],
  "fim_titulo": "...", "fim_texto": "...", "fim_link": "/?jogo=psico", "fim_botao": "..."
}
```

## Personalização (cursos)
- Página inicial: o ANNAN (`curso-app/annan-guia.js`) pergunta o objetivo (entrevista de emprego, concurso, escola, mente mais rápida) e monta o plano de hoje com 3 passos: desafio do dia, teste, treino do ponto fraco.
- Teste psicotécnico: guarda o resultado de cada tipo de pergunta; o Curso de Psicotecnia ordena os módulos pelo que a pessoa mais errou e marca "recomendado para si".
- Aulas em `/cursos?aprender=1`: inscrição, diagnóstico e percurso por aluno (motor educacional, fases 2 a 4).

## Ainda por ligar (precisa de acesso à base Supabase do Placurso)
- Pôr os motores `fabrica-livro` e `fabrica-agente` a produzir este JSON (prompts e validação) e a publicar na loja.
- Ensinar ao ANNAN (procedimento "Formato novo dos infoprodutos" na `annan_memoria`).
