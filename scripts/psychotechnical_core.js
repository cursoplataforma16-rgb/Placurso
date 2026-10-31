(function(root){
  'use strict';
  var QUESTIONS=[
    {id:'q1',text:'Quando surge um problema novo, o que fazes primeiro?',options:['Observo antes de agir','Ajo imediatamente','Peço que alguém decida'],correct:0,skill:'decision'},
    {id:'q2',text:'Qual sequência completa melhor: 2 · 4 · 6 · ?',options:['7','8','10'],correct:1,skill:'pattern'},
    {id:'q3',text:'Tens pouco tempo e duas tarefas importantes. O melhor começo é:',options:['Escolher ao acaso','Definir prioridade e tempo','Desistir das duas'],correct:1,skill:'focus'},
    {id:'q4',text:'Uma informação parece contraditória. O mais seguro é:',options:['Confirmar o contexto','Ignorar','Espalhar a informação'],correct:0,skill:'reasoning'},
    {id:'q5',text:'Num desafio difícil, depois de errar, preferes:',options:['Parar','Analisar o erro e tentar outra abordagem','Culpar o desafio'],correct:1,skill:'adaptation'},
    {id:'q6',text:'Se tens 100 e gastas 30, quanto resta?',options:['60','70','80'],correct:1,skill:'finance'},
    {id:'q7',text:'Quando não tens informação suficiente para decidir:',options:['Reconheço a incerteza e procuro mais dados','Invento uma resposta','Decido sempre pelo impulso'],correct:0,skill:'judgment'}
  ];
  function questions(){return QUESTIONS.map(function(q){return {id:q.id,text:q.text,options:q.options,skill:q.skill};});}
  function complete(answers){
    var a=answers||{};var correct=0;QUESTIONS.forEach(function(q){if(Number(a[q.id])===q.correct)correct++;});
    var band=correct<=2?'explorar':correct<=4?'desenvolver':correct<=6?'avancar':'dominio';
    return {completed:Object.keys(a).filter(function(k){return QUESTIONS.some(function(q){return q.id===k;});}).length===7,questions:7,correct:correct,score:Math.round(correct/7*100),band:band};
  }
  var api={questions:questions,complete:complete};root.PlacursoPsychotechnical=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
