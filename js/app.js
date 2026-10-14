/* ═══════════════════════════════════════════════════════════════
   Interview Atlas — application logic (vanilla JS, no build step)
   Data comes from /data/*.js via window.ATLAS.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";
  const A = window.ATLAS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const STORAGE_KEY = "interview-atlas-v2";
  const LEGACY_KEY = "interview-atlas-v1";
  const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const LEVEL_COLORS = { Beginner: "#59e1bd", Intermediate: "#6aa8ff", Advanced: "#9a7bff", Expert: "#ff7187" };
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FOCUS = {
    fullstack: ["java", "concurrency", "springboot", "angular", "database", "microservices", "devops", "cicd", "aws", "systemdesign", "projects"],
    backend: ["java", "concurrency", "springboot", "database", "microservices", "kafka", "systemdesign", "aws"],
    frontend: ["angular", "nestjs", "java", "projects", "leadership"],
    cloud: ["cicd", "cloud", "devops", "aws", "microservices", "kafka", "systemdesign"],
    lead: ["systemdesign", "leadership", "projects", "microservices", "cloud", "kafka", "cicd"]
  };

  /* ───────────── State ───────────── */
  let state = loadState();
  let M = new Set(state.mastered), F = new Set(state.favorites);

  function defaultState() {
    return { v: 2, mastered: [], favorites: [], custom: [], theme: "dark", rating: {}, notes: {}, seen: {}, plan: {}, pitch: {}, streak: { last: "", count: 0 }, focus: "all" };
  }
  function loadState() {
    const base = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) return Object.assign(base, saved);
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
      if (legacy) {                                   // migrate custom questions from v1
        const map = { Angular: "angular", Frontend: "angular", "Java & Spring": "java", Databases: "database", "Cloud & DevOps": "devops", Behavioral: "leadership", "System Design": "systemdesign", Backend: "springboot", Security: "springboot", Testing: "springboot" };
        base.theme = legacy.theme || "dark";
        base.custom = (legacy.custom || []).map(q => ({ id: q.id, track: map[q.category] || "java", level: q.difficulty === "Beginner" ? "Beginner" : q.difficulty === "Advanced" ? "Advanced" : "Intermediate", topic: "Custom", q: q.q, answer: q.answer, takeaway: q.takeaway || "", custom: true }));
      }
    } catch (e) { /* storage unavailable or corrupt: start fresh */ }
    return base;
  }
  function save() {
    state.mastered = [...M]; state.favorites = [...F];
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  /* ───────────── Data helpers ───────────── */
  const tracks = () => A.tracks.slice().sort((a, b) => (a.extra ? 1 : 0) - (b.extra ? 1 : 0) || a.order - b.order);
  const trackById = id => A.tracks.find(t => t.id === id);
  function allQuestions() {
    const custom = state.custom.filter(c => trackById(c.track)).map((c, i) => Object.assign({ n: 900 + i, topic: "Custom" }, c));
    return A.questions.concat(custom);
  }
  let QINDEX = new Map();
  function reindex() { QINDEX = new Map(allQuestions().map(q => [q.id, q])); }
  const qById = id => QINDEX.get(id);
  const trackQuestions = id => allQuestions().filter(q => q.track === id);
  function trackStats(id) {
    const qs = trackQuestions(id), m = qs.filter(q => M.has(q.id)).length;
    return { total: qs.length, mastered: m, pct: qs.length ? Math.round(m / qs.length * 100) : 0, qs };
  }

  /* ───────────── Utilities ───────────── */
  function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  function today(offset = 0) { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); }
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2600); }
  function ringOffset(pct) { return 327 * (1 - Math.max(0, Math.min(100, pct)) / 100); }
  function confetti() {
    if (REDUCED) return;
    const host = $("#confetti"), colors = ["#9a7bff", "#59e1bd", "#ffb36b", "#ff7187", "#6aa8ff", "#ffd36b"];
    for (let i = 0; i < 90; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--dx", (Math.random() * 200 - 100) + "px");
      p.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
      p.style.animationDuration = (1.8 + Math.random() * 1.6) + "s";
      p.style.animationDelay = Math.random() * .4 + "s";
      host.appendChild(p);
    }
    setTimeout(() => (host.innerHTML = ""), 4200);
  }
  function touchStreak() {
    const t = today();
    if (state.streak.last === t) return;
    state.streak.count = state.streak.last === today(-1) ? state.streak.count + 1 : 1;
    state.streak.last = t; save(); renderStreak();
    if (state.streak.count > 1) toast(`🔥 ${state.streak.count}-day practice streak!`);
  }
  function currentStreak() { const s = state.streak; return s.last === today() || s.last === today(-1) ? s.count : 0; }
  function renderStreak() {
    const c = currentStreak();
    $("#streakCount").textContent = c; $("#streakPill").classList.toggle("hot", c >= 3);
    $("#statStreak").dataset.target = c; if ($("#statStreak").dataset.done) $("#statStreak").textContent = c;
  }

  /* ───────────── Mini markdown + syntax highlighting ───────────── */
  const KW = {
    java: "abstract assert boolean break byte case catch char class continue default do double else enum extends final finally float for if implements import instanceof int interface long new package private protected public return short static super switch synchronized this throw throws transient try void volatile while var record sealed permits yield when true false null",
    ts: "abstract any as async await boolean break case catch class const constructor continue default delete do else enum export extends false finally for from function if implements import in instanceof interface let new null number of private protected public readonly return static string super switch this throw true try type typeof undefined var void while",
    sql: "select from where and or not in is null join inner left right full outer cross on group by having order asc desc limit offset insert into values update set delete create table index unique primary key foreign references as with recursive union all distinct case when then else end exists between like over partition rank dense_rank row_number count sum avg min max returning conflict do nothing lateral filter using concurrently include materialized view refresh begin commit rollback for skip locked nulls first last true false coalesce rows preceding current row merge matched",
    groovy: "pipeline agent stages stage steps post always success failure environment options parameters when branch script def call node parallel input timeout true false null return withCredentials sh echo",
    bash: "if then fi else for do done in echo export sudo cd docker kubectl aws git mvn npm curl",
    yaml: "true false null",
    docker: "FROM AS WORKDIR COPY ADD RUN ENV ARG EXPOSE USER HEALTHCHECK ENTRYPOINT CMD LABEL VOLUME",
    nginx: "server location listen proxy_pass proxy_set_header upstream root try_files proxy_http_version proxy_read_timeout keepalive"
  };
  const LANG = { java: "java", kotlin: "java", ts: "ts", typescript: "ts", js: "ts", javascript: "ts", html: "ts", sql: "sql", groovy: "groovy", bash: "bash", sh: "bash", shell: "bash", yaml: "yaml", yml: "yaml", dockerfile: "docker", nginx: "nginx", json: "yaml" };
  function highlight(code, lang) {
    const L = LANG[(lang || "").toLowerCase()] || "";
    const kw = new Set((KW[L] || "").split(" ").filter(Boolean));
    const ci = L === "sql";
    const slash = ["java", "ts", "groovy"].includes(L), hash = ["bash", "yaml", "docker", "nginx"].includes(L), dash = L === "sql";
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(#[^\n]*)|(--[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(@[A-Za-z_][\w.]*)|(\b\d[\d_.]*[a-zA-Z%]*\b)|([A-Za-z_$][\w$-]*)/g;
    let out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      const [tok, c1, c2, c3, str, ann, num, word] = m;
      let cls = "";
      if (c1) { if (slash || c1.startsWith("/*")) cls = "tok-c"; else { out += esc(tok[0]); last = re.lastIndex = m.index + 1; continue; } }
      else if (c2) { if (hash && (m.index === 0 || /\s/.test(code[m.index - 1]))) cls = "tok-c"; else { out += esc(tok[0]); last = re.lastIndex = m.index + 1; continue; } }
      else if (c3) { if (dash) cls = "tok-c"; else { out += esc(tok[0]); last = re.lastIndex = m.index + 1; continue; } }
      else if (str) cls = "tok-s";
      else if (ann) cls = "tok-a";
      else if (num) cls = "tok-n";
      else if (word) {
        if (kw.has(ci ? word.toLowerCase() : word)) cls = "tok-k";
        else if ((L === "java" || L === "ts") && /^[A-Z][A-Za-z0-9]*$/.test(word)) cls = "tok-t";
      }
      out += cls ? `<span class="${cls}">${esc(tok)}</span>` : esc(tok);
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }
  function inline(s) {
    return esc(s)
      .replace(/‹([^›]+)›/g, '<code class="inline">$1</code>')
      .replace(/`([^`]+)`/g, '<code class="inline">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }
  function codeBlock(b) {
    const lang = b.lang || "code";
    return `<div class="code-block"><div class="code-head"><span>${esc(lang)}</span><button class="copy-btn" data-copy>Copy</button></div><pre><code>${highlight(b.code, b.lang)}</code></pre></div>`;
  }
  function md(src) {
    const blocks = [];
    const text = String(src || "").replace(/\r/g, "").replace(/(?:~~~|```)([\w-]*)\n([\s\S]*?)\n?(?:~~~|```)/g, (m0, lang, code) => { blocks.push({ lang, code }); return `\u0000${blocks.length - 1}\u0000`; });
    let html = "", para = [], list = null;
    const flushP = () => { if (para.length) { html += `<p>${inline(para.join(" "))}</p>`; para = []; } };
    const flushL = () => { if (list) { html += `<${list.t}>${list.items.map(i => `<li>${inline(i)}</li>`).join("")}</${list.t}>`; list = null; } };
    for (const raw of text.split("\n")) {
      const line = raw.trimEnd(); let m;
      if ((m = line.match(/^\s*\u0000(\d+)\u0000\s*$/))) { flushP(); flushL(); html += codeBlock(blocks[+m[1]]); continue; }
      if (!line.trim()) { flushP(); flushL(); continue; }
      if ((m = line.match(/^\s*[-*•] (.*)$/))) { flushP(); if (!list || list.t !== "ul") { flushL(); list = { t: "ul", items: [] }; } list.items.push(m[1]); continue; }
      if ((m = line.match(/^\s*\d+[.)] (.*)$/))) { flushP(); if (!list || list.t !== "ol") { flushL(); list = { t: "ol", items: [] }; } list.items.push(m[1]); continue; }
      if (list && /^\s{2,}\S/.test(raw)) { list.items[list.items.length - 1] += " " + line.trim(); continue; }
      flushL(); para.push(line.trim());
    }
    flushP(); flushL();
    return html;
  }
  function plain(src) {
    return String(src || "").replace(/(?:~~~|```)[\s\S]*?(?:~~~|```)/g, " (code example) ").replace(/[‹›`]/g, "").replace(/\*\*/g, "").replace(/^\s*[-*•] /gm, "").replace(/\s+/g, " ").trim();
  }
  function summary(q, max = 230) {
    const first = String(q.answer).replace(/\r/g, "").split(/\n\s*\n/)[0];
    const s = plain(first.startsWith("~~~") ? q.takeaway || q.answer : first);
    return s.length > max ? s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : s;
  }

  /* ───────────── Speech ───────────── */
  function speak(text) {
    if (!("speechSynthesis" in window)) { toast("Speech narration isn't supported in this browser."); return; }
    const synth = window.speechSynthesis; synth.cancel();
    const voices = synth.getVoices(), chosen = voices.find(v => v.name === $("#voiceSelect").value);
    const chunks = (plain(text).match(/[^.!?]+[.!?]*/g) || []).reduce((acc, s) => { const last = acc[acc.length - 1]; if (last && (last + s).length < 220) acc[acc.length - 1] = last + s; else acc.push(s); return acc; }, []);
    chunks.forEach(c => {
      const u = new SpeechSynthesisUtterance(c.trim());
      u.rate = Number($("#speechRate").value || 1);
      if (chosen) { u.voice = chosen; u.lang = chosen.lang; } else u.lang = "en-US";
      synth.speak(u);
    });
  }
  function stopSpeech() { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }
  function populateVoices() {
    if (!("speechSynthesis" in window)) return;
    const sel = $("#voiceSelect"), prev = localStorage.getItem("interviewAtlasVoice") || sel.value;
    const voices = speechSynthesis.getVoices().slice().sort((a, b) => (/en/i.test(b.lang) - /en/i.test(a.lang)) || a.name.localeCompare(b.name));
    sel.innerHTML = '<option value="">System default voice</option>' + voices.map(v => `<option value="${esc(v.name)}">${esc(v.name)} (${esc(v.lang)})</option>`).join("");
    if (voices.some(v => v.name === prev)) sel.value = prev;
  }
  const speakQuestion = q => speak(`${q.q}. ${plain(q.answer)} Key takeaway: ${q.takeaway || ""}`);

  /* ───────────── Progress actions ───────────── */
  function setMastered(id, on) {
    const had = M.has(id);
    on ? M.add(id) : M.delete(id);
    if (on) state.rating[id] = 2; else if (state.rating[id] === 2) delete state.rating[id];
    save(); touchStreak(); refreshProgress();
    if (on && !had) {
      const total = M.size;
      if ([10, 25, 50, 100, 200, 300, 400, 500].includes(total)) { confetti(); toast(`🏆 ${total} questions mastered!`); }
      const q = qById(id); if (q) { const s = trackStats(q.track); if (s.mastered === s.total) { confetti(); toast(`🎉 ${trackById(q.track).title} track complete!`); } }
    }
  }
  function setSaved(id, on) { on ? F.add(id) : F.delete(id); save(); refreshProgress(); }
  function setRating(id, r) {
    state.rating[id] = r;
    if (r === 2) M.add(id); else M.delete(id);
    save(); touchStreak(); refreshProgress();
  }
  function refreshProgress() {
    renderTrackGrid(false); renderOverall(); renderHeroStats();
    if (route.view === "track") { renderTrackHeader(); renderSide(); updateCards(); }
  }

  /* ───────────── Home: hero ───────────── */
  const HERO_WORDS = ["Master Spring Boot.", "Explain Kafka.", "Design microservices.", "Tune PostgreSQL.", "Ship with Jenkins.", "Architect on AWS.", "Think in signals.", "Lead with confidence."];
  function startHeroWords() {
    let i = 0; const el = $("#heroWord");
    setInterval(() => {
      if (document.hidden) return;
      el.classList.add("swap");
      setTimeout(() => { i = (i + 1) % HERO_WORDS.length; el.textContent = HERO_WORDS[i]; el.classList.remove("swap"); }, 350);
    }, 2800);
  }
  function renderOrbit() {
    const core = tracks().filter(t => !t.extra), ring = $("#orbitRing");
    ring.innerHTML = core.map((t, i) => {
      const a = (i / core.length) * Math.PI * 2 - Math.PI / 2, r = 46;
      return `<a class="orbit-node" href="#/track/${t.id}" style="--c:${t.color};left:${50 + r * Math.cos(a)}%;top:${50 + r * Math.sin(a)}%" aria-label="${esc(t.title)}"><span>${t.icon}<small>${esc(t.title)}</small></span></a>`;
    }).join("");
  }
  function renderHeroStats() {
    const all = allQuestions(), pct = Math.round(M.size / Math.max(1, all.length) * 100);
    $("#statQuestions").dataset.target = all.length; $("#statTracks").dataset.target = A.tracks.length;
    $("#statMastery").textContent = pct + "%";
    $("#heroCount").textContent = Math.floor(all.length / 50) * 50 + "+";
    $$("[data-count]").forEach(el => { if (el.dataset.done) el.textContent = el.dataset.target; });
  }
  function countUp(el) {
    const target = Number(el.dataset.target || 0), start = performance.now(), dur = REDUCED ? 1 : 1300;
    const step = now => { const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(target * e); if (p < 1) requestAnimationFrame(step); else el.dataset.done = "1"; };
    requestAnimationFrame(step);
  }

  /* Question of the day */
  let qotd = null;
  function pickQotd(random) {
    const pool = A.questions.filter(q => !["leadership"].includes(q.track) && q.level !== "Beginner");
    if (random) qotd = pool[Math.floor(Math.random() * pool.length)];
    else { let h = 0; for (const c of today()) h = (h * 31 + c.charCodeAt(0)) >>> 0; qotd = pool[h % pool.length]; }
    const t = trackById(qotd.track);
    $("#qotdTrack").innerHTML = `${t.icon} ${esc(t.title)} · ${esc(qotd.level)}`;
    $("#qotdQ").textContent = qotd.q;
    $("#qotdA").hidden = true; $("#qotdA").innerHTML = ""; $("#qotdReveal").textContent = "Reveal answer ↗";
  }

  /* ───────────── Home: tracks grid ───────────── */
  function levelMix(qs) { return LEVELS.map(l => ({ l, n: qs.filter(q => q.level === l).length })); }
  function renderTrackGrid(full = true) {
    const grid = $("#trackGrid");
    if (full || !grid.children.length) {
      grid.innerHTML = tracks().map(t => {
        const s = trackStats(t.id), mix = levelMix(s.qs);
        return `<a class="track-card ${t.extra ? "extra" : ""}" href="#/track/${t.id}" data-track="${t.id}" style="--c:${t.color}">
          <div class="tc-top"><div class="tc-icon">${t.icon}</div><div class="tc-ring"><svg viewBox="0 0 120 120"><circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fg" cx="60" cy="60" r="52" style="stroke-dashoffset:${ringOffset(s.pct)}"/></svg><b>${s.pct}%</b></div></div>
          <div><div class="tc-title">${esc(t.title)}</div><p class="tc-tag">${esc(t.tagline)}</p></div>
          <div class="tc-levels" title="${mix.map(m => `${m.l}: ${m.n}`).join(" · ")}">${mix.filter(m => m.n).map(m => `<i class="lv-${m.l}" style="flex:${m.n}"></i>`).join("")}</div>
          <div class="tc-foot"><span><b>${s.total}</b> questions · <b>${s.mastered}</b> mastered</span><span class="tc-go">Open →</span></div>
        </a>`;
      }).join("");
      applyFocus(); observeReveal($$(".track-card", grid)); bindTilt($$(".track-card", grid));
    } else {
      $$(".track-card", grid).forEach(card => {
        const s = trackStats(card.dataset.track);
        card.querySelector(".ring-fg").style.strokeDashoffset = ringOffset(s.pct);
        card.querySelector(".tc-ring b").textContent = s.pct + "%";
        card.querySelector(".tc-foot span").innerHTML = `<b>${s.total}</b> questions · <b>${s.mastered}</b> mastered`;
      });
    }
  }
  function applyFocus() {
    const f = state.focus || "all", allow = FOCUS[f];
    $$(".focus-chip").forEach(b => b.classList.toggle("active", b.dataset.focus === f));
    $$(".track-card").forEach(c => c.classList.toggle("dim", !!allow && !allow.includes(c.dataset.track)));
  }
  function renderOverall() {
    const all = allQuestions(), pct = Math.round(M.size / Math.max(1, all.length) * 100);
    $("#overallRing").style.strokeDashoffset = ringOffset(pct); $("#overallPct").textContent = pct + "%";
    const [title, text] = pct >= 80 ? ["Interview-ready 🏆", "Keep it sharp with mock interviews and weak-spot revision."] : pct >= 50 ? ["Strong momentum ✨", "Focus on Advanced and Expert questions and run timed mocks."] : pct >= 15 ? ["Building foundations 🧭", "Work track by track; flashcards help lock in recall."] : ["Let's get started", "Open a track, reveal answers, and mark questions you can explain confidently."];
    $("#overallTitle").textContent = title; $("#overallText").textContent = text;
    const mix = levelMix(all);
    $("#levelLegend").innerHTML = mix.map(m => `<span><i style="background:${LEVEL_COLORS[m.l]}"></i>${m.l} · ${m.n}</span>`).join("");
  }

  /* ───────────── Your story ───────────── */
  const SKILLS = [
    ["Java", "java"], ["Multithreading", "concurrency"], ["Spring Boot", "springboot"], ["Hibernate / JPA", "springboot", "JPA"], ["REST APIs", "springboot", "REST"], ["Microservices", "microservices"], ["WebSockets", "kafka", "WebSocket"], ["Kafka", "kafka"], ["NestJS", "nestjs"], ["Node.js", "nestjs", "Node"], ["JWT Auth", "springboot", "JWT"],
    ["PostgreSQL", "database", "PostgreSQL"], ["SQL", "database", "SQL"], ["MongoDB", "database", "MongoDB"], ["MySQL", "database", "MySQL"], ["SQL Server", "database", "SQL Server"],
    ["Maven", "springboot", "Maven"], ["Docker", "devops", "Docker"], ["Jenkins", "devops", "Jenkins"], ["Git", "devops", "Git"], ["CI/CD", "cicd"], ["AWS", "aws"], ["Cloud", "cloud"], ["Nginx", "devops", "Nginx"], ["Linux", "devops", "Linux"],
    ["TypeScript", "angular", "TypeScript"], ["Angular", "angular"], ["RxJS", "angular", "RxJS"], ["Angular Material", "angular", "Material"],
    ["Distributed Systems", "systemdesign"], ["Event-Driven", "microservices", "event"], ["Design Patterns", "java", "pattern"], ["OOP", "java", "OOP"], ["Performance", "springboot", "performance"],
    ["Code Reviews", "leadership", "code review"], ["Unit Testing", "springboot", "test"], ["Agile / Scrum", "leadership", "Agile"], ["Root-Cause Analysis", "leadership", "root"], ["Mentoring", "leadership", "mentor"], ["AI coding tools", "leadership", "AI"]
  ];
  function matchesTerm(q, term) { const t = term.toLowerCase(); return (q.q + " " + q.topic + " " + q.answer).toLowerCase().includes(t); }
  function renderSkills() {
    $("#skillCloud").innerHTML = SKILLS.map(([label, track, term]) => {
      const t = trackById(track); if (!t) return "";
      const n = term ? trackQuestions(track).filter(q => matchesTerm(q, term)).length : trackQuestions(track).length;
      const href = `#/track/${track}` + (term ? `?q=${encodeURIComponent(term)}` : "");
      return `<a class="skill" href="${href}" style="--c:${t.color}">${esc(label)}<small>${n}</small></a>`;
    }).join("");
  }
  const PLAN = [
    { w: "Week 1 · Foundations", items: [["w1a", "Core Java: OOP, strings, collections, Java 8 streams", "java"], ["w1b", "Spring Boot core, REST design & validation", "springboot"], ["w1c", "SQL fundamentals + 10 query-writing problems", "database"], ["w1d", "Angular components, binding, DI, routing & forms", "angular"], ["w1e", "Record your 90-second pitch three times", ""]] },
    { w: "Week 2 · Depth", items: [["w2a", "Java concurrency, JVM memory & GC", "java"], ["w2b", "JPA/Hibernate, N+1, transactions & locking", "springboot"], ["w2c", "Indexes, execution plans, isolation levels", "database"], ["w2d", "RxJS operators, change detection & signals", "angular"], ["w2e", "Daily 10-question quiz (all tracks)", ""]] },
    { w: "Week 3 · Distributed systems", items: [["w3a", "Microservices patterns: resilience, saga, outbox", "microservices"], ["w3b", "Kafka internals + WebSocket alerting", "kafka"], ["w3c", "Dockerfile best practices + Jenkinsfile", "devops"], ["w3d", "AWS: VPC, ECS, RDS, S3, IAM, CloudWatch", "aws"], ["w3e", "Whiteboard a real-time monitoring system", "systemdesign"]] },
    { w: "Week 4 · Lead & mock", items: [["w4a", "Prepare 6 STAR stories (incident, conflict, failure…)", "leadership"], ["w4b", "Project deep-dive questions out loud", "projects"], ["w4c", "Three timed mock interviews", ""], ["w4d", "Weak-spot flashcard revision", ""], ["w4e", "Prepare questions to ask the interviewer", "leadership"]] }
  ];
  function renderPlan() {
    const all = PLAN.flatMap(p => p.items), done = all.filter(i => state.plan[i[0]]).length;
    $("#planPct").textContent = Math.round(done / all.length * 100) + "%";
    $("#planWeeks").innerHTML = PLAN.map(p => `<div class="plan-week"><b>${esc(p.w)}</b>${p.items.map(([id, label, track]) => `<label><input type="checkbox" data-plan="${id}" ${state.plan[id] ? "checked" : ""}><span>${esc(label)}${track ? ` <a class="text-link" href="#/track/${track}">→</a>` : ""}</span></label>`).join("")}</div>`).join("");
  }
  /* Pitch builder: empty fields fall back to the example placeholders */
  const PITCH_FIELDS = ["role", "years", "product", "stack", "win", "past", "goal"];
  function pitchValues() {
    const form = $("#pitchForm"), saved = state.pitch || {};
    return Object.fromEntries(PITCH_FIELDS.map(f => [f, (saved[f] || "").trim() || form.elements[f].placeholder]));
  }
  function renderPitch() {
    const form = $("#pitchForm"), saved = state.pitch || {};
    PITCH_FIELDS.forEach(f => { if (document.activeElement !== form.elements[f]) form.elements[f].value = saved[f] || ""; });
    const v = pitchValues(), article = /^[aeiou]/i.test(v.role) ? "an" : "a";
    const yrs = /^\d+(\.\d+)?$/.test(v.years) ? `${v.years} year${v.years === "1" ? "" : "s"}` : v.years;
    const sentence = s => s.replace(/^\w/, c => c.toUpperCase()).replace(/[.\s]*$/, ".");
    $("#pitchText").textContent = `I'm ${article} ${v.role} with ${yrs} of experience. Right now I build ${v.product}, mainly with ${v.stack}. ${sentence(v.win)} Before that, I worked on ${v.past.replace(/[.\s]*$/, "")}. I'm now looking for ${v.goal.replace(/[.\s]*$/, "")}, which is why this role interests me.`;
    $("#pitchText").classList.toggle("is-example", !PITCH_FIELDS.some(f => (saved[f] || "").trim()));
  }
  let pitchTimer = null;
  function practicePitch() {
    clearInterval(pitchTimer); const box = $("#pitchTimer"); box.hidden = false;
    let left = 90; const tick = () => { $("#pitchTime").textContent = left + " s"; $("#pitchBar").style.width = ((90 - left) / 90 * 100) + "%"; if (left-- <= 0) { clearInterval(pitchTimer); toast("⏱ Time! Did you cover present → past → future?"); } };
    tick(); pitchTimer = setInterval(tick, 1000); touchStreak();
  }

  /* ───────────── Router ───────────── */
  const route = { view: "home" };
  let homeScroll = 0;
  function parseHash() {
    const h = decodeURIComponent(location.hash || "");
    const m = h.match(/^#\/track\/([\w-]+)(?:\/q\/([\w-]+))?(?:\?q=(.*))?$/);
    if (m && trackById(m[1])) return { view: "track", track: m[1], q: m[2] || null, search: m[3] || "" };
    return { view: "home", anchor: h.startsWith("#/") ? "" : h.slice(1) };
  }
  function handleRoute() {
    const r = parseHash(), wasTrack = route.view === "track";
    if (r.view === "track") {
      if (!wasTrack) homeScroll = scrollY;
      const changed = route.track !== r.track || !wasTrack;
      Object.assign(route, r);
      $("#homeView").hidden = true; $("#trackView").hidden = false;
      if (changed) openTrack(r.track, r.search);
      else if (r.search) { $("#tvSearch").value = r.search; tv.search = r.search; renderList(); }
      if (r.q) setTimeout(() => focusQuestion(r.q, true), 0);
      else if (changed) scrollTo({ top: 0, behavior: "instant" in document.documentElement.style ? "instant" : "auto" });
      document.title = `${trackById(r.track).title} · Interview Atlas`;
    } else {
      route.view = "home"; route.track = null;
      $("#trackView").hidden = true; $("#homeView").hidden = false;
      document.title = "Interview Atlas";
      setTimeout(() => {
        const el = r.anchor && document.getElementById(r.anchor);
        if (el) el.scrollIntoView({ behavior: wasTrack ? "auto" : "smooth" });
        else if (wasTrack) scrollTo(0, homeScroll);
      }, 0);
    }
    $("#topnav")?.classList.remove("open");
  }

  /* ───────────── Track view ───────────── */
  const tv = { track: null, level: "all", topic: "all", status: "all", search: "", open: new Set(), focus: -1, list: [] };
  function openTrack(id, search = "") {
    Object.assign(tv, { track: id, level: "all", topic: "all", status: "all", search, open: new Set(), focus: -1 });
    $("#tvSearch").value = search;
    $$("#levelSeg button").forEach(b => b.classList.toggle("active", b.dataset.level === "all"));
    $("#statusFilter").value = "all";
    const t = trackById(id);
    $("#trackHero").style.setProperty("--c", t.color); $("#trackHero").dataset.icon = t.icon;
    $("#trackView").style.setProperty("--c", t.color);
    $("#tvIcon").textContent = t.icon; $("#tvTitle").textContent = t.title; $("#tvBlurb").textContent = t.blurb;
    renderTrackHeader(); renderSide(); renderList();
  }
  function renderTrackHeader() {
    const s = trackStats(tv.track);
    $("#tvRing").style.strokeDashoffset = ringOffset(s.pct); $("#tvPct").textContent = s.pct + "%"; $("#tvCounts").textContent = `${s.mastered} / ${s.total} mastered`;
  }
  function topicsOf(id) {
    const map = new Map();
    trackQuestions(id).forEach(q => { const e = map.get(q.topic) || { n: 0, m: 0 }; e.n++; if (M.has(q.id)) e.m++; map.set(q.topic, e); });
    return [...map.entries()];
  }
  function renderSide() {
    const topics = topicsOf(tv.track), total = trackQuestions(tv.track).length;
    const item = (key, label, n, m) => `<button class="topic-item ${tv.topic === key ? "active" : ""}" data-topic="${esc(key)}"><span>${esc(label)}</span><span class="topic-mini"><i style="width:${n ? m / n * 100 : 0}%"></i></span><small>${n}</small></button>`;
    $("#topicList").innerHTML = item("all", "All topics", total, trackStats(tv.track).mastered) + topics.map(([k, e]) => item(k, k, e.n, e.m)).join("");
    $("#topicChips").innerHTML = [["all", total], ...topics.map(([k, e]) => [k, e.n])].map(([k, n]) => `<button class="${tv.topic === k ? "active" : ""}" data-topic="${esc(k)}">${esc(k === "all" ? "All" : k)} · ${n}</button>`).join("");
    const qs = trackQuestions(tv.track);
    $("#levelBars").innerHTML = LEVELS.map(l => { const ql = qs.filter(q => q.level === l), m = ql.filter(q => M.has(q.id)).length; return ql.length ? `<div><span>${l} · ${m}/${ql.length}</span><div class="bar"><i style="width:${m / ql.length * 100}%;background:${LEVEL_COLORS[l]}"></i></div></div>` : ""; }).join("");
  }
  function filtered() {
    const term = tv.search.trim().toLowerCase(), words = term.split(/\s+/).filter(Boolean);
    return trackQuestions(tv.track).filter(q => {
      if (tv.level !== "all" && q.level !== tv.level) return false;
      if (tv.topic !== "all" && q.topic !== tv.topic) return false;
      const r = state.rating[q.id];
      if (tv.status === "unseen" && state.seen[q.id]) return false;
      if (tv.status === "review" && !(r === 0 || r === 1)) return false;
      if (tv.status === "saved" && !F.has(q.id)) return false;
      if (tv.status === "mastered" && !M.has(q.id)) return false;
      if (tv.status === "todo" && M.has(q.id)) return false;
      if (words.length) { const hay = (q.q + " " + q.topic + " " + q.answer + " " + q.takeaway).toLowerCase(); return words.every(w => hay.includes(w)); }
      return true;
    });
  }
  function cardHTML(q, i) {
    const t = trackById(q.track);
    return `<article class="q-card ${M.has(q.id) ? "mastered" : ""}" id="q-${q.id}" data-id="${q.id}" style="--c:${t.color};animation-delay:${REDUCED ? 0 : Math.min(i * 28, 420)}ms">
      <button class="q-head" aria-expanded="false" aria-controls="qb-${q.id}">
        <span class="q-num">${String(q.n).padStart(2, "0")}</span>
        <span><span class="q-title">${esc(q.q)}</span><span class="q-meta"><span class="lvl ${q.level}">${q.level}</span><span class="topic-tag">${esc(q.topic)}</span>${q.custom ? '<span class="topic-tag">custom</span>' : ""}</span></span>
        <span class="q-flags"><span class="flag-save">${F.has(q.id) ? "♥" : ""}</span><span class="flag-master">${M.has(q.id) ? "✓" : ""}</span><span class="q-chevron">⌄</span></span>
      </button>
      <div class="q-body" id="qb-${q.id}"><div><div class="q-inner"></div></div></div>
    </article>`;
  }
  function innerHTML(q) {
    const r = state.rating[q.id];
    return `${realCard(q)}<div class="answer-body">${md(q.answer)}</div>
      ${q.takeaway ? `<div class="takeaway"><b>Remember</b><span>${inline(q.takeaway)}</span></div>` : ""}
      <div class="q-actions">
        <button class="q-act walk" data-act="walk">▶ Walkthrough</button>
        <button class="q-act master ${M.has(q.id) ? "on" : ""}" data-act="master">${M.has(q.id) ? "✓ Mastered" : "○ Mark mastered"}</button>
        <button class="q-act save ${F.has(q.id) ? "on" : ""}" data-act="save">${F.has(q.id) ? "♥ Saved" : "♡ Save"}</button>
        <button class="q-act" data-act="speak">🔊 Listen</button>
        <button class="q-act" data-act="link">🔗 Copy link</button>
        ${q.custom ? '<button class="q-act" data-act="delete" style="color:var(--red)">Delete</button>' : ""}
        <span class="q-rate">How did you do?<button data-rate="0" class="${r === 0 ? "on" : ""}">Missed</button><button data-rate="1" class="${r === 1 ? "on" : ""}">Partial</button><button data-rate="2" class="${r === 2 ? "on" : ""}">Nailed</button></span>
      </div>
      <label class="notes"><span class="tiny-label">MY NOTES · saved automatically</span><textarea data-note placeholder="Add an example from your own project, a follow-up question you were asked, or a mnemonic…">${esc(state.notes[q.id] || "")}</textarea></label>`;
  }
  const REAL_ICONS = ["🏪", "🚦", "🍳", "📦", "🏦", "🚆", "🏥", "🎟", "🧑‍🍳", "🏗"];
  function realCard(q) {
    if (!q.real) return "";
    const icon = REAL_ICONS[[...q.id].reduce((h, c) => h + c.charCodeAt(0), 0) % REAL_ICONS.length];
    return `<div class="real-card"><span class="real-icon">${icon}</span><div><span class="tiny-label">REAL-LIFE EXAMPLE</span><p>${inline(q.real)}</p></div></div>`;
  }
  /* Animated walkthrough: steps through each paragraph / bullet / code block of an answer */
  let walk = null;
  function stopWalk() {
    if (!walk) return; clearTimeout(walk.t); stopSpeech();
    walk.parts.forEach(p => p.classList.remove("walk-on", "walk-dim"));
    walk.btn.textContent = "▶ Walkthrough"; walk.btn.classList.remove("on"); walk.root.classList.remove("walking"); walk = null;
  }
  function startWalk(card, btn) {
    if (walk && walk.btn === btn) return stopWalk();
    stopWalk();
    const root = card.querySelector(".q-inner");
    const parts = [...root.querySelectorAll(".real-card, .answer-body > p, .answer-body li, .answer-body .code-block, .takeaway")];
    if (!parts.length) return;
    walk = { parts, i: -1, btn, root, t: null };
    btn.textContent = "■ Stop"; btn.classList.add("on"); root.classList.add("walking");
    const narrate = $("#walkVoice")?.checked;
    const step = () => {
      if (!walk) return;
      walk.i++;
      if (walk.i >= parts.length) { stopWalk(); toast("Walkthrough complete ✓ — now explain it in your own words"); return; }
      parts.forEach((p, k) => { p.classList.toggle("walk-on", k === walk.i); p.classList.toggle("walk-dim", k > walk.i); });
      const el = parts[walk.i]; el.scrollIntoView({ behavior: "smooth", block: "center" });
      const text = el.classList.contains("code-block") ? "" : el.innerText;
      if (narrate && text) speak(text);
      walk.t = setTimeout(step, el.classList.contains("code-block") ? 6000 : Math.min(9000, 1800 + text.length * 38));
    };
    step();
  }
  function renderList() {
    stopWalk();
    const list = filtered(); tv.list = list; tv.focus = -1;
    $("#qList").innerHTML = list.map(cardHTML).join("");
    $("#tvEmpty").hidden = list.length > 0;
    const total = trackQuestions(tv.track).length;
    $("#tvResult").textContent = list.length === total ? `${total} questions · tap a question to reveal the model answer` : `Showing ${list.length} of ${total} questions`;
    $$("#topicList .topic-item, #topicChips button").forEach(b => b.classList.toggle("active", b.dataset.topic === tv.topic));
    $("#expandAll").textContent = "Expand all";
    tv.open.forEach(id => { if (list.some(q => q.id === id)) toggleCard(id, true, false); });
  }
  function updateCards() {
    $$(".q-card").forEach(card => {
      const id = card.dataset.id, m = M.has(id), f = F.has(id), r = state.rating[id];
      card.classList.toggle("mastered", m);
      card.querySelector(".flag-master").textContent = m ? "✓" : ""; card.querySelector(".flag-save").textContent = f ? "♥" : "";
      const mb = card.querySelector('[data-act="master"]');
      if (mb) {
        mb.classList.toggle("on", m); mb.textContent = m ? "✓ Mastered" : "○ Mark mastered";
        const sb = card.querySelector('[data-act="save"]'); sb.classList.toggle("on", f); sb.textContent = f ? "♥ Saved" : "♡ Save";
        card.querySelectorAll("[data-rate]").forEach(b => b.classList.toggle("on", Number(b.dataset.rate) === r));
      }
    });
  }
  function toggleCard(id, force, scroll = true) {
    const card = document.getElementById("q-" + id); if (!card) return;
    const open = force ?? !card.classList.contains("open"), q = qById(id), inner = card.querySelector(".q-inner");
    if (open && !inner.dataset.ready) { inner.innerHTML = innerHTML(q); inner.dataset.ready = "1"; }
    card.classList.toggle("open", open); card.querySelector(".q-head").setAttribute("aria-expanded", open);
    if (open) { tv.open.add(id); if (!state.seen[id]) { state.seen[id] = 1; save(); } touchStreak(); if (scroll) setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120); }
    else { tv.open.delete(id); if (walk && walk.root === inner) stopWalk(); }
  }
  function focusQuestion(id, open) {
    if (!document.getElementById("q-" + id)) { tv.level = "all"; tv.topic = "all"; tv.status = "all"; tv.search = ""; $("#tvSearch").value = ""; $("#statusFilter").value = "all"; $$("#levelSeg button").forEach(b => b.classList.toggle("active", b.dataset.level === "all")); renderList(); }
    const card = document.getElementById("q-" + id); if (!card) return;
    if (open) toggleCard(id, true, false);
    tv.focus = tv.list.findIndex(q => q.id === id); markFocus();
    setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }
  function markFocus() { $$(".q-card").forEach((c, i) => c.classList.toggle("focused", i === tv.focus)); }
  function moveFocus(d) {
    if (!tv.list.length) return;
    tv.focus = Math.max(0, Math.min(tv.list.length - 1, tv.focus + d)); markFocus();
    $$(".q-card")[tv.focus].scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function shareLink(id) { const q = qById(id); return `${location.origin}${location.pathname}#/track/${q.track}/q/${id}`; }
  async function copyText(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg); }
    catch (e) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast(msg); } catch (e2) { toast("Copy failed"); } ta.remove(); }
  }

  /* ───────────── Practice ───────────── */
  const P = { mode: "quiz", items: [], i: 0, score: 0, answered: false, results: [], timer: null, left: 0, flipped: false };
  const MODE_INFO = {
    quiz: ["⚡", "Quick-fire quiz", "Pick the strongest answer from four options. Instant feedback with the full model answer after each question."],
    flash: ["🃏", "Flip-card revision", "See the question, answer it in your head, flip to check. 'Got it' marks it mastered; 'Again' sends it to the back of the deck."],
    mock: ["🎙", "Timed mock interview", "Answer out loud against the clock (time scales with difficulty), reveal the model answer, then grade yourself honestly."]
  };
  function populatePracticeTracks() {
    const opts = `<option value="all">All tracks</option><option value="core">Core 7 tracks</option><option value="saved">♥ Saved questions</option><option value="review">⟲ Needs review</option>` + tracks().map(t => `<option value="${t.id}">${t.icon} ${esc(t.title)}</option>`).join("");
    $("#practiceTrack").innerHTML = opts;
    $("#newTrack").innerHTML = tracks().map(t => `<option value="${t.id}">${esc(t.title)}</option>`).join("");
  }
  function setMode(mode) {
    P.mode = mode; clearInterval(P.timer);
    $$(".ptab").forEach(b => { const on = b.dataset.mode === mode; b.classList.toggle("active", on); b.setAttribute("aria-selected", on); });
    const [icon, title, text] = MODE_INFO[mode];
    $("#practiceStage").innerHTML = `<div class="practice-intro"><div class="intro-orb">${icon}</div><h3>${title}</h3><p>${text}</p></div>`;
  }
  function practicePool() {
    const tr = $("#practiceTrack").value, lv = $("#practiceLevel").value, skip = $("#practiceUnmastered").checked;
    let pool = allQuestions();
    if (tr === "core") pool = pool.filter(q => !trackById(q.track).extra);
    else if (tr === "saved") pool = pool.filter(q => F.has(q.id));
    else if (tr === "review") pool = pool.filter(q => state.rating[q.id] === 0 || state.rating[q.id] === 1 || F.has(q.id));
    else if (tr !== "all") pool = pool.filter(q => q.track === tr);
    if (lv !== "all") pool = pool.filter(q => q.level === lv);
    if (skip) pool = pool.filter(q => !M.has(q.id));
    if (P.mode === "quiz") pool = pool.filter(q => !q.custom);
    return shuffle(pool).slice(0, Number($("#practiceCount").value));
  }
  function startPractice() {
    clearInterval(P.timer); stopSpeech();
    const items = practicePool();
    if (!items.length) { toast("No questions match those settings — try widening the filters."); return; }
    Object.assign(P, { items, i: 0, score: 0, answered: false, results: [], flipped: false });
    touchStreak();
    ({ quiz: renderQuiz, flash: renderFlash, mock: renderMock })[P.mode]();
  }
  function stageTop(extra = "") {
    const q = P.items[P.i], t = trackById(q.track);
    return `<div class="pq-top"><span>QUESTION ${P.i + 1} OF ${P.items.length}</span><span class="chip" style="border-color:${t.color}">${t.icon} ${esc(t.title)} · ${q.level}</span><span>${extra}</span></div><div class="bar"><i style="width:${P.i / P.items.length * 100}%"></i></div>`;
  }
  // Quiz
  function quizOptions(q) {
    const correct = summary(q, 210);
    const seen = new Set([correct]);
    const pick = list => shuffle(list.filter(x => x.id !== q.id && !x.custom)).map(x => summary(x, 210)).filter(s => !seen.has(s) && seen.add(s));
    let wrong = pick(trackQuestions(q.track)).slice(0, 3);
    if (wrong.length < 3) wrong = wrong.concat(pick(A.questions).slice(0, 3 - wrong.length));
    return shuffle([{ text: correct, ok: true }, ...wrong.map(text => ({ text, ok: false }))]);
  }
  function renderQuiz() {
    const q = P.items[P.i]; P.answered = false; P.options = quizOptions(q);
    $("#practiceStage").innerHTML = `<div>${stageTop("SCORE " + P.score)}<h3 class="pq-question">${esc(q.q)}</h3>
      <div class="quiz-options">${P.options.map((o, i) => `<button class="quiz-option" data-opt="${i}"><b>${"ABCD"[i]}.</b>${esc(o.text)}</button>`).join("")}</div>
      <div id="quizFeedback"></div></div>`;
  }
  function chooseQuiz(i) {
    if (P.answered) return; P.answered = true;
    const q = P.items[P.i], o = P.options[i];
    if (o.ok) P.score++;
    P.results.push({ q, ok: o.ok });
    $$(".quiz-option").forEach((b, k) => { b.disabled = true; if (P.options[k].ok) b.classList.add("correct"); else if (k === i) b.classList.add("incorrect"); });
    $("#quizFeedback").innerHTML = `<div class="feedback"><b>${o.ok ? "✓ Correct — nice reasoning." : "✗ Not quite — here's the model answer."}</b>${realCard(q)}<div class="answer-body">${md(q.answer)}</div>${q.takeaway ? `<div class="takeaway" style="--c:${trackById(q.track).color};margin-top:10px"><b>Remember</b><span>${inline(q.takeaway)}</span></div>` : ""}</div>
      <div class="row-gap" style="margin-top:14px"><button class="button button-primary" id="quizNext">${P.i === P.items.length - 1 ? "See results →" : "Next question →"}</button><a class="button button-quiet" href="#/track/${q.track}/q/${q.id}">Open in track ↗</a></div>`;
    $(".pq-top span:last-child").textContent = "SCORE " + P.score;
    $("#quizNext").focus({ preventScroll: true });
  }
  function nextQuiz() { if (P.i < P.items.length - 1) { P.i++; renderQuiz(); $("#practice").scrollIntoView({ behavior: "smooth", block: "start" }); } else finishPractice(); }
  // Flashcards
  function renderFlash() {
    if (P.i >= P.items.length) return finishPractice();
    const q = P.items[P.i], t = trackById(q.track); P.flipped = false;
    $("#practiceStage").innerHTML = `<div class="flash-wrap">${stageTop("✓ " + P.score)}
      <div class="flashcard" id="flashcard" tabindex="0" role="button" aria-label="Flip card">
        <div class="flash-inner">
          <div class="flash-face flash-front"><span class="chip" style="align-self:center">${t.icon} ${esc(t.title)} · ${q.level}</span><h3>${esc(q.q)}</h3><span class="flash-hint">Click or press Space to flip</span></div>
          <div class="flash-face flash-back"><span class="tiny-label">KEY TAKEAWAY</span><div class="takeaway-big">${inline(q.takeaway || summary(q, 120))}</div><p class="muted">${esc(summary(q, 300))}</p>${q.real ? `<p class="flash-real">🌍 ${inline(q.real)}</p>` : ""}<a class="text-link" href="#/track/${q.track}/q/${q.id}">Open full answer ↗</a></div>
        </div>
      </div>
      <div class="flash-actions"><button class="button button-quiet" data-flash="prev">← Back</button><button class="button button-quiet" data-flash="flip">↻ Flip</button><button class="button button-quiet again" data-flash="again">✗ Again</button><button class="button button-quiet gotit" data-flash="got">✓ Got it</button><button class="button button-quiet" data-flash="speak">🔊</button></div></div>`;
  }
  function flashAction(a) {
    const q = P.items[P.i]; if (!q) return;
    if (a === "flip") { P.flipped = !P.flipped; $("#flashcard").classList.toggle("flipped", P.flipped); }
    else if (a === "prev") { if (P.i > 0) { P.i--; renderFlash(); } }
    else if (a === "again") { setRating(q.id, 0); P.results.push({ q, ok: false }); P.items.push(q); P.i++; renderFlash(); }
    else if (a === "got") { setRating(q.id, 2); P.results.push({ q, ok: true }); P.score++; P.i++; renderFlash(); }
    else if (a === "speak") speak(P.flipped ? `${q.takeaway}. ${summary(q, 400)}` : q.q);
  }
  // Mock interview
  const MOCK_TIME = { Beginner: 60, Intermediate: 90, Advanced: 120, Expert: 150 };
  function renderMock() {
    clearInterval(P.timer);
    if (P.i >= P.items.length) return finishPractice();
    const q = P.items[P.i]; P.left = MOCK_TIME[q.level] || 90; P.total = P.left; P.revealed = false;
    $("#practiceStage").innerHTML = `<div>${stageTop("ANSWER OUT LOUD")}
      <div class="mock-grid"><div><h3 class="pq-question">${esc(q.q)}</h3>
        <p class="muted small">Structure: define → explain → example from your projects → trade-offs.</p>
        <div class="row-gap" style="margin-top:14px"><button class="button button-primary" id="mockReveal">Reveal model answer</button><button class="button button-quiet" id="mockSpeak">🔊 Read question</button><button class="button button-quiet" id="mockSkip">Skip →</button></div>
        <div id="mockAnswer"></div></div>
        <div class="timer running" id="mockTimer"><svg viewBox="0 0 120 120"><circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fg" cx="60" cy="60" r="52" style="stroke-dashoffset:0"/></svg><b>${fmt(P.left)}</b></div>
      </div></div>`;
    P.timer = setInterval(() => {
      P.left--; const el = $("#mockTimer"); if (!el) return clearInterval(P.timer);
      el.querySelector("b").textContent = fmt(P.left);
      el.querySelector(".ring-fg").style.strokeDashoffset = 327 * Math.min(1, (P.total - P.left) / P.total);
      el.classList.toggle("warn", P.left <= 20 && P.left > 0); el.classList.toggle("over", P.left <= 0);
      if (P.left === 0) toast("⏱ Time's up — wrap up your answer");
    }, 1000);
  }
  function fmt(s) { const a = Math.abs(s); return (s < 0 ? "+" : "") + Math.floor(a / 60) + ":" + String(a % 60).padStart(2, "0"); }
  function revealMock() {
    if (P.revealed) return; P.revealed = true; clearInterval(P.timer); $("#mockTimer")?.classList.remove("running");
    const q = P.items[P.i];
    $("#mockAnswer").innerHTML = `<div class="feedback">${realCard(q)}<div class="answer-body" style="--c:${trackById(q.track).color}">${md(q.answer)}</div></div>
      <p class="muted small" style="margin-top:12px">How did your answer compare?</p>
      <div class="grade-row"><button class="grade g0" data-grade="0">✗ Missed it</button><button class="grade g1" data-grade="1">◐ Partially</button><button class="grade g2" data-grade="2">✓ Nailed it</button></div>`;
    $("#mockReveal").disabled = true;
  }
  function gradeMock(g) {
    const q = P.items[P.i]; setRating(q.id, g); if (g < 2) setSaved(q.id, true);
    P.results.push({ q, ok: g === 2, grade: g, time: P.total - P.left }); if (g === 2) P.score++;
    P.i++; renderMock();
  }
  function finishPractice() {
    clearInterval(P.timer);
    const n = P.mode === "flash" ? new Set(P.results.map(r => r.q.id)).size : P.items.length;
    const pct = P.score / Math.max(1, n);
    const label = P.mode === "quiz" ? "correct" : P.mode === "flash" ? "got it" : "nailed";
    const missed = [...new Map(P.results.filter(r => !r.ok).map(r => [r.q.id, r])).values()];
    $("#practiceStage").innerHTML = `<div class="result-card">
      <div class="intro-orb">${pct >= .8 ? "🏆" : pct >= .5 ? "✨" : "🧭"}</div>
      <div class="result-score">${P.score}/${n}</div>
      <h3>${pct >= .8 ? "Strong signal!" : pct >= .5 ? "Good progress." : "Keep building the foundations."}</h3>
      <p class="muted">${P.score} ${label}. ${missed.length ? "Review these next — they've been flagged for revision:" : "Clean sweep — try a harder level next."}</p>
      ${missed.length ? `<div class="result-list">${missed.map(r => `<a href="#/track/${r.q.track}/q/${r.q.id}">${trackById(r.q.track).icon}<span>${esc(r.q.q)}</span></a>`).join("")}</div>` : ""}
      <div class="row-gap"><button class="button button-primary" id="practiceAgain">Another round ↻</button></div></div>`;
    if (pct >= .8 && n >= 5) confetti();
  }

  /* ───────────── Journey simulator ───────────── */
  let jStep = 0, jTimer = null;
  function buildJourney() {
    $("#journeyTrack").innerHTML = '<div class="journey-fill" id="journeyFill"></div><div class="packet" id="packet"></div>' + A.journeySteps.map((s, i) => `<button class="journey-node" data-step="${i}"><span class="node-icon">${s.icon}</span><span class="node-label">${esc(s.tag.split(" ")[0].charAt(0) + s.tag.split(" ")[0].slice(1).toLowerCase())}</span><small>0${i + 1}</small></button>`).join("");
  }
  function setJourneyStep(i, failed = false) {
    const steps = A.journeySteps; jStep = Math.max(0, Math.min(steps.length - 1, i));
    const s = steps[jStep], sc = A.scenarios[$("#scenarioSelect").value];
    $$(".journey-node").forEach((n, k) => { n.classList.toggle("active", k === jStep && !failed); n.classList.toggle("visited", k < jStep); n.classList.toggle("failed", failed && k === jStep); });
    $("#journeyFill").style.width = (jStep / (steps.length - 1)) * 85.7 + "%";
    const pk = $("#packet"); pk.style.left = `calc(${(jStep + .5) / steps.length * 100}% - 7px)`; pk.classList.toggle("error", failed);
    $("#stepCounter").textContent = `STEP ${String(jStep + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}`;
    $("#journeyProgress").style.width = ((jStep + 1) / steps.length * 100) + "%";
    $("#detailNumber").textContent = `LAYER ${String(jStep + 1).padStart(2, "0")}`;
    $("#detailTag").textContent = s.tag; $("#detailTitle").textContent = s.title; $("#detailBody").textContent = s.body;
    $("#detailAnalogy").textContent = s.analogy; $("#detailInspect").textContent = s.inspect; $("#detailInterview").textContent = s.interview;
    const d = $("#journeyDetail"); d.style.animation = "none"; void d.offsetWidth; d.style.animation = "";
    const stopped = sc.stop >= 0 && jStep >= sc.stop;
    $("#journeyStatus").textContent = failed || stopped ? sc.status : jStep === steps.length - 1 && sc.stop < 0 ? "COMPLETE" : "IN PROGRESS";
    $("#journeyStatus").classList.toggle("error", failed || stopped);
  }
  function setScenario(key) {
    clearInterval(jTimer); $("#scenarioSelect").value = key; setJourneyStep(0);
    const s = A.scenarios[key];
    $("#journeyStatus").textContent = "READY"; $("#journeyStatus").classList.remove("error");
    $("#outcomeIcon").textContent = s.icon; $("#outcomeIcon").classList.toggle("error", s.error);
    $("#outcomeTitle").textContent = s.title; $("#outcomeText").textContent = s.text;
  }
  function playJourney() {
    clearInterval(jTimer);
    const last = A.journeySteps.length - 1;
    if (jStep >= last || $(".journey-node.failed")) setJourneyStep(0);
    $("#journeyStatus").textContent = "PLAYING";
    jTimer = setInterval(() => {
      const sc = A.scenarios[$("#scenarioSelect").value];
      if (sc.stop >= 0 && jStep >= sc.stop) { clearInterval(jTimer); setJourneyStep(jStep, true); return; }
      if (jStep >= last) { clearInterval(jTimer); setJourneyStep(last); return; }
      setJourneyStep(jStep + 1);
    }, 1050 / Number($("#journeySpeed").value || 1));
  }

  /* ───────────── Runtime lab ───────────── */
  let cKey = "jvm", cIdx = 0, cTimer = null;
  function buildConceptMenu() {
    let html = "", group = "", n = 0;
    for (const [key, c] of Object.entries(A.concepts)) {
      if (c.group !== group) { group = c.group; html += `<div class="concept-group">${esc(group.toUpperCase())}</div>`; }
      html += `<button class="concept-tab" data-concept="${key}"><span>${String(++n).padStart(2, "0")}</span><b>${esc(c.title.replace(/^How |^What happens inside /, "").replace(/^\w/, ch => ch.toUpperCase()))}</b><small>${esc(c.kicker)}</small></button>`;
    }
    $("#conceptMenu").innerHTML = html;
  }
  function renderConcept(key) {
    clearInterval(cTimer); cKey = key; cIdx = 0; const c = A.concepts[key];
    $("#conceptKicker").textContent = c.kicker; $("#conceptTitle").textContent = c.title; $("#conceptBody").textContent = c.body; $("#conceptAnalogy").textContent = c.analogy;
    $$(".concept-tab").forEach(b => b.classList.toggle("active", b.dataset.concept === key));
    renderConceptFrame(); $("#conceptStepStatus").textContent = `Ready · ${c.steps.length} stages`;
  }
  function renderConceptFrame() {
    const c = A.concepts[cKey];
    $("#conceptAnimation").innerHTML = c.steps.map((s, i) => `<div class="flow-node ${i === cIdx ? "active" : ""} ${i < cIdx ? "complete" : ""}"><span>${String(i + 1).padStart(2, "0")}</span>${esc(s)}</div>${i < c.steps.length - 1 ? `<span class="flow-arrow ${i < cIdx ? "lit" : ""}">→</span>` : ""}`).join("");
    $("#conceptStepStatus").textContent = `Stage ${cIdx + 1} of ${c.steps.length}`;
  }
  function playConcept() {
    clearInterval(cTimer); cIdx = 0; renderConceptFrame();
    cTimer = setInterval(() => { if (cIdx >= A.concepts[cKey].steps.length - 1) { clearInterval(cTimer); $("#conceptStepStatus").textContent = "Complete ✓"; return; } cIdx++; renderConceptFrame(); }, Math.max(380, 1150 / Number($("#journeySpeed").value || 1)));
  }

  /* ───────────── Command palette ───────────── */
  let pSel = 0, pItems = [];
  function openPalette() { $("#palette").hidden = false; $("#paletteInput").value = ""; renderPalette(); setTimeout(() => $("#paletteInput").focus(), 20); }
  function closePalette() { $("#palette").hidden = true; }
  function hl(text, words) { let s = esc(text); words.forEach(w => { if (w.length > 1) s = s.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"), "<mark>$1</mark>"); }); return s; }
  function renderPalette() {
    const term = $("#paletteInput").value.trim().toLowerCase(), words = term.split(/\s+/).filter(Boolean);
    if (!words.length) {
      pItems = tracks().map(t => ({ href: `#/track/${t.id}`, icon: t.icon, title: t.title, sub: `${trackQuestions(t.id).length} questions · ${t.tagline}` }));
      $("#paletteCount").textContent = "Jump to a track or start typing";
    } else {
      const scored = [];
      for (const q of allQuestions()) {
        const qt = q.q.toLowerCase(), meta = (q.topic + " " + trackById(q.track).title).toLowerCase(), body = (q.answer + " " + q.takeaway).toLowerCase();
        let score = 0, ok = true;
        for (const w of words) { const s = (qt.includes(w) ? 5 : 0) + (meta.includes(w) ? 3 : 0) + (body.includes(w) ? 1 : 0); if (!s) { ok = false; break; } score += s; }
        if (ok) scored.push([score, q]);
      }
      scored.sort((a, b) => b[0] - a[0]);
      $("#paletteCount").textContent = `${scored.length} match${scored.length === 1 ? "" : "es"}`;
      pItems = scored.slice(0, 50).map(([, q]) => { const t = trackById(q.track); return { href: `#/track/${q.track}/q/${q.id}`, icon: t.icon, title: q.q, sub: `${t.title} · ${q.topic} · ${q.level}`, words }; });
    }
    pSel = 0;
    $("#paletteResults").innerHTML = pItems.length ? pItems.map((it, i) => `<div class="p-item ${i === 0 ? "sel" : ""}" role="option" data-i="${i}"><span class="p-icon">${it.icon}</span><div><b>${it.words ? hl(it.title, it.words) : esc(it.title)}</b><small>${esc(it.sub)}</small></div><kbd>↵</kbd></div>`).join("") : '<div class="empty-state"><span>⌕</span><p>No matches. Try fewer or different words.</p></div>';
  }
  function paletteMove(d) { if (!pItems.length) return; pSel = (pSel + d + pItems.length) % pItems.length; $$(".p-item").forEach((el, i) => el.classList.toggle("sel", i === pSel)); $$(".p-item")[pSel].scrollIntoView({ block: "nearest" }); }
  function paletteGo(i) { const it = pItems[i]; if (!it) return; closePalette(); location.hash = it.href; }

  /* ───────────── Custom questions, backup ───────────── */
  function addCustom(e) {
    e.preventDefault();
    const q = { id: "custom-" + Date.now().toString(36), track: $("#newTrack").value, level: $("#newLevel").value, topic: "Custom", q: $("#newQuestion").value.trim(), answer: $("#newAnswer").value.trim(), takeaway: $("#newTakeaway").value.trim(), custom: true };
    if (!q.q || !q.answer) return;
    state.custom.push(q); save(); reindex(); $("#questionDialog").close(); $("#questionForm").reset();
    renderTrackGrid(); renderOverall(); renderHeroStats(); toast("Question added ✦");
    location.hash = `#/track/${q.track}/q/${q.id}`;
    if (route.view === "track" && route.track === q.track) { renderSide(); renderList(); focusQuestion(q.id, true); }
  }
  function exportData() {
    save();
    const blob = new Blob([JSON.stringify({ app: "Interview Atlas", version: 2, exportedAt: new Date().toISOString(), state }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = `interview-atlas-backup-${today()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500);
    toast("Backup exported");
  }
  async function importData(file) {
    try {
      const data = JSON.parse(await file.text()), s = data.state || data;
      if (!Array.isArray(s.mastered) || !Array.isArray(s.favorites) || !Array.isArray(s.custom)) throw new Error("bad");
      state = Object.assign(defaultState(), s, { v: 2 }); M = new Set(state.mastered); F = new Set(state.favorites);
      save(); reindex(); applyTheme(); renderAll(); toast("Backup imported ✓");
    } catch (e) { toast("Couldn't import: not a valid Atlas backup"); }
  }
  function resetAll() {
    if (!confirm("Reset all progress, notes, ratings and custom questions? Export a backup first if you want to keep them.")) return;
    const theme = state.theme; state = defaultState(); state.theme = theme; M = new Set(); F = new Set(); save(); reindex(); renderAll(); toast("Progress reset");
  }
  function startRevision() {
    $("#practiceTrack").value = "review"; $("#practiceUnmastered").checked = false; setMode("flash");
    location.hash = "#practice";
    setTimeout(() => { if (!practicePool().length) { toast("Nothing flagged yet — rate answers 'Missed'/'Partial' or save questions first."); return; } startPractice(); }, 350);
  }
  function launchPractice(mode, track, count = 10) {
    $("#practiceTrack").value = track || "all"; $("#practiceLevel").value = "all"; $("#practiceCount").value = String(count);
    setMode(mode); location.hash = "#practice"; setTimeout(startPractice, 380);
  }

  /* ───────────── Ambient visuals ───────────── */
  function backgroundCanvas() {
    if (REDUCED) return;
    const cv = $("#bgCanvas"), ctx = cv.getContext("2d"); let W, H, pts = [], mouse = { x: -999, y: -999 };
    const resize = () => { W = cv.width = innerWidth * devicePixelRatio; H = cv.height = innerHeight * devicePixelRatio; const n = Math.min(90, Math.floor(innerWidth * innerHeight / 16000)); pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25 * devicePixelRatio, vy: (Math.random() - .5) * .25 * devicePixelRatio })); };
    resize(); addEventListener("resize", debounce(resize, 200));
    addEventListener("pointermove", e => { mouse.x = e.clientX * devicePixelRatio; mouse.y = e.clientY * devicePixelRatio; });
    const link = 130 * devicePixelRatio;
    (function frame() {
      if (!document.hidden) {
        ctx.clearRect(0, 0, W, H);
        const light = document.body.classList.contains("light");
        for (const p of pts) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          for (let j = i + 1; j < pts.length; j++) { const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < link) { ctx.strokeStyle = light ? `rgba(116,87,244,${(1 - d / link) * .18})` : `rgba(154,123,255,${(1 - d / link) * .22})`; ctx.lineWidth = devicePixelRatio * .7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
          const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (dm < link * 1.4) { ctx.strokeStyle = `rgba(89,225,189,${(1 - dm / (link * 1.4)) * .35})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
          ctx.fillStyle = light ? "rgba(116,87,244,.35)" : "rgba(190,200,255,.45)"; ctx.beginPath(); ctx.arc(a.x, a.y, 1.4 * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
        }
      }
      requestAnimationFrame(frame);
    })();
  }
  let revealObs;
  function observeReveal(els) {
    if (!("IntersectionObserver" in window) || REDUCED) { els.forEach(e => e.classList.add("in")); return; }
    revealObs = revealObs || new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.transitionDelay = (el.classList.contains("track-card") ? Math.min(sib * 60, 600) : 0) + "ms";
      el.classList.add("in"); revealObs.unobserve(el);
      el.querySelectorAll?.("[data-count]").forEach(countUp);
      if (el.matches("[data-count]")) countUp(el);
    }), { threshold: .12 });
    els.forEach(e => revealObs.observe(e));
  }
  function bindTilt(cards) {
    if (REDUCED || matchMedia("(hover: none)").matches) return;
    cards.forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", x * 100 + "%"); card.style.setProperty("--my", y * 100 + "%");
        card.style.transform = `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }
  function scrollEffects() {
    const bar = $("#scrollProgress"), links = $$("[data-nav]");
    const ids = links.map(a => a.getAttribute("href").slice(1));
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + "%";
      if (route.view !== "home") { links.forEach(a => a.classList.remove("active")); return; }
      let cur = ""; for (const id of ids) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 140) cur = id; }
      links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
  function applyTheme() { document.body.classList.toggle("light", state.theme === "light"); $("#themeToggle").textContent = state.theme === "light" ? "☾" : "☼"; document.querySelector('meta[name="theme-color"]').content = state.theme === "light" ? "#f5f7ff" : "#0b1020"; }

  /* ───────────── Events ───────────── */
  function bindEvents() {
    $("#themeToggle").onclick = () => { state.theme = state.theme === "light" ? "dark" : "light"; applyTheme(); save(); };
    $("#menuToggle").onclick = () => { const nav = $(".topnav"); nav.id = "topnav"; const open = nav.classList.toggle("open"); $("#menuToggle").setAttribute("aria-expanded", open); };
    $("#voiceBtn").onclick = e => { e.stopPropagation(); const p = $("#voicePop"); p.hidden = !p.hidden; $("#voiceBtn").setAttribute("aria-expanded", !p.hidden); };
    document.addEventListener("click", e => { if (!$("#voicePop").hidden && !e.target.closest("#voicePop, #voiceBtn")) $("#voicePop").hidden = true; });
    $("#speechRate").oninput = e => ($("#speechRateValue").textContent = Number(e.target.value).toFixed(1) + "×");
    $("#voiceSelect").onchange = e => { try { localStorage.setItem("interviewAtlasVoice", e.target.value); } catch (x) { } };
    $("#testVoice").onclick = () => speak("Hi there. Let's crack this interview. Explain how a HashMap works internally.");
    $("#stopSpeech").onclick = stopSpeech;
    $("#openPalette").onclick = openPalette;
    $("#heroMock").onclick = () => launchPractice("mock", "core", 5);
    // QOTD
    $("#qotdReveal").onclick = () => { const a = $("#qotdA"); if (a.hidden) { a.innerHTML = md(qotd.answer); a.style.setProperty("--c", trackById(qotd.track).color); a.hidden = false; $("#qotdReveal").textContent = "Hide answer ↑"; touchStreak(); } else { a.hidden = true; $("#qotdReveal").textContent = "Reveal answer ↗"; } };
    $("#qotdNext").onclick = () => pickQotd(true);
    $("#qotdOpen").onclick = () => (location.hash = `#/track/${qotd.track}/q/${qotd.id}`);
    // Focus
    $(".focus-bar").onclick = e => { const b = e.target.closest("[data-focus]"); if (!b) return; state.focus = b.dataset.focus; save(); applyFocus(); };
    // Your story
    $("#speakPitch").onclick = () => speak($("#pitchText").textContent);
    $("#practicePitch").onclick = practicePitch;
    $("#pitchForm").addEventListener("input", debounce(e => { if (!e.target.name) return; state.pitch = Object.assign({}, state.pitch, { [e.target.name]: e.target.value }); save(); renderPitch(); }, 150));
    $("#pitchForm").addEventListener("submit", e => e.preventDefault());
    $("#pitchReset").onclick = () => { state.pitch = {}; save(); renderPitch(); toast("Showing the example pitch"); };
    $("#copyPitch").onclick = () => copyText($("#pitchText").textContent, "Pitch copied");
    $("#planWeeks").onchange = e => { const id = e.target.dataset.plan; if (!id) return; if (e.target.checked) state.plan[id] = 1; else delete state.plan[id]; save(); renderPlan(); if (e.target.checked) touchStreak(); };
    // Practice
    $(".practice-tabs").onclick = e => { const b = e.target.closest("[data-mode]"); if (b) setMode(b.dataset.mode); };
    $("#practiceStart").onclick = startPractice;
    $("#practiceStage").addEventListener("click", e => {
      const opt = e.target.closest("[data-opt]"); if (opt) return chooseQuiz(Number(opt.dataset.opt));
      if (e.target.closest("#quizNext")) return nextQuiz();
      if (e.target.closest("#practiceAgain")) return startPractice();
      const fl = e.target.closest("[data-flash]"); if (fl) return flashAction(fl.dataset.flash);
      if (e.target.closest("#flashcard") && !e.target.closest("a")) return flashAction("flip");
      if (e.target.closest("#mockReveal")) return revealMock();
      if (e.target.closest("#mockSpeak")) return speak(P.items[P.i].q);
      if (e.target.closest("#mockSkip")) { P.results.push({ q: P.items[P.i], ok: false }); P.i++; return renderMock(); }
      const g = e.target.closest("[data-grade]"); if (g) return gradeMock(Number(g.dataset.grade));
      const cp = e.target.closest("[data-copy]"); if (cp) return copyText(cp.closest(".code-block").querySelector("pre").innerText, "Code copied");
    });
    // Journey
    $("#journeyTrack").onclick = e => { const n = e.target.closest(".journey-node"); if (n) { clearInterval(jTimer); setJourneyStep(Number(n.dataset.step)); } };
    $("#scenarioSelect").onchange = e => setScenario(e.target.value);
    $("#playJourney").onclick = playJourney;
    $("#journeySpeed").oninput = e => { $("#journeySpeedValue").textContent = Number(e.target.value).toFixed(2).replace(/0$/, "") + "×"; if (jTimer) playJourney(); };
    $("#prevStep").onclick = () => { clearInterval(jTimer); setJourneyStep(jStep - 1); };
    $("#nextStep").onclick = () => { clearInterval(jTimer); setJourneyStep(jStep + 1); };
    $("#resetJourney").onclick = () => setScenario($("#scenarioSelect").value);
    $("#speakJourney").onclick = () => { const s = A.journeySteps[jStep]; speak(`${s.tag}. ${s.title}. ${s.body} Think of it like this: ${s.analogy} Interview angle: ${s.interview}`); };
    $("#journeyTrackLink").onclick = () => (location.hash = `#/track/${A.journeySteps[jStep].track}`);
    // Lab
    $("#conceptMenu").onclick = e => { const b = e.target.closest("[data-concept]"); if (b) renderConcept(b.dataset.concept); };
    $("#playConcept").onclick = playConcept;
    $("#speakConcept").onclick = () => { const c = A.concepts[cKey]; speak(`${c.title}. ${c.body} ${c.analogy} Stages: ${c.steps.join(", ")}.`); };
    $("#relatedQuestions").onclick = () => { const c = A.concepts[cKey]; location.hash = `#/track/${c.track}?q=${encodeURIComponent(c.search)}`; };
    // Toolkit
    $("#addQuestionBtn").onclick = () => { if (route.view === "track") $("#newTrack").value = route.track; $("#questionDialog").showModal(); };
    $("#closeDialog").onclick = $("#cancelDialog").onclick = () => $("#questionDialog").close();
    $("#questionForm").onsubmit = addCustom;
    $("#exportBtn").onclick = exportData;
    $("#importBtn").onclick = () => $("#importFile").click();
    $("#importFile").onchange = e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ""; };
    $("#reviseBtn").onclick = startRevision;
    $("#resetBtn").onclick = resetAll;
    // Track view
    $("#tvSearch").addEventListener("input", debounce(e => { tv.search = e.target.value; renderList(); }, 160));
    $("#levelSeg").onclick = e => { const b = e.target.closest("[data-level]"); if (!b) return; tv.level = b.dataset.level; $$("#levelSeg button").forEach(x => x.classList.toggle("active", x === b)); renderList(); };
    $("#statusFilter").onchange = e => { tv.status = e.target.value; renderList(); };
    const topicClick = e => { const b = e.target.closest("[data-topic]"); if (!b) return; tv.topic = b.dataset.topic; renderList(); window.scrollTo({ top: $("#trackToolbar").offsetTop - 90, behavior: "smooth" }); };
    $("#topicList").onclick = topicClick; $("#topicChips").onclick = topicClick;
    $("#expandAll").onclick = () => { const anyClosed = $$(".q-card:not(.open)").length > 0; $$(".q-card").forEach(c => toggleCard(c.dataset.id, anyClosed, false)); $("#expandAll").textContent = anyClosed ? "Collapse all" : "Expand all"; };
    $("#tvClear").onclick = () => { tv.level = "all"; tv.topic = "all"; tv.status = "all"; tv.search = ""; $("#tvSearch").value = ""; $("#statusFilter").value = "all"; $$("#levelSeg button").forEach(b => b.classList.toggle("active", b.dataset.level === "all")); renderList(); };
    $("#tvFlash").onclick = () => launchPractice("flash", route.track, 15);
    $("#tvQuiz").onclick = () => launchPractice("quiz", route.track, 10);
    $("#tvMock").onclick = () => launchPractice("mock", route.track, 5);
    $("#qList").addEventListener("click", e => {
      const card = e.target.closest(".q-card"); if (!card) return; const id = card.dataset.id;
      if (e.target.closest(".q-head")) { tv.focus = tv.list.findIndex(q => q.id === id); markFocus(); return toggleCard(id); }
      const act = e.target.closest("[data-act]");
      if (act) {
        const a = act.dataset.act;
        if (a === "walk") startWalk(card, act);
        else if (a === "master") setMastered(id, !M.has(id));
        else if (a === "save") { setSaved(id, !F.has(id)); toast(F.has(id) ? "Saved ♥" : "Removed from saved"); }
        else if (a === "speak") speakQuestion(qById(id));
        else if (a === "link") copyText(shareLink(id), "Link copied 🔗");
        else if (a === "delete" && confirm("Delete this custom question?")) { state.custom = state.custom.filter(c => c.id !== id); M.delete(id); F.delete(id); save(); reindex(); renderSide(); renderList(); refreshProgress(); toast("Deleted"); }
        return;
      }
      const rate = e.target.closest("[data-rate]"); if (rate) { setRating(id, Number(rate.dataset.rate)); return; }
      const cp = e.target.closest("[data-copy]"); if (cp) copyText(cp.closest(".code-block").querySelector("pre").innerText, "Code copied");
    });
    $("#qList").addEventListener("input", debounce(e => { const ta = e.target.closest("[data-note]"); if (!ta) return; const id = ta.closest(".q-card").dataset.id; const v = ta.value.trim(); if (v) state.notes[id] = ta.value; else delete state.notes[id]; save(); }, 400));
    $("#qotdA").addEventListener("click", e => { const cp = e.target.closest("[data-copy]"); if (cp) copyText(cp.closest(".code-block").querySelector("pre").innerText, "Code copied"); });
    // Palette
    $("#paletteInput").addEventListener("input", debounce(renderPalette, 90));
    $("#paletteResults").onclick = e => { const it = e.target.closest(".p-item"); if (it) paletteGo(Number(it.dataset.i)); };
    $("#palette").onclick = e => { if (e.target.id === "palette") closePalette(); };
    // Keyboard
    document.addEventListener("keydown", e => {
      const typing = e.target.closest?.("input, textarea, select, [contenteditable]");
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#palette").hidden ? openPalette() : closePalette(); return; }
      if (!$("#palette").hidden) {
        if (e.key === "Escape") closePalette();
        else if (e.key === "ArrowDown") { e.preventDefault(); paletteMove(1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); paletteMove(-1); }
        else if (e.key === "Enter") { e.preventDefault(); paletteGo(pSel); }
        return;
      }
      if (typing || e.altKey || e.ctrlKey || e.metaKey) return;
      if (P.mode === "flash" && $("#flashcard") && isInView($("#flashcard"))) {
        if (e.key === " ") { e.preventDefault(); return flashAction("flip"); }
        if (e.key === "ArrowRight") return flashAction("got");
        if (e.key === "ArrowLeft") return flashAction("again");
      }
      if (route.view === "track") {
        const k = e.key.toLowerCase(), cur = tv.list[tv.focus];
        if (k === "j" || e.key === "ArrowDown" && e.shiftKey) { e.preventDefault(); moveFocus(1); }
        else if (k === "k") { e.preventDefault(); moveFocus(-1); }
        else if ((k === "enter" || k === "o") && cur && !e.target.closest("button")) { e.preventDefault(); toggleCard(cur.id); }
        else if (k === "m" && cur) setMastered(cur.id, !M.has(cur.id));
        else if (k === "s" && cur) setSaved(cur.id, !F.has(cur.id));
        else if (e.key === "/") { e.preventDefault(); $("#tvSearch").focus(); }
        else if (e.key === "Escape") location.hash = "#/";
      } else if (e.key === "/") { e.preventDefault(); openPalette(); }
    });
    addEventListener("hashchange", handleRoute);
  }
  function isInView(el) { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }

  function renderAll() {
    renderTrackGrid(); renderOverall(); renderHeroStats(); renderSkills(); renderPlan(); renderPitch(); renderStreak();
    populatePracticeTracks();
    if (route.view === "track") { renderTrackHeader(); renderSide(); renderList(); }
  }

  /* ───────────── Init ───────────── */
  function init() {
    if (!A || !A.tracks.length) { document.body.insertAdjacentHTML("afterbegin", '<p style="padding:20px;color:#ff7187">Question data failed to load. Check that the /data folder was deployed.</p>'); return; }
    reindex(); applyTheme();
    renderOrbit(); pickQotd(false); buildJourney(); buildConceptMenu();
    renderAll(); setMode("quiz"); setScenario("success"); renderConcept("jvm");
    bindEvents(); startHeroWords(); backgroundCanvas(); scrollEffects();
    observeReveal($$(".reveal")); $$(".hero-stats [data-count]").forEach(el => setTimeout(() => countUp(el), 300));
    populateVoices(); if ("speechSynthesis" in window) speechSynthesis.addEventListener?.("voiceschanged", populateVoices);
    handleRoute();
  }
  init();
})();
