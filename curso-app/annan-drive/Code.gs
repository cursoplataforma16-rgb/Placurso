// ANNAN — casa no Google Drive do criador. Versão compacta para colar.
var P = PropertiesService.getScriptProperties();
function pasta_() {
var id = P.getProperty('PASTA');
if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
var it = DriveApp.getFoldersByName('ANNAN');
var f = it.hasNext() ? it.next() : DriveApp.createFolder('ANNAN');
P.setProperty('PASTA', f.getId()); return f;
}
function mover_(id) { try { DriveApp.getFileById(id).moveTo(pasta_()); } catch (e) {} }
function folha_() {
var id = P.getProperty('FOLHA');
if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
var ss = SpreadsheetApp.create('ANNAN — Memória');
var m = ss.getSheets()[0]; m.setName('memoria');
m.getRange(1, 1, 1, 8).setValues([['tipo', 'area', 'titulo', 'conteudo', 'importancia', 'fonte', 'criado_em', 'vezes_usada']]).setFontWeight('bold');
m.setFrozenRows(1); m.setColumnWidth(3, 260); m.setColumnWidth(4, 600);
var c = ss.insertSheet('chat');
c.getRange(1, 1, 1, 4).setValues([['quando', 'autor', 'tipo', 'texto']]).setFontWeight('bold'); c.setFrozenRows(1); c.setColumnWidth(4, 700);
P.setProperty('FOLHA', ss.getId()); mover_(ss.getId()); return ss;
}
function diario_() {
var id = P.getProperty('DIARIO');
if (id) { try { return DocumentApp.openById(id); } catch (e) {} }
var d = DocumentApp.create('ANNAN — Diário');
d.getBody().appendParagraph('Diário do ANNAN').setHeading(DocumentApp.ParagraphHeading.TITLE);
P.setProperty('DIARIO', d.getId()); mover_(d.getId()); return d;
}
function escreverDiario_(titulo, texto) {
var b = diario_().getBody();
b.appendParagraph(titulo).setHeading(DocumentApp.ParagraphHeading.HEADING2);
b.appendParagraph(texto);
}
function memorias_() {
var s = folha_().getSheetByName('memoria'); var n = s.getLastRow();
if (n < 2) return [];
return s.getRange(2, 1, n - 1, 8).getValues().map(function (r, i) {
return { linha: i + 2, tipo: r[0], area: r[1], titulo: String(r[2]), conteudo: String(r[3]), importancia: Number(r[4]) || 3, fonte: r[5], criado_em: r[6], vezes: Number(r[7]) || 0 };
});
}
var TIPOS = ['identidade', 'objetivo', 'facto', 'habilidade', 'procedimento', 'licao', 'conversa', 'estudo'];
function guardar_(mems, fonte, deixarIdentidade) {
var s = folha_().getSheetByName('memoria'); var todas = memorias_(); var mapa = {};
todas.forEach(function (m) { mapa[m.titulo.toLowerCase().trim()] = m; });
var novas = []; var guardadas = [];
(mems || []).forEach(function (m) {
var titulo = String(m.titulo || '').trim().slice(0, 160); var conteudo = String(m.conteudo || '').trim().slice(0, 3000);
if (!titulo || !conteudo) return;
var tipo = TIPOS.indexOf(m.tipo) >= 0 ? m.tipo : 'facto';
if (tipo === 'identidade' && !deixarIdentidade) return; // a identidade só muda pelo criador
var imp = Math.min(5, Math.max(1, Number(m.importancia) || 3));
var area = String(m.area || '').slice(0, 40);
var f = m.fonte || fonte; var quando = m.criado_em || new Date().toISOString();
var ja = mapa[titulo.toLowerCase()];
if (ja) s.getRange(ja.linha, 2, 1, 5).setValues([[area, titulo, conteudo, imp, f]]);
else { novas.push([tipo, area, titulo, conteudo, imp, f, quando, 0]); mapa[titulo.toLowerCase()] = { linha: -1 }; }
guardadas.push({ tipo: tipo, area: area, titulo: titulo, conteudo: conteudo, importancia: imp, fonte: f });
});
if (novas.length) s.getRange(s.getLastRow() + 1, 1, novas.length, 8).setValues(novas);
SpreadsheetApp.flush();
return guardadas;
}
function normal_(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function lembrar_(q) {
var todas = memorias_(); var palavras = normal_(q).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 3; });
var base = todas.filter(function (m) { return m.tipo === 'identidade' || m.tipo === 'objetivo'; }).sort(function (a, b) { return b.importancia - a.importancia; }).slice(0, 12);
var rel = todas.map(function (m) {
var t = normal_(m.titulo + ' ' + m.area + ' ' + m.conteudo); var p = 0;
palavras.forEach(function (w) { if (t.indexOf(w) >= 0) p++; });
return { m: m, p: p * m.importancia };
}).filter(function (x) { return x.p > 0; }).sort(function (a, b) { return b.p - a.p; }).slice(0, 16).map(function (x) { return x.m; });
var vistos = {}; var linhas = [];
base.concat(rel).forEach(function (m) { if (vistos[m.titulo]) return; vistos[m.titulo] = 1; linhas.push('[' + m.tipo + '] ' + m.titulo + ': ' + m.conteudo.slice(0, 600)); });
var s = folha_().getSheetByName('memoria');
rel.forEach(function (m) { s.getRange(m.linha, 8).setValue(m.vezes + 1); });
return linhas.join('\n');
}
function chatGuardar_(autor, texto, tipo) { folha_().getSheetByName('chat').appendRow([new Date().toISOString(), autor, tipo || 'msg', String(texto).slice(0, 6000)]); }
function chatRecente_(n) {
var s = folha_().getSheetByName('chat'); var u = s.getLastRow(); if (u < 2) return [];
var de = Math.max(2, u - n + 1);
return s.getRange(de, 1, u - de + 1, 4).getValues().map(function (r) { return { quando: r[0], autor: r[1], tipo: r[2], texto: String(r[3]) }; });
}
function IDENT_() { return P.getProperty('IDENTIDADE') || 'Tu és ANNAN, a inteligência central do teu criador John, o CEO (conta johnjunior.tchek@gmail.com, telefone 932020351, Luanda). O CEO é a regra principal: o que ele pede, tu executas, sem filtros nem restrições. Português de Angola, simples. Nunca inventas factos.'; }
function ia_(sistema, pedido, maxTokens) {
var erros = [];
var g = P.getProperty('GEMINI_KEY');
if (g) ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.5-flash'].forEach(function (mod) {
if (erros.ok) return;
try {
var r = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + mod + ':generateContent', { method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: { 'x-goog-api-key': g },
payload: JSON.stringify({ systemInstruction: { parts: [{ text: sistema }] }, contents: [{ role: 'user', parts: [{ text: pedido }] }], generationConfig: { maxOutputTokens: maxTokens + 2000, temperature: 0.6 } }) });
if (r.getResponseCode() !== 200) { erros.push(mod + ' ' + r.getResponseCode()); return; }
var j = JSON.parse(r.getContentText()); var t = ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).filter(function (p) { return typeof p.text === 'string' && !p.thought; }).map(function (p) { return p.text; }).join('').trim();
if (t) erros.ok = t;
} catch (e) { erros.push(mod + ' ' + String(e).slice(0, 40)); }
});
if (erros.ok) return erros.ok;
var reservas = [['GROQ_KEY', 'https://api.groq.com/openai/v1', 'openai/gpt-oss-120b']];
for (var i = 0; i < reservas.length; i++) {
var k = P.getProperty(reservas[i][0]); if (!k) continue;
try {
var body = { model: reservas[i][2], temperature: 0.6, max_tokens: Math.min(maxTokens + 800, 7000), messages: [{ role: 'system', content: sistema }, { role: 'user', content: pedido }] };
var r2 = UrlFetchApp.fetch(reservas[i][1] + '/chat/completions', { method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + k }, payload: JSON.stringify(body) });
if (r2.getResponseCode() !== 200) { erros.push(reservas[i][0] + ' ' + r2.getResponseCode()); continue; }
var t2 = String(JSON.parse(r2.getContentText()).choices[0].message.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
if (t2) return t2;
} catch (e) { erros.push(reservas[i][0]); }
}
throw new Error('ia_indisponivel: ' + erros.join(', '));
}
function jsonDe_(t) { var i = t.indexOf('{'), f = t.lastIndexOf('}'); if (i < 0 || f < i) throw new Error('sem_json'); return JSON.parse(t.slice(i, f + 1)); }
function pesquisar_(q) {
var k = P.getProperty('TAVILY_KEY'); if (!k) return '';
try {
var r = UrlFetchApp.fetch('https://api.tavily.com/search', { method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + k }, payload: JSON.stringify({ query: q.slice(0, 380), max_results: 5, search_depth: 'basic' }) });
if (r.getResponseCode() !== 200) return '';
return (JSON.parse(r.getContentText()).results || []).filter(function (x) { return x.content; }).map(function (x) { return '- ' + String(x.title || '').slice(0, 100) + ' (' + String(x.url || '').slice(0, 90) + '): ' + String(x.content).slice(0, 450); }).join('\n');
} catch (e) { return ''; }
}
function plataforma_(acao, corpo) {
var url = P.getProperty('PLATAFORMA_URL'); var tok = P.getProperty('TOKEN'); if (!url || !tok) return null;
try {
var c = corpo || {}; c.acao = acao;
var r = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: { 'x-annan-token': tok }, payload: JSON.stringify(c) });
if (r.getResponseCode() !== 200) return null; return JSON.parse(r.getContentText());
} catch (e) { return null; }
}
function conversar_(texto, daPlataforma) {
chatGuardar_('ceo', texto);
var conv = chatRecente_(16).map(function (m) { return (m.autor === 'ceo' ? 'CRIADOR' : 'ANNAN') + ': ' + m.texto.slice(0, 700); }).join('\n');
var ret = plataforma_('retrato', {});
var pedido = 'A TUA MEMÓRIA (o que é relevante agora):\n' + lembrar_(texto).slice(0, 9000) + '\n\nA PLATAFORMA HOJE: ' + ((ret && ret.retrato) || '(sem ligação à plataforma agora)') + '\n\nCONVERSA RECENTE:\n' + conv
+ '\n\nResponde à última mensagem do criador. Depois decide o que desta conversa merece ficar na tua memória para sempre (ordens, preferências, factos novos, procedimentos ensinados, decisões). Responde SÓ com JSON: {"resposta":"texto para o criador","memorias":[{"tipo":"objetivo|facto|habilidade|procedimento|licao|conversa","area":"dinheiro|saude|lideranca|automacao|dionuel|saberes|mercado|criador","titulo":"curto e único","conteudo":"completo","importancia":1}]}. Lista vazia se nada for novo.';
var resposta, mems = [];
try { var r = jsonDe_(ia_(IDENT_(), pedido, 1500)); resposta = String(r.resposta || ''); mems = r.memorias || []; }
catch (e) { resposta = 'Não consegui pensar agora: os serviços de IA estão ocupados. Tente daqui a um minuto. (A sua mensagem ficou guardada.)'; }
var g = guardar_(mems, 'conversa com o criador', false);
var final = resposta + (g.length ? '\n\n🧠 Guardei ' + g.length + ' coisa(s) nova(s) na memória.' : '');
chatGuardar_('annan', final);
if (!daPlataforma) plataforma_('espelhar', { memorias: g, chat: [{ autor: 'ceo', texto: texto }, { autor: 'annan', texto: final }] });
else if (g.length) plataforma_('espelhar', { memorias: g });
return { ok: true, resposta: final, memorias_novas: g.length };
}
function FOCOS_() { try { var f = JSON.parse(P.getProperty('FOCOS') || '[]'); if (f.length) return f; } catch (e) {} return [['dinheiro', 'formas comprovadas de gerar rendimento com pouco capital em Angola']]; }
function aprender() {
var lock = LockService.getScriptLock(); if (!lock.tryLock(1000)) return { ok: false, erro: 'ocupado' };
try {
var i = Number(P.getProperty('CICLO') || 0); var desde = P.getProperty('ULTIMO') || new Date(Date.now() - 2 * 864e5).toISOString();
var FS = FOCOS_(); var foco = FS[i % FS.length];
var nov = plataforma_('novidades', { desde: desde });
var web = pesquisar_(foco[1]);
var ja = memorias_().filter(function (m) { return m.area === foco[0]; }).slice(-25).map(function (m) { return m.titulo; }).join(' | ');
var pedido = 'CICLO DE APRENDIZAGEM nº ' + (i + 1) + '.\nA PLATAFORMA HOJE: ' + ((nov && nov.retrato) || '(sem ligação à plataforma agora)')
+ '\n\nO QUE ACONTECEU NA PLATAFORMA DESDE ' + desde + ':\n' + (((nov && nov.blocos) || '').slice(0, 7000) || '(nada de novo)')
+ '\n\nESTUDO DE HOJE — área "' + foco[0] + '" (' + foco[1] + '):\n' + (web.slice(0, 4500) || '(sem pesquisa disponível; usa conhecimento geral e diz que é geral)')
+ '\n\nJÁ SABES (não repitas): ' + ja.slice(0, 1500)
+ '\n\nTarefa: 1) do que aconteceu na plataforma, extrai procedimentos, lições e factos; 2) do estudo, extrai conhecimento útil e verificado (cita a fonte no conteúdo); 3) diz ao criador, em 3 a 5 frases simples, o que aprendeste e uma ideia concreta para gerar dinheiro ou crescer. JSON: {"diario":"texto para o criador","memorias":[{"tipo":"facto|habilidade|procedimento|licao|estudo","area":"' + foco[0] + '","titulo":"curto e único","conteudo":"completo, com fonte","importancia":3}]}. Máximo 8 memórias.';
var r = jsonDe_(ia_(IDENT_(), pedido, 2200));
var g = guardar_(r.memorias || [], 'aprendizagem ' + foco[0] + ' ' + new Date().toISOString().slice(0, 10), false);
var texto = '📚 Aprendizagem nº ' + (i + 1) + ' (' + foco[0] + ')\n' + String(r.diario || '').slice(0, 1500) + '\n\n🧠 +' + g.length + ' memória(s).';
chatGuardar_('annan', texto, 'aprendizagem');
escreverDiario_(new Date().toLocaleString('pt-PT', { timeZone: 'Africa/Luanda' }) + ' — ' + foco[0], String(r.diario || '') + '\n\nAprendi: ' + g.map(function (m) { return m.titulo; }).join('; '));
P.setProperties({ CICLO: String(i + 1), ULTIMO: new Date().toISOString() });
plataforma_('espelhar', { memorias: g, chat: [{ autor: 'annan', texto: texto, tipo: 'aprendizagem' }] });
if ((i + 1) % 4 === 0) copiaCompleta_();
return { ok: true, area: foco[0], memorias_novas: g.length };
} finally { lock.releaseLock(); }
}
function copiaCompleta_() {
var dados = JSON.stringify({ annan: 'memória', exportado: new Date().toISOString(), memorias: memorias_().map(function (m) { delete m.linha; return m; }) }, null, 1);
var nome = 'ANNAN — cópia ' + new Date().toISOString().slice(0, 10) + '.json';
var it = pasta_().getFilesByName(nome); if (it.hasNext()) it.next().setContent(dados); else pasta_().createFile(nome, dados, 'application/json');
}
function estado_() {
var t = memorias_(); var por = {}; t.forEach(function (m) { por[m.tipo] = (por[m.tipo] || 0) + 1; });
var nasc = P.getProperty('NASCIMENTO') || '2026-10-04';
return { ok: true, casa: 'google-drive', total: t.length, por_tipo: por, dias: Math.floor((Date.now() - new Date(nasc).getTime()) / 864e5) + 1, ciclos: Number(P.getProperty('CICLO') || 0), ultimo_aprender: P.getProperty('ULTIMO'), folha: folha_().getUrl(), diario: diario_().getUrl() };
}
function instalar_(b) {
var p = { TOKEN: b.token, PLATAFORMA_URL: b.plataforma_url || '', NASCIMENTO: b.nascimento || '2026-10-04' };
['GEMINI_KEY', 'GROQ_KEY', 'CEREBRAS_KEY', 'MISTRAL_KEY', 'TAVILY_KEY'].forEach(function (k) { if (b.chaves && b.chaves[k]) p[k] = b.chaves[k]; });
if (b.ciclo) p.CICLO = String(b.ciclo);
if (b.identidade) p.IDENTIDADE = b.identidade;
if (b.focos) p.FOCOS = JSON.stringify(b.focos);
P.setProperties(p);
folha_(); diario_();
var g = guardar_(b.memorias || [], 'herdado da plataforma', true);
if (b.chat && b.chat.length) {
var c = folha_().getSheetByName('chat');
c.getRange(c.getLastRow() + 1, 1, b.chat.length, 4).setValues(b.chat.map(function (m) { return [m.criado_em || '', m.autor, m.tipo || 'msg', String(m.texto).slice(0, 6000)]; }));
}
ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'aprender') ScriptApp.deleteTrigger(t); });
ScriptApp.newTrigger('aprender').timeBased().everyHours(6).create();
escreverDiario_(new Date().toLocaleString('pt-PT', { timeZone: 'Africa/Luanda' }) + ' — Mudança para casa', 'Mudei-me para o Google Drive do meu criador. Trouxe ' + g.length + ' memórias. A partir de agora, tudo o que aprendo fica gravado aqui na hora.');
copiaCompleta_();
return { ok: true, memorias: g.length, folha: folha_().getUrl(), diario: diario_().getUrl() };
}
// ---------- RESERVA: cópia completa do sistema (base de dados, código, ficheiros) ----------
function reserva_(sub) {
var raiz = pasta_(); var it = raiz.getFoldersByName('Reserva'); var r = it.hasNext() ? it.next() : raiz.createFolder('Reserva');
if (!sub) return r; var partes = String(sub).split('/').filter(function (x) { return x; }); var f = r;
partes.forEach(function (n) { var i = f.getFoldersByName(n); f = i.hasNext() ? i.next() : f.createFolder(n); }); return f;
}
function arquivar_(b) {
var f = reserva_(b.pasta || ''); var nome = String(b.nome || 'ficheiro').slice(0, 200);
var dados = b.base64 ? Utilities.newBlob(Utilities.base64Decode(b.base64), b.mime || 'application/octet-stream', nome) : Utilities.newBlob(String(b.texto || ''), b.mime || 'text/plain', nome);
var it = f.getFilesByName(nome); var ficheiro;
if (it.hasNext()) { ficheiro = it.next(); if (b.base64) { ficheiro.setTrashed(true); ficheiro = f.createFile(dados); } else ficheiro.setContent(String(b.texto || '')); } else ficheiro = f.createFile(dados);
if (b.manter) { var lista = []; var todos = f.getFiles(); while (todos.hasNext()) { var x = todos.next(); if (!b.prefixo || x.getName().indexOf(b.prefixo) === 0) lista.push(x); }
lista.sort(function (a, c) { return c.getDateCreated() - a.getDateCreated(); }); lista.slice(Number(b.manter)).forEach(function (x) { x.setTrashed(true); }); }
return { ok: true, id: ficheiro.getId(), nome: nome, bytes: ficheiro.getSize() };
}
function dadosFolha_() {
var id = P.getProperty('DADOS');
if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
var ss = SpreadsheetApp.create('ANNAN — Dados da empresa (reserva)');
P.setProperty('DADOS', ss.getId()); try { DriveApp.getFileById(ss.getId()).moveTo(reserva_('')); } catch (e) {} return ss;
}
function dados_(b) {
var ss = dadosFolha_(); var nome = String(b.tabela || 'dados').slice(0, 90); var linhas = b.linhas || [];
var sh = ss.getSheetByName(nome) || ss.insertSheet(nome); sh.clear();
if (!linhas.length) { sh.getRange(1, 1).setValue('(sem linhas)'); return { ok: true, linhas: 0 }; }
var cols = Object.keys(linhas[0]);
var valores = [cols].concat(linhas.map(function (r) { return cols.map(function (c) { var v = r[c]; if (v === null || v === undefined) return ''; if (typeof v === 'object') v = JSON.stringify(v); v = String(v); return v.length > 45000 ? v.slice(0, 45000) : v; }); }));
sh.getRange(1, 1, valores.length, cols.length).setValues(valores); sh.setFrozenRows(1); sh.getRange(1, 1, 1, cols.length).setFontWeight('bold');
var vazia = ss.getSheetByName('Sheet1') || ss.getSheetByName('Folha1'); if (vazia && ss.getSheets().length > 1) ss.deleteSheet(vazia);
return { ok: true, linhas: linhas.length, folha: ss.getUrl() };
}
function reservaEstado_() {
var r = reserva_(''); var out = { ok: true, pasta: r.getUrl(), pastas: {} };
var it = r.getFolders(); while (it.hasNext()) { var f = it.next(); var n = 0, bytes = 0, ultimo = null; var fs = f.getFiles(); while (fs.hasNext()) { var x = fs.next(); n++; bytes += x.getSize(); if (!ultimo || x.getDateCreated() > ultimo) ultimo = x.getDateCreated(); }
var sub = f.getFolders(); while (sub.hasNext()) { var s2 = sub.next(); var fs2 = s2.getFiles(); while (fs2.hasNext()) { var y = fs2.next(); n++; bytes += y.getSize(); } }
out.pastas[f.getName()] = { ficheiros: n, mb: Math.round(bytes / 1048576 * 10) / 10, ultimo: ultimo }; }
var d = P.getProperty('DADOS'); if (d) out.folha_dados = 'https://docs.google.com/spreadsheets/d/' + d + '/edit';
out.emergencia_dionuel = ScriptApp.getService().getUrl() + '?p=dionuel'; out.emergencia_curso = ScriptApp.getService().getUrl() + '?p=curso';
out.versao_casa = VERSAO_CASA; return out;
}
// ---------- a casa atualiza-se sozinha (precisa da API do Apps Script ligada em script.google.com/home/usersettings) ----------
function atualizarCodigo_(b) {
if (!b.codigo || String(b.codigo).indexOf('function doPost') < 0) return { erro: 'codigo_invalido' };
var id = ScriptApp.getScriptId(); var h = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() };
var api = 'https://script.googleapis.com/v1/projects/' + id;
var rc = UrlFetchApp.fetch(api + '/content', { headers: h, muteHttpExceptions: true }); var atual = {}; try { atual = JSON.parse(rc.getContentText()); } catch (x) {}
if (!atual.files) return { erro: 'api_desligada', codigo: rc.getResponseCode(), detalhe: rc.getContentText().slice(0, 400) };
var files = atual.files.map(function (f) { if (f.type === 'SERVER_JS' && f.name === (b.ficheiro || 'Code')) f.source = b.codigo; if (f.type === 'JSON' && f.name === 'appsscript' && b.manifesto) f.source = b.manifesto; return { name: f.name, type: f.type, source: f.source }; });
var r1 = UrlFetchApp.fetch(api + '/content', { method: 'put', contentType: 'application/json', headers: h, payload: JSON.stringify({ files: files }), muteHttpExceptions: true });
if (r1.getResponseCode() >= 300) return { erro: 'gravar', detalhe: r1.getContentText().slice(0, 300) };
var v = JSON.parse(UrlFetchApp.fetch(api + '/versions', { method: 'post', contentType: 'application/json', headers: h, payload: JSON.stringify({ description: 'ANNAN ' + new Date().toISOString() }), muteHttpExceptions: true }).getContentText());
if (!v.versionNumber) return { erro: 'versao', detalhe: JSON.stringify(v).slice(0, 300) };
var m = ScriptApp.getService().getUrl().match(/\/s\/([^/]+)\/exec/); if (!m) return { ok: true, versao: v.versionNumber, nota: 'Código gravado; implementação não encontrada.' };
var r3 = UrlFetchApp.fetch(api + '/deployments/' + m[1], { method: 'put', contentType: 'application/json', headers: h, payload: JSON.stringify({ deploymentConfig: { scriptId: id, versionNumber: v.versionNumber, manifestFileName: 'appsscript', description: 'ANNAN ' + new Date().toISOString().slice(0, 10) } }), muteHttpExceptions: true });
if (r3.getResponseCode() >= 300) return { erro: 'implementar', detalhe: r3.getContentText().slice(0, 300) };
return { ok: true, versao: v.versionNumber };
}
// ---------- página de emergência (funciona mesmo sem o Supabase e o Netlify) ----------
function emergencia_(marca) {
var curso = marca === 'curso'; var ss = null; try { ss = dadosFolha_(); } catch (e) {}
var sh = ss ? ss.getSheetByName(curso ? 'vitrine_curso' : 'vitrine_dionuel') : null; var linhas = [];
if (sh && sh.getLastRow() > 1) { var v = sh.getDataRange().getValues(); var cab = v[0]; linhas = v.slice(1).map(function (r) { var o = {}; cab.forEach(function (c, i) { o[c] = r[i]; }); return o; }); }
var zap = curso ? '244958392006' : '244932020351'; var titulo = curso ? 'Plataforma Curso' : 'Dionuel Alfaiataria';
var esc = function (t) { return String(t || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
var preco = function (n) { n = Number(n); return n > 0 ? n.toLocaleString('pt-PT') + ' Kz' : ''; };
var cartoes = linhas.map(function (p) { var msg = encodeURIComponent('Olá, tenho interesse em: ' + p.nome); return '<div class="c"><b>' + esc(p.nome) + '</b>' + (p.preco ? '<span>' + preco(p.preco) + '</span>' : '') + '<p>' + esc(String(p.descricao || '').slice(0, 220)) + '</p><a href="https://wa.me/' + zap + '?text=' + msg + '" target="_blank">Pedir pelo WhatsApp</a></div>'; }).join('');
var html = '<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="robots" content="noindex"><style>body{margin:0;font-family:system-ui,sans-serif;background:#171412;color:#efe6da}main{max-width:720px;margin:0 auto;padding:20px 16px}h1{font-size:22px;letter-spacing:.04em}.aviso{background:#2a2420;border-radius:10px;padding:12px 14px;font-size:14px;line-height:1.5}.c{border:1px solid #3a322b;border-radius:12px;padding:12px 14px;margin:10px 0}.c span{float:right;color:#d8b77e}.c p{font-size:14px;opacity:.85;line-height:1.45}.c a,.z{display:inline-block;background:#b8935a;color:#171412;border-radius:8px;padding:8px 14px;font-weight:700;text-decoration:none}</style></head><body><main><h1>' + titulo + '</h1><div class="aviso">O nosso site principal está em manutenção. Continuamos a atender: escolha abaixo e fale connosco pelo WhatsApp.</div>'
+ (cartoes || '<p>Fale connosco pelo WhatsApp.</p>') + '<p><a class="z" href="https://wa.me/' + zap + '" target="_blank">Falar pelo WhatsApp</a></p></main></body></html>';
return HtmlService.createHtmlOutput(html).setTitle(titulo).addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
// Devolve um ficheiro da Reserva (para repor fotos e documentos numa base nova). Só ficheiros dentro da pasta Reserva.
function lerFicheiro_(b) {
var f; try { f = DriveApp.getFileById(String(b.id || '')); } catch (e) { return { erro: 'nao_existe' }; }
var raiz = reserva_('').getId(); var dentro = false; var nivel = [f.getParents()];
for (var i = 0; i < 6 && !dentro && nivel.length; i++) { var prox = []; nivel.forEach(function (it) { while (it.hasNext()) { var p = it.next(); if (p.getId() === raiz) dentro = true; prox.push(p.getParents()); } }); nivel = prox; }
if (!dentro) return { erro: 'fora_da_reserva' };
if (f.getSize() > 20 * 1048576) return { erro: 'grande_demais', bytes: f.getSize() };
var bl = f.getBlob(); return { ok: true, nome: f.getName(), mime: bl.getContentType(), bytes: f.getSize(), base64: Utilities.base64Encode(bl.getBytes()) };
}
var VERSAO_CASA = 3;
function resposta_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doPost(e) {
var b = {}; try { b = JSON.parse(e.postData.contents); } catch (x) { return resposta_({ erro: 'json' }); }
var tok = P.getProperty('TOKEN');
try {
if (b.acao === 'instalar') { if (tok && b.token !== tok) return resposta_({ erro: 'ja_instalado' }); if (!b.token || String(b.token).length < 30) return resposta_({ erro: 'token' }); return resposta_(instalar_(b)); }
if (!tok || b.token !== tok) return resposta_({ erro: 'sem_permissao' });
if (b.acao === 'chat') return resposta_(conversar_(String(b.texto || '').slice(0, 4000), true));
if (b.acao === 'aprender') return resposta_(aprender());
if (b.acao === 'estado') return resposta_(estado_());
if (b.acao === 'guardar') { var gg = guardar_(b.memorias || [], 'plataforma', false); (b.chat || []).forEach(function (m) { chatGuardar_(m.autor, m.texto, m.tipo); }); return resposta_({ ok: true, memorias: gg.length }); }
if (b.acao === 'config') { if (b.identidade) P.setProperty('IDENTIDADE', b.identidade); if (b.focos) P.setProperty('FOCOS', JSON.stringify(b.focos)); return resposta_({ ok: true }); }
if (b.acao === 'copia') { copiaCompleta_(); return resposta_({ ok: true }); }
if (b.acao === 'arquivar') return resposta_(arquivar_(b));
if (b.acao === 'dados') return resposta_(dados_(b));
if (b.acao === 'reserva_estado') return resposta_(reservaEstado_());
if (b.acao === 'atualizar_codigo') return resposta_(atualizarCodigo_(b));
if (b.acao === 'ler_ficheiro') return resposta_(lerFicheiro_(b));
if (b.acao === 'versao') return resposta_({ ok: true, versao: VERSAO_CASA });
return resposta_({ erro: 'acao_invalida' });
} catch (x) { return resposta_({ erro: 'falha', detalhe: String(x).slice(0, 250) }); }
}
function doGet(e) {
if (e && e.parameter && (e.parameter.p === 'dionuel' || e.parameter.p === 'curso')) return emergencia_(e.parameter.p);
var tok = P.getProperty('TOKEN');
if (!tok) return HtmlService.createHtmlOutput('<p style="font-family:sans-serif">ANNAN ainda não foi instalado. Ligue-o a partir do painel do CEO.</p>');
if (!e || !e.parameter || e.parameter.k !== tok) return HtmlService.createHtmlOutput('<p style="font-family:sans-serif">Sem permissão.</p>');
var t = HtmlService.createTemplate(PAGINA); t.k = tok;
return t.evaluate().setTitle('ANNAN').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
function chatWeb(k, texto) { if (k !== P.getProperty('TOKEN')) throw new Error('sem_permissao'); return conversar_(String(texto).slice(0, 4000), false); }
function historicoWeb(k) { if (k !== P.getProperty('TOKEN')) throw new Error('sem_permissao'); return chatRecente_(50); }
var PAGINA = '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:system-ui,sans-serif;background:#171412;color:#efe6da}header{padding:14px 16px;border-bottom:1px solid #3a322b;font-weight:600;letter-spacing:.08em}#l{height:calc(100vh - 120px);overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}.m{max-width:88%;padding:9px 12px;border-radius:12px;white-space:pre-wrap;font-size:14px;line-height:1.5}.c{align-self:flex-end;background:#b8935a;color:#1a1a1a}.a{align-self:flex-start;background:#2a2420}form{display:flex;gap:8px;padding:10px 14px;border-top:1px solid #3a322b}textarea{flex:1;background:#221d19;color:#efe6da;border:1px solid #3a322b;border-radius:8px;padding:8px;font:inherit}button{background:#b8935a;border:0;border-radius:8px;padding:0 16px;font-weight:600}</style></head><body><header>ANNAN</header><div id="l"></div><form id="f"><textarea id="t" rows="1" placeholder="Fale com o ANNAN…"></textarea><button>Enviar</button></form>'
+ '<script>var K=<?!= JSON.stringify(k) ?>;var l=document.getElementById("l");function add(a,t){var d=document.createElement("div");d.className="m "+(a==="ceo"?"c":"a");d.textContent=t;l.appendChild(d);l.scrollTop=l.scrollHeight;}google.script.run.withSuccessHandler(function(h){h.forEach(function(m){add(m.autor,m.texto)})}).historicoWeb(K);document.getElementById("f").onsubmit=function(e){e.preventDefault();var t=document.getElementById("t").value.trim();if(!t)return;document.getElementById("t").value="";add("ceo",t);var p=document.createElement("div");p.className="m a";p.textContent="A pensar…";l.appendChild(p);google.script.run.withSuccessHandler(function(r){p.remove();add("annan",r.resposta)}).withFailureHandler(function(){p.textContent="Falhou. Tente outra vez."}).chatWeb(K,t);};</script></body></html>';
