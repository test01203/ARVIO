// ── Supabase Config ───────────────────────────────────────────────────────
const SUPABASE_URL = 'https://zrdwvortcfnoykltzuqf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZHd2b3J0Y2Zub3lrbHR6dXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NDU4NzMsImV4cCI6MjA4MjMyMTg3M30.YfKZbSwxGs6_xMd6jkDtn1PKkfuyOHo9qVhUvFRddGU';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w92';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── State ─────────────────────────────────────────────────────────────────
let state = {
  session: null,
  userId: null,
  syncPayload: null,
  activeSection: 'dashboard',
  historyTab: 'movies',
};

// ── Toast ─────────────────────────────────────────────────────────────────
function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show toast-${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ''; }, 3000);
}

// ── Auth ──────────────────────────────────────────────────────────────────
async function signInGoogle() {
  const { error } = await db.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href },
  });
  if (error) toast(error.message, 'err');
}

async function signOut() {
  await db.auth.signOut();
  location.reload();
}

// ── Cloud Sync Payload ────────────────────────────────────────────────────
async function loadSyncPayload() {
  try {
    const { data, error } = await db
      .from('profiles')
      .select('addons')
      .eq('id', state.userId)
      .single();
    if (error || !data?.addons) return null;
    const wrapper = JSON.parse(data.addons);
    const raw = wrapper['__arvioAccountSyncPayload'];
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

async function saveSyncPayload(payload) {
  const raw = JSON.stringify(payload);
  const wrapper = JSON.stringify({
    __arvioAccountSyncPayload: raw,
    __arvioAccountSyncUpdatedAt: new Date().toISOString(),
  });
  const { error } = await db
    .from('profiles')
    .update({ addons: wrapper })
    .eq('id', state.userId);
  if (error) throw error;
  state.syncPayload = payload;
}

// ── Sections ──────────────────────────────────────────────────────────────
const sections = {
  dashboard: renderDashboard,
  profiles: renderProfiles,
  addons: renderAddons,
  history: renderHistory,
  watchlist: renderWatchlist,
  ai: renderAI,
  settings: renderSettings,
};

function navigate(id) {
  state.activeSection = id;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.section === id);
  });
  renderSection();
}

async function renderSection() {
  const main = document.getElementById('main-content');
  main.innerHTML = `<div class="loading"><div class="spinner"></div> טוען...</div>`;
  await sections[state.activeSection]?.();
}

// ── Dashboard ─────────────────────────────────────────────────────────────
async function renderDashboard() {
  const main = document.getElementById('main-content');

  const [histRes, wlRes] = await Promise.all([
    db.from('watch_history').select('id, media_type', { count: 'exact', head: false })
      .eq('user_id', state.userId).limit(1),
    db.from('watchlist').select('tmdb_id', { count: 'exact', head: false })
      .eq('user_id', state.userId).limit(1),
  ]);

  const payload = state.syncPayload;
  const profiles = payload?.profiles ?? [];
  const addons = getAddons(payload);

  main.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Dashboard</div>
        <div class="section-sub">סקירה מהירה של חשבון ה-ARVIO שלך</div>
      </div>
    </div>
    <div class="card-grid">
      <div class="stat-card"><div class="stat-label">פרופילים</div><div class="stat-value gold">${profiles.length || 1}</div></div>
      <div class="stat-card"><div class="stat-label">הרחבות</div><div class="stat-value">${addons.filter(a => a.isEnabled).length}</div></div>
      <div class="stat-card"><div class="stat-label">היסטוריית צפייה</div><div class="stat-value">${histRes.count ?? '—'}</div></div>
      <div class="stat-card"><div class="stat-label">רשימת צפייה</div><div class="stat-value">${wlRes.count ?? '—'}</div></div>
    </div>
    <div class="card">
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px">פעילות אחרונה</div>
      <div id="recent-activity"><div class="loading"><div class="spinner"></div></div></div>
    </div>
  `;

  const { data: recent } = await db.from('watch_history')
    .select('title, media_type, progress, updated_at, poster_path, backdrop_path')
    .eq('user_id', state.userId)
    .order('updated_at', { ascending: false })
    .limit(6);

  const ra = document.getElementById('recent-activity');
  if (!recent?.length) {
    ra.innerHTML = emptyState('אין פעילות אחרונה');
    return;
  }
  ra.innerHTML = recent.map(r => `
    <div class="list-item">
      <img class="history-poster" src="${r.poster_path ? TMDB_IMG + r.poster_path : ''}" onerror="this.style.background='var(--bg-card2)';this.src=''" alt="">
      <div class="item-info">
        <div class="item-title">${r.title || '—'}</div>
        <div class="item-sub">${r.media_type === 'movie' ? '🎬 סרט' : '📺 סדרה'} · ${timeAgo(r.updated_at)}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${Math.round((r.progress||0)*100)}%"></div></div>
      </div>
      <span class="badge badge-gray">${Math.round((r.progress||0)*100)}%</span>
    </div>
  `).join('');
}

// ── Profiles ──────────────────────────────────────────────────────────────
function getProfileColors() {
  return ['#E53935','#8E24AA','#1E88E5','#00897B','#F4511E','#6D4C41','#3949AB','#039BE5'];
}

function renderProfileAvatar(profile) {
  const color = '#' + (profile.avatarColor?.toString(16).padStart(8,'0').slice(2) || 'F5C442');
  const letter = (profile.name || '?')[0].toUpperCase();
  return `<div class="profile-avatar-big" style="background:${color}22;color:${color}">${letter}</div>`;
}

async function renderProfiles() {
  const main = document.getElementById('main-content');
  const payload = state.syncPayload;
  const profiles = payload?.profiles ?? [];
  const activeId = payload?.activeProfileId;

  if (!profiles.length) {
    main.innerHTML = `
      <div class="section-header"><div class="section-title">פרופילים</div></div>
      ${emptyState('אין פרופילים — פתח את ARVIO בטלוויזיה ליצירת פרופיל')}`;
    return;
  }

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">פרופילים</div><div class="section-sub">${profiles.length} פרופילים בחשבון</div></div>
    </div>
    <div class="profiles-grid">
      ${profiles.map(p => `
        <div class="profile-card ${p.id === activeId ? 'active-profile' : ''}">
          ${renderProfileAvatar(p)}
          <div class="profile-name">${p.name}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">
            ${p.id === activeId ? '<span class="badge badge-gold">פעיל</span>' : ''}
            ${p.isKidsProfile ? '<span class="badge badge-blue">ילדים</span>' : ''}
            ${p.pin ? '<span class="badge badge-gray">🔒 נעול</span>' : ''}
          </div>
        </div>
      `).join('')}
    </div>
    <div class="card">
      <div style="font-size:13px;color:var(--text-muted)">💡 ניהול פרופילים (יצירה, מחיקה, שינוי שם) זמין ב-ARVIO על הטלוויזיה.<br>שינויים מסונכרנים אוטומטית עם הענן.</div>
    </div>
  `;
}

// ── Addons ────────────────────────────────────────────────────────────────
function getAddons(payload) {
  if (!payload) return [];
  const shared = payload.addons ?? [];
  const byProfile = payload.addonsByProfile ?? {};
  const allIds = new Set();
  const all = [...shared];
  Object.values(byProfile).forEach(arr => {
    (arr || []).forEach(a => { if (!allIds.has(a.id)) { allIds.add(a.id); all.push(a); } });
  });
  return all;
}

async function renderAddons() {
  const main = document.getElementById('main-content');
  const addons = getAddons(state.syncPayload);

  if (!addons.length) {
    main.innerHTML = `
      <div class="section-header"><div class="section-title">הרחבות</div></div>
      ${emptyState('אין הרחבות מותקנות')}`;
    return;
  }

  const byType = {
    STREMIO: addons.filter(a => a.runtimeKind !== 'TELEGRAM'),
    TELEGRAM: addons.filter(a => a.runtimeKind === 'TELEGRAM'),
  };

  function addonIcon(a) {
    if (a.manifest?.logo || a.logo) {
      return `<img src="${a.manifest?.logo || a.logo}" alt="" onerror="this.style.display='none'">`;
    }
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>`;
  }

  function addonTypeBadge(a) {
    const t = a.type || 'COMMUNITY';
    if (t === 'OFFICIAL') return '<span class="badge badge-gold">רשמי</span>';
    if (t === 'SUBTITLE') return '<span class="badge badge-blue">כתוביות</span>';
    if (t === 'METADATA') return '<span class="badge badge-gray">מטאדאטה</span>';
    if (a.runtimeKind === 'TELEGRAM') return '<span class="badge badge-blue">Telegram</span>';
    return '<span class="badge badge-gray">קהילה</span>';
  }

  function renderAddonList(list, label) {
    if (!list.length) return '';
    return `
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin:20px 0 12px">${label}</div>
      <div class="card" style="padding:0 20px">
        ${list.map(a => `
          <div class="list-item">
            <div class="item-icon">${addonIcon(a)}</div>
            <div class="item-info">
              <div class="item-title">${a.name || a.id}</div>
              <div class="item-sub">${a.manifest?.description || a.description || a.id}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              ${addonTypeBadge(a)}
              <span class="badge ${a.isEnabled ? 'badge-green' : 'badge-red'}">${a.isEnabled ? 'פעיל' : 'כבוי'}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">הרחבות</div><div class="section-sub">${addons.filter(a=>a.isEnabled).length} פעילות מתוך ${addons.length}</div></div>
    </div>
    ${renderAddonList(byType.STREMIO, `Stremio הרחבות (${byType.STREMIO.length})`)}
    ${renderAddonList(byType.TELEGRAM, `Telegram מקורות (${byType.TELEGRAM.length})`)}
    <div class="card" style="margin-top:16px">
      <div style="font-size:13px;color:var(--text-muted)">💡 להוספה/הסרה של הרחבות — גש להגדרות ב-ARVIO. הנתונים מסונכרנים אוטומטית.</div>
    </div>
  `;
}

// ── Watch History ─────────────────────────────────────────────────────────
async function renderHistory() {
  const main = document.getElementById('main-content');

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">היסטוריית צפייה</div></div>
    </div>
    <div class="tabs">
      <button class="tab ${state.historyTab==='movies'?'active':''}" onclick="state.historyTab='movies';renderHistoryContent()">סרטים</button>
      <button class="tab ${state.historyTab==='tv'?'active':''}" onclick="state.historyTab='tv';renderHistoryContent()">סדרות</button>
      <button class="tab ${state.historyTab==='all'?'active':''}" onclick="state.historyTab='all';renderHistoryContent()">הכל</button>
    </div>
    <div id="history-content"><div class="loading"><div class="spinner"></div></div></div>
  `;
  await renderHistoryContent();
}

async function renderHistoryContent() {
  document.querySelectorAll('.tab').forEach(t => {
    const map = { movies: 'סרטים', tv: 'סדרות', all: 'הכל' };
    t.classList.toggle('active', t.textContent.trim() === map[state.historyTab]);
  });

  const el = document.getElementById('history-content');
  if (!el) return;
  el.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

  let q = db.from('watch_history')
    .select('*')
    .eq('user_id', state.userId)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (state.historyTab === 'movies') q = q.eq('media_type', 'movie');
  if (state.historyTab === 'tv') q = q.eq('media_type', 'tv');

  const { data, error } = await q;
  if (error) { el.innerHTML = `<div class="empty"><div class="empty-title">שגיאה בטעינה</div></div>`; return; }
  if (!data?.length) { el.innerHTML = emptyState('אין היסטוריית צפייה'); return; }

  el.innerHTML = `<div class="card" style="padding:0 20px">
    ${data.map(r => `
      <div class="list-item">
        <img class="history-poster" src="${r.poster_path ? TMDB_IMG+r.poster_path : ''}" onerror="this.style.background='var(--bg-card2)';this.src=''" alt="">
        <div class="item-info">
          <div class="item-title">${r.title || '—'}${r.season ? ` S${String(r.season).padStart(2,'0')}E${String(r.episode||0).padStart(2,'0')}` : ''}</div>
          <div class="item-sub">${timeAgo(r.updated_at)} · ${formatDuration(r.position_seconds)} / ${formatDuration(r.duration_seconds)}</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.round((r.progress||0)*100)}%"></div></div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <span class="badge badge-gray">${Math.round((r.progress||0)*100)}%</span>
          <button class="btn btn-danger" style="padding:4px 10px;font-size:11px" onclick="deleteHistory('${r.id}',this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </div>
    `).join('')}
  </div>`;
}

async function deleteHistory(id, btn) {
  btn.disabled = true;
  const { error } = await db.from('watch_history').delete().eq('id', id).eq('user_id', state.userId);
  if (error) { toast('שגיאה במחיקה', 'err'); btn.disabled = false; return; }
  toast('הוסר מההיסטוריה ✓');
  btn.closest('.list-item').remove();
}

// ── Watchlist ─────────────────────────────────────────────────────────────
async function renderWatchlist() {
  const main = document.getElementById('main-content');
  main.innerHTML = `<div class="section-header"><div class="section-title">רשימת צפייה</div></div><div class="loading"><div class="spinner"></div></div>`;

  const { data, error } = await db.from('watchlist')
    .select('*')
    .eq('user_id', state.userId)
    .order('added_at', { ascending: false });

  if (error || !data?.length) {
    main.innerHTML = `<div class="section-header"><div class="section-title">רשימת צפייה</div></div>${emptyState('רשימת הצפייה ריקה')}`;
    return;
  }

  const movies = data.filter(i => i.media_type === 'movie');
  const shows = data.filter(i => i.media_type === 'tv');

  function renderWLSection(items, label) {
    if (!items.length) return '';
    return `
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin:20px 0 12px">${label} (${items.length})</div>
      <div class="card" style="padding:0 20px">
        ${items.map(i => `
          <div class="list-item" id="wl-${i.tmdb_id}-${i.media_type}">
            <div class="item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${i.media_type==='movie'?'<path d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>':'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'}
              </svg>
            </div>
            <div class="item-info">
              <div class="item-title">TMDB #${i.tmdb_id}</div>
              <div class="item-sub">נוסף ${timeAgo(i.added_at)}</div>
            </div>
            <button class="btn btn-danger" style="padding:6px 10px" onclick="removeWatchlist(${i.tmdb_id},'${i.media_type}',this)">הסר</button>
          </div>
        `).join('')}
      </div>`;
  }

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">רשימת צפייה</div><div class="section-sub">${data.length} פריטים</div></div>
    </div>
    ${renderWLSection(movies, '🎬 סרטים')}
    ${renderWLSection(shows, '📺 סדרות')}
  `;
}

async function removeWatchlist(tmdbId, mediaType, btn) {
  btn.disabled = true;
  const { error } = await db.from('watchlist').delete()
    .eq('user_id', state.userId).eq('tmdb_id', tmdbId).eq('media_type', mediaType);
  if (error) { toast('שגיאה במחיקה', 'err'); btn.disabled = false; return; }
  toast('הוסר מהרשימה ✓');
  document.getElementById(`wl-${tmdbId}-${mediaType}`)?.remove();
}

// ── AI Subtitle Translation ────────────────────────────────────────────────
async function renderAI() {
  const main = document.getElementById('main-content');
  const payload = state.syncPayload;
  const enabled = payload?.subtitleAiEnabled ?? false;
  const autoSelect = payload?.subtitleAiAutoSelect ?? false;
  const model = payload?.subtitleAiModel ?? 'GROQ_LLAMA_70B';
  const removeHI = payload?.subtitleRemoveHearingImpaired ?? false;

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">תרגום כתוביות AI</div><div class="section-sub">הגדר תרגום כתוביות בזמן אמת על ידי AI</div></div>
    </div>

    <div class="tv-banner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
      <div>
        <div class="tv-banner-title">🔑 מפתח API — הגדר ישירות בטלוויזיה</div>
        <div class="tv-banner-sub">מטעמי אבטחה, מפתח ה-API נשמר רק מקומית בטלוויזיה.<br>פתח את ARVIO ← הגדרות ← כתוביות ← תרגום AI</div>
      </div>
    </div>

    <div class="card">
      <div style="font-size:16px;font-weight:700;margin-bottom:16px">הגדרות תרגום</div>

      <div class="form-group">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-weight:600">הפעל תרגום AI</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">תרגם כתוביות אוטומטית בזמן צפייה</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="ai-enabled" ${enabled ? 'checked' : ''} onchange="updateAISetting('subtitleAiEnabled', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-weight:600">בחירה אוטומטית</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">בחר אוטומטית כתוביות לתרגום</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="ai-auto" ${autoSelect ? 'checked' : ''} onchange="updateAISetting('subtitleAiAutoSelect', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-weight:600">הסר כתוביות לכבדי שמיעה</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">הסר תיאורי קול מהכתוביות [SDH]</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="ai-hi" ${removeHI ? 'checked' : ''} onchange="updateAISetting('subtitleRemoveHearingImpaired', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>

    <div class="card">
      <div style="font-size:16px;font-weight:700;margin-bottom:16px">בחר מודל AI</div>
      <div class="models-grid">
        <label class="model-card ${model==='GROQ_LLAMA_70B'?'selected':''}">
          <input type="radio" name="ai-model" value="GROQ_LLAMA_70B" ${model==='GROQ_LLAMA_70B'?'checked':''} onchange="updateAISetting('subtitleAiModel',this.value)">
          <div>
            <div class="model-name">⚡ Groq Llama 70B</div>
            <div class="model-desc">מהיר ביותר, חינמי, מומלץ לתרגום כתוביות</div>
          </div>
        </label>
        <label class="model-card ${model==='GEMINI_FLASH_25'?'selected':''}">
          <input type="radio" name="ai-model" value="GEMINI_FLASH_25" ${model==='GEMINI_FLASH_25'?'checked':''} onchange="updateAISetting('subtitleAiModel',this.value)">
          <div>
            <div class="model-name">🤖 Gemini Flash 2.5</div>
            <div class="model-desc">Google Gemini, איכות גבוהה, מהיר מאוד</div>
          </div>
        </label>
      </div>

      <div style="background:var(--bg-card2);border-radius:8px;padding:14px 16px;margin-top:8px">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px">איך לקבל מפתח API חינמי?</div>
        <div style="font-size:12px;color:var(--text-muted);line-height:1.7">
          🔹 <b>Groq (מומלץ)</b>: גש ל-<code style="background:var(--bg);padding:1px 5px;border-radius:4px">console.groq.com</code> ← צור חשבון ← API Keys ← Create Key<br>
          🔹 <b>Gemini</b>: גש ל-<code style="background:var(--bg);padding:1px 5px;border-radius:4px">aistudio.google.com</code> ← Get API Key
        </div>
      </div>
    </div>
  `;
}

async function updateAISetting(key, value) {
  if (!state.syncPayload) { toast('אין נתוני סנכרון', 'err'); return; }
  state.syncPayload[key] = value;
  try {
    await saveSyncPayload(state.syncPayload);
    toast('נשמר ✓');
    // Update model card UI
    if (key === 'subtitleAiModel') {
      document.querySelectorAll('.model-card').forEach(card => {
        const inp = card.querySelector('input');
        card.classList.toggle('selected', inp?.value === value);
      });
    }
  } catch (e) {
    toast('שגיאה בשמירה', 'err');
  }
}

// ── Settings ──────────────────────────────────────────────────────────────
async function renderSettings() {
  const main = document.getElementById('main-content');
  const p = state.syncPayload;

  const cardLayout = p?.cardLayoutMode ?? 'landscape';
  const accentColor = p?.accentColor ?? '#F5C442';
  const oled = p?.oledBlackBackground ?? true;
  const skipProfile = p?.skipProfileSelection ?? false;
  const lang = p?.lastAppLanguage ?? 'en';

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">הגדרות</div><div class="section-sub">הגדרות כלליות לחשבון</div></div>
    </div>

    <div class="card">
      <div style="font-size:16px;font-weight:700;margin-bottom:16px">מראה</div>

      <div class="form-group">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-weight:600">רקע OLED שחור</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">רקע שחור לחלוטין לחיסכון בסוללה</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${oled?'checked':''} onchange="updateSetting('oledBlackBackground',this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">פריסת כרטיסי מדיה</label>
        <select class="form-select" onchange="updateSetting('cardLayoutMode',this.value)">
          <option value="landscape" ${cardLayout==='landscape'?'selected':''}>Landscape (רוחב)</option>
          <option value="portrait" ${cardLayout==='portrait'?'selected':''}>Portrait (אנכי)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">שפת ממשק</label>
        <select class="form-select" onchange="updateSetting('lastAppLanguage',this.value)">
          <option value="en" ${lang==='en'?'selected':''}>English</option>
          <option value="he" ${lang==='he'?'selected':''}>עברית</option>
          <option value="ar" ${lang==='ar'?'selected':''}>العربية</option>
          <option value="fr" ${lang==='fr'?'selected':''}>Français</option>
          <option value="de" ${lang==='de'?'selected':''}>Deutsch</option>
          <option value="es" ${lang==='es'?'selected':''}>Español</option>
          <option value="ru" ${lang==='ru'?'selected':''}>Русский</option>
          <option value="tr" ${lang==='tr'?'selected':''}>Türkçe</option>
        </select>
      </div>
    </div>

    <div class="card">
      <div style="font-size:16px;font-weight:700;margin-bottom:16px">פרופיל</div>
      <div class="form-group">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-weight:600">דלג על בחירת פרופיל</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">עבור ישירות לאפליקציה עם הפרופיל הפעיל</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${skipProfile?'checked':''} onchange="updateSetting('skipProfileSelection',this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>

    <div class="card">
      <div style="font-size:16px;font-weight:700;margin-bottom:16px">חשבון</div>
      <div class="list-item" style="padding:10px 0;border:none">
        <div class="item-info">
          <div class="item-title">מזהה משתמש</div>
          <div class="item-sub" style="font-family:monospace;font-size:11px">${state.userId}</div>
        </div>
      </div>
      <button class="btn btn-danger" onclick="signOut()" style="margin-top:8px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        התנתק
      </button>
    </div>
  `;
}

async function updateSetting(key, value) {
  if (!state.syncPayload) { toast('אין נתוני סנכרון', 'err'); return; }
  state.syncPayload[key] = value;
  try {
    await saveSyncPayload(state.syncPayload);
    toast('נשמר ✓');
  } catch (e) {
    toast('שגיאה בשמירה', 'err');
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return '';
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'עכשיו';
  if (m < 60) return `לפני ${m} דק׳`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} שע׳`;
  const days = Math.floor(h / 24);
  if (days < 30) return `לפני ${days} ימים`;
  return new Date(iso).toLocaleDateString('he-IL');
}

function formatDuration(secs) {
  if (!secs) return '0:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function emptyState(msg) {
  return `<div class="empty">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
    <div class="empty-title">${msg}</div>
  </div>`;
}

// ── Shell ─────────────────────────────────────────────────────────────────
function buildShell(user) {
  const name = user.user_metadata?.full_name || user.email || 'משתמש';
  const avatar = user.user_metadata?.avatar_url || '';
  const email = user.email || '';
  const initial = name[0].toUpperCase();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { id: 'profiles', label: 'פרופילים', icon: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>' },
    { id: 'addons', label: 'הרחבות', icon: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/>' },
    { id: 'history', label: 'היסטוריה', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
    { id: 'watchlist', label: 'רשימת צפייה', icon: '<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>' },
    { id: 'ai', label: 'תרגום AI', icon: '<path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>' },
    { id: 'settings', label: 'הגדרות', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M1 12h2M21 12h2M12 1v2M12 21v2"/>' },
  ];

  document.getElementById('app-screen').innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="../assets/arvio-icon-512.png" class="auth-logo" style="width:32px;height:32px" onerror="this.style.display='none'" alt="ARVIO">
        <span>ARVIO</span>
      </div>
      <nav>
        ${navItems.map(n => `
          <button class="nav-item ${n.id === state.activeSection ? 'active' : ''}" data-section="${n.id}" onclick="navigate('${n.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${n.icon}</svg>
            ${n.label}
          </button>
        `).join('')}
      </nav>
      <div class="sidebar-user">
        <div class="user-avatar">
          ${avatar ? `<img src="${avatar}" alt="">` : initial}
        </div>
        <div class="user-info">
          <div class="user-name">${name}</div>
          <div class="user-email">${email}</div>
        </div>
        <button class="btn-logout" onclick="signOut()" title="התנתק">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>
    <main class="main" id="main-content"></main>
  `;
}

// ── Boot ──────────────────────────────────────────────────────────────────
async function boot() {
  const { data: { session } } = await db.auth.getSession();

  if (!session) {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
    return;
  }

  state.session = session;
  state.userId = session.user.id;

  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'flex';

  buildShell(session.user);

  state.syncPayload = await loadSyncPayload();

  await renderSection();

  db.auth.onAuthStateChange((_e, s) => {
    if (!s) location.reload();
  });
}

boot();
