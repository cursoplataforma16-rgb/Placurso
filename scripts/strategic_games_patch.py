from pathlib import Path

p = Path(__file__).resolve().parent.parent / 'public' / 'psico-engine.js'
if not p.exists():
    raise SystemExit('ERRO: public/psico-engine.js não encontrado.')

s = p.read_text(encoding='utf-8')
repls = {
    'Jogue, teste-se e descubra onde pode melhorar.': 'Jogue. Pense. Decida. Aprenda.',
    'Uma área organizada para entrar rapidamente num desafio, treinar uma habilidade e receber orientação. Cada ronda muda para incentivar novas tentativas.': 'Jogos curtos e estratégicos para testar decisões, treinar a mente, aprender com cada jogada e querer voltar para tentar de novo.',
    '🧠 Mente': '🧠 Tática',
    'Desafio psicotécnico</strong><span>10 perguntas · diagnóstico': 'Laboratório de decisão</strong><span>10 desafios · pense antes de agir',
    'Jogo do Contador</strong><span>Meta de tempo · concentração': 'Desafio de foco</strong><span>Controle o tempo · mantenha a atenção',
    'Xadrez com ANNAN</strong><span>Posições · decisão · estratégia': 'Xadrez tático com ANNAN</strong><span>Antecipe · escolha · aprenda',
    '<h3>Desafio psicotécnico</h3><p>Treino rápido com resultado no fim</p>': '<h3>Laboratório de decisão</h3><p>Treine raciocínio, lógica e escolha sob pressão</p>',
    'LINHA ORIENTAL</span><h3 style="margin:9px 0 0;color:#202A24;font-size:20px">Jogo do Contador</h3>': 'LINHA ZEN · FOCO</span><h3 style="margin:9px 0 0;color:#202A24;font-size:20px">Desafio de foco</h3>',
    'Foco, percepção do tempo e disciplina.': 'Controle do tempo, atenção e disciplina.',
    '<h3>Estratégia com ANNAN</h3><p>Pense antes de agir</p>': '<h3>Estratégia com ANNAN</h3><p>Antecipe consequências antes de jogar</p>'
}
for old, new in repls.items():
    s = s.replace(old, new)
p.write_text(s, encoding='utf-8')
print('OK: jogos reposicionados para uma apresentação mais estratégica.')
