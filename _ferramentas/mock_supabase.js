(function(){
  const CEO=(()=>{try{return localStorage.getItem('mock_ceo')==='1'}catch(e){return false}})();
  const SESS=CEO?{user:{id:'ceo-1',email:'teste@exemplo.com',user_metadata:{}},access_token:'x'}:null;
  const res=(data)=>({data:data===undefined?[]:data,error:null,count:0});
  function chain(final,tab){
    const h={get(t,k){
      if(k==='then') return (ok,ko)=>Promise.resolve(res(final)).then(ok,ko);
      if(k==='maybeSingle'||k==='single') return ()=>Promise.resolve(res(tab==='usuarios'&&CEO?{id:'ceo-1',papel:'ceo',estado:'aprovado',email:'teste@exemplo.com',nome:'Teste'}:null));
      return ()=>new Proxy({},h);
    }};
    return new Proxy({},h);
  }
  const mkch=()=>{const c={on:()=>c,subscribe:()=>c,unsubscribe:()=>{}};return c;};
  window.supabase={createClient(){return {
    from:(t)=>chain([],t),
    rpc:()=>chain([]),
    auth:{getSession:async()=>({data:{session:SESS},error:null}),getUser:async()=>({data:{user:SESS&&SESS.user},error:null}),
      onAuthStateChange(cb){setTimeout(()=>cb(SESS?'SIGNED_IN':'INITIAL_SESSION',SESS),0);return {data:{subscription:{unsubscribe(){}}}}},
      signInWithOAuth:async()=>({data:{},error:null}),signOut:async()=>({error:null}),signInWithOtp:async()=>({data:{},error:null}),
      setSession:async()=>({data:{},error:null}),exchangeCodeForSession:async()=>({data:{},error:null})},
    functions:{invoke:async()=>({data:{},error:null})},
    storage:{from:()=>({getPublicUrl:()=>({data:{publicUrl:''}}),upload:async()=>({data:{},error:null}),createSignedUrl:async()=>({data:{signedUrl:''},error:null}),list:async()=>({data:[],error:null})})},
    channel:mkch,removeChannel(){},
  }}};
  window.jspdf={jsPDF:function(){}};
})();
