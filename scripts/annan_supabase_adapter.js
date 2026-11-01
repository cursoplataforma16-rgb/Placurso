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

  function errorMessage(error,fallback){
    var message=error&&typeof error.message==='string'?error.message:'';
    return message?message.slice(0,240):(fallback||'Falha de comunicação com o serviço.');
  }

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
  function getClient(){
    if(!ready) ready=loadClient().catch(function(error){ready=null;throw error;});
    return ready;
  }

  function enqueue(operation){
    var task=queue.then(operation,operation);
    queue=task.then(function(){return undefined;},function(){return undefined;});
    return task.catch(function(error){return {ok:false,reason:errorMessage(error)};});
  }

  function normalizeEvent(detail){
    if(!detail||typeof detail!=='object'||Array.isArray(detail)||typeof detail.id!=='string'||!detail.id.trim()) return null;
    var score=Number(detail.score); if(!Number.isFinite(score)) score=null;
    var correct=Number(detail.correct); if(!Number.isFinite(correct)) correct=null;
    var total=Number(detail.total); if(!Number.isFinite(total)) total=null;
    var occurred=typeof detail.occurredAt==='string'?detail.occurredAt:(typeof detail.occurred_at==='string'?detail.occurred_at:(typeof detail.at==='string'?detail.at:new Date().toISOString()));
    return {event_id:detail.id.trim(),source:typeof detail.source==='string'?detail.source:null,game:typeof detail.game==='string'?detail.game:null,level:typeof detail.level==='string'?detail.level:null,correct:correct,total:total,score:score,passed:typeof detail.passed==='boolean'?detail.passed:null,occurred_at:occurred};
  }

  function validEvent(event){
    return !!(event&&event.event_id&&['phase3a','crypto','psychotechnical','bible'].indexOf(event.source)>=0
      &&['memoria','reflexo','dinheiro','negocio','crypto','biblia','psychotechnical'].indexOf(event.game)>=0
      &&Number.isInteger(event.correct)&&event.correct>=0
      &&Number.isInteger(event.total)&&event.total>0&&event.correct<=event.total
      &&(event.score===null||(Number.isFinite(event.score)&&event.score>=0&&event.score<=100))
      &&(!event.occurred_at||Number.isFinite(Date.parse(event.occurred_at))));
  }

  function getCurrentUser(){
    return getClient().then(function(sb){return sb.auth.getUser();}).then(function(result){
      if(result.error) return {ok:false,reason:errorMessage(result.error,'Não foi possível confirmar a sessão.'),user:null};
      var user=result.data&&result.data.user?result.data.user:null;
      return {ok:!!user,reason:user?null:'unauthenticated',user:user};
    }).catch(function(error){return {ok:false,reason:errorMessage(error),user:null};});
  }

  function signUp(name,email,password){
    var safeName=typeof name==='string'?name.trim():'';
    var safeEmail=typeof email==='string'?email.trim().toLowerCase():'';
    if(!safeName||!safeEmail||typeof password!=='string'||password.length<8){
      return Promise.resolve({ok:false,reason:'invalid_input'});
    }
    return getClient().then(function(sb){
      return sb.auth.signUp({email:safeEmail,password:password,options:{data:{full_name:safeName}}});
    }).then(function(result){
      if(result.error) return {ok:false,reason:errorMessage(result.error,'Não foi possível criar a conta.'),user:null};
      var data=result.data||{};
      if(!data.user) return {ok:false,reason:'signup_incomplete',user:null};
      if(!data.session) return {ok:false,reason:'email_confirmation_required',user:data.user};
      return getCurrentUser().then(function(current){
        return current.ok?{ok:true,user:current.user}:{ok:false,reason:current.reason||'session_unavailable',user:null};
      });
    }).catch(function(error){return {ok:false,reason:errorMessage(error,'Não foi possível criar a conta.'),user:null};});
  }

  function signIn(email,password){
    var safeEmail=typeof email==='string'?email.trim().toLowerCase():'';
    if(!safeEmail||typeof password!=='string'||!password) return Promise.resolve({ok:false,reason:'invalid_input',user:null});
    return getClient().then(function(sb){
      return sb.auth.signInWithPassword({email:safeEmail,password:password});
    }).then(function(result){
      if(result.error) return {ok:false,reason:errorMessage(result.error,'Credenciais inválidas.'),user:null};
      if(!result.data||!result.data.session) return {ok:false,reason:'session_unavailable',user:null};
      return getCurrentUser().then(function(current){
        return current.ok?{ok:true,user:current.user}:{ok:false,reason:current.reason||'session_unavailable',user:null};
      });
    }).catch(function(error){return {ok:false,reason:errorMessage(error,'Não foi possível iniciar sessão.'),user:null};});
  }

  function signOut(){
    return getClient().then(function(sb){return sb.auth.signOut();}).then(function(result){
      return result.error?{ok:false,reason:errorMessage(result.error,'Não foi possível terminar a sessão.') }:{ok:true};
    }).catch(function(error){return {ok:false,reason:errorMessage(error,'Não foi possível terminar a sessão.')};});
  }

  function rowsForUser(events,userId){
    var seen={};
    var rows=[];
    (Array.isArray(events)?events:[]).slice(-120).forEach(function(detail){
      var event=normalizeEvent(detail);
      if(!validEvent(event)||seen[event.event_id]) return;
      seen[event.event_id]=true;
      event.user_id=userId;
      rows.push(event);
    });
    return rows;
  }

  function syncEvents(events){
    return enqueue(function(){
      return getClient().then(function(sb){return sb.auth.getUser().then(function(auth){
        if(auth.error) return {ok:false,reason:errorMessage(auth.error),synced:0};
        var user=auth.data&&auth.data.user?auth.data.user:null;
        if(!user) return {ok:false,reason:'unauthenticated',synced:0};
        var rows=rowsForUser(events,user.id);
        if(!rows.length) return {ok:true,synced:0};
        return sb.from(TABLE).upsert(rows,{onConflict:'user_id,event_id'}).then(function(result){
          return result.error?{ok:false,reason:errorMessage(result.error),synced:0}:{ok:true,synced:rows.length};
        });
      });});
    });
  }

  function syncEvent(detail){
    var event=normalizeEvent(detail);
    if(!validEvent(event)) return Promise.resolve({ok:false,reason:'invalid_event',synced:0});
    return syncEvents([event]);
  }

  function loadEvents(limit){
    var size=Math.min(Math.max(Number(limit)||120,1),240);
    return getClient().then(function(sb){return sb.auth.getUser().then(function(auth){
      if(auth.error) return {ok:false,reason:errorMessage(auth.error),events:[]};
      if(!auth.data||!auth.data.user) return {ok:false,reason:'unauthenticated',events:[]};
      return sb.from(TABLE).select('event_id,source,game,level,correct,total,score,passed,occurred_at').eq('user_id',auth.data.user.id).order('occurred_at',{ascending:false}).limit(size).then(function(result){
        return result.error?{ok:false,reason:errorMessage(result.error),events:[]}:{ok:true,events:Array.isArray(result.data)?result.data:[]};
      });
    });}).catch(function(error){return {ok:false,reason:errorMessage(error),events:[]};});
  }

  function upsertProfile(profile){
    if(!profile||typeof profile!=='object'||Array.isArray(profile)) return Promise.resolve({ok:false,reason:'invalid_profile'});
    return getClient().then(function(sb){return sb.auth.getUser().then(function(auth){
      if(auth.error) return {ok:false,reason:errorMessage(auth.error)};
      if(!auth.data||!auth.data.user) return {ok:false,reason:'unauthenticated'};
      var row={user_id:auth.data.user.id,profile:profile,updated_at:new Date().toISOString()};
      return sb.from(PROFILE_TABLE).upsert(row,{onConflict:'user_id'}).then(function(result){return result.error?{ok:false,reason:errorMessage(result.error)}:{ok:true};});
    });}).catch(function(error){return {ok:false,reason:errorMessage(error)};});
  }

  function loadProfile(){
    return getClient().then(function(sb){return sb.auth.getUser().then(function(auth){
      if(auth.error) return {ok:false,reason:errorMessage(auth.error),profile:null};
      if(!auth.data||!auth.data.user) return {ok:false,reason:'unauthenticated',profile:null};
      return sb.from(PROFILE_TABLE).select('profile,updated_at').eq('user_id',auth.data.user.id).maybeSingle().then(function(result){
        if(result.error) return {ok:false,reason:errorMessage(result.error),profile:null};
        return {ok:true,profile:result.data?result.data.profile:null,updated_at:result.data?result.data.updated_at:null};
      });
    });}).catch(function(error){return {ok:false,reason:errorMessage(error),profile:null};});
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

  window.PlacursoAnnanPersistence={
    version:1,key:CLIENT_KEY,projectUrl:PROJECT_URL,getClient:getClient,
    normalizeEvent:normalizeEvent,getCurrentUser:getCurrentUser,signUp:signUp,signIn:signIn,signOut:signOut,
    syncEvent:syncEvent,syncEvents:syncEvents,loadEvents:loadEvents,upsertProfile:upsertProfile,
    loadProfile:loadProfile,bootstrap:bootstrap,isConfigured:function(){return !!PROJECT_URL&&!!PUBLISHABLE_KEY;}
  };
  window.addEventListener('placurso:progress',function(event){
    syncEvent(event&&event.detail?event.detail:null).catch(function(){});
  });

  function bootstrapWhenReady(){
    var Learning=window.PlacursoAnnanLearningCore;
    if(!Learning){setTimeout(bootstrapWhenReady,500);return;}
    var state=null;
    try{state=JSON.parse(localStorage.getItem('placurso_annan_learning_v1')||'null');}catch(e){state=null;}
    bootstrap(Learning,state).then(function(result){
      window.dispatchEvent(new CustomEvent('placurso:annan-persistence-status',{detail:{ok:!!(result&&result.ok),count:result&&result.events?result.events.length:0}}));
    }).catch(function(){
      window.dispatchEvent(new CustomEvent('placurso:annan-persistence-status',{detail:{ok:false}}));
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bootstrapWhenReady); else setTimeout(bootstrapWhenReady,0);
})();
