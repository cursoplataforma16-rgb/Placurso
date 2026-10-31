/* PLACURSO_ANNAN_SUPABASE_ADAPTER_V1 */
(function(){
  'use strict';
  if(window.PlacursoAnnanPersistence) return;

  var PROJECT_URL='https://ebdrrsrvjsdjthatfbcd.supabase.co';
  var PUBLISHABLE_KEY='sb_publishable_yGhE0wXCqPMKSMrc1xlzkw_1E8JmFD9';
  var CLIENT_KEY='placurso_annan_persistence_v1';
  var TABLE='annan_learning_events';
  var PROFILE_TABLE='annan_student_profiles';
  var CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
  var client=null;
  var ready=null;
  var queue=Promise.resolve();

  function loadClient(){
    if(client) return Promise.resolve(client);
    if(window.supabase&&window.supabase.createClient){
      client=window.supabase.createClient(PROJECT_URL,PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      return Promise.resolve(client);
    }
    return new Promise(function(resolve,reject){
      var existing=document.querySelector('script[data-annan-supabase="1"]');
      if(existing){existing.addEventListener('load',function(){loadClient().then(resolve,reject);});existing.addEventListener('error',reject);return;}
      var script=document.createElement('script');
      script.src=CDN;script.async=true;script.dataset.annanSupabase='1';
      script.onload=function(){loadClient().then(resolve,reject);};
      script.onerror=function(){reject(new Error('Não foi possível carregar o cliente Supabase.'));};
      document.head.appendChild(script);
    });
  }
  function getClient(){if(!ready) ready=loadClient();return ready;}

  function normalizeEvent(detail){
    if(!detail||typeof detail!=='object'||typeof detail.id!=='string'||!detail.id) return null;
    var score=Number(detail.score);
    if(!Number.isFinite(score)) score=null;
    var correct=Number(detail.correct);
    if(!Number.isFinite(correct)) correct=null;
    var total=Number(detail.total);
    if(!Number.isFinite(total)) total=null;
    return {
      event_id:detail.id,
      source:typeof detail.source==='string'?detail.source:null,
      game:typeof detail.game==='string'?detail.game:null,
      level:typeof detail.level==='string'?detail.level:null,
      correct:correct,
      total:total,
      score:score,
      passed:typeof detail.passed==='boolean'?detail.passed:null,
      occurred_at:typeof detail.occurredAt==='string'?detail.occurredAt:(typeof detail.occurred_at==='string'?detail.occurred_at:new Date().toISOString())
    };
  }

  function syncEvent(detail){
    var event=normalizeEvent(detail);
    if(!event||!event.source||!event.game) return Promise.resolve({ok:false,reason:'invalid_event'});
    queue=queue.then(function(){return getClient().then(function(sb){
      return sb.auth.getUser().then(function(result){
        if(result.error||!result.data||!result.data.user) return {ok:false,reason:'unauthenticated'};
        event.user_id=result.data.user.id;
        return sb.from(TABLE).upsert(event,{onConflict:'user_id,event_id'}).then(function(result){
          return result.error?{ok:false,reason:result.error.message}:{ok:true,event_id:event.event_id};
        });
      });
    });});
    return queue;
  }

  function loadEvents(limit){
    var size=Math.min(Math.max(Number(limit)||120,1),240);
    return getClient().then(function(sb){return sb.auth.getUser().then(function(result){
      if(result.error||!result.data||!result.data.user) return {ok:false,reason:'unauthenticated',events:[]};
      return sb.from(TABLE).select('event_id,source,game,level,correct,total,score,passed,occurred_at').eq('user_id',result.data.user.id).order('occurred_at',{ascending:false}).limit(size).then(function(result){
        return result.error?{ok:false,reason:result.error.message,events:[]}:{ok:true,events:Array.isArray(result.data)?result.data:[]};
      });
    });});
  }

  function upsertProfile(profile){
    if(!profile||typeof profile!=='object') return Promise.resolve({ok:false,reason:'invalid_profile'});
    return getClient().then(function(sb){return sb.auth.getUser().then(function(result){
      if(result.error||!result.data||!result.data.user) return {ok:false,reason:'unauthenticated'};
      var row={user_id:result.data.user.id,profile:profile,updated_at:new Date().toISOString()};
      return sb.from(PROFILE_TABLE).upsert(row,{onConflict:'user_id'}).then(function(result){return result.error?{ok:false,reason:result.error.message}:{ok:true};});
    });});
  }

  function loadProfile(){
    return getClient().then(function(sb){return sb.auth.getUser().then(function(result){
      if(result.error||!result.data||!result.data.user) return {ok:false,reason:'unauthenticated',profile:null};
      return sb.from(PROFILE_TABLE).select('profile,updated_at').eq('user_id',result.data.user.id).maybeSingle().then(function(result){
        if(result.error) return {ok:false,reason:result.error.message,profile:null};
        return {ok:true,profile:result.data?result.data.profile:null,updated_at:result.data?result.data.updated_at:null};
      });
    });});
  }

  function mergePersistedIntoLearning(Learning,state,events){
    if(!Learning||!Learning.sanitizeLearningState) return state;
    var next=Learning.sanitizeLearningState(state||{});
    (events||[]).slice().reverse().forEach(function(event){
      var recorded=Learning.recordLearningEvent(next,{id:event.event_id,source:event.source,game:event.game,level:event.level,correct:event.correct,total:event.total,score:event.score,passed:event.passed,occurredAt:event.occurred_at},event.occurred_at||new Date().toISOString());
      if(recorded&&recorded.added) next=recorded.state;
    });
    return next;
  }

  function bootstrap(Learning,currentState){
    return loadEvents(240).then(function(result){
      if(!result.ok) return result;
      var merged=mergePersistedIntoLearning(Learning,currentState,result.events);
      try{localStorage.setItem('placurso_annan_learning_v1',JSON.stringify(merged));}catch(e){}
      window.dispatchEvent(new CustomEvent('placurso:annan-persistence-ready',{detail:{events:result.events,state:merged}}));
      return {ok:true,events:result.events,state:merged};
    });
  }

  window.PlacursoAnnanPersistence={version:1,key:CLIENT_KEY,projectUrl:PROJECT_URL,getClient:getClient,normalizeEvent:normalizeEvent,syncEvent:syncEvent,loadEvents:loadEvents,upsertProfile:upsertProfile,loadProfile:loadProfile,bootstrap:bootstrap,isConfigured:function(){return !!PROJECT_URL&&!!PUBLISHABLE_KEY;}};
  window.addEventListener('placurso:progress',function(event){syncEvent(event&&event.detail?event.detail:null);});
})();
