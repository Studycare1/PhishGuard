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
  const titles = {home:'Home',stats:'Stats',timeline:'Timeline',types:'Phishing Types',flashcards:'Flashcards',future:'Future 2026',detector:'URL Detector',quiz:'Quiz (250)',notes:'Notes',glossary:'Glossary',cases:'Case Studies',warnings:'Warnings',about:'About'};
  document.getElementById('view-title').textContent = titles[view] || view;
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('main').scrollTo({ top: 0, behavior: 'smooth' });
  if (typeof updateBackBtn === 'function') updateBackBtn();
  if (view === 'timeline') renderTimeline();
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
    const r = await fetch('/api/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url })
    });
    const j = await r.json();
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
  document.getElementById('score-total').textContent = QUIZ.length;
  document.getElementById('quiz-score').style.display = 'flex';
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
  document.getElementById('score-num').textContent = quizState.score;
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
    const r = await fetch('/api/future');
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
    const r = await fetch('/api/glossary');
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
    const r = await fetch('/api/timeline');
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


async function loadData() {
  try {
    const [t, q, e, f] = await Promise.all([
      fetch('/api/types').then(r => r.json()),
      fetch('/api/quiz').then(r => r.json()),
      fetch('/api/examples').then(r => r.json()),
      fetch('/api/flashcards').then(r => r.json())
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


