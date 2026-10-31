(function(root){
  'use strict';
  var KEY='placurso_community_access_v1';
  var REFERRAL_TARGET=5;
  function fresh(){return {status:'visitor',referrals:0,referralIds:[],registered:false,profile:null,updatedAt:0};}
  function read(storage){try{var s=storage||root.localStorage;var x=JSON.parse(s.getItem(KEY)||'null');return x&&typeof x==='object'?Object.assign(fresh(),x):fresh();}catch(e){return fresh();}}
  function write(state,storage){var s=storage||root.localStorage;var next=Object.assign(fresh(),state,{updatedAt:Date.now()});s.setItem(KEY,JSON.stringify(next));return next;}
  function addReferral(id,storage){var state=read(storage),token=String(id||'').trim();if(!token)return {state:state,added:false};if(state.referralIds.indexOf(token)>=0)return {state:state,added:false};state.referralIds=state.referralIds.concat(token);state.referrals=state.referralIds.length;return {state:write(state,storage),added:true};}
  function register(profile,storage){var state=read(storage);state.status='member';state.registered=true;state.profile=profile||{};return write(state,storage);}
  function canEnterStudent(state){return !!(state&&state.status==='member'&&state.registered);}
  function hasReferralThreshold(state){return !!(state&&Number(state.referrals)>=REFERRAL_TARGET);}
  function markVerifiedReferral(id,storage){return addReferral('verified:'+String(id||''),storage);}
  var api={KEY:KEY,REFERRAL_TARGET:REFERRAL_TARGET,fresh:fresh,read:read,write:write,addReferral:addReferral,markVerifiedReferral:markVerifiedReferral,register:register,canEnterStudent:canEnterStudent,hasReferralThreshold:hasReferralThreshold};
  root.PlacursoCommunityAccess=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
