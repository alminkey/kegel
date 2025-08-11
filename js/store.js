
// KP v38.4 — statsStore (single source of truth)
(function(global){
  const LS = window.localStorage;
  const KEYS = {
    dailyTarget: 'kp_daily_target',
    dailyDone:   'kp_sessions_today',
    dailyDate:   'kp_daily_date',
    rank:        'kp_rank',
    rankDay:     'kp_rank_day',
    rankLen:     'kp_rank_len',
    sessMin:     'kp_session_minutes',
    total:       'kp_total_sessions',
    streak:      'kp_streak_days',
    version:     'kp_store_version'
  };
  const VERSION = 'v38_store_1';
  function todayISO(){
    try { return new Date().toISOString().slice(0,10); } catch(e){ return ''; }
  }
  function toInt(x, def){ x = parseInt(x,10); return isFinite(x) ? x : def; }
  function clamp(n,a,b){ return Math.min(b, Math.max(a, n|0)); }

  const store = {
    _subs: [],
    state: {
      daily:  { target: 2, done: 0, date: todayISO(), updated: null },
      rank:   { current: 1, day: 1, length: 5 },
      session:{ defaultMinutes: 5 },
      totals: { streakDays: 0, totalSessions: 0 }
    },
    init(){
      try{
        const ver = LS.getItem(KEYS.version);
        if(!ver){ LS.setItem(KEYS.version, VERSION); }

        const target = clamp(toInt(LS.getItem(KEYS.dailyTarget), 2), 1, 4);
        const done   = clamp(toInt(LS.getItem(KEYS.dailyDone),   0), 0, 4);
        const date   = LS.getItem(KEYS.dailyDate) || todayISO();

        const rank   = clamp(toInt(LS.getItem(KEYS.rank),    1), 1, 99);
        const day    = clamp(toInt(LS.getItem(KEYS.rankDay), 1), 1, 99);
        const rlen   = clamp(toInt(LS.getItem(KEYS.rankLen), 5), 1, 99);

        const mins   = clamp(toInt(LS.getItem(KEYS.sessMin), 5), 1, 60);
        const total  = clamp(toInt(LS.getItem(KEYS.total),   0), 0, 1e7);
        const streak = clamp(toInt(LS.getItem(KEYS.streak),  0), 0, 1e7);

        this.state.daily.target = target;
        this.state.daily.done   = done;
        this.state.daily.date   = date;
        this.state.daily.updated= new Date().toISOString();

        this.state.rank.current = rank;
        this.state.rank.day     = day;
        this.state.rank.length  = rlen;

        this.state.session.defaultMinutes = mins;

        this.state.totals.totalSessions = total;
        this.state.totals.streakDays    = streak;

        // midnight rollover
        this._rolloverIfNeeded();

        // kick light reconciler (2s)
        this._lastLS = this._snapshotLS();
        this._tick = setInterval(()=>this._reconcileFromLS(), 2000);
        document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) this._reconcileFromLS(); });

        // expose
        global.kpStore = this;
        this.emit();
      }catch(e){ console.warn('kpStore.init error', e); }
    },
    _snapshotLS(){
      return JSON.stringify({
        t: LS.getItem(KEYS.dailyTarget),
        d: LS.getItem(KEYS.dailyDone),
        dt:LS.getItem(KEYS.dailyDate),
        r: LS.getItem(KEYS.rank),
        rd:LS.getItem(KEYS.rankDay),
        rl:LS.getItem(KEYS.rankLen),
        m: LS.getItem(KEYS.sessMin),
        tt:LS.getItem(KEYS.total),
        st:LS.getItem(KEYS.streak)
      });
    },
    _reconcileFromLS(){
      try{
        const snap = this._snapshotLS();
        if(snap === this._lastLS) return;
        this._lastLS = snap;

        // read again
        const target = clamp(toInt(LS.getItem(KEYS.dailyTarget), 2), 1, 4);
        const done   = clamp(toInt(LS.getItem(KEYS.dailyDone),   0), 0, 4);
        const date   = LS.getItem(KEYS.dailyDate) || todayISO();

        const rank   = clamp(toInt(LS.getItem(KEYS.rank),    1), 1, 99);
        const day    = clamp(toInt(LS.getItem(KEYS.rankDay), 1), 1, 99);
        const rlen   = clamp(toInt(LS.getItem(KEYS.rankLen), 5), 1, 99);

        const mins   = clamp(toInt(LS.getItem(KEYS.sessMin), 5), 1, 60);
        const total  = clamp(toInt(LS.getItem(KEYS.total),   0), 0, 1e7);
        const streak = clamp(toInt(LS.getItem(KEYS.streak),  0), 0, 1e7);

        this.state.daily.target = target;
        this.state.daily.done   = done;
        this.state.daily.date   = date;

        this.state.rank.current = rank;
        this.state.rank.day     = day;
        this.state.rank.length  = rlen;

        this.state.session.defaultMinutes = mins;

        this.state.totals.totalSessions = total;
        this.state.totals.streakDays    = streak;

        this._rolloverIfNeeded();
        this.emit();
      }catch(e){}
    },
    _rolloverIfNeeded(){
      const today = todayISO();
      if(this.state.daily.date !== today){
        // reset today's done
        this.state.daily.date = today;
        this.state.daily.done = 0;
        this._saveDaily();
      }
    },
    _saveDaily(){
      try{
        LS.setItem(KEYS.dailyDate, this.state.daily.date);
        LS.setItem(KEYS.dailyDone, String(this.state.daily.done));
        LS.setItem(KEYS.dailyTarget, String(this.state.daily.target));
      }catch(e){}
    },
    _saveRank(){
      try{
        LS.setItem(KEYS.rank, String(this.state.rank.current));
        LS.setItem(KEYS.rankDay, String(this.state.rank.day));
        LS.setItem(KEYS.rankLen, String(this.state.rank.length));
      }catch(e){}
    },
    _saveSession(){
      try{ LS.setItem(KEYS.sessMin, String(this.state.session.defaultMinutes)); }catch(e){}
    },
    _saveTotals(){
      try{
        LS.setItem(KEYS.total, String(this.state.totals.totalSessions));
        LS.setItem(KEYS.streak, String(this.state.totals.streakDays));
      }catch(e){}
    },
    subscribe(fn){
      if(typeof fn==='function'){ this._subs.push(fn); fn(this.state); }
      return ()=>{ this._subs = this._subs.filter(x=>x!==fn); };
    },
    emit(){ this._subs.forEach(fn=>{ try{ fn(this.state); }catch(e){} }); },

    // Selectors
    getTodayProgress(){
      const d=this.state.daily;
      const pct = Math.max(0, Math.min(1, (d.target? d.done/d.target : 0)));
      return { done: d.done, target: d.target, percent: pct };
    },
    getRankGoal(){
      const r=this.state.rank;
      const doneDays = (r.day-1) + (this.state.daily.done >= this.state.daily.target ? 1 : 0);
      const pct = Math.max(0, Math.min(1, (r.length? doneDays/r.length : 0)));
      return { rank: r.current, day: r.day, length: r.length, percent: pct };
    },
    getSessionDefaults(){
      return { minutes: this.state.session.defaultMinutes };
    },

    // Mutations
    setDailyTarget(n){
      this.state.daily.target = clamp(parseInt(n,10)||2,1,4);
      this._saveDaily(); this.emit();
    },
    setRank(r){ this.state.rank.current = clamp(parseInt(r,10)||1,1,99); this._saveRank(); this.emit(); },
    setRankDay(d){ this.state.rank.day = clamp(parseInt(d,10)||1,1,99); this._saveRank(); this.emit(); },
    setRankLength(l){ this.state.rank.length = clamp(parseInt(l,10)||5,1,99); this._saveRank(); this.emit(); },
    setSessionMinutes(m){ this.state.session.defaultMinutes = clamp(parseInt(m,10)||5,1,60); this._saveSession(); this.emit(); },

    recordSession(meta){
      // meta: { variation, durationSec, success }
      const today = todayISO();
      if(this.state.daily.date !== today){
        this.state.daily.date = today;
        this.state.daily.done = 0;
      }
      // increment done up to target (do not silently exceed)
      this.state.daily.done = clamp(this.state.daily.done + 1, 0, Math.max(this.state.daily.target, this.state.daily.done+1));
      this.state.totals.totalSessions = clamp(this.state.totals.totalSessions + 1, 0, 1e9);
      // streak calc (simple: if previous day had >= target, keep streak else reset) — placeholder
      // For now, leave streak as-is; we can implement proper calendar log later.
      this._saveDaily(); this._saveTotals(); this.emit();
      try{ LS.setItem(KEYS.version, VERSION);}catch(e){}
    }
  };

  // global event hook (training module can dispatch this)
  window.addEventListener('kp:sessionCompleted', function(ev){
    try{ store.recordSession(ev && ev.detail || {}); }catch(e){}
  });

  // init now
  store.init();
})(window);
