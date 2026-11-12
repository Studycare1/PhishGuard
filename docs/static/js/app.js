// PhishGuard v3.1 — Clean app.js
let TYPES = [];
let QUIZ = [];
let EXAMPLES = [];
let FLASHCARDS = [];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function go(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById('view-' + view);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === view);
  });
  const titles = {home:'Home',course:'Cyber Course',stats:'Stats',timeline:'Timeline',types:'Phishing Types',flashcards:'Flashcards',future:'Future 2026',detector:'URL Detector',password:'Password Tools','email-analyzer':'Email Analyzer',checklist:'Safety Checklist',quiz:'Quiz (250)',notes:'Notes',glossary:'Glossary',cases:'Case Studies',warnings:'Warnings',about:'About'};
  document.getElementById('view-title').textContent = titles[view] || view;
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('main').scrollTo({ top: 0, behavior: 'smooth' });
  if (typeof updateBackBtn === 'function') updateBackBtn();
  if (view === 'timeline') renderTimeline();
  if (view === 'password') setTimeout(()=>{const i=document.getElementById('pwd-input');if(i)i.focus();},100);
  if (view === 'checklist') renderChecklist();
  if (view === 'course') renderCourse('syllabus');
  if (view === 'future') renderFuture();
  if (view === 'glossary') renderGlossary();
  if (view === 'quiz') {
    const qc = document.getElementById('quiz-container');
    if (qc && !qc.children.length && QUIZ.length) renderQuiz();
  }
}
window.go = go;

function goBack(){
  var active = document.querySelector(".view.active");
  if(!active) return;
  var id = active.id.replace("view-", "");
  if(id === "types"){
    var det = document.getElementById("type-detail");
    if(det && det.innerHTML.trim()){ backToTypes(); return; }
  }
  go("home");
}
window.goBack = goBack;

function updateBackBtn(){
  var active = document.querySelector(".view.active");
  if(!active) return;
  var id = active.id.replace("view-", "");
  var btn = document.getElementById("back-nav");
  if(!btn) return;
  if(id === "home"){
    btn.classList.remove("show");
  } else {
    btn.classList.add("show");
  }
}

function renderTypes() {
  const grid = document.getElementById('types-grid');
  if (!grid) return;
  if (!TYPES.length) {
    grid.innerHTML = '<div class="box danger">Types load nahi hue. Server restart karo.</div>';
    return;
  }
  grid.innerHTML = '';
  TYPES.forEach(t => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<span class="severity sev-' + t.severity + '">' + t.severity + '</span>' +
      '<div class="card-icon">' + t.icon + '</div>' +
      '<div class="card-title">' + esc(t.name) + '</div>' +
      '<div class="card-desc">' + esc(t.short) + '</div>';
    card.addEventListener('click', function() { showType(t.id); });
    grid.appendChild(card);
  });
}

function showType(id) {
  const t = TYPES.find(x => x.id === id);
  if (!t) return;
  const grid = document.getElementById('types-grid');
  const detail = document.getElementById('type-detail');
  grid.style.display = 'none';

  const examplesHtml = t.examples.map((ex, i) =>
    '<div class="example-card">' +
      '<div class="example-title"><span class="num">' + (i+1) + '</span>' + esc(ex.title) + '</div>' +
      '<div class="code-mock">' +
        '<span style="color:#6b7280;font-style:italic">From:</span>    ' + esc(ex.from) + '\n' +
        '<span style="color:#6b7280;font-style:italic">Subject:</span> ' + esc(ex.subject) + '\n\n' +
        esc(ex.body) +
      '</div>' +
      '<div class="box warn" style="margin-top:12px">' +
        '<b style="color:var(--yellow)">Red Flags:</b>' +
        '<ul class="ul x" style="margin-top:8px">' +
          ex.red_flags.map(f => '<li>' + esc(f) + '</li>').join('') +
        '</ul>' +
      '</div>' +
    '</div>'
  ).join('');

  detail.innerHTML =
    '<button class="back-btn" id="back-to-types">\u2190 Back to all types</button>' +
    '<div class="detail-header">' +
      '<div class="detail-icon">' + t.icon + '</div>' +
      '<div style="flex:1">' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
          '<h1 class="h1" style="margin:0;font-size:26px">' + esc(t.name) + '</h1>' +
          '<span class="severity sev-' + t.severity + '" style="position:static">' + t.severity + '</span>' +
        '</div>' +
        '<p style="color:var(--text-dim);margin-top:6px;font-size:14px">' + esc(t.category) + ' \u00b7 ' + esc(t.short) + '</p>' +
      '</div>' +
    '</div>' +
    '<div class="section-h">Definition</div>' +
    '<div class="box">' + esc(t.definition).replace(/\n/g, '<br>') + '</div>' +
    '<div class="section-h">How It Works</div>' +
    '<div class="box"><ol style="list-style:decimal;padding-left:22px;color:var(--text-dim);font-size:13.5px;line-height:1.8">' +
      t.how_it_works.map(s => '<li>' + esc(s) + '</li>').join('') +
    '</ol></div>' +
    '<div class="section-h">3 Real Examples</div>' + examplesHtml +
    '<div class="section-h">Common Red Flags</div>' +
    '<div class="box danger"><ul class="ul x">' + t.red_flags.map(f => '<li>' + esc(f) + '</li>').join('') + '</ul></div>' +
    '<div class="section-h">How to Stay Safe</div>' +
    '<div class="box good"><ul class="ul check">' + t.prevention.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul></div>' +
    '<div class="section-h">Real Case</div>' +
    '<div class="box info">' + esc(t.real_case).replace(/\n/g, '<br>') + '</div>';

  document.getElementById('back-to-types').addEventListener('click', backToTypes);
  document.getElementById('main').scrollTo({ top: 0, behavior: 'smooth' });
}

function backToTypes() {
  document.getElementById('types-grid').style.display = '';
  document.getElementById('type-detail').innerHTML = '';
  document.getElementById('main').scrollTo({ top: 0, behavior: 'smooth' });
}
window.showType = showType;
window.backToTypes = backToTypes;

function renderChips() {
  const chips = document.getElementById('example-chips');
  if (!chips) return;
  chips.innerHTML = '';
  EXAMPLES.forEach(ex => {
    const c = document.createElement('span');
    c.className = 'chip';
    c.textContent = ex.length > 45 ? ex.slice(0, 45) + '\u2026' : ex;
    c.title = ex;
    c.addEventListener('click', function() {
      document.getElementById('url-input').value = ex;
      detect();
    });
    chips.appendChild(c);
  });
}

async function detect() {
  const url = document.getElementById('url-input').value.trim();
  if (!url) return;
  const btn = document.getElementById('detect-btn');
  btn.disabled = true;
  btn.textContent = 'Analyzing...';
  const res = document.getElementById('detect-result');
  res.innerHTML = '<div class="box">Scanning 45 checks\u2026</div>';
  try {
    const j = detect(url);
    renderResult(j);
  } catch (e) {
    res.innerHTML = '<div class="box danger">Error: ' + esc(e.message) + '</div>';
  }
  btn.disabled = false;
  btn.textContent = 'Analyze';
}
window.detect = detect;

function renderResult(j) {
  const res = document.getElementById('detect-result');
  const colorMap = {green:'var(--green)',yellow:'var(--yellow)',orange:'var(--orange)',red:'var(--red)'};
  let html = '<div class="verdict-box ' + j.color + '">' +
    '<div class="verdict-score">' + j.risk + '</div>' +
    '<div style="flex:1">' +
      '<div class="verdict-label" style="color:' + colorMap[j.color] + '">' + esc(j.verdict) + '</div>' +
      '<div class="verdict-sub">Risk ' + j.risk + '/100 \u00b7 ' + j.findings.length + ' issue' + (j.findings.length === 1 ? '' : 's') + '</div>' +
    '</div></div>';
  if (j.host) html += '<div class="box info"><b>Host:</b> <code>' + esc(j.host) + '</code></div>';
  if (j.findings.length === 0) {
    html += '<div class="box good">\u2713 Koi problem nahi mili. Par 100% guarantee nahi \u2014 domain manually verify karo.</div>';
  } else {
    html += '<div class="section-h">Findings</div>';
    j.findings.forEach(f => {
      html += '<div class="finding ' + f.level + '">' +
        '<div class="finding-msg">' + esc(f.msg) + '<span class="finding-level ' + f.level + '">' + f.level + '</span></div>' +
        '<div class="finding-detail">' + esc(f.detail) + '</div>' +
      '</div>';
    });
  }
  html += '<div class="box" style="margin-top:16px;font-size:12.5px;color:var(--text-mute)"><b style="color:var(--text-dim)">Note:</b> Patterns pe based.</div>';
  res.innerHTML = html;
}

let quizState = null;

function renderQuiz() {
  const c = document.getElementById('quiz-container');
  if (!c) return;
  c.innerHTML = '';
  quizState = { answered: new Set(), score: 0 };
  QUIZ.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'quiz-q';
    let optsHtml = '';
    q.options.forEach((o, j) => {
      optsHtml += '<button class="quiz-opt" data-q="' + i + '" data-o="' + j + '">' + String.fromCharCode(65 + j) + '. ' + esc(o) + '</button>';
    });
    div.innerHTML =
      '<div class="quiz-num">Question ' + (i+1) + ' / ' + QUIZ.length + '</div>' +
      '<div class="quiz-text">' + esc(q.q) + '</div>' +
      '<div id="opts-' + i + '">' + optsHtml + '</div>' +
      '<div class="quiz-explain" id="exp-' + i + '"><b>Explanation:</b> ' + esc(q.explain) + '</div>';
    c.appendChild(div);
  });
  
  
  c.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', function() {
      answer(parseInt(this.dataset.q), parseInt(this.dataset.o));
    });
  });
}

function answer(qi, oi) {
  if (!quizState || quizState.answered.has(qi)) return;
  quizState.answered.add(qi);
  const q = QUIZ[qi];
  const opts = document.getElementById('opts-' + qi).querySelectorAll('.quiz-opt');
  opts.forEach((b, j) => {
    b.disabled = true;
    if (j === q.answer) b.classList.add('correct');
    if (j === oi && oi !== q.answer) b.classList.add('wrong');
  });
  if (oi === q.answer) quizState.score++;
  
  document.getElementById('exp-' + qi).classList.add('show');
}
window.answer = answer;

let fcIdx = 0;

function showCard() {
  if (!FLASHCARDS.length) return;
  const c = FLASHCARDS[fcIdx];
  document.getElementById('fc-front').textContent = c.q;
  document.getElementById('fc-back').textContent = c.a;
  document.getElementById('fc-counter').textContent = (fcIdx + 1) + ' / ' + FLASHCARDS.length;
  document.getElementById('flashcard').classList.remove('flipped');
}
function nextCard() { fcIdx = (fcIdx + 1) % FLASHCARDS.length; showCard(); }
function prevCard() { fcIdx = (fcIdx - 1 + FLASHCARDS.length) % FLASHCARDS.length; showCard(); }
window.nextCard = nextCard;
window.prevCard = prevCard;

function tick() {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toLocaleTimeString();
}
setInterval(tick, 1000);
tick();

let gPressed = false;
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.getElementById('sidebar').classList.remove('open');
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    go('detector');
    document.getElementById('url-input').focus();
    return;
  }
  if (e.key === 'g') {
    gPressed = true;
    setTimeout(() => { gPressed = false; }, 1000);
    return;
  }
  if (gPressed) {
    if (e.key === 't') go('types');
    if (e.key === 'q') go('quiz');
    if (e.key === 'f') go('flashcards');
    if (e.key === 'h') go('home');
    if (e.key === 'd') go('detector');
    gPressed = false;
  }
  const fcView = document.getElementById('view-flashcards');
  if (fcView && fcView.classList.contains('active') && document.activeElement.tagName !== 'INPUT') {
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === 'ArrowLeft') prevCard();
    if (e.key === ' ') {
      e.preventDefault();
      document.getElementById('flashcard').classList.toggle('flipped');
    }
  }
});



// ============================================================
// FUTURE MODULES 2026-2027
// ============================================================
let FUTURE = null;
let currentFutureTab = "future_threats";

async function loadFuture() {
  if (FUTURE) return FUTURE;
  try {
    const r = await fetch('./data/future.json');
    FUTURE = await r.json();
    return FUTURE;
  } catch (e) {
    console.error("Future load failed:", e);
    return null;
  }
}

async function renderFuture() {
  const data = await loadFuture();
  if (!data) return;
  const tabs = document.getElementById('future-tabs');
  const content = document.getElementById('future-content');
  if (!tabs || !content) return;

  // Build tabs
  tabs.innerHTML = '';
  const keys = Object.keys(data);
  keys.forEach(k => {
    const mod = data[k];
    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (k === currentFutureTab ? ' active' : '');
    btn.innerHTML = mod.icon + ' ' + esc(mod.title);
    btn.addEventListener('click', () => {
      currentFutureTab = k;
      renderFuture();
    });
    tabs.appendChild(btn);
  });

  // Render active section
  const mod = data[currentFutureTab];
  if (!mod) return;

  let html = '<p class="lead" style="margin-bottom:20px">' + esc(mod.lead) + '</p>';
  html += '<div class="grid">';

  mod.items.forEach((item, idx) => {
    const itemJson = JSON.stringify(item).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    html += '<div class="card" data-future-item=\'' + encodeURIComponent(JSON.stringify(item)) + '\'>';
    html += '<span class="severity sev-' + (item.severity || 'high') + '">' + (item.severity || 'info') + '</span>';
    html += '<div class="card-icon">' + item.icon + '</div>';
    html += '<div class="card-title">' + esc(item.name) + '</div>';
    html += '<div class="card-desc">' + esc(item.short) + '</div>';
    html += '</div>';
  });
  html += '</div>';
  content.innerHTML = html;

  // Attach click handlers
  content.querySelectorAll('[data-future-item]').forEach(el => {
    el.addEventListener('click', function () {
      const item = JSON.parse(decodeURIComponent(this.getAttribute('data-future-item')));
      showFutureItem(item);
    });
  });
}

function showFutureItem(item) {
  const content = document.getElementById('future-content');
  let html = '<button class="back-btn" id="back-future">\u2190 Back</button>';
  html += '<div class="detail-header">';
  html += '<div class="detail-icon">' + item.icon + '</div>';
  html += '<div style="flex:1">';
  html += '<h1 class="h1" style="margin:0;font-size:26px">' + esc(item.name) + '</h1>';
  html += '<p style="color:var(--text-dim);margin-top:6px;font-size:14px">' + esc(item.short) + '</p>';
  html += '</div></div>';

  if (item.definition) {
    html += '<div class="section-h">What It Is</div>';
    html += '<div class="box">' + esc(item.definition).replace(/\n/g, '<br>') + '</div>';
  }
  if (item.body) {
    html += '<div class="section-h">Detail</div>';
    html += '<div class="box">' + esc(item.body).replace(/\n/g, '<br>') + '</div>';
  }
  if (item.how_it_works) {
    html += '<div class="section-h">How It Works</div>';
    html += '<div class="box"><ol style="list-style:decimal;padding-left:22px;color:var(--text-dim);font-size:13.5px;line-height:1.8">';
    item.how_it_works.forEach(s => { html += '<li>' + esc(s) + '</li>'; });
    html += '</ol></div>';
  }
  if (item.tools) {
    html += '<div class="section-h">Tools</div>';
    html += '<div class="box"><ul class="ul">';
    item.tools.forEach(t => { html += '<li>' + esc(t) + '</li>'; });
    html += '</ul></div>';
  }
  if (item.why) {
    html += '<div class="section-h">Why It Matters</div>';
    html += '<div class="box info">' + esc(item.why) + '</div>';
  }
  if (item.how) {
    html += '<div class="section-h">How To Use</div>';
    html += '<div class="box good"><ul class="ul check">';
    item.how.forEach(h => { html += '<li>' + esc(h) + '</li>'; });
    html += '</ul></div>';
  }
  if (item.example) {
    html += '<div class="section-h">Example Attack</div>';
    html += '<div class="code-mock">';
    html += '<span style="color:#8892aa;font-style:italic">From:</span>    ' + esc(item.example.from) + '\n';
    html += '<span style="color:#8892aa;font-style:italic">Subject:</span> ' + esc(item.example.subject) + '\n\n';
    html += esc(item.example.body);
    html += '</div>';
    if (item.example.red_flags) {
      html += '<div class="box warn" style="margin-top:12px"><b style="color:var(--yellow)">Red Flags:</b><ul class="ul x" style="margin-top:8px">';
      item.example.red_flags.forEach(f => { html += '<li>' + esc(f) + '</li>'; });
      html += '</ul></div>';
    }
  }
  if (item.red_flags) {
    html += '<div class="section-h">Common Red Flags</div>';
    html += '<div class="box danger"><ul class="ul x">';
    item.red_flags.forEach(f => { html += '<li>' + esc(f) + '</li>'; });
    html += '</ul></div>';
  }
  if (item.prevention) {
    html += '<div class="section-h">Prevention</div>';
    html += '<div class="box good"><ul class="ul check">';
    item.prevention.forEach(p => { html += '<li>' + esc(p) + '</li>'; });
    html += '</ul></div>';
  }
  if (item.real_case) {
    html += '<div class="section-h">Real Case</div>';
    html += '<div class="box info">' + esc(item.real_case) + '</div>';
  }

  content.innerHTML = html;
  document.getElementById('back-future').addEventListener('click', renderFuture);
  document.getElementById('main').scrollTo({ top: 0, behavior: 'smooth' });
}




// ============================================================
// GLOSSARY — ELI10 style
// ============================================================
let GLOSSARY = null;
let currentGlossCat = "all";

async function loadGlossary() {
  if (GLOSSARY) return GLOSSARY;
  try {
    const r = await fetch('./data/glossary.json');
    GLOSSARY = await r.json();
    return GLOSSARY;
  } catch (e) {
    console.error("Glossary load failed:", e);
    return null;
  }
}

async function renderGlossary() {
  const data = await loadGlossary();
  if (!data) return;
  const catsEl = document.getElementById('gloss-cats');
  const listEl = document.getElementById('gloss-list');
  if (!catsEl || !listEl) return;

  // Build category tabs
  catsEl.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'cat-tab' + (currentGlossCat === 'all' ? ' active' : '');
  allBtn.textContent = '📚 All (' + data.terms.length + ')';
  allBtn.addEventListener('click', () => { currentGlossCat = 'all'; renderGlossary(); });
  catsEl.appendChild(allBtn);

  data.categories.forEach(cat => {
    const count = data.terms.filter(t => t.cat === cat.id).length;
    if (count === 0) return;
    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (currentGlossCat === cat.id ? ' active' : '');
    btn.textContent = cat.icon + ' ' + cat.name + ' (' + count + ')';
    btn.addEventListener('click', () => { currentGlossCat = cat.id; renderGlossary(); });
    catsEl.appendChild(btn);
  });

  // Filter terms
  const q = (document.getElementById('gloss-search').value || '').toLowerCase().trim();
  let filtered = data.terms;
  if (currentGlossCat !== 'all') {
    filtered = filtered.filter(t => t.cat === currentGlossCat);
  }
  if (q) {
    filtered = filtered.filter(t =>
      t.term.toLowerCase().includes(q) ||
      (t.full && t.full.toLowerCase().includes(q)) ||
      (t.eli10 && t.eli10.toLowerCase().includes(q))
    );
  }

  // Render
  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="box info">Koi term nahi mila. Search clear karo ya category change karo.</div>';
    return;
  }

  let html = '';
  filtered.forEach((t, i) => {
    const catInfo = data.categories.find(c => c.id === t.cat) || {icon: '📖', name: 'General'};
    html += '<div class="gloss-item" data-idx="' + i + '">';
    html += '<div class="gloss-head" onclick="toggleGloss(' + i + ')">';
    html += '<span class="gloss-cat-badge">' + catInfo.icon + '</span>';
    html += '<div class="gloss-head-text">';
    html += '<div class="gloss-term">' + esc(t.term) + '</div>';
    if (t.full) html += '<div class="gloss-full">' + esc(t.full) + '</div>';
    html += '</div>';
    html += '<span class="gloss-arrow" id="gloss-arrow-' + i + '">▸</span>';
    html += '</div>';
    html += '<div class="gloss-body" id="gloss-body-' + i + '" style="display:none">';
    html += '<div class="gloss-eli">';
    html += '<div class="gloss-eli-label">🎯 ELI10</div>';
    html += '<div class="gloss-eli-text">' + esc(t.eli10) + '</div>';
    html += '</div>';
    if (t.detail) {
      html += '<div class="gloss-detail">';
      html += '<div class="gloss-detail-label">🔬 Detail</div>';
      html += '<div class="gloss-detail-text">' + esc(t.detail).replace(/\n/g, '<br>') + '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
  });
  listEl.innerHTML = html;
}

function toggleGloss(i) {
  const body = document.getElementById('gloss-body-' + i);
  const arrow = document.getElementById('gloss-arrow-' + i);
  if (!body) return;
  if (body.style.display === 'none') {
    body.style.display = 'block';
    arrow.textContent = '▾';
    arrow.style.transform = 'rotate(0deg)';
  } else {
    body.style.display = 'none';
    arrow.textContent = '▸';
  }
}
window.toggleGloss = toggleGloss;




// ============================================================
// TIMELINE — 1995 to 2027
// ============================================================
let TIMELINE_DATA = null;
let currentTimelineCat = "all";

async function loadTimeline() {
  if (TIMELINE_DATA) return TIMELINE_DATA;
  try {
    const r = await fetch('./data/timeline.json');
    TIMELINE_DATA = await r.json();
    return TIMELINE_DATA;
  } catch (e) {
    console.error("Timeline load failed:", e);
    return null;
  }
}

async function renderTimeline() {
  const data = await loadTimeline();
  if (!data) return;
  const statsEl = document.getElementById('timeline-stats');
  const catsEl = document.getElementById('timeline-cats');
  const listEl = document.getElementById('timeline-list');
  if (!statsEl || !catsEl || !listEl) return;

  // Stats
  statsEl.innerHTML =
    '<div class="stat"><div class="stat-num">' + data.stats.total + '</div><div class="stat-lbl">Events</div></div>' +
    '<div class="stat"><div class="stat-num">' + data.stats.start + '</div><div class="stat-lbl">Start</div></div>' +
    '<div class="stat"><div class="stat-num">' + data.stats.end + '</div><div class="stat-lbl">End</div></div>' +
    '<div class="stat"><div class="stat-num">' + data.stats.categories.length + '</div><div class="stat-lbl">Categories</div></div>';

  // Category tabs
  catsEl.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'cat-tab' + (currentTimelineCat === 'all' ? ' active' : '');
  allBtn.textContent = '📜 All (' + data.events.length + ')';
  allBtn.addEventListener('click', () => { currentTimelineCat = 'all'; renderTimeline(); });
  catsEl.appendChild(allBtn);

  data.stats.categories.forEach(cat => {
    const count = data.events.filter(e => e.category === cat).length;
    if (count === 0) return;
    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (currentTimelineCat === cat ? ' active' : '');
    btn.textContent = cat + ' (' + count + ')';
    btn.addEventListener('click', () => { currentTimelineCat = cat; renderTimeline(); });
    catsEl.appendChild(btn);
  });

  // Filter
  const q = (document.getElementById('timeline-search').value || '').toLowerCase().trim();
  let filtered = data.events;
  if (currentTimelineCat !== 'all') {
    filtered = filtered.filter(e => e.category === currentTimelineCat);
  }
  if (q) {
    filtered = filtered.filter(e =>
      (e.title || '').toLowerCase().includes(q) ||
      (e.event || '').toLowerCase().includes(q) ||
      (e.year || '').toLowerCase().includes(q) ||
      (e.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="box info">Koi event nahi mila.</div>';
    return;
  }

  // Render timeline items
  let html = '<div class="tl-wrap">';
  filtered.forEach((e, i) => {
    const sevClass = 'tl-' + (e.severity || 'info');
    html += '<div class="tl-item ' + sevClass + '">';
    html += '<div class="tl-marker">';
    html += '<div class="tl-dot"></div>';
    html += '<div class="tl-year">' + esc(e.year) + '</div>';
    html += '</div>';
    html += '<div class="tl-content">';
    html += '<div class="tl-head">';
    html += '<span class="tl-cat">' + esc(e.category) + '</span>';
    if (e.date && e.date !== e.year) html += '<span class="tl-date">· ' + esc(e.date) + '</span>';
    html += '</div>';
    html += '<h3 class="tl-title">' + esc(e.title) + '</h3>';
    html += '<div class="tl-event">' + esc(e.event) + '</div>';
    if (e.impact) {
      html += '<div class="tl-block tl-impact">';
      html += '<div class="tl-label">💥 Impact</div>';
      html += '<div>' + esc(e.impact) + '</div>';
      html += '</div>';
    }
    if (e.lesson) {
      html += '<div class="tl-block tl-lesson">';
      html += '<div class="tl-label">🎓 Lesson</div>';
      html += '<div>' + esc(e.lesson) + '</div>';
      html += '</div>';
    }
    if (e.tags && e.tags.length) {
      html += '<div class="tl-tags">';
      e.tags.forEach(t => { html += '<span class="tl-tag">#' + esc(t) + '</span>'; });
      html += '</div>';
    }
    html += '</div></div>';
  });
  html += '</div>';
  listEl.innerHTML = html;
}




// ============================================================
// PASSWORD TOOLS
// ============================================================
let pwdVisible = false;

function togglePwdView() {
  const inp = document.getElementById('pwd-input');
  const btn = document.getElementById('pwd-toggle-btn');
  if (!inp) return;
  pwdVisible = !pwdVisible;
  inp.type = pwdVisible ? 'text' : 'password';
  btn.textContent = pwdVisible ? 'Hide' : 'Show';
}
window.togglePwdView = togglePwdView;

async function checkPassword() {
  const inp = document.getElementById('pwd-input');
  if (!inp) return;
  const pwd = inp.value;
  const res = document.getElementById('pwd-result');
  if (!pwd) { res.innerHTML = ''; return; }

  try {
    const d = analyzePassword(pwd);
    renderPwdResult(d);
  } catch (e) {
    res.innerHTML = '<div class="box danger">Error: ' + esc(e.message) + '</div>';
  }
}
window.checkPassword = checkPassword;

function renderPwdResult(d) {
  const res = document.getElementById('pwd-result');
  const colorMap = {green:'var(--green)', yellow:'var(--yellow)', orange:'var(--orange)', red:'var(--red)'};
  let html = '<div class="verdict-box ' + d.color + '" style="padding:18px 22px">' +
    '<div class="verdict-score" style="font-size:38px">' + d.score + '</div>' +
    '<div style="flex:1">' +
      '<div class="verdict-label" style="color:' + colorMap[d.color] + '">' + esc(d.label) + '</div>' +
      '<div class="verdict-sub">Length: ' + d.length + ' · Types: ' + d.types + '/4 · Crack time: ' + esc(d.crack_time) + '</div>' +
    '</div></div>';

  // Progress bar
  html += '<div style="height:8px;background:rgba(168,85,247,0.12);border-radius:4px;margin:10px 0 18px;overflow:hidden">' +
    '<div style="height:100%;width:' + d.score + '%;background:linear-gradient(90deg,var(--accent),var(--accent-2));transition:width 0.5s"></div></div>';

  if (d.issues && d.issues.length) {
    html += '<div class="section-h">Issues</div><div class="box danger"><ul class="ul x">';
    d.issues.forEach(i => { html += '<li>' + esc(i) + '</li>'; });
    html += '</ul></div>';
  }
  if (d.tips && d.tips.length) {
    html += '<div class="section-h">Suggestions</div><div class="box info"><ul class="ul">';
    d.tips.forEach(t => { html += '<li>' + esc(t) + '</li>'; });
    html += '</ul></div>';
  }
  res.innerHTML = html;
}

function generatePassword() {
  const lower = document.getElementById('gen-lower').checked;
  const upper = document.getElementById('gen-upper').checked;
  const digit = document.getElementById('gen-digit').checked;
  const symbol = document.getElementById('gen-symbol').checked;
  const length = parseInt(document.getElementById('gen-length').value);

  if (!lower && !upper && !digit && !symbol) {
    document.getElementById('gen-output').innerHTML = '<div class="box danger">Kam se kam ek character type select karo.</div>';
    return;
  }

  const lc = 'abcdefghijkmnpqrstuvwxyz';
  const uc = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const dc = '23456789';
  const sc = '!@#$%^&*()-_=+[]{};:,.?';
  let chars = '';
  let required = [];
  if (lower) { chars += lc; required.push(lc); }
  if (upper) { chars += uc; required.push(uc); }
  if (digit) { chars += dc; required.push(dc); }
  if (symbol) { chars += sc; required.push(sc); }

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let pwd = '';
  // ensure required chars
  required.forEach((set, i) => {
    pwd += set[arr[i] % set.length];
  });
  for (let i = required.length; i < length; i++) {
    pwd += chars[arr[i] % chars.length];
  }
  // shuffle
  const shuffle = Array.from(pwd);
  const shuf = new Uint32Array(shuffle.length);
  crypto.getRandomValues(shuf);
  for (let i = shuffle.length - 1; i > 0; i--) {
    const j = shuf[i] % (i + 1);
    [shuffle[i], shuffle[j]] = [shuffle[j], shuffle[i]];
  }
  pwd = shuffle.join('');

  const out = document.getElementById('gen-output');
  out.innerHTML =
    '<div class="code-mock" style="font-size:14px;text-align:center;letter-spacing:1px;padding:20px">' + esc(pwd) + '</div>' +
    '<div style="display:flex;gap:8px;margin-top:10px;justify-content:center">' +
      '<button class="back-btn" onclick="copyPwd()">Copy</button>' +
      '<button class="back-btn" onclick="generatePassword()">Regenerate</button>' +
    '</div>';
}
window.generatePassword = generatePassword;

function copyPwd() {
  const el = document.querySelector('#gen-output .code-mock');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    const btn = event.target;
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = orig; }, 1500);
  });
}
window.copyPwd = copyPwd;

// ============================================================
// EMAIL ANALYZER
// ============================================================
async function analyzeEmailText() {
  const inp = document.getElementById('email-input');
  const res = document.getElementById('email-result');
  if (!inp || !res) return;
  const text = inp.value.trim();
  if (!text) {
    res.innerHTML = '<div class="box warn">Email text paste karo pehle.</div>';
    return;
  }
  res.innerHTML = '<div class="box">Analyzing…</div>';

  try {
    const d = analyzeEmail(text);
    renderEmailResult(d);
  } catch (e) {
    res.innerHTML = '<div class="box danger">Error: ' + esc(e.message) + '</div>';
  }
}
window.analyzeEmailText = analyzeEmailText;

function renderEmailResult(d) {
  const res = document.getElementById('email-result');
  const colorMap = {green:'var(--green)', yellow:'var(--yellow)', orange:'var(--orange)', red:'var(--red)'};
  let html = '<div class="verdict-box ' + d.color + '">' +
    '<div class="verdict-score">' + d.score + '</div>' +
    '<div style="flex:1">' +
      '<div class="verdict-label" style="color:' + colorMap[d.color] + '">' + esc(d.verdict) + '</div>' +
      '<div class="verdict-sub">Risk ' + d.score + '/100 · ' + d.findings.length + ' indicator' + (d.findings.length === 1 ? '' : 's') + '</div>' +
    '</div></div>';

  if (!d.findings.length) {
    html += '<div class="box good">✓ Koi major phishing indicator nahi mila. Par 100% safe guarantee nahi — sender manually verify karo.</div>';
  } else {
    html += '<div class="section-h">Findings</div>';
    d.findings.forEach(f => {
      html += '<div class="finding ' + f.level + '">' +
        '<div class="finding-msg">' + esc(f.msg) + '<span class="finding-level ' + f.level + '">' + f.level + '</span></div>' +
        '<div class="finding-detail">' + esc(f.detail) + '</div>' +
      '</div>';
    });
  }
  res.innerHTML = html;
}

function loadSampleEmail() {
  const sample = `From: Amazon Security <security@amaz0n-verify.tk>
Reply-To: attacker@evil-domain.com
Subject: URGENT: Your account will be suspended

Dear Customer,

We have detected suspicious activity on your account.
Your account will be permanently suspended in 24 hours.

Verify now to avoid deletion:
http://amaz0n-verify.tk/login

Also please confirm your OTP and credit card details for verification.

Act now or lose access forever!

Amazon Security Team`;

  document.getElementById('email-input').value = sample;
  analyzeEmailText();
}
window.loadSampleEmail = loadSampleEmail;

function clearEmail() {
  document.getElementById('email-input').value = '';
  document.getElementById('email-result').innerHTML = '';
}
window.clearEmail = clearEmail;

// ============================================================
// SAFETY CHECKLIST
// ============================================================
const CHECKLIST_DATA = [
  {cat: "Passwords", icon: "🔑", items: [
    {id: "p1", text: "Password manager use kar raha hoon (Bitwarden/1Password)"},
    {id: "p2", text: "Har account ka alag password hai"},
    {id: "p3", text: "Master password 15+ characters ka hai"},
    {id: "p4", text: "2FA on hai important accounts me"},
    {id: "p5", text: "Passwords kisi note/email me plain text me nahi hain"},
  ]},
  {cat: "2FA / MFA", icon: "🛡️", items: [
    {id: "m1", text: "Authenticator app use kar raha hoon (SMS nahi)"},
    {id: "m2", text: "Backup codes print karke safe rakhe hain"},
    {id: "m3", text: "Hardware key (YubiKey) critical accounts pe"},
    {id: "m4", text: "Number matching enabled hai jahan available"},
  ]},
  {cat: "Email Safety", icon: "📧", items: [
    {id: "e1", text: "Sender address dhyaan se check karta hoon"},
    {id: "e2", text: "Links pe click se pehle hover karta hoon"},
    {id: "e3", text: "Attachments bina verify open nahi karta"},
    {id: "e4", text: "Company login emails se nahi karta — app/website use karta hoon"},
  ]},
  {cat: "Device Security", icon: "💻", items: [
    {id: "d1", text: "OS auto-update on hai"},
    {id: "d2", text: "Browser latest version pe hai"},
    {id: "d3", text: "Screen lock PIN/biometric on hai"},
    {id: "d4", text: "Find My Device enabled hai"},
    {id: "d5", text: "Antivirus/EDR installed hai"},
  ]},
  {cat: "Network", icon: "📡", items: [
    {id: "n1", text: "Public WiFi pe VPN use karta hoon"},
    {id: "n2", text: "Router ka default admin password change kiya hai"},
    {id: "n3", text: "Banking public WiFi pe nahi karta"},
    {id: "n4", text: "DNS 1.1.1.1 ya 8.8.8.8 pe set hai"},
  ]},
  {cat: "Financial", icon: "💳", items: [
    {id: "f1", text: "Transaction alerts SMS/email me on hain"},
    {id: "f2", text: "Card ke liye low-limit account use karta hoon"},
    {id: "f3", text: "Bank ka official number save kiya hai"},
    {id: "f4", text: "Monthly statements check karta hoon"},
    {id: "f5", text: "UPI PIN kisi ko nahi batata"},
  ]},
  {cat: "Habits", icon: "🎯", items: [
    {id: "h1", text: "Urgent emails pe ruk jata hoon — verify karta hoon"},
    {id: "h2", text: "OTP/password kisi ko share nahi karta"},
    {id: "h3", text: "Family code word set kiya hai (deepfake se bachne ke liye)"},
    {id: "h4", text: "Suspicious emails report karta hoon"},
    {id: "h5", text: "Website URLs type karta hoon, click nahi karta"},
  ]},
];

const CHECKLIST_KEY = 'pg_checklist_v1';

function loadChecklist() {
  try {
    return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}');
  } catch (e) { return {}; }
}

function saveChecklist(data) {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(data));
}

function renderChecklist() {
  const container = document.getElementById('checklist-content');
  const progress = document.getElementById('checklist-progress');
  if (!container) return;

  const state = loadChecklist();
  let total = 0, done = 0;
  CHECKLIST_DATA.forEach(cat => cat.items.forEach(it => {
    total++;
    if (state[it.id]) done++;
  }));

  const pct = total ? Math.round((done / total) * 100) : 0;
  progress.innerHTML = '<div class="box info" style="display:flex;align-items:center;gap:16px">' +
    '<div style="font-size:28px;font-weight:800;background:linear-gradient(135deg,var(--accent),var(--accent-2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;font-family:\'SF Mono\',monospace">' + pct + '%</div>' +
    '<div style="flex:1">' +
      '<div style="font-size:12px;color:var(--text-dim);font-weight:600">' + done + ' / ' + total + ' complete</div>' +
      '<div style="height:8px;background:rgba(168,85,247,0.12);border-radius:4px;margin-top:6px;overflow:hidden">' +
        '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--accent),var(--accent-2));transition:width 0.5s"></div>' +
      '</div>' +
    '</div></div>';

  let html = '';
  CHECKLIST_DATA.forEach((cat, ci) => {
    const catDone = cat.items.filter(it => state[it.id]).length;
    html += '<div class="checklist-cat">';
    html += '<div class="checklist-cat-head">';
    html += '<span style="font-size:18px">' + cat.icon + '</span>';
    html += '<span style="font-weight:700;color:var(--accent-deep)">' + cat.cat + '</span>';
    html += '<span style="margin-left:auto;font-size:11px;color:var(--text-mute);font-family:\'SF Mono\',monospace">' + catDone + '/' + cat.items.length + '</span>';
    html += '</div>';
    cat.items.forEach(it => {
      const checked = state[it.id] ? 'checked' : '';
      html += '<label class="checklist-item' + (state[it.id] ? ' done' : '') + '">' +
        '<input type="checkbox" ' + checked + ' onchange="toggleCheck(\'' + it.id + '\')">' +
        '<span>' + esc(it.text) + '</span></label>';
    });
    html += '</div>';
  });
  container.innerHTML = html;
}

function toggleCheck(id) {
  const state = loadChecklist();
  state[id] = !state[id];
  if (!state[id]) delete state[id];
  saveChecklist(state);
  renderChecklist();
}
window.toggleCheck = toggleCheck;

function resetChecklist() {
  if (!confirm('Poora checklist reset karna hai?')) return;
  localStorage.removeItem(CHECKLIST_KEY);
  renderChecklist();
}
window.resetChecklist = resetChecklist;




// ============================================================
// CYBERSECURITY COURSE
// ============================================================
let COURSE_DATA = null;
let currentCourseView = "syllabus"; // syllabus | module | lesson | info

async function loadCourse() {
  if (COURSE_DATA) return COURSE_DATA;
  try {
    const r = await fetch('./data/course.json');
    COURSE_DATA = await r.json();
    return COURSE_DATA;
  } catch (e) {
    console.error("Course load failed:", e);
    return null;
  }
}

async function renderCourse(view, id) {
  const data = await loadCourse();
  if (!data) return;
  const container = document.getElementById('course-content');
  if (!container) return;

  if (view === 'module' && id) return renderCourseModule(data, id, container);
  if (view === 'lesson' && id) return renderCourseLesson(data, id, container);

  // Default syllabus
  renderCourseSyllabus(data, container);
}

function renderCourseSyllabus(data, container) {
  let html = '';

  // Hero
  html += '<div class="course-hero">' +
    '<div class="course-hero-icon">' + data.icon + '</div>' +
    '<div class="course-hero-title">' + esc(data.title) + '</div>' +
    '<div class="course-hero-sub">' + esc(data.subtitle) + '</div>' +
    '<div class="course-hero-meta">' +
      '<span class="course-badge">⏱ ' + esc(data.duration) + '</span>' +
      '<span class="course-badge">📊 ' + esc(data.level) + '</span>' +
      '<span class="course-badge">🎯 ' + data.stats.modules + ' Modules</span>' +
      '<span class="course-badge">📚 ' + data.stats.lessons + ' Lessons</span>' +
    '</div>' +
    '<p class="course-hero-desc">' + esc(data.description) + '</p>' +
  '</div>';

  // Stats grid
  html += '<div class="stat-grid" style="margin:20px 0">' +
    '<div class="stat"><div class="stat-num">' + data.stats.modules + '</div><div class="stat-lbl">Modules</div></div>' +
    '<div class="stat"><div class="stat-num">' + data.stats.lessons + '</div><div class="stat-lbl">Lessons</div></div>' +
    '<div class="stat"><div class="stat-num">' + data.stats.hours + 'h</div><div class="stat-lbl">Content</div></div>' +
    '<div class="stat"><div class="stat-num">' + data.stats.projects + '</div><div class="stat-lbl">Projects</div></div>' +
  '</div>';

  // Learning path
  html += '<div class="section-h">📍 Learning Path</div>';
  html += '<div class="course-path">';
  data.learning_path.forEach((p, i) => {
    html += '<div class="course-path-step">' +
      '<div class="course-path-num">' + (i+1) + '</div>' +
      '<div class="course-path-body">' +
        '<div class="course-path-phase">' + esc(p.phase) + '</div>' +
        '<div class="course-path-weeks">Weeks ' + esc(p.weeks) + '</div>' +
        '<div class="course-path-goal">' + esc(p.goal) + '</div>' +
      '</div>' +
    '</div>';
  });
  html += '</div>';

  // Modules
  html += '<div class="section-h">📚 Course Modules — click karke dekho</div>';
  html += '<div class="course-modules">';
  data.modules.forEach(m => {
    html += '<div class="course-module" data-module="' + m.id + '">' +
      '<div class="course-module-head">' +
        '<div class="course-module-num">M' + m.num + '</div>' +
        '<div class="course-module-icon">' + m.icon + '</div>' +
        '<div class="course-module-title">' + esc(m.title) + '</div>' +
        '<div class="course-module-arrow">▸</div>' +
      '</div>' +
      '<div class="course-module-desc">' + esc(m.desc) + '</div>' +
      '<div class="course-module-meta">' +
        '<span class="course-meta-chip">⏱ ' + esc(m.duration) + '</span>' +
        '<span class="course-meta-chip">📊 ' + esc(m.level) + '</span>' +
        '<span class="course-meta-chip">📖 ' + m.lessons.length + ' lessons</span>' +
      '</div>' +
    '</div>';
  });
  html += '</div>';

  // Certifications
  html += '<div class="section-h">🏆 Target Certifications</div>';
  html += '<div class="course-certs">';
  data.certifications.forEach(cert => {
    html += '<div class="course-cert">' +
      '<div class="course-cert-name">' + esc(cert.name) + '</div>' +
      '<div class="course-cert-meta">' +
        '<span>' + esc(cert.level) + '</span> · ' +
        '<span>' + esc(cert.duration) + '</span>' +
      '</div>' +
    '</div>';
  });
  html += '</div>';

  // Tools
  html += '<div class="section-h">🛠️ Tools You Will Master</div>';
  html += '<div class="course-tools">';
  data.tools_covered.forEach(t => {
    html += '<span class="course-tool">' + esc(t) + '</span>';
  });
  html += '</div>';

  container.innerHTML = html;

  // Attach click handlers to modules
  container.querySelectorAll('.course-module').forEach(el => {
    el.addEventListener('click', function () {
      renderCourse('module', this.getAttribute('data-module'));
      document.getElementById('main').scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function renderCourseModule(data, moduleId, container) {
  const m = data.modules.find(x => x.id === moduleId);
  if (!m) return;

  let html = '<button class="back-btn" id="course-back">← Back to Syllabus</button>';

  html += '<div class="course-module-hero">' +
    '<div class="course-module-hero-icon">' + m.icon + '</div>' +
    '<div style="flex:1">' +
      '<div class="course-module-hero-num">MODULE ' + m.num + '</div>' +
      '<h2 class="course-module-hero-title">' + esc(m.title) + '</h2>' +
      '<div class="course-module-hero-meta">' +
        '<span class="course-meta-chip">⏱ ' + esc(m.duration) + '</span>' +
        '<span class="course-meta-chip">📊 ' + esc(m.level) + '</span>' +
        '<span class="course-meta-chip">📖 ' + m.lessons.length + ' lessons</span>' +
      '</div>' +
    '</div>' +
  '</div>';

  html += '<div class="box info" style="margin-top:18px">' + esc(m.desc) + '</div>';

  html += '<div class="section-h">📖 Lessons — click karke dekho</div>';
  html += '<div class="course-lessons">';
  m.lessons.forEach((l, i) => {
    html += '<div class="course-lesson" data-lesson="' + l.id + '">' +
      '<div class="course-lesson-num">' + (i+1) + '</div>' +
      '<div class="course-lesson-body">' +
        '<div class="course-lesson-title">' + esc(l.title) + '</div>' +
        '<div class="course-lesson-desc">' + esc(l.desc) + '</div>' +
        '<div class="course-lesson-meta">⏱ ' + esc(l.duration) + '</div>' +
      '</div>' +
      '<div class="course-lesson-arrow">▸</div>' +
    '</div>';
  });
  html += '</div>';

  container.innerHTML = html;

  document.getElementById('course-back').addEventListener('click', () => {
    renderCourse('syllabus');
    document.getElementById('main').scrollTo({ top: 0, behavior: 'smooth' });
  });

  container.querySelectorAll('.course-lesson').forEach(el => {
    el.addEventListener('click', function () {
      renderCourse('lesson', this.getAttribute('data-lesson'));
      document.getElementById('main').scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function renderCourseLesson(data, lessonId, container) {
  let module = null, lesson = null, lessonIdx = 0;
  for (const m of data.modules) {
    const idx = m.lessons.findIndex(l => l.id === lessonId);
    if (idx !== -1) { module = m; lesson = m.lessons[idx]; lessonIdx = idx; break; }
  }
  if (!lesson) return;

  let html = '<button class="back-btn" id="lesson-back">← Back to ' + esc(module.title) + '</button>';

  html += '<div class="lesson-hero">' +
    '<div class="lesson-hero-icon">' + module.icon + '</div>' +
    '<div style="flex:1">' +
      '<div class="lesson-hero-num">MODULE ' + module.num + ' · Lesson ' + (lessonIdx+1) + '</div>' +
      '<h2 class="lesson-hero-title">' + esc(lesson.title) + '</h2>' +
      '<div class="lesson-hero-meta">⏱ ' + esc(lesson.duration) + '</div>' +
    '</div>' +
  '</div>';

  html += '<div class="section-h">📄 Description</div>';
  html += '<div class="box info">' + esc(lesson.desc) + '</div>';

  html += '<div class="section-h">🎯 Topics Covered</div>';
  html += '<div class="box"><ul class="ul">';
  lesson.topics.forEach(t => {
    html += '<li>' + esc(t) + '</li>';
  });
  html += '</ul></div>';

  html += '<div class="section-h">✅ Learning Outcome</div>';
  html += '<div class="box good">' + esc(lesson.outcome) + '</div>';

  // Prev / Next nav
  const allLessons = [];
  data.modules.forEach(m => m.lessons.forEach(l => allLessons.push({m, l})));
  const currentIdx = allLessons.findIndex(x => x.l.id === lessonId);
  const prev = currentIdx > 0 ? allLessons[currentIdx-1] : null;
  const next = currentIdx < allLessons.length-1 ? allLessons[currentIdx+1] : null;

  html += '<div class="lesson-nav">';
  if (prev) {
    html += '<button class="back-btn lesson-nav-btn" data-lesson="' + prev.l.id + '" data-module="' + prev.m.id + '">← ' + esc(prev.l.title.substring(0, 30)) + '</button>';
  } else {
    html += '<div></div>';
  }
  if (next) {
    html += '<button class="back-btn lesson-nav-btn" style="margin-left:auto" data-lesson="' + next.l.id + '" data-module="' + next.m.id + '">' + esc(next.l.title.substring(0, 30)) + ' →</button>';
  }
  html += '</div>';

  container.innerHTML = html;

  document.getElementById('lesson-back').addEventListener('click', () => {
    renderCourse('module', module.id);
    document.getElementById('main').scrollTo({ top: 0, behavior: 'smooth' });
  });

  container.querySelectorAll('.lesson-nav-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      renderCourse('lesson', this.getAttribute('data-lesson'));
      document.getElementById('main').scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}


async function loadData() {
  try {
    const [t, q, e, f] = await Promise.all([
      fetch('./data/types.json').then(r => r.json()),
      fetch('./data/quiz.json').then(r => r.json()),
      fetch('./data/examples.json').then(r => r.json()),
      fetch('./data/flashcards.json').then(r => r.json())
    ]);
    TYPES = t;
    QUIZ = q;
    EXAMPLES = e;
    FLASHCARDS = f;
    renderTypes();
    renderChips();
    if (FLASHCARDS.length) showCard();
    console.log('PhishGuard loaded:', TYPES.length, QUIZ.length, EXAMPLES.length, FLASHCARDS.length);
  } catch (err) {
    console.error('Data load failed:', err);
    const grid = document.getElementById('types-grid');
    if (grid) grid.innerHTML = '<div class="box danger">Data load nahi hua: ' + esc(err.message) + '</div>';
  }
}

document.querySelectorAll('.nav-item').forEach(n => {
  n.addEventListener('click', e => {
    e.preventDefault();
    go(n.dataset.view);
  });
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadData);
} else {
  loadData();
}

// ============================================================
// ABOUT — 3D WordArt animations
// ============================================================
function animateAboutLetters() {
  const letters = document.querySelectorAll('.brand-letter, .author-letter');
  letters.forEach((el, i) => {
    el.addEventListener('mouseenter', function () {
      this.style.animationPlayState = 'paused';
    });
    el.addEventListener('mouseleave', function () {
      this.style.animationPlayState = 'running';
    });
  });
}

// Run when about view opens
const originalGoAbout = window.go;
if (originalGoAbout) {
  window.go = function(view) {
    originalGoAbout(view);
    if (view === 'about') {
      setTimeout(animateAboutLetters, 100);
    }
  };
}




// ============================================================
// PULL TO REFRESH
// ============================================================
(function initPullToRefresh() {
  const main = document.getElementById('main');
  if (!main) return;

  // Create indicator element
  const indicator = document.createElement('div');
  indicator.className = 'ptr-indicator';
  indicator.innerHTML =
    '<div class="ptr-spinner"><span class="ptr-arrow">↓</span></div>' +
    '<div class="ptr-label">Pull to refresh</div>';
  main.appendChild(indicator);

  // Create toast
  const toast = document.createElement('div');
  toast.className = 'ptr-toast';
  toast.textContent = '✓ Refreshed';
  document.body.appendChild(toast);

  const THRESHOLD = 80;
  const MAX_PULL = 140;
  let startY = 0;
  let currentY = 0;
  let pulling = false;
  let refreshing = false;

  function getScrollTop() {
    return main.scrollTop || document.documentElement.scrollTop || 0;
  }

  function onTouchStart(e) {
    if (refreshing) return;
    if (getScrollTop() > 5) return;
    startY = e.touches[0].clientY;
    pulling = true;
  }

  function onTouchMove(e) {
    if (!pulling || refreshing) return;
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff <= 0) {
      pulling = false;
      return;
    }

    // If user scrolls down while pulling, cancel
    if (getScrollTop() > 5) {
      pulling = false;
      resetIndicator();
      return;
    }

    // Apply resistance curve
    const pull = Math.min(MAX_PULL, diff * 0.55);

    // Prevent default to avoid native scroll bounce
    if (e.cancelable) e.preventDefault();

    const progress = Math.min(1, pull / THRESHOLD);
    indicator.style.transform = 'translate(-50%, calc(-100% + ' + pull + 'px))';

    if (pull > 4) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }

    if (pull >= THRESHOLD) {
      indicator.classList.add('ready');
      indicator.querySelector('.ptr-label').textContent = 'Release to refresh';
    } else {
      indicator.classList.remove('ready');
      indicator.querySelector('.ptr-label').textContent = 'Pull to refresh';
    }
  }

  function onTouchEnd() {
    if (!pulling || refreshing) return;
    pulling = false;

    const pull = Math.min(MAX_PULL, (currentY - startY) * 0.55);

    if (pull >= THRESHOLD) {
      doRefresh();
    } else {
      resetIndicator();
    }
  }

  function resetIndicator() {
    indicator.classList.remove('active', 'ready', 'refreshing');
    indicator.style.transform = 'translate(-50%, -100%)';
    indicator.querySelector('.ptr-label').textContent = 'Pull to refresh';
  }

  async function doRefresh() {
    refreshing = true;
    indicator.classList.add('active', 'refreshing');
    indicator.classList.remove('ready');
    indicator.querySelector('.ptr-label').textContent = 'Refreshing…';
    indicator.style.transform = 'translate(-50%, 20px)';

    // Reset cached data flags so views reload fresh
    if (typeof VISIT_LOADED !== 'undefined') VISIT_LOADED = false;
    if (typeof VISITORS_LOADED !== 'undefined') VISITORS_LOADED = false;
    if (typeof FUTURE !== 'undefined') FUTURE = null;
    if (typeof GLOSSARY !== 'undefined') GLOSSARY = null;
    if (typeof TIMELINE_DATA !== 'undefined') TIMELINE_DATA = null;
    if (typeof COURSE_DATA !== 'undefined') COURSE_DATA = null;

    // Determine current view
    const activeView = document.querySelector('.view.active');
    const viewId = activeView ? activeView.id.replace('view-', '') : 'home';

    try {
      // Refresh current view content
      if (viewId === 'glossary' && typeof renderGlossary === 'function') {
        await renderGlossary();
      } else if (viewId === 'timeline' && typeof renderTimeline === 'function') {
        await renderTimeline();
      } else if (viewId === 'future' && typeof renderFuture === 'function') {
        await renderFuture();
      } else if (viewId === 'course' && typeof renderCourse === 'function') {
        renderCourse('syllabus');
      } else if (viewId === 'types' && typeof renderTypes === 'function') {
        renderTypes();
        if (typeof backToTypes === 'function') backToTypes();
      } else if (viewId === 'checklist' && typeof renderChecklist === 'function') {
        renderChecklist();
      } else if (viewId === 'quiz') {
        // Reset quiz
        const qc = document.getElementById('quiz-container');
        if (qc) qc.innerHTML = '';
        if (typeof renderQuiz === 'function') renderQuiz();
      } else if (viewId === 'detector') {
        document.getElementById('detect-result').innerHTML = '';
        document.getElementById('url-input').value = '';
      } else {
        // Home / stats / about / warnings — just scroll to top
        main.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Small delay for smooth UX
      await new Promise(r => setTimeout(r, 500));

      // Success toast
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 1800);
    } catch (e) {
      console.error('Refresh error:', e);
    }

    // Reset indicator
    setTimeout(() => {
      resetIndicator();
      refreshing = false;
    }, 400);
  }

  // Attach touch events
  main.addEventListener('touchstart', onTouchStart, { passive: true });
  main.addEventListener('touchmove', onTouchMove, { passive: false });
  main.addEventListener('touchend', onTouchEnd, { passive: true });
  main.addEventListener('touchcancel', onTouchEnd, { passive: true });

  // Desktop fallback — Ctrl+R intercept? No. Just add a subtle hint.
  // Actually add manual refresh via keyboard
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
      // Don't hijack, let browser reload
    }
  });
})();

