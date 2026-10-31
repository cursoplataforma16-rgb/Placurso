const assert=require('assert');
const core=require('./bible_learning_core.js');
for(let level=1;level<=3;level++){const m=core.mission(level);assert.strictEqual(m.items.length,3);const r=core.score(level,m.items.map(x=>x.a));assert.strictEqual(r.correct,3);assert.strictEqual(r.passed,true);}
assert.strictEqual(core.score(1,[0]).passed,false);
console.log('bible learning: 4/4 PASS');
