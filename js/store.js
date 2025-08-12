
(function(global){
  if(global.kpStore) return;
  global.kpStore={
    _subs:[],
    subscribe:function(fn){ this._subs.push(fn); try{fn(this.state);}catch(e){}; return ()=>{}; },
    emit:function(){ this._subs.forEach(fn=>{ try{fn(this.state);}catch(e){} })},
    state:{},
    getTodayProgress:function(){ try{ var d=+localStorage.getItem('kp_sessions_today')||0; var t=+localStorage.getItem('kp_daily_target')||2; return {done:d,target:t,percent:(t?d/t:0)};}catch(e){return {done:0,target:2,percent:0};}},
    getRankGoal:function(){ return {rank:+(localStorage.getItem('kp_rank')||1), day:+(localStorage.getItem('kp_rank_day')||1), length:+(localStorage.getItem('kp_rank_len')||5), percent:0}; },
    getSessionDefaults:function(){ return {minutes:+(localStorage.getItem('kp_session_minutes')||5)}; },
    getBonusState:function(){ return {active:false}; }
  };
})(window);
