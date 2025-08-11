# KegelPilot – KP-REF-v23 Checklist

Use this list before publishing any new build. If something breaks, compare to this reference and restore.

---

## 0) Version & PWA
- [ ] App header shows **v23** (or newer) on the right.
- [ ] `localStorage.kp_app_version` matches build version.
- [ ] Service worker cache name includes version (e.g. `kegelpilot-pwa-v23`).
- [ ] On first load after update, app forces hard refresh (adds `?v=vXX`).
- [ ] `manifest.json` present; icons 192/512 valid.

## 1) Branding & Header
- [ ] **Logo.PNG** renders top-left; if missing, fallback to `assets/logo_text.png`, then inline SVG.
- [ ] Tag on the right: **PRO** (red) + **aktivno** (teal).
- [ ] Theme colors: background `#0B0E12`, accents teal `#66E6A8`, orange `#FFA94D`.

## 2) Navigacija (tabs)
- [ ] Donja navigacija ima 4 taba: **Početna**, **Trening**, **Edu**, **Napredak**.
- [ ] Aktivni tab ima blagi glow; svi tabovi reaguju na tap.
- [ ] Vibracija (12 ms) na promjenu taba (gdje podržano).

## 3) Početna (Home cards)
- [ ] 3 kartice: **Tvoj nivo**, **O Kegel vježbama**, **Brzi start**.
- [ ] Kartice imaju suptilnu pozadinsku grafiku (SVG: `card-level.svg`, `card-edu.svg`, `card-quick.svg`).
- [ ] Cijela kartica je klikabilna (bez posebnog dugmeta).
- [ ] **Tvoj nivo** prikazuje: `Dan X • Danas: Y/2 sesije`.
- [ ] Klik na **Tvoj nivo** → otvara **Napredak**.
- [ ] Klik na **O Kegel vježbama** → otvara **Edu**.
- [ ] Klik na **Brzi start** → otvara **Trening**.

## 4) Onboarding (samo prvi put)
- [ ] Pojavi se 3-slajdni overlay (`kp_onboard_v23_done`=false).
- [ ] Slajdovi: (1) Welcome, (2) Kako pomaže, (3) Postavi navike.
- [ ] Dugmad: Dalje/Nazad/Kreni rade ispravno.
- [ ] Zatvaranje postavlja `localStorage.kp_onboard_v23_done = '1'`.

## 5) Trening – UI i kontrola
- [ ] Status iznad prstena: **PRIPREMI SE / STEGNI / ZADRŽI / OPUSTI** (velika slova, narandžasto).
- [ ] U prstenu samo pulsirajući **prsten** + narandžasta **progress** traka oko fiksnog graničnog kruga.
- [ ] **START** (velika, bold, narandžasta) vidljiv prije starta.
- [ ] Prsten je ~30% manji (više prostora oko njega).
- [ ] Pozadinski “plavi puls” ispod prstena prati intenzitet.

### Kontrole
- [ ] **Prvi tap** (na prsten ili “START”) → odmah pokreće sesiju.
- [ ] **Kratki tap** tokom rada → pauza/rezume.
- [ ] **Dugi pritisak (~650 ms)** → stop (prekid bez upisa napretka).
- [ ] Narandžasta progress traka mjeri **cijelu sesiju**, ne pojedinačne faze.

## 6) Rang 1 – Plan i varijacije (auto po danima)
- [ ] Varijacije nisu ručno birane; app odlučuje po danu.
- [ ] **Varijacije (tajming):**
  - Var1: hold **1.0s**, keep **0s**, rest **2.0s**
  - Var2: hold **1.0s**, keep **1.0s**, rest **1.0s**
  - Var3: hold **0.5s**, keep **3.0s**, rest **2.0s**
- [ ] **Distribucija po danima (≈30 ponavljanja/dan):**
  - Dan 1: Var1 × 30
  - Dan 2: Var1 × 30
  - Dan 3: Var1 × 15 + Var2 × 15 (uz popup “upoznavanje var2”) — *popup može biti TODO*
  - Dan 4: Var1 + Var2 (mix) × 30
  - Dan 5: Var1 × 10 + Var2 × 10 + Var3 × 10 (uz popup “upoznavanje var3”)
- [ ] **Countdown** prije starta: 3 sekunde.
- [ ] Intenzitet vizuala: raste tokom STEGNI, zadržava se na ZADRŽI, opada na OPUSTI.

## 7) Napredak (Progress)
- [ ] KPI box-grid pokazuje: **Dan ranga**, **Danas sesije (Y/2)**, **Uzastopni dani (2+/dan)**, **Ukupno sesija**.
- [ ] Traka cilja: 2× dnevno kroz 5 dana → progress % i tekst “Završeni dani: X/5”.
- [ ] Nakon uspješnog završetka sesije, broj “Danas sesije” se povećava i ulazi u računanje cilja.
- [ ] Podaci se čuvaju u `localStorage.kp_state_v23`.

## 8) Edu (Accordion)
- [ ] 10 sekcija: *Šta su Kegel vježbe? • Zašto rade? • Kom je korisno? • Ko treba pauzirati… • Kako naći mišić • Osnovna tehnika u aplikaciji • Šta kažu studije • Česte greške • Plan i motivacija • Napomena*.
- [ ] Samo jedna sekcija otvorena u isto vrijeme (klik na header otvara/zatvara).

## 9) Tehničke stavke
- [ ] `service-worker.js` precache: index + manifest + icons + art + logo.
- [ ] Fallback lanac logotipa radi (Logo.PNG → assets/logo_text.png → inline SVG).
- [ ] Svi SVG/PNG asseti učitavaju se bez 404.
- [ ] `todayKey()` koristi lokalni dan (ISO yyyy-mm-dd).
- [ ] `dayIndexFromStart()` računa Dan 1–5 od `state.r1Start`.
- [ ] `markSessionComplete()`: povećava `state.days[YYYY-MM-DD]` i `state.totals.sessions`.

---

## Quick QA koraci prije objave
1. Otvori app u Incognito → potvrdi da vidiš **Onboarding 1/3**.  
2. Odradi kratku sesiju do kraja → provjeri **Danas sesije: 1/2** na Home i Progress.  
3. Pauziraj i nastavi sesiju (tap), zatim probaj **long-press stop**.  
4. Promijeni tabove i provjeri da **Edu** accordion radi i da se zatvara pri otvaranju drugog odjeljka.  
5. Refresh stranice → potvrdi da se vrijednosti napretka zadržavaju iz `localStorage.kp_state_v23`.  
6. Provjeri header verziju (v23) i glavni logo.

---

## Reference
- **Stabilna tačka u ChatGPT:** `KP-REF-v23` (zatraži “Vrati na KP-REF-v23”).
- **Repo savjet:** tag `v23` + grana `stable` + GitHub Pages na `stable`.
