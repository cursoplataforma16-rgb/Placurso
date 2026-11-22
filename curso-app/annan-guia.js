/* ANNAN, o treinador da página inicial: descobre o objetivo da pessoa, monta o plano de hoje
   à medida (a partir do que ela já fez e do último teste) e dá-lhe sempre uma razão concreta
   para continuar. Regras próprias, sem IA e sem Internet. Nunca promete o que não pode cumprir. */
(function(){
'use strict';
function $(id){ return document.getElementById(id); }
function ler(k, def){ try{ var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? def : v; }catch(e){ return def; } }
function gravar(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function medir(ev){ try{ if(window.medirEvento) window.medirEvento(ev); }catch(e){} }
function hoje(){ var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

var OBJ = {
  emprego:  { nome:'Entrevista de emprego', porque:'As empresas usam estes testes para escolher entre candidatos com o mesmo currículo. Quem treina responde mais depressa e com menos erros.', foco:'Numérico' },
  concurso: { nome:'Concurso público', porque:'Nos concursos, um ponto separa quem entra de quem fica de fora. Treinar todos os dias é a forma mais segura de ganhar esse ponto.', foco:'Lógico' },
  escola:   { nome:'Escola ou universidade', porque:'Atenção e memória treinadas fazem estudar menos horas para o mesmo resultado.', foco:'Atenção' },
  mente:    { nome:'Mente mais rápida', porque:'Dez minutos por dia chegam para notar diferença na concentração em poucas semanas.', foco:'Atenção' }
};

function perfil(){ return ler('pc_perfil', null); }
function jogos(){ return ler('pc_jogos', {}); }
function ultimoTeste(){ var d = jogos(); return d.psico && d.psico.length ? d.psico[d.psico.length - 1] : null; }

/* Módulo do curso que mais precisa, a partir das respostas do último teste */
var MOD_GENS = { m1:['serie','letras'], m2:['logica','codigo','relacao'], m3:['percent','intruso','espacial','atencao','verbal'] };
var MOD_NOME = { m1:'Séries de números e de letras', m2:'Lógica, códigos e analogias', m3:'Cálculo rápido, espaço e atenção' };
function moduloRecomendado(){
  var t = ultimoTeste(); if(!t || !t.k) return null;
  var melhor = null;
  Object.keys(MOD_GENS).forEach(function(m){
    var v = MOD_GENS[m].filter(function(g){ return t.k[g] != null; }).map(function(g){ return t.k[g]; });
    if(!v.length) return;
    var p = v.reduce(function(a, b){ return a + b; }, 0) / v.length;
    if(!melhor || p < melhor.p) melhor = { m:m, p:p, nome:MOD_NOME[m] };
  });
  return melhor;
}

function passos(){
  var d = jogos(), h = hoje(), t = ultimoTeste(), rec = moduloRecomendado();
  var p = [
    { id:'dia', nome:'Jogar o desafio de hoje', feito:!!(d.feito && d.feito[h]), acao:function(){ var b = $('btnHoje'); if(b) b.click(); } },
    { id:'teste', nome:t ? 'Fazer um teste novo e bater o seu ' + t.c + '/10' : 'Fazer o teste psicotécnico (5 min)', feito:!!(t && t.d === h), acao:function(){ if(window.PC_PSICO) window.PC_PSICO.teste(); } }
  ];
  var pr = d.curso_psico_hoje === h;
  p.push({ id:'curso', nome:rec ? 'Treinar o seu ponto fraco: ' + rec.nome : 'Treinar 10 exercícios do Curso de Psicotecnia', feito:pr, acao:function(){ if(window.PC_PSICO) window.PC_PSICO.curso(); } });
  return p;
}

function frase(pf, feitos){
  var o = OBJ[pf.objetivo] || OBJ.mente, d = jogos(), t = ultimoTeste();
  if(feitos === 3) return 'Dia completo. Amanhã há um desafio diferente e o plano ajusta-se ao que fez hoje.';
  if(t && t.c <= 4) return 'O seu último teste foi ' + t.c + '/10. É normal no início: com teoria e prática, este tipo de pergunta deixa de surpreender.';
  if(t && t.c >= 8) return t.c + '/10 no último teste. Agora o objetivo é fazer o mesmo em menos tempo: é isso que conta numa seleção a sério.';
  if(feitos === 2) return 'Falta só um passo para completar o dia.';
  if(feitos === 1) return 'Bom começo. Mais dois passos e o dia fica completo.';
  return o.porque;
}

function desenhar(){
  var box = $('annanGuia'); if(!box) return;
  var pf = perfil();
  if(!pf){
    box.innerHTML = '<div class="ag"><div class="ag-t"><span class="ag-av">A</span><div><b>Olá, sou o ANNAN, o seu treinador.</b><span>Diga-me para que quer treinar e eu monto o seu plano de hoje.</span></div></div>'
      + '<div class="ag-ops">' + Object.keys(OBJ).map(function(k){ return '<button data-obj="' + k + '">' + OBJ[k].nome + '</button>'; }).join('') + '</div></div>';
    box.querySelectorAll('[data-obj]').forEach(function(b){ b.onclick = function(){ gravar('pc_perfil', { objetivo:b.dataset.obj, em:hoje() }); medir('objetivo_' + b.dataset.obj); desenhar(); }; });
    return;
  }
  var ps = passos(), feitos = ps.filter(function(x){ return x.feito; }).length, o = OBJ[pf.objetivo] || OBJ.mente;
  box.innerHTML = '<div class="ag"><div class="ag-t"><span class="ag-av">A</span><div><b>O seu plano de hoje</b><span>Objetivo: ' + o.nome + ' · <a href="#" id="agMudar">mudar</a></span></div><em>' + feitos + ' de 3</em></div>'
    + '<div class="ag-bar"><i style="width:' + Math.round(feitos / 3 * 100) + '%"></i></div>'
    + '<p class="ag-f">' + frase(pf, feitos) + '</p>'
    + ps.map(function(x, i){ return '<button class="ag-p' + (x.feito ? ' ok' : '') + '" data-p="' + i + '"><span class="ag-c">' + (x.feito ? '✓' : (i + 1)) + '</span>' + x.nome + '</button>'; }).join('') + '</div>';
  box.querySelectorAll('[data-p]').forEach(function(b){ b.onclick = function(){ var x = ps[+b.dataset.p]; medir('plano_' + x.id); x.acao(); }; });
  $('agMudar').onclick = function(e){ e.preventDefault(); try{ localStorage.removeItem('pc_perfil'); }catch(_){} desenhar(); };
}

/* Mensagem curta no fim de cada jogo: a próxima coisa a fazer, sempre concreta */
function depoisJogo(jogoId, novo, serieN){
  var pf = perfil(), ps = passos(), falta = ps.filter(function(x){ return !x.feito; });
  var txt;
  if(!falta.length) txt = 'Plano de hoje completo' + (serieN > 1 ? ' e ' + serieN + ' dias seguidos' : '') + '. Volte amanhã: o desafio muda.';
  else if(falta[0].id === 'teste') txt = (pf && (pf.objetivo === 'emprego' || pf.objetivo === 'concurso') ? 'Próximo passo: o teste psicotécnico. É o tipo de prova que aparece nas seleções.' : 'Próximo passo: o teste psicotécnico de 5 minutos.');
  else if(falta[0].id === 'curso') txt = 'Próximo passo: 10 exercícios do seu ponto fraco. É assim que o resultado sobe.';
  else txt = 'Próximo passo: ' + falta[0].nome.toLowerCase() + '.';
  return '<div class="ag-res"><span class="ag-av">A</span><p>' + txt + '</p></div>';
}

function estilos(){
  if($('agCss')) return;
  var s = document.createElement('style'); s.id = 'agCss';
  s.textContent = '.ag{background:#fff;border:1px solid var(--linha);border-radius:16px;padding:14px;margin:14px 0 4px;box-shadow:0 2px 10px rgba(20,40,75,.06)}'
    + '.ag-t{display:flex;gap:10px;align-items:center}.ag-t div{flex:1;display:flex;flex-direction:column}.ag-t span{font-size:13px;color:var(--suave)}.ag-t a{color:var(--azul2)}.ag-t em{font-style:normal;font-weight:700;color:var(--azul2);font-size:14px}'
    + '.ag-av{width:36px;height:36px;border-radius:50%;background:var(--azul);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:800;flex:none}'
    + '.ag-ops{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.ag-ops button{padding:12px 8px;border-radius:12px;border:1px solid var(--linha);background:var(--claro);font-weight:600;color:var(--texto);min-height:48px}'
    + '.ag-bar{height:7px;background:var(--claro);border-radius:4px;overflow:hidden;margin:10px 0 4px}.ag-bar i{display:block;height:100%;background:var(--real)}'
    + '.ag-f{font-size:14px;color:var(--texto);margin:8px 0}'
    + '.ag-p{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:11px 10px;border-radius:12px;background:var(--claro);border:0;margin-top:6px;font-weight:600;color:var(--texto);min-height:46px}.ag-p.ok{background:#E6F4EC;color:var(--suave);text-decoration:line-through}'
    + '.ag-c{width:24px;height:24px;border-radius:50%;background:#fff;border:1px solid var(--linha);display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex:none;text-decoration:none}.ag-p.ok .ag-c{background:var(--ok);color:#fff;border-color:var(--ok)}'
    + '.ag-res{display:flex;gap:10px;align-items:center;background:#fff;border:1px solid var(--linha);border-radius:14px;padding:10px 12px;margin-top:12px;text-align:left}.ag-res p{margin:0;font-size:14px}.ag-res .ag-av{width:30px;height:30px;font-size:14px}';
  document.head.appendChild(s);
}

window.PC_ANNAN = { desenhar:desenhar, depoisJogo:depoisJogo, moduloRecomendado:moduloRecomendado, perfil:perfil, OBJ:OBJ };
estilos(); desenhar();
})();
