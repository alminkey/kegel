
// KP v38.5 — statsStore with per-day map + bonus window (00:00–04:00)
(function(global){
  const LS = window.localStorage;
  const KEYS = {
    days:       'kp_days',
    tz:         'kp_tz',
    dailyTarget:'kp_daily_target',
    dailyDone:  'kp_sessions_today',
    dailyDate:  'kp_daily_date',
    rank:       'kp_rank',
    rankDay:    'kp_rank_day',
    rankLen:    'kp_rank_len',
    sessMin:    'kp_session_minutes',
    total:      'kp_total_sessions',
    streak:     'kp_streak_days',
    version:    'kp_store_version'
  };
  const VERSION = 'v38_store_2';
  function getTimeZone(){ try{ return Intl.DateTimeFormat().resolvedOptions().timeZone || 'local'; }catch(e){ return 'local'; } }
  function nowLocal(){ return new Date(); }
  function pad2(n){ return (n<10?'0':'')+n; }
  function dayKey(d, zone){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())+'@'+(zone||getTimeZone()); }
  function prevDate(d){ const x=new Date(d.getTime()); x.setDate(x.getDate()-1); return x; }
  function clamp(n,a,b){ return Math.min(b, Math.max(a, (n|0))); }
  function toInt(x,def){ x=parseInt(x,10); return isFinite(x)?x:def; }
  function parseDays(s){ try{ const o=JSON.parse(s||'{}'); return (o && typeof o==='object')? o : {}; }catch(e){ return {}; } }
  const store = {
    _subs: [],
    state: {
      tz: getTimeZone(),
      days: {},
      daily:  { key:null, target:2, done:0, updated:null },
      prev:   { key:null, target:2, done:0 },
      rank:   { current:1, day:1, length:5 },
      session:{ defaultMinutes:5 },
      totals: { streakDays:0, totalSessions:0 }
    },
    init(){
      try{
        const LS2=LS;
        const legacyTarget = clamp(toInt(LS2.getItem(KEYS.dailyTarget), 2), 1, 4);
        const legacyDone   = clamp(toInt(LS2.getItem(KEYS.dailyDone),   0), 0, 4);
        const legacyDate   = LS2.getItem(KEYS.dailyDate) || null;
        const rank   = clamp(toInt(LS2.getItem(KEYS.rank),    1), 1, 99);
        const day    = clamp(toInt(LS2.getItem(KEYS.rankDay), 1), 1, 99);
        const rlen   = clamp(toInt(LS2.getItem(KEYS.rankLen), 5), 1, 99);
        const mins   = clamp(toInt(LS2.getItem(KEYS.sessMin), 5), 1, 60);
        const total  = clamp(toInt(LS2.getItem(KEYS.total),   0), 0, 1e9);
        const streak = clamp(toInt(LS2.getItem(KEYS.streak),  0), 0, 1e9);
        const tz = getTimeZone(); try{ LS2.setItem(KEYS.tz, tz); }catch(e){}
        let days = parseDays(LS2.getItem(KEYS.days));
        const now = nowLocal(); const tKey = dayKey(now, tz); const yKey = dayKey(prevDate(now), tz);
        if(!days[tKey]) days[tKey] = {done:0, target:legacyTarget};
        if(legacyDate && tKey.split('@')[0]===legacyDate){ days[tKey].done = Math.max(days[tKey].done, legacyDone); days[tKey].target = legacyTarget; }
        if(!days[yKey]) days[yKey] = {done:0, target:legacyTarget};
        this.state.days = days; this.state.tz = tz;
        this.state.daily.key = tKey; this.state.daily.done = days[tKey].done; this.state.daily.target = days[tKey].target; this.state.daily.updated = new Date().toISOString();
        this.state.prev.key = yKey; this.state.prev.done = days[yKey].done; this.state.prev.target = days[yKey].target;
        this.state.rank.current = rank; this.state.rank.day = day; this.state.rank.length = rlen;
        this.state.session.defaultMinutes = mins;
        this.state.totals.totalSessions = total; this.state.totals.streakDays = streak;
        try{ LS2.setItem(KEYS.version, VERSION);}catch(e){}
        this._lastDaysJSON = JSON.stringify(this.state.days);
        this._tick = setInterval(()=>this._reconcile(), 5000);
        document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) this._reconcile(); });
        global.kpStore = this;
        this.emit();
      }catch(e){ console.warn('kpStore.init v38.5 error', e); }
    },
    _saveDays(){
      try{ LS.setItem(KEYS.days, JSON.stringify(this.state.days)); }catch(e){}
      try{
        const tKey = this.state.daily.key; const d = this.state.days[tKey]||{done:0,target:2};
        const dateOnly = (tKey.split('@')[0]||'1970-01-01');
        LS.setItem(KEYS.dailyDate, dateOnly); LS.setItem(KEYS.dailyDone, String(d.done)); LS.setItem(KEYS.dailyTarget, String(d.target));
      }catch(e){}
    },
    _reconcile(){
      const tz = getTimeZone(); if(tz !== this.state.tz){ this.state.tz=tz; try{ LS.setItem(KEYS.tz,tz);}catch(e){} }
      const now = nowLocal(); const tKey = dayKey(now, tz); const yKey = dayKey(prevDate(now), tz);
      if (!this.state.days[tKey]) this.state.days[tKey] = {done:0, target:(this.state.days[this.state.daily.key]?.target)||2};
      if (!this.state.days[yKey]) this.state.days[yKey] = {done:0, target:(this.state.days[this.state.prev.key]?.target)||2};
      if (tKey !== this.state.daily.key){
        this.state.daily.key = tKey; this.state.daily.done = this.state.days[tKey].done; this.state.daily.target = this.state.days[tKey].target;
        this.state.prev.key = yKey; this.state.prev.done = this.state.days[yKey].done; this.state.prev.target = this.state.days[yKey].target;
        this._saveDays(); this.emit();
      }
      const snap = JSON.stringify(this.state.days);
      if (snap !== this._lastDaysJSON){ this._lastDaysJSON=snap; this._saveDays(); this.emit(); }
    },
    subscribe(fn){ if(typeof fn==='function'){ this._subs.push(fn); fn(this.state);} return ()=>{ this._subs=this._subs.filter(x=>x!==fn); }; },
    emit(){ this._subs.forEach(fn=>{ try{ fn(this.state); }catch(e){} }); },
    getTodayProgress(){ const d=this.state.days[this.state.daily.key]||{done:0,target:2}; const pct=d.target? d.done/d.target : 0; return {done:d.done,target:d.target,percent:Math.max(0,Math.min(1,pct))}; },
    getBonusState(){ const h=nowLocal().getHours(); const prev=this.state.days[this.state.prev.key]||{done:0,target:2}; const active = (h<4)&&(prev.done<prev.target); return {active, forKey: active? this.state.prev.key:null, prevDone:prev.done, prevTarget:prev.target}; },
    getRankGoal(){ const r=this.state.rank; const today=this.state.days[this.state.daily.key]||{done:0,target:2}; const ok=today.done>=today.target; const doneDays=(r.day-1)+(ok?1:0); const pct=r.length? doneDays/r.length : 0; return {rank:r.current, day:r.day, length:r.length, percent:Math.max(0,Math.min(1,pct))}; },
    getSessionDefaults(){ return { minutes: this.state.session.defaultMinutes }; },
    recordSession(meta){
      const d = meta && meta.completedAt ? new Date(meta.completedAt) : nowLocal();
      const tz = this.state.tz; const tKey = dayKey(d, tz); const yKey = dayKey(prevDate(d), tz);
      if (!this.state.days[tKey]) this.state.days[tKey] = {done:0, target:(this.state.days[this.state.daily.key]?.target)||2};
      if (!this.state.days[yKey]) this.state.days[yKey] = {done:0, target:(this.state.days[this.state.prev.key]?.target)||2};
      const hour = d.getHours(); const prev=this.state.days[yKey];
      let key=tKey; if(hour<4 && prev.done<prev.target) key=yKey;
      const cur=this.state.days[key]; cur.done = Math.max(cur.done+1, cur.target); // ensure raises at least to target step-by-step
      this.state.daily.key=tKey; this.state.daily.done=this.state.days[tKey].done; this.state.daily.target=this.state.days[tKey].target;
      this.state.prev.key=yKey; this.state.prev.done=this.state.days[yKey].done; this.state.prev.target=this.state.days[yKey].target;
      this.state.totals.totalSessions = (this.state.totals.totalSessions||0)+1;
      try{ LS.setItem(KEYS.total, String(this.state.totals.totalSessions)); }catch(e){}
      this._saveDays(); this.emit();
    }
  };
  window.addEventListener('kp:sessionCompleted', function(ev){ try{ store.recordSession(ev && ev.detail || {});}catch(e){} });
  store.init();
})(window);
