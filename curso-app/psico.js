/* Plataforma Curso — jogos rápidos no ecrã inicial, teste psicotécnico de 10 perguntas
   e curso de Psicotecnia (teoria + prática). Tudo gerado por regras: nunca a mesma pergunta. */
(function(){
'use strict';
var WHATS = '244958392006';
function $(id){ return document.getElementById(id); }
function rnd(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
function baralhar(a){ a = a.slice(); for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function opcoes(certa, erradas){ var s = {}; s[certa] = 1; var o = [certa]; erradas.forEach(function(e){ if(o.length < 4 && !s[e]){ s[e] = 1; o.push(e); } }); var k = 1; while(o.length < 4){ var v = (typeof certa === 'number') ? certa + (k++ * (Math.random() < .5 ? -1 : 1) * rnd(1, 3)) : certa + k++; if(!s[v]){ s[v] = 1; o.push(v); } } return baralhar(o); }
function ler(){ try{ return JSON.parse(localStorage.getItem('pc_jogos') || '{}') || {}; }catch(e){ return {}; } }
function gravar(d){ try{ localStorage.setItem('pc_jogos', JSON.stringify(d)); }catch(e){} }
function medir(ev){ try{ if(window.medirEvento) window.medirEvento(ev); }catch(e){} }
function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
var LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/* ---------- geradores de perguntas (cada um devolve {tipo, p, o, c, e}) ---------- */
var G = {
  serie: function(){
    var t = rnd(0, 3), a = rnd(2, 9), s = [], r, e;
    if(t === 0){ r = rnd(3, 9); for(var i = 0; i < 5; i++) s.push(a + i * r); e = 'Cada número soma ' + r + ' ao anterior.'; }
    else if(t === 1){ r = rnd(2, 3); a = rnd(1, 4); for(i = 0; i < 5; i++) s.push(a * Math.pow(r, i)); e = 'Cada número é multiplicado por ' + r + '.'; }
    else if(t === 2){ r = rnd(1, 3); var d = rnd(1, 3); s.push(a); for(i = 1; i < 5; i++) s.push(s[i-1] + d + (i - 1) * r); e = 'As diferenças aumentam ' + r + ' de cada vez (' + d + ', ' + (d + r) + ', ' + (d + 2*r) + '…).'; }
    else { var x = rnd(2, 5), y = rnd(5, 9); s = [a, a + x, a + x - 1, a + 2*x - 1, a + 2*x - 2]; s.push(a + 3*x - 2); var c0 = s.pop(); return { tipo:'Séries numéricas', p:'Qual é o número seguinte? ' + s.join(', ') + ', …', c:c0, o:opcoes(c0, [c0+1, c0-1, c0+x]), e:'Alterna: soma ' + x + ', tira 1, soma ' + x + ', tira 1.' }; }
    var c = s.pop(); return { tipo:'Séries numéricas', p:'Qual é o número seguinte? ' + s.join(', ') + ', …', c:c, o:opcoes(c, [c + 2, c - 3, c + rnd(4, 8)]), e:e };
  },
  letras: function(){
    var k = rnd(2, 4), i0 = rnd(0, 6), s = []; for(var i = 0; i < 4; i++) s.push(LETRAS[i0 + i * k]); var c = LETRAS[i0 + 4 * k];
    return { tipo:'Séries de letras', p:'Qual é a letra seguinte? ' + s.join(', ') + ', …', c:c, o:opcoes(c, [LETRAS[i0 + 4*k - 1], LETRAS[i0 + 4*k + 1] || 'Z', LETRAS[i0 + 3*k + 1]]), e:'Salta ' + (k - 1) + ' letra' + (k > 2 ? 's' : '') + ' de cada vez (alfabeto de 26 letras).' };
  },
  logica: function(){
    var T = pick([['médicos','pessoas formadas','A Ana é médica'],['gatos','mamíferos','O Tico é um gato'],['quadrados','retângulos','Esta figura é um quadrado'],['engenheiros','licenciados','O Paulo é engenheiro']]);
    var certa = pick([0, 1]);
    if(certa === 0) return { tipo:'Raciocínio lógico', p:'Todos os ' + T[0] + ' são ' + T[1] + '. ' + T[2] + '. O que se conclui com certeza?', c:'Pertence aos ' + T[1], o:baralhar(['Pertence aos ' + T[1], 'Não pertence aos ' + T[1], 'Todos os ' + T[1] + ' são ' + T[0], 'Não se pode concluir nada']), e:'Se todos os ' + T[0] + ' estão dentro do grupo dos ' + T[1] + ', quem é um deles também está.' };
    return { tipo:'Raciocínio lógico', p:'Todos os ' + T[0] + ' são ' + T[1] + '. Algumas pessoas são ' + T[1] + '. O que se conclui com certeza?', c:'Não se pode concluir que sejam ' + T[0], o:baralhar(['Não se pode concluir que sejam ' + T[0], 'Essas pessoas são ' + T[0], 'Nenhuma é ' + T[0], 'Todos os ' + T[1] + ' são ' + T[0]]), e:'O grupo dos ' + T[1] + ' é maior: estar nele não obriga a ser ' + T[0] + '.' };
  },
  percent: function(){
    var p = pick([5, 10, 15, 20, 25, 30, 40, 50]), v = pick([40, 60, 80, 120, 160, 200, 240, 300, 400]), c = p * v / 100;
    return { tipo:'Cálculo', p:'Quanto é ' + p + '% de ' + v + '?', c:c, o:opcoes(c, [c + v/10, c * 2, v - c]), e:'10% de ' + v + ' é ' + (v/10) + '. ' + p + '% é ' + (p/10) + ' vezes isso: ' + c + '.' };
  },
  codigo: function(){
    var W = pick(['CASA','MESA','LIVRO','PORTA','RATO','LUZ','SOL','PEDRA']), V = pick(['BOLA','CAMA','VELA','FARO','MAPA','NOTA']), k = rnd(1, 2);
    function cod(w){ return w.split('').map(function(l){ var i = LETRAS.indexOf(l); return LETRAS[(i + k) % LETRAS.length]; }).join(''); }
    var c = cod(V), ok = cod(W);
    return { tipo:'Códigos', p:'Se ' + W + ' se escreve ' + ok + ', como se escreve ' + V + '?', c:c, o:opcoes(c, [V.split('').reverse().join(''), cod(V).slice(1) + cod(V)[0], cod(V).replace(/./, function(x){ return LETRAS[(LETRAS.indexOf(x) + 1) % LETRAS.length]; })]), e:'Cada letra avança ' + k + (k > 1 ? ' posições' : ' posição') + ' no alfabeto.' };
  },
  espacial: function(){
    var S = ['↑','→','↓','←'], i = rnd(0, 3), g = pick([1, 2, 3]), sent = pick(['horário','anti-horário']), j = sent === 'horário' ? (i + g) % 4 : (i - g + 4) % 4;
    return { tipo:'Raciocínio espacial', p:'A seta ' + S[i] + ' roda ' + (g * 90) + '° no sentido ' + sent + '. Como fica?', c:S[j], o:S.slice(), e:'Cada 90° é um quarto de volta. ' + g + ' quarto' + (g > 1 ? 's' : '') + ' de volta no sentido ' + sent + '.' };
  },
  atencao: function(){
    var alvo = pick(['A','E','O','R']), s = '', n = 0; for(var i = 0; i < 28; i++){ var l = Math.random() < .22 ? alvo : pick('BCDFGHLMNPSTV'.split('')); if(l === alvo) n++; s += l; }
    return { tipo:'Atenção', p:'Quantas vezes aparece a letra ' + alvo + '?<div style="font-family:monospace;letter-spacing:.12em;margin-top:8px;font-size:18px;word-break:break-all">' + s + '</div>', c:n, o:opcoes(n, [n + 1, n - 1, n + 2]), e:'Conte por blocos de 7 letras e some no fim; evita perder a conta.' };
  },
  intruso: function(){
    var m = pick([3, 4, 5, 6]), base = [], i; while(base.length < 3){ var v = m * rnd(2, 12); if(base.indexOf(v) < 0) base.push(v); } var fora; do { fora = rnd(10, 70); } while(fora % m === 0);
    var o = baralhar(base.concat([fora]));
    return { tipo:'Intruso', p:'Qual número não pertence ao grupo? ' + o.join(', '), c:fora, o:o, e:'Os outros são todos múltiplos de ' + m + '.' };
  },
  verbal: function(){
    var B = pick([['rápido','veloz','lento','alto','calmo'],['começar','iniciar','acabar','parar','esperar'],['difícil','complicado','fácil','simples','leve'],['honesto','sincero','falso','tímido','rico'],['aumentar','ampliar','reduzir','cortar','manter'],['antigo','velho','novo','moderno','recente'],['escasso','raro','abundante','farto','comum']]);
    return { tipo:'Raciocínio verbal', p:'Qual palavra tem o mesmo significado de "' + B[0] + '"?', c:B[1], o:baralhar(B.slice(1)), e:'"' + B[1] + '" é sinónimo; "' + B[2] + '" é o contrário.' };
  },
  relacao: function(){
    var R = pick([['Pé','sapato','Mão','luva',['anel','dedo','braço']],['Médico','hospital','Professor','escola',['aluno','livro','quadro']],['Pássaro','ninho','Abelha','colmeia',['mel','flor','asa']],['Dia','sol','Noite','lua',['escuro','sono','estrela']],['Livro','páginas','Casa','divisões',['telhado','porta','rua']]]);
    return { tipo:'Analogias', p:R[0] + ' está para ' + R[1] + ' como ' + R[2] + ' está para…', c:R[3], o:baralhar([R[3]].concat(R[4])), e:'A mesma relação: ' + R[1] + ' serve ou pertence a ' + R[0].toLowerCase() + ', ' + R[3] + ' a ' + R[2].toLowerCase() + '.' };
  }
};
var ORDEM_TESTE = ['serie','logica','percent','letras','codigo','espacial','atencao','intruso','verbal','relacao'];
var CAPS = { serie:'Numérico', percent:'Numérico', intruso:'Numérico', letras:'Abstrato', codigo:'Abstrato', espacial:'Espacial', logica:'Lógico', verbal:'Verbal', relacao:'Verbal', atencao:'Atenção' };

/* ---------- ecrã cheio (reutiliza o painel do desafio) ---------- */
function abrirPainel(titulo){ $('jNome').textContent = titulo; $('jTempo').textContent = ''; $('jProg').style.width = '0%'; $('jogo').classList.add('ativo'); document.body.style.overflow = 'hidden'; window.__pcSair = fecharPainel; }
function fecharPainel(){ if(PT.timer){ clearInterval(PT.timer); PT.timer = null; } $('jogo').classList.remove('ativo'); document.body.style.overflow = ''; if(window.pcRedesenhar) window.pcRedesenhar(); desenharPsicoHome(); if(window.PC_ANNAN) window.PC_ANNAN.desenhar(); }
var PT = { timer:null };

/* ---------- teste psicotécnico de 10 perguntas ---------- */
function teste(){
  medir('psico_inicio'); abrirPainel('Teste psicotécnico');
  var qs = ORDEM_TESTE.map(function(k){ var q = G[k](); q.k = k; return q; }), i = 0, certas = 0, porCap = {}, inicio = Date.now();
  $('jArea').innerHTML = '<div class="jinfo"><b>10 perguntas · cerca de 5 minutos.</b><br>Números, lógica, letras, códigos, espaço, atenção e palavras. Responda com calma: conta o acerto, não a pressa.</div><button class="grande" id="ptGo">Começar o teste</button>';
  $('ptGo').onclick = pergunta;
  function pergunta(){
    var q = qs[i]; $('jProg').style.width = (i / 10 * 100) + '%'; $('jTempo').textContent = (i + 1) + '/10';
    var h = '<div class="jpont">' + esc(q.tipo) + '</div><div class="pq">' + q.p + '</div><div class="po">';
    q.o.forEach(function(o, n){ h += '<button data-n="' + n + '">' + esc(o) + '</button>'; });
    $('jArea').innerHTML = h + '</div>';
    $('jArea').querySelectorAll('[data-n]').forEach(function(b){ b.onclick = function(){
      var certo = String(q.o[+b.dataset.n]) === String(q.c); porCap[CAPS[q.k]] = porCap[CAPS[q.k]] || [0, 0]; porCap[CAPS[q.k]][1]++;
      if(certo){ certas++; porCap[CAPS[q.k]][0]++; }
      q.ok = certo; i++; if(i < 10) pergunta(); else fim();
    }; });
  }
  function fim(){
    var erros = 10 - certas, d = ler(); d.psico = d.psico || []; var kk = {}; qs.forEach(function(q){ kk[q.k] = q.ok ? 1 : 0; }); var hj = new Date(); d.psico.push({ d:hj.getFullYear() + '-' + String(hj.getMonth() + 1).padStart(2, '0') + '-' + String(hj.getDate()).padStart(2, '0'), c:certas, s:Math.round((Date.now() - inicio)/1000), k:kk }); d.psico = d.psico.slice(-30); gravar(d);
    medir('psico_fim_' + certas);
    var nivel = certas >= 9 ? 'Excelente' : certas >= 7 ? 'Bom' : certas >= 5 ? 'Razoável' : 'A treinar';
    var caps = Object.keys(porCap).map(function(k){ return { k:k, p:porCap[k][0] / porCap[k][1] }; }).sort(function(a, b){ return a.p - b.p; });
    var fracos = caps.filter(function(c){ return c.p < 1; }).map(function(c){ return c.k; });
    var h = '<div class="res"><div class="n">' + certas + '/10</div><div class="r">Teste psicotécnico · ' + nivel + '</div>';
    h += '<div class="capt">' + caps.map(function(c){ return '<div class="l"><span>' + c.k + '</span><div class="b"><i style="width:' + Math.round(c.p*100) + '%"></i></div><b>' + Math.round(c.p*100) + '%</b></div>'; }).join('') + '</div>';
    h += '<details class="rev"><summary>Ver as respostas e porquê</summary>' + qs.map(function(q, n){ return '<p><b>' + (n+1) + '. ' + (q.ok ? 'Certo' : 'Errado') + '</b> · ' + esc(q.tipo) + ': ' + esc(String(q.c)) + '. ' + esc(q.e) + '</p>'; }).join('') + '</details></div>';
    if(erros >= 6) h += '<div class="reco"><b>Recomendado para si: Curso de Psicotecnia</b><p>Errou ' + erros + ' de 10. O curso explica as regras por trás de cada tipo de pergunta (teoria) e dá exercícios novos sem fim (prática). É o treino que mais faz subir neste tipo de teste.</p><button class="a1" id="ptCurso">Ver o curso</button></div>';
    else h += '<div class="reco leve"><b>Quer subir ainda mais?</b><p>' + (fracos.length ? 'Pontos a treinar: ' + fracos.join(', ') + '.' : 'Acertou tudo.') + ' O Curso de Psicotecnia tem teoria e prática para cada tipo.</p><button class="a2" id="ptCurso">Ver o curso</button></div>';
    var rec = window.PC_ANNAN && window.PC_ANNAN.moduloRecomendado();
    if(rec) h += '<div class="ag-res"><span class="ag-av">A</span><p>O seu curso fica feito à sua medida: começa por <b>' + esc(rec.nome) + '</b>, onde teve mais dificuldade.</p></div>';
    h += '<div class="acoes"><button class="a2" id="ptPart">Desafiar o meu grupo</button><button class="a1" id="ptDeNovo">Fazer outro teste (perguntas novas)</button><button class="a3" id="ptSair">Voltar ao início</button></div>';
    $('jArea').innerHTML = h; $('jProg').style.width = '100%'; $('jTempo').textContent = '';
    $('ptCurso').onclick = function(){ curso(fracos); };
    $('ptDeNovo').onclick = teste; $('ptSair').onclick = fecharPainel;
    $('ptPart').onclick = function(){ convidar(certas); };
  }
}

/* ---------- convite ---------- */
function codigoConvite(){ try{ var a = JSON.parse(localStorage.getItem('ens_convite_meu') || 'null'); if(a && a.codigo) return a.codigo; }catch(e){} return ''; }
function linkConvite(){ var c = codigoConvite(); return location.origin + '/?utm_source=convite' + (c ? '&c=' + encodeURIComponent(c) : ''); }
function convidar(certas){
  medir('convite_partilhou');
  var txt = (certas != null ? 'Fiz ' + certas + '/10 no teste psicotécnico. ' : '') + 'Em 5 minutos descobre como estão a sua atenção, memória e raciocínio. Teste grátis, perguntas novas a cada vez: ' + linkConvite();
  if(navigator.share) navigator.share({ text:txt }).catch(function(){}); else window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener');
}

/* ---------- curso de Psicotecnia ---------- */
var MODULOS = [
  { id:'m1', nome:'Séries de números e de letras', gratis:true, gens:['serie','letras'],
    teoria:'<p>Uma série esconde uma regra. Procure-a sempre por esta ordem:</p><ol><li><b>Diferença entre vizinhos.</b> 3, 7, 11, 15: soma 4. É o caso mais comum.</li><li><b>Diferença das diferenças.</b> 2, 3, 5, 8, 12: as diferenças são 1, 2, 3, 4. A regra está um nível abaixo.</li><li><b>Multiplicação.</b> 2, 6, 18, 54: cada número é o anterior vezes 3. Pista: os números crescem muito depressa.</li><li><b>Alternância.</b> 5, 9, 8, 12, 11: soma 4, tira 1, soma 4, tira 1. Pista: a série sobe e desce.</li></ol><p><b>Letras:</b> transforme cada letra no seu número (A=1, B=2…) e aplique as mesmas regras. Use o alfabeto completo de 26 letras, com K, W e Y.</p><p><b>Erro comum:</b> escolher a primeira regra que serve para dois números. Confirme a regra em todos os números antes de responder.</p>' },
  { id:'m2', nome:'Lógica, códigos e analogias', gens:['logica','codigo','relacao'],
    teoria:'<p><b>Silogismos.</b> Desenhe círculos: "Todos os A são B" põe o círculo A dentro de B. Só conclua o que é verdade em <b>todos</b> os desenhos possíveis.</p><p><b>Códigos.</b> Compare a palavra com o código letra a letra e descubra o deslocamento (+1, +2…) ou a troca. Aplique exatamente a mesma regra à palavra nova.</p><p><b>Analogias.</b> Diga a relação numa frase ("o sapato protege o pé") e procure a resposta onde a mesma frase funciona ("a luva protege a mão").</p><p><b>Erro comum:</b> responder com o que é verdade no mundo real em vez do que decorre das frases dadas.</p>' },
  { id:'m3', nome:'Cálculo rápido, espaço e atenção', gens:['percent','intruso','espacial','atencao','verbal'],
    teoria:'<p><b>Percentagens de cabeça.</b> Calcule 10% (tire um zero) e multiplique: 30% de 240 = 3 × 24 = 72. 5% é metade de 10%.</p><p><b>Intruso.</b> Teste primeiro: pares/ímpares, múltiplos de 3, 4 ou 5, números primos.</p><p><b>Rotações.</b> Cada 90° é um quarto de volta. Rode o telemóvel na mão se precisar: o corpo ajuda a mente.</p><p><b>Atenção.</b> Conte por blocos pequenos e some no fim. Nunca volte ao início a meio.</p><p><b>Vocabulário.</b> Sinónimos: substitua a palavra na frase e veja se o sentido fica igual.</p>' }
];
var CODIGOS = ["f1950ada5d1c2b4480d6", "6be329c29601e45bcfbe", "a49197104314b093e870", "d65406792a3a567eead1", "8d07ca415922690fbdb3", "de35c3e00ef286d85832", "e5a4b0c2906bd0d4c5eb", "14cb068b341345763ed7", "f1c7d6497ecfaeddfa7f", "d3e8c118a6c49caf8260", "35f756ed40714c701375", "a47f4a57401b9f2df3c0", "12591422e55689ff3a0a", "295ef9d292982eca5568", "a03af857430a9cfa413e", "62c7cbe942bb3c0b2dbf", "7dd2b578fccb4d9182e3", "893b64d6b504ab6bac44", "35aff40f8281b91d9f95", "624f55ed65e64d3eb0c8", "5e72d67311180d28810a", "5821bec8a00f1754f2dc", "8f1e7538084e10d677d7", "b2913e9d3982e9b3349f", "0231c9f0b40b00d6bb07", "442311ef68a5f3815ab2", "c658c77239badc3feda3", "1950a64b8c91200bc105", "cdf21f5744fe505dcf40", "22b10aa4bcab2ccfdddc", "a720861ceab8d5569a51", "04163d56d83a95ed7864", "a9d7d1e39594db2b1670", "4a59c2107b42c8f6f801", "cae6c8370d81be2b1dbb", "248d1c1c602f228dd796", "9f3e37740d4bd09274ce", "80591d81eef2d51106de", "9f2451088093f4bdf63e", "08ed9b55ffcd11cde881", "35b9c24c46adedfd2949", "b417c89eb75a16ae2972", "944fdb3b5b8d9681a39c", "7f8ca64d56d7cc475640", "9cd25ace78154497397d", "e4a37b56c0340ce95f58", "474be4546d5e25f7047f", "72c5546ae74a89505ef3", "ed8fec6df811ac566403", "da258610ad9bf66b3276", "0112515e8ac6615a9ce8", "e0f3c466af67d80769b2", "5c65f66701528599deda", "d5f8b845d0f762734208", "285543f17f8bc24b5da6", "b9fb37299032e218bbde", "5ecd32e645fe20c7dcab", "8f53a4a9193e12abfb7c", "d0297e728c963eed8453", "0af18d3537fda363d5df"];
function cursoLiberado(){ var d = ler(); return !!d.curso_psico_liberado; }
function sha(t){ return crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)).then(function(b){ return Array.from(new Uint8Array(b)).map(function(x){ return x.toString(16).padStart(2, '0'); }).join('').slice(0, 20); }); }
function curso(fracos){
  medir('psico_curso'); abrirPainel('Curso de Psicotecnia');
  var lib = cursoLiberado(), d = ler(), feitos = d.curso_psico || {}, rec = window.PC_ANNAN && window.PC_ANNAN.moduloRecomendado(), pf = window.PC_ANNAN && window.PC_ANNAN.perfil();
  var obj = pf && window.PC_ANNAN.OBJ[pf.objetivo];
  var h = '<div class="curso"><p class="cint">Teoria curta e prática sem fim' + (obj ? ' para o seu objetivo: <b>' + esc(obj.nome) + '</b>' : ' para testes psicotécnicos de emprego, concursos e entrevistas') + '. Cada exercício é novo.</p>';
  if(rec) h += '<div class="ag-res"><span class="ag-av">A</span><p>Pelo seu último teste, comece por <b>' + esc(rec.nome) + '</b>.</p></div>';
  else h += '<div class="ag-res"><span class="ag-av">A</span><p>Faça primeiro o teste de 10 perguntas: o curso ordena-se pelas suas dificuldades.</p></div>';
  var ordem = MODULOS.map(function(m, n){ return n; });
  if(rec) ordem.sort(function(a, b){ return (MODULOS[b].id === rec.m) - (MODULOS[a].id === rec.m) || a - b; });
  ordem.forEach(function(n){ var m = MODULOS[n];
    var amostra = !m.gratis && !lib && rec && rec.m === m.id && !d.amostra_rec, aberto = m.gratis || lib || amostra, f = feitos[m.id] || 0;
    h += '<button class="mod' + (aberto ? '' : ' fechado') + '" data-m="' + n + '"><span class="mn">Módulo ' + (n+1) + (m.gratis ? ' · grátis' : '') + (rec && rec.m === m.id ? ' · recomendado para si' : '') + (amostra ? ' · 1.ª prática grátis' : '') + '</span><b>' + m.nome + '</b><em>' + (aberto ? (f ? 'Prática: ' + f + ' exercícios certos' : 'Teoria + prática') : 'Bloqueado') + '</em></button>';
  });
  if(!lib) h += '<div class="gate"><b>Desbloquear o curso completo</b><p>1 000 Kz ou o equivalente em dólares (USDT pela Bybit ou Binance). Também em meticais.</p><button class="a1" id="cPagar">Pagar 1 000 Kz</button><p class="ou">ou convide 10 pessoas que se registem e façam o teste</p><button class="a2" id="cConv">Convidar o meu grupo</button><p class="ou">Já pagou? Introduza o código que recebeu</p><div class="cod"><input id="cCod" placeholder="PSI-XXXXXX" maxlength="10" autocapitalize="characters"><button class="a2" id="cCodOk">Ativar</button></div><div class="cmsg" id="cMsg"></div></div>';
  h += '<div class="acoes"><button class="a3" id="cSair">Voltar</button></div></div>';
  $('jArea').innerHTML = h;
  $('jArea').querySelectorAll('[data-m]').forEach(function(b){ b.onclick = function(){ var m = MODULOS[+b.dataset.m], dd = ler(); if(m.gratis || cursoLiberado() || (rec && rec.m === m.id && !dd.amostra_rec)) modulo(m); else { var g = $('jArea').querySelector('.gate'); if(g) g.scrollIntoView({ behavior:'smooth', block:'center' }); } }; });
  $('cSair').onclick = fecharPainel;
  if($('cPagar')) $('cPagar').onclick = function(){ medir('psico_pagar'); window.open('https://wa.me/' + WHATS + '?text=' + encodeURIComponent('Olá, quero desbloquear o Curso de Psicotecnia (1 000 Kz). Como pago?'), '_blank', 'noopener'); };
  if($('cConv')) $('cConv').onclick = function(){ convidar(null); };
  if($('cCodOk')) $('cCodOk').onclick = function(){ var c = ($('cCod').value || '').trim().toUpperCase(); sha(c).then(function(h){ if(CODIGOS.indexOf(h) >= 0){ var d = ler(); d.curso_psico_liberado = { em:new Date().toISOString(), codigo:c.slice(0, 4) + '…' }; gravar(d); medir('psico_desbloqueou'); curso(); } else { $('cMsg').textContent = 'Código não reconhecido. Confira e tente de novo.'; } }); };
}
function modulo(m){
  abrirPainel(m.nome);
  $('jArea').innerHTML = '<div class="curso"><div class="teoria"><span class="mn">Teoria</span>' + m.teoria + '</div><button class="a1" id="mPrat">Praticar: 10 exercícios novos</button><button class="a3" id="mVolta">Voltar ao curso</button></div>';
  $('mPrat').onclick = function(){ pratica(m); };
  $('mVolta').onclick = function(){ curso(); };
}
function pratica(m){
  var n = 0, certas = 0;
  function prox(){
    if(n >= 10){ var d = ler(); d.curso_psico = d.curso_psico || {}; d.curso_psico[m.id] = (d.curso_psico[m.id] || 0) + certas; if(!m.gratis && !cursoLiberado()) d.amostra_rec = 1; var hj = new Date(); d.curso_psico_hoje = hj.getFullYear() + '-' + String(hj.getMonth() + 1).padStart(2, '0') + '-' + String(hj.getDate()).padStart(2, '0'); gravar(d); medir('psico_pratica_' + m.id);
      $('jArea').innerHTML = '<div class="res"><div class="n">' + certas + '/10</div><div class="r">Prática · ' + esc(m.nome) + '</div><p class="msg">' + (certas >= 8 ? 'Domina este tipo. Passe ao módulo seguinte.' : 'Releia a teoria e repita: os exercícios são sempre novos.') + '</p></div><div class="acoes"><button class="a1" id="pOutra">Mais 10 exercícios</button><button class="a2" id="pTeo">Rever a teoria</button><button class="a3" id="pCurso">Voltar ao curso</button></div>';
      $('pOutra').onclick = function(){ pratica(m); }; $('pTeo').onclick = function(){ modulo(m); }; $('pCurso').onclick = function(){ curso(); }; return; }
    var q = G[pick(m.gens)](); $('jProg').style.width = (n * 10) + '%'; $('jTempo').textContent = (n + 1) + '/10';
    var h = '<div class="jpont">' + esc(q.tipo) + '</div><div class="pq">' + q.p + '</div><div class="po">';
    q.o.forEach(function(o, i){ h += '<button data-n="' + i + '">' + esc(o) + '</button>'; });
    $('jArea').innerHTML = h + '</div><div class="expl" id="pExp"></div>';
    $('jArea').querySelectorAll('[data-n]').forEach(function(b){ b.onclick = function(){
      var ok = String(q.o[+b.dataset.n]) === String(q.c); if(ok) certas++;
      $('jArea').querySelectorAll('[data-n]').forEach(function(x){ x.disabled = true; if(String(q.o[+x.dataset.n]) === String(q.c)) x.classList.add('certa'); });
      if(!ok) b.classList.add('errada');
      $('pExp').innerHTML = '<b>' + (ok ? 'Certo.' : 'Resposta: ' + esc(String(q.c)) + '.') + '</b> ' + esc(q.e) + '<button class="a1" id="pSeg">Seguinte</button>';
      $('pSeg').onclick = function(){ n++; prox(); };
    }; });
  }
  prox();
}

/* ---------- 3 jogos rápidos no ecrã inicial ---------- */
function miniDiferente(el){
  var n = 0, nivel = 1;
  function ronda(){ var lado = Math.min(5, 3 + Math.floor(nivel / 4)), tot = lado * lado, alvo = rnd(0, tot - 1), h = rnd(0, 359), dl = Math.max(5, 22 - nivel * 1.5);
    var g = '<div class="mg" style="grid-template-columns:repeat(' + lado + ',1fr)">'; for(var i = 0; i < tot; i++) g += '<button data-i="' + i + '" style="background:hsl(' + h + ',60%,' + (i === alvo ? 52 + dl : 52) + '%)" aria-label="quadrado"></button>';
    el.querySelector('.mz').innerHTML = g + '</div>'; el.querySelector('.mc').textContent = 'Seguidos: ' + n;
    el.querySelectorAll('[data-i]').forEach(function(b){ b.onclick = function(){ if(+b.dataset.i === alvo){ n++; nivel++; ronda(); } else { n = 0; nivel = 1; b.classList.add('flash-er'); setTimeout(ronda, 300); } }; }); }
  ronda();
}
function miniCor(el){
  var C = [['Vermelho','#C0392B'],['Azul','#1F5FBF'],['Verde','#1E8E5A'],['Amarelo','#D4A017']], n = 0;
  function ronda(){ var p = pick(C), t = pick(C.filter(function(x){ return x !== p; }));
    el.querySelector('.mz').innerHTML = '<div class="mw" style="color:' + t[1] + '">' + p[0].toUpperCase() + '</div><div class="mo">' + baralhar(C).map(function(o){ return '<button data-c="' + o[0] + '" style="border-color:' + o[1] + '">' + o[0] + '</button>'; }).join('') + '</div>';
    el.querySelector('.mc').textContent = 'Seguidos: ' + n;
    el.querySelectorAll('[data-c]').forEach(function(b){ b.onclick = function(){ if(b.dataset.c === t[0]) n++; else n = 0; ronda(); }; }); }
  ronda();
}
function miniRelogio(el){
  var ini = 0, raf = 0, melhor = null;
  function ecra(){ el.querySelector('.mz').innerHTML = '<div class="mr" id="mrV">0,00</div><button class="mb2" id="mrB">Iniciar</button>'; el.querySelector('.mc').textContent = melhor == null ? 'Pare nos 3,00 s' : 'Melhor: ' + (melhor/1000).toFixed(2).replace('.', ',') + ' s de diferença';
    el.querySelector('#mrB').onclick = function(){ var v = el.querySelector('#mrV'), b = el.querySelector('#mrB'); ini = performance.now(); b.textContent = 'Parar';
      (function tic(){ var t = performance.now() - ini; v.textContent = (t/1000).toFixed(2).replace('.', ','); v.style.opacity = t > 1500 ? .15 : 1; raf = requestAnimationFrame(tic); })();
      b.onclick = function(){ cancelAnimationFrame(raf); var t = performance.now() - ini, d = Math.abs(t - 3000); v.style.opacity = 1; v.textContent = (t/1000).toFixed(2).replace('.', ','); if(melhor == null || d < melhor) melhor = d; b.textContent = 'Outra vez'; b.onclick = ecra; el.querySelector('.mc').textContent = (d < 50 ? 'Excelente! ' : '') + 'A ' + (d/1000).toFixed(2).replace('.', ',') + ' s dos 3,00'; };
    }; }
  ecra();
}

/* ---------- secções na página inicial ---------- */
function desenharPsicoHome(){
  var box = $('psicoHome'); if(!box) return;
  var d = ler(), ult = d.psico && d.psico[d.psico.length - 1], lib = cursoLiberado();
  box.innerHTML = '<div class="psi"><div><b>Teste psicotécnico</b><span>10 perguntas · 5 min · perguntas novas a cada vez</span>' + (ult ? '<em>Último resultado: ' + ult.c + '/10</em>' : '<em>Usado em seleções de emprego e concursos</em>') + '</div><button class="a1" id="psiGo">Fazer o teste</button></div>'
    + '<button class="psc" id="psiCurso"><b>Curso de Psicotecnia</b><span>Teoria + prática · Módulo 1 grátis · ' + (lib ? 'desbloqueado' : 'completo: 1 000 Kz ou 10 convites') + '</span></button>';
  $('psiGo').onclick = teste; $('psiCurso').onclick = function(){ curso(); };
}
function iniciarMinis(){
  var m = $('minis'); if(!m) return;
  m.innerHTML = [['Toque no diferente','md'],['Cor da tinta','mcor'],['Pare nos 3 segundos','mrel']].map(function(x){ return '<div class="mini" id="' + x[1] + '"><div class="mh"><b>' + x[0] + '</b><span class="mc"></span></div><div class="mz"></div></div>'; }).join('');
  miniDiferente($('md')); miniCor($('mcor')); miniRelogio($('mrel'));
}

window.PC_PSICO = { teste:teste, curso:curso, convidar:convidar, refresh:desenharPsicoHome };
iniciarMinis(); desenharPsicoHome();
})();
