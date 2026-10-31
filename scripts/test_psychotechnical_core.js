const assert=require('assert');
const core=require('./psychotechnical_core.js');
const qs=core.questions();assert.strictEqual(qs.length,7);assert.strictEqual(new Set(qs.map(q=>q.id)).size,7);
const answers={};qs.forEach((q,i)=>answers[q.id]=i===0?0:1);
let result=core.complete(answers);assert.strictEqual(result.completed,true);assert.strictEqual(result.questions,7);assert.ok(result.score>=0&&result.score<=100);
result=core.complete({q1:0});assert.strictEqual(result.completed,false);assert.strictEqual(result.questions,7);
console.log('psychotechnical: 4/4 PASS');
