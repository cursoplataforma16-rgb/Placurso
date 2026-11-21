import fs from 'fs';
import {createRequire} from 'module';
const require=createRequire('/opt/npm-tools/node_modules/');
const acorn=require('acorn');
export function carregar(file){
  const html=fs.readFileSync(file,'utf8');
  const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m,blocks=[];
  while((m=re.exec(html))) blocks.push({attrs:m[1],code:m[2],start:m.index+m[0].indexOf('>')+1,end:m.index+m[0].indexOf('>')+1+m[2].length});
  return {html,blocks};
}
export function nos(code){
  const comments=[];
  const ast=acorn.parse(code,{ecmaVersion:'latest',allowReturnOutsideFunction:true,onComment:comments});
  const out=[];
  for(const n of ast.body){
    let names=[];
    if(n.type==='FunctionDeclaration')names=[n.id.name];
    else if(n.type==='ClassDeclaration')names=[n.id.name];
    else if(n.type==='VariableDeclaration'){
      for(const d of n.declarations){ if(d.id.type==='Identifier')names.push(d.id.name); else collect(d.id,names); }
    }
    out.push({n,names,start:n.start,end:n.end,tipo:n.type});
  }
  return {ast,out,comments};
}
function collect(p,names){
  if(p.type==='Identifier')names.push(p.name);
  else if(p.type==='ObjectPattern')p.properties.forEach(x=>collect(x.value||x.argument,names));
  else if(p.type==='ArrayPattern')p.elements.forEach(x=>x&&collect(x,names));
  else if(p.type==='AssignmentPattern')collect(p.left,names);
  else if(p.type==='RestElement')collect(p.argument,names);
}
export function tokens(code,start,end,comments){
  let s=code.slice(start,end);
  // blank comments
  const cs=comments.filter(c=>c.start>=start&&c.end<=end).sort((a,b)=>b.start-a.start);
  for(const c of cs){s=s.slice(0,c.start-start)+' '.repeat(c.end-c.start)+s.slice(c.end-start);}
  return new Set(s.match(/[A-Za-z_$][\w$]*/g)||[]);
}
