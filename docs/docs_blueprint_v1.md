# KegelPilot — Blueprint & Roadmap (Android‑first)

**Version:** v1.0  
**Purpose:** Jedan izvor istine za re‑build. Ovaj dokument sumira izgled, funkcije i pravila koja primjenjujemo u vNext implementaciji (Android‑first uz Capacitor).

---

## 1) Brend i UI
- **Naziv:** KegelPilot (KP)
- **Identitet:** ring + narandžasti luk + tipografski “KegelPilot”
- **Paleta:** mint (naglasci), narandžasta (akcije/progres), tamna pozadina
- **Tipografija:** moderan sans, veći CTA, visoki kontrast
- **Stil:** moderni dark, suptilni glow; bez teškog glossy izgleda

## 2) Tehnički pristup
- **UI/Logika:** Svelte + Vite + TypeScript
- **Android paket:** Capacitor (Android), nativne notifikacije + Play Billing
- **PWA:** samo razvoj/test; finalni fokus Android

## 3) Navigacija i skelet
- Fiksni header (logo, verzija, PRO badge)
- Fiksni tab bar (Početna, Trening, Edu, Napredak)
- **KP-RULE-HOME-OWN-SECTION:** home kartice žive samo u Home komponenti

## 4) Ekrani (sažetak)
### Početna
- **Trenutni cilj** (Rang X • Dan Y/L + „Danas: a/b“) → otvara Napredak
- **Trening za danas** (ring 0/b + meta + Start) → otvara Trening
- Hero + Brzi start, mini metrike, sljedeći termin, savjet dana, značke, tvoj nivo, Edu teaser

### Trening
- Ring/prsten (puls) + plava pozadina; narandžasti luk = progres **cijele sesije**
- Stanja: **PRIPREMI SE (2s)** → STEGNI → ZADRŽI → OPUSTI
- START (jedan klik), STOP (prekida i *ne* bilježi), UI lock tokom sesije
- Vrijeme do kraja ispod kruga

### Edu
- Akordeoni: Šta su Kegeli, Zašto rade, Ko ima koristi, Ko treba pauzirati, Kako naći pravi mišić

### Napredak
- Sažetak: Dan ranga, Danas sesije a/b, Streak (2+/dan), Ukupno sesija
- Cilj ranga: „2/dan × 5 dana“ + progress bar
- (Roadmap) Graf 7/30 dana, heatmap, značke

## 5) Programi
- **Rang 1:** V1 (osnovno), V2 (+1s zadrška), V3 (brzo + 3s zadrška + 2s otpuštanje)
- Plan: Dan1 V1, Dan2 V1, Dan3 intro V2 → V1+V2, Dan4 V1+V2, Dan5 intro V3 → V1+V2+V3
- Prelaz: 5 uzastopnih dana sa 2+/dan
- (Kasnije: ukupno 10 rangova)

## 6) Dnevna logika
- Dan: 00:00–24:00 (lokalno)
- **Bonus 00–04:** ako jučer < cilj, prvo popuni jučer (max do cilja), ostatak ide u novi dan; ako jučer ≥ cilj, sve ide u novi dan

## 7) Podsjetnici (Android)
- Korisnik bira broj termina i vremena; 2 ponavljanja u 1h ako se ignoriše; bez spama
- AlarmManager/WorkManager + Notification Channels

## 8) Free vs PRO
- **Free:** osnovni program (V1), bez statistike na početnoj; Edu otvoren; ostalo sa PRO overlayem
- **PRO:** sve metrike/istorija, varijacije, rasporedi, svi rangovi, značke, personalizacija

## 9) Pretplate & profil (Android‑only)
- **Play Billing** izvor istine za PRO (entitlement); offline cache (npr. 7 dana)
- Login nije nužan za PRO; kasnije opcioni login (backup/sync)
- Profil: status PRO, podsjetnici, jezik/tema, export/reset, pravne stranice

## 10) Podaci i store
- **kpStore**: jedini izvor istine; eventi: `progress-updated`, `session-complete`, `day-rollover`
- Lokalna pohrana (IndexedDB/localForage) + migracije
- Model: `daily_progress`, `sessions`, `plan`, `streak`, `reminders`, `settings`, `badges`

## 11) Timer & UX
- Precizan timer + animacije (ring/puls)
- Foreground service tokom sesije; “keep screen on”; pauziraj na poziv
- Haptika/zvuk (opcionalno; default OFF)

## 12) Kvalitet, privatnost, i18n
- Crash/analytics (anonimno), feedback
- GDPR-friendly: export/brisanje; minimalna pohrana
- i18n: BS/EN skeleton

---

## Roadmap (Android‑first)

| Milestone | Sadržaj | Procjena |
|---|---|---|
| **M0 – Skeleton** | Vite+Svelte+TS, layout (header+tabbar), rute, design tokens | 0.5–1 dan |
| **M1 – Core & Store** | kpStore, clock (bonus 00–04), counters, ranks (Rang1+varijacije), storage | 1–2 dana |
| **M2 – Trening** | Ring/puls, 2s „Pripremi se“, STOP lock, devShort opcija | 1–2 dana |
| **M3 – Početna** | „Trenutni cilj“ + „Trening za danas“, hero, mini metrike, savjet, značke, Edu teaser | 1 dan |
| **M4 – Edu** | Akordeon sa sadržajem | 0.5 dan |
| **M5 – Napredak** | Sažetak + „Cilj ranga“; priprema grafova | 1–2 dana |
| **M6 – Podsjetnici** | Local notifications (Android), UI vremena + retry logika | 1 dan |
| **M7 – PRO zid** | Gating komponenta, copy, tok nadogradnje | 0.5 dan |
| **M8 – Play Billing** | Kupovina + entitlement cache + restore | 2–3 dana |
| **M9 – Polish & QA** | UX detalji, pristupačnost, crash/report, i18n skeleton | 1–2 dana |

### Milestone checklist
- [ ] M0 Skeleton  
- [ ] M1 Core & Store  
- [ ] M2 Trening (ring, 2s priprema, STOP lock)  
- [ ] M3 Početna (dvije kartice, hero, mini-metrike)  
- [ ] M4 Edu akordeon  
- [ ] M5 Napredak (sažetak + cilj ranga)  
- [ ] M6 Podsjetnici (Android)  
- [ ] M7 PRO zid  
- [ ] M8 Play Billing + restore  
- [ ] M9 Polish & QA

---

### Sidra/šifre
- **KP-BLUEPRINT** – referenca na ovaj dokument  
- **KP-RULE-HOME-OWN-SECTION** – home kartice samo u Home komponenti  
- Stabilni tagovi: `KP-stable-vX.Y`