/* ANNAN Creative Studio — geração de texto, imagem, vídeo e voz. */
(function(){
  'use strict';
  const API='https://ebdrrsrvjsdjthatfbcd.supabase.co/functions/v1/annan-media-ai';
  const journal=(type,payload)=>window.ANNAN_ONLINE_JOURNAL?.record(type,payload).catch(()=>{});
  window.ANNAN_CREATIVE={
    async call(body){
      const started=new Date().toISOString();
      await journal('tool.called',{tool:'annan-media-ai',action:body.action,provider:body.provider||null,input:body.prompt||body.text||null,started_at:started});
      try{
        const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
        const j=await r.json().catch(()=>({}));
        if(!r.ok||j.ok===false) throw new Error(j.error||('Creative Studio HTTP '+r.status));
        await journal('tool.result',{tool:'annan-media-ai',action:body.action,provider:body.provider||null,output:j,started_at:started,completed_at:new Date().toISOString()});
        return j;
      }catch(error){await journal('error.created',{source:'annan-media-ai',action:body.action,message:String(error?.message||error)});throw error;}
    },
    async text(prompt,provider){return this.call({action:'text',prompt,provider:provider||'openai'});},
    async image(prompt,size){return this.call({action:'image',prompt,size:size||'1024x1024'});},
    async video(prompt,image_url,provider){return this.call({action:'video',prompt,image_url,provider:provider||'runway',ratio:'720:1280',duration:5});},
    async videoStatus(task_id){return this.call({action:'video_status',task_id});},
    async voice(text,voice_id){return this.call({action:'voice',text,voice_id});}
  };
})();
