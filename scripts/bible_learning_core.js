(function(root){
  'use strict';
  var MISSIONS=[
    {level:1,title:'Primeiros passos',items:[
      {q:'Quem construiu a arca?',o:['Noé','Moisés','Pedro'],a:0,why:'Noé recebeu a orientação para construir a arca.'},
      {q:'Qual é o primeiro livro da Bíblia?',o:['Êxodo','Génesis','Salmos'],a:1,why:'Génesis abre a Bíblia e apresenta o início da criação e da história bíblica.'},
      {q:'O que Jesus ensinou sobre amar o próximo?',o:['É um princípio central','É opcional','Só vale para amigos'],a:0,why:'Amar o próximo é apresentado por Jesus como um princípio fundamental.'}
    ]},
    {level:2,title:'Histórias e princípios',items:[
      {q:'Quem liderou Israel na saída do Egito?',o:['David','Moisés','Salomão'],a:1,why:'Moisés liderou o povo de Israel na saída do Egito.'},
      {q:'A parábola do bom samaritano destaca principalmente:',o:['Compaixão pelo próximo','Riqueza','Competição'],a:0,why:'A história ensina a agir com misericórdia e cuidado.'},
      {q:'O que caracteriza uma decisão sábia?',o:['Impulso','Considerar consequências e princípios','Ignorar os outros'],a:1,why:'Sabedoria envolve discernimento, contexto e responsabilidade.'}
    ]},
    {level:3,title:'Compreender e aplicar',items:[
      {q:'Quando uma pessoa enfrenta um conflito, qual atitude está mais próxima do ensino cristão?',o:['Buscar reconciliação e verdade','Aumentar o conflito','Nunca ouvir'],a:0,why:'Reconciliação, verdade e amor são valores importantes no ensino cristão.'},
      {q:'Conhecer uma história bíblica é mais útil quando:',o:['Apenas memorizamos nomes','Compreendemos o sentido e refletimos sobre a aplicação','Esquecemos o contexto'],a:1,why:'Aprendizagem profunda liga conhecimento, compreensão e aplicação.'},
      {q:'Ao estudar um texto bíblico difícil, uma boa prática é:',o:['Ler o contexto e comparar passagens','Escolher a primeira interpretação','Ignorar a dúvida'],a:0,why:'Contexto e comparação ajudam a evitar interpretações precipitadas.'}
    ]}
  ];
  function mission(level){return MISSIONS.filter(function(m){return m.level===Number(level);})[0]||MISSIONS[0];}
  function score(level,answers){var m=mission(level),a=answers||[],correct=0;m.items.forEach(function(x,i){if(Number(a[i])===x.a)correct++;});return {level:m.level,title:m.title,questions:m.items.length,correct:correct,score:Math.round(correct/m.items.length*100),passed:correct>=2};}
  var api={mission:mission,score:score};root.PlacursoBibleLearning=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
