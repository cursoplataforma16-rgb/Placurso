import fs from 'fs';
import {carregar,nos} from './graph.mjs';
import {createRequire} from 'module';
const require=createRequire('/opt/npm-tools/node_modules/');
const acorn=require('acorn');
const ORIG='/home/claude/curso-base/index.html';
const {html,blocks}=carregar(ORIG);
const b=blocks[5];
const {out,comments}=nos(b.code);
const nodes=out.map((o,i)=>({i,names:o.names,tipo:o.tipo,text:b.code.slice(o.start,o.end)}));
const byName=new Map();nodes.forEach(n=>n.names.forEach(nm=>byName.set(nm,n)));
const log=[];
function sub(name,fn){const n=byName.get(name);if(!n)throw new Error('sem '+name);const t=fn(n.text);if(t===n.text)throw new Error('patch sem efeito '+name);n.text=t;}
function repl(name,novo){const n=byName.get(name);if(!n)throw new Error('sem '+name);n.text=novo;}
function drop(name){const n=byName.get(name);if(!n)throw new Error('sem '+name);n.drop=true;}
const cfg=await import('./cfg.mjs');
{ // sobrepõe com a versão de hoje (main) os nomes pedidos; nomes novos entram como nós novos
  const mcode=fs.readFileSync('/home/claude/dionuel/app.js','utf8');
  const mo=nos(mcode).out;
  const mm=new Map();mo.forEach(o=>o.names.forEach(nm=>mm.set(nm,mcode.slice(o.start,o.end))));
  for(const nm of (cfg.deMain||[])){
    const t=mm.get(nm);if(!t){console.log('deMain: sem',nm);continue}
    const ex=byName.get(nm);
    if(ex){ex.text=t}else{const n={i:nodes.length,names:[nm],tipo:'novo',text:t};nodes.push(n);byName.set(nm,n)}
  }
  globalThis.__mm=mm;
}
cfg.aplicar({sub,repl,drop,byName,nodes});
for(const nm of (cfg.cortar||[])){const n=byName.get(nm);if(!n){console.log('cortar: nome inexistente',nm);continue}n.drop=true}
// closure
function toks(t){
  // tira comentários simples // e /* */ de forma segura via acorn
  let cm=[];try{acorn.parse(t,{ecmaVersion:'latest',allowReturnOutsideFunction:true,onComment:cm});}catch(e){}
  let s=t;for(const c of cm.sort((a,b)=>b.start-a.start))s=s.slice(0,c.start)+' '.repeat(c.end-c.start)+s.slice(c.end);
  return new Set(s.match(/[A-Za-z_$][\w$]*/g)||[]);
}
nodes.forEach(n=>{n.tok=toks(n.text)});
const roots=nodes.filter(n=>!n.names.length&&!n.drop&&!(cfg.dropRoots||[]).some(f=>f(n.text)));
const keep=new Set();const st=[];
const add=n=>{if(n.drop||keep.has(n))return;keep.add(n);st.push(n)};
roots.forEach(add);(cfg.extraRoots||[]).forEach(nm=>{const n=byName.get(nm);if(!n)throw new Error('raiz sem '+nm);add(n)});
while(st.length){const n=st.pop();for(const t of n.tok){const m=byName.get(t);if(m)add(m)}}
const kept=nodes.filter(n=>keep.has(n));
if(process.env.WHY){for(const w of process.env.WHY.split(',')){console.log('>>',w,'<-',kept.filter(n=>n.tok.has(w)&&n.names[0]!==w).map(n=>n.names[0]||('#raiz:'+n.text.slice(0,50).replace(/\s+/g,' '))).join(' | '))}}
{const sec=new Map();for(const n of kept)for(const t of n.tok){const m=byName.get(t);if(m&&m.drop){if(!sec.has(t))sec.set(t,[]);sec.get(t).push(n.names[0]||'#raiz')}}
{const und=new Map();for(const n of kept)for(const t of n.tok){if(!byName.has(t)&&globalThis.__mm.has(t)){if(!und.has(t))und.set(t,[]);und.get(t).push(n.names[0]||'#raiz')}}
console.log('INDEFINIDOS (existem só no main):');for(const [k,v] of und)console.log('  ',k,'<-',[...new Set(v)].join(' | '));}
console.log('PENDENTES (cortados mas ainda referidos):');for(const [k,v] of sec)console.log('  ',k,'<-',[...new Set(v)].join(' | '));}
const tot=nodes.reduce((a,n)=>a+n.text.length,0),k=kept.reduce((a,n)=>a+n.text.length,0);
console.log('nós',nodes.length,'mantidos',kept.length,'bytes',tot,'->',k);
fs.writeFileSync('/home/claude/work/mantidos.txt',kept.filter(n=>n.names.length).map(n=>n.names[0]+':'+n.text.length).join('\n'));
fs.writeFileSync('/home/claude/work/removidos.txt',nodes.filter(n=>!keep.has(n)&&n.names.length).map(n=>n.names[0]+':'+n.text.length).join('\n'));
if(process.argv[2]==='escrever'){
  const novoScript=kept.map(n=>n.text).join('\n');
  let novoHtml=html.slice(0,b.start)+'\n'+novoScript+'\n'+html.slice(b.end);
  novoHtml=cfg.cabecalho?cfg.cabecalho(novoHtml):novoHtml;
  fs.writeFileSync('/home/claude/placurso/index.html',novoHtml);console.log('escrito',novoHtml.length);
}
