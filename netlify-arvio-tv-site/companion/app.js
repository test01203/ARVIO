// ── API Config ────────────────────────────────────────────────────────────
const API_BASE = 'https://auth.arvio.tv/.netlify/functions';
const APP_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZHd2b3J0Y2Zub3lrbHR6dXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NDU4NzMsImV4cCI6MjA4MjMyMTg3M30.YfKZbSwxGs6_xMd6jkDtn1PKkfuyOHo9qVhUvFRddGU';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w92';
const SESSION_KEY = 'arvio_companion_session';

// ── API Helper ────────────────────────────────────────────────────────────
async function apiCall(endpoint, { method = 'POST', body, token } = {}) {
  const headers = {
    'content-type': 'application/json',
    'apikey': APP_ANON_KEY,
    'authorization': `Bearer ${token || APP_ANON_KEY}`,
  };
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { statusCode: res.status, code: data.code });
  return data;
}

// ── i18n ──────────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    nav_dashboard: 'Dashboard', nav_profiles: 'Profiles', nav_addons: 'Add-ons',
    nav_iptv: 'IPTV', nav_plugins: 'Plugins', nav_watchlist: 'Watchlist',
    nav_ai: 'AI Subtitles', nav_settings: 'Settings',
    sign_out: 'Sign out', user_fallback: 'User', loading: 'Loading...',
    saved: 'Saved ✓', save_err: 'Failed to save', no_sync: 'No sync data',
    auth_title: 'ARVIO Companion',
    auth_sub: 'Manage your ARVIO account — profiles, add-ons, history & AI subtitles',
    auth_email: 'Email', auth_password: 'Password',
    auth_signin: 'Sign In', auth_signup: 'Create Account',
    auth_forgot: 'Forgot password?', auth_sending: 'Signing in...',
    auth_err_fields: 'Please enter email and password',
    dash_sub: 'A quick overview of your ARVIO account',
    stat_profiles: 'Profiles', stat_addons: 'Add-ons', stat_watchlist: 'Watchlist',
    profiles_title: 'Profiles',
    profiles_sub: (n) => `${n} profile${n !== 1 ? 's' : ''} in account`,
    profiles_empty: 'No profiles found — open ARVIO on your TV to create one',
    profiles_tip: '💡 Profile management is available in ARVIO on your TV. Changes sync automatically.',
    badge_active: 'Active', badge_kids: 'Kids', badge_locked: '🔒 Locked',
    addons_title: 'Add-ons',
    addons_sub: (a, t) => `${a} active of ${t}`,
    addons_empty: 'No add-ons installed',
    addons_tip: '💡 To add or remove add-ons, go to Settings in ARVIO on your TV.',
    badge_official: 'Official', badge_subtitles: 'Subtitles',
    badge_metadata: 'Metadata', badge_community: 'Community',
    badge_telegram: 'Telegram', badge_enabled: 'Enabled', badge_disabled: 'Disabled',
    stremio_label: (n) => `Stremio Add-ons (${n})`,
    telegram_label: (n) => `Telegram Sources (${n})`,
    iptv_sub: (n) => `${n} active playlist${n !== 1 ? 's' : ''}`,
    iptv_empty: 'No IPTV playlists configured',
    iptv_m3u: 'M3U Playlists', iptv_active: 'Active', iptv_disabled: 'Disabled',
    fav_groups: (n) => `Favourite Groups (${n})`,
    fav_channels: (n) => `Favourite Channels (${n})`,
    iptv_more: (n) => `+${n} more`,
    iptv_tip: '💡 To add M3U playlists — go to IPTV Settings in ARVIO.',
    plugins_title: 'Plugins (Sideload)',
    plugins_sub: (r, s) => `${r} repositor${r !== 1 ? 'ies' : 'y'} · ${s} scrapers`,
    plugins_status_on: 'Plugins enabled', plugins_status_off: 'Plugins disabled',
    plugins_empty: 'No plugin repositories',
    repos_label: (n) => `Repositories (${n})`,
    repo_updated: 'updated', repo_never: 'never',
    scrapers_label: (n) => `Scrapers (${n})`,
    plugin_active: 'Active', plugin_disabled: 'Disabled',
    plugins_tip: '💡 Plugin JS code stays local on your TV and is never uploaded.',
    watchlist_title: 'Watchlist',
    watchlist_sub: (n) => `${n} item${n !== 1 ? 's' : ''}`,
    watchlist_empty: 'Your watchlist is empty',
    wl_movies: '🎬 Movies', wl_tv: '📺 TV Shows',
    ai_title: 'AI Subtitle Translation',
    ai_sub: 'Configure real-time AI subtitle translation',
    ai_banner_title: '🔑 API Key — set directly on your TV',
    ai_banner_sub: 'For security, your API key is stored locally on your TV only.',
    ai_settings_title: 'Translation Settings',
    ai_enable: 'Enable AI Translation', ai_enable_desc: 'Automatically translate subtitles while watching',
    ai_auto: 'Auto-select', ai_auto_desc: 'Automatically pick subtitles for translation',
    ai_hi: 'Remove Hearing Impaired (HI)', ai_hi_desc: 'Strip audio descriptions from subtitles [SDH]',
    ai_model_title: 'Select AI Model',
    ai_groq_desc: 'Fastest · Free · Great quality for subtitles',
    ai_gemini_desc: 'Google Gemini, high quality, very fast',
    ai_key_title: 'How to get a free API key?',
    ai_key_desc: '🔹 <b>Groq (recommended)</b>: go to <code>console.groq.com</code> → Create account → API Keys<br>🔹 <b>Gemini</b>: go to <code>aistudio.google.com</code> → Get API Key',
    ai_recommended: 'Recommended',
    settings_title: 'Settings', settings_sub: 'General account settings',
    appearance: 'Appearance',
    oled_label: 'OLED Black Background', oled_desc: 'Pure black background for OLED screens',
    layout_label: 'Media Card Layout', layout_landscape: 'Landscape', layout_portrait: 'Portrait',
    lang_label: 'App Language',
    profile_section: 'Profile',
    skip_label: 'Skip Profile Selection', skip_desc: 'Launch directly into the app',
    account_section: 'Account', user_id_label: 'User ID',
    tv_pair_title: 'Connect TV', tv_pair_sub: 'Enter the code shown on your TV screen',
    tv_code_label: 'Code from TV', tv_connect: '🔗 Connect TV',
    tv_connecting: '⏳ Connecting...', tv_success: '✓ TV connected! You can close this page.',
    tv_err_code: 'Please enter the code from your TV',
    just_now: 'just now', m_ago: (m) => `${m}m ago`, h_ago: (h) => `${h}h ago`, d_ago: (d) => `${d}d ago`,
  },
  he: {
    nav_dashboard: 'דשבורד', nav_profiles: 'פרופילים', nav_addons: 'הרחבות',
    nav_iptv: 'IPTV', nav_plugins: 'פלאגינים', nav_watchlist: 'רשימת צפייה',
    nav_ai: 'כתוביות AI', nav_settings: 'הגדרות',
    sign_out: 'התנתק', user_fallback: 'משתמש', loading: 'טוען...',
    saved: 'נשמר ✓', save_err: 'שגיאה בשמירה', no_sync: 'אין נתוני סנכרון',
    auth_title: 'ARVIO Companion',
    auth_sub: 'נהל את חשבון ה-ARVIO שלך — פרופילים, הרחבות, ותרגום AI',
    auth_email: 'אימייל', auth_password: 'סיסמה',
    auth_signin: 'התחבר', auth_signup: 'צור חשבון',
    auth_forgot: 'שכחת סיסמה?', auth_sending: 'מתחבר...',
    auth_err_fields: 'אנא הזן אימייל וסיסמה',
    dash_sub: 'סקירה מהירה של חשבון ה-ARVIO שלך',
    stat_profiles: 'פרופילים', stat_addons: 'הרחבות', stat_watchlist: 'רשימת צפייה',
    profiles_title: 'פרופילים',
    profiles_sub: (n) => `${n} פרופילים בחשבון`,
    profiles_empty: 'אין פרופילים — פתח את ARVIO בטלוויזיה ליצירת פרופיל',
    profiles_tip: '💡 ניהול פרופילים זמין ב-ARVIO על הטלוויזיה. שינויים מסונכרנים אוטומטית.',
    badge_active: 'פעיל', badge_kids: 'ילדים', badge_locked: '🔒 נעול',
    addons_title: 'הרחבות',
    addons_sub: (a, total) => `${a} פעילות מתוך ${total}`,
    addons_empty: 'אין הרחבות מותקנות',
    addons_tip: '💡 להוספה/הסרה של הרחבות — גש להגדרות ב-ARVIO.',
    badge_official: 'רשמי', badge_subtitles: 'כתוביות',
    badge_metadata: 'מטאדאטה', badge_community: 'קהילה',
    badge_telegram: 'Telegram', badge_enabled: 'פעיל', badge_disabled: 'כבוי',
    stremio_label: (n) => `הרחבות Stremio (${n})`,
    telegram_label: (n) => `מקורות Telegram (${n})`,
    iptv_sub: (n) => `${n} רשימות פעילות`,
    iptv_empty: 'אין רשימות IPTV מוגדרות',
    iptv_m3u: 'רשימות M3U', iptv_active: 'פעיל', iptv_disabled: 'כבוי',
    fav_groups: (n) => `קבוצות מועדפות (${n})`,
    fav_channels: (n) => `ערוצים מועדפים (${n})`,
    iptv_more: (n) => `+${n} נוספים`,
    iptv_tip: '💡 להוספת רשימות M3U — גש להגדרות IPTV ב-ARVIO.',
    plugins_title: 'פלאגינים (Sideload)',
    plugins_sub: (r, s) => `${r} מאגרים · ${s} scrapers`,
    plugins_status_on: 'פלאגינים פעילים', plugins_status_off: 'פלאגינים כבויים',
    plugins_empty: 'אין מאגרי פלאגינים',
    repos_label: (n) => `מאגרים (${n})`,
    repo_updated: 'עודכן', repo_never: 'אף פעם',
    scrapers_label: (n) => `Scrapers (${n})`,
    plugin_active: 'פעיל', plugin_disabled: 'כבוי',
    plugins_tip: '💡 קוד ה-JS של כל scraper נשמר מקומית בטלוויזיה בלבד.',
    watchlist_title: 'רשימת צפייה',
    watchlist_sub: (n) => `${n} פריטים`,
    watchlist_empty: 'רשימת הצפייה ריקה',
    wl_movies: '🎬 סרטים', wl_tv: '📺 סדרות',
    ai_title: 'תרגום כתוביות AI',
    ai_sub: 'הגדר תרגום כתוביות בזמן אמת על ידי AI',
    ai_banner_title: '🔑 מפתח API — הגדר ישירות בטלוויזיה',
    ai_banner_sub: 'מטעמי אבטחה, מפתח ה-API נשמר רק מקומית בטלוויזיה.',
    ai_settings_title: 'הגדרות תרגום',
    ai_enable: 'הפעל תרגום AI', ai_enable_desc: 'תרגם כתוביות אוטומטית בזמן צפייה',
    ai_auto: 'בחירה אוטומטית', ai_auto_desc: 'בחר אוטומטית כתוביות לתרגום',
    ai_hi: 'הסר כתוביות לכבדי שמיעה', ai_hi_desc: 'הסר תיאורי קול מהכתוביות [SDH]',
    ai_model_title: 'בחר מודל AI',
    ai_groq_desc: 'מהיר ביותר, חינמי, מומלץ לתרגום כתוביות',
    ai_gemini_desc: 'Google Gemini, איכות גבוהה, מהיר מאוד',
    ai_key_title: 'איך לקבל מפתח API חינמי?',
    ai_key_desc: '🔹 <b>Groq (מומלץ)</b>: גש ל-<code>console.groq.com</code> ← צור חשבון ← API Keys<br>🔹 <b>Gemini</b>: גש ל-<code>aistudio.google.com</code> ← Get API Key',
    ai_recommended: 'מומלץ',
    settings_title: 'הגדרות', settings_sub: 'הגדרות כלליות לחשבון',
    appearance: 'מראה',
    oled_label: 'רקע OLED שחור', oled_desc: 'רקע שחור לחלוטין לחיסכון בסוללה',
    layout_label: 'פריסת כרטיסי מדיה', layout_landscape: 'Landscape (רוחב)', layout_portrait: 'Portrait (אנכי)',
    lang_label: 'שפת ממשק',
    profile_section: 'פרופיל',
    skip_label: 'דלג על בחירת פרופיל', skip_desc: 'עבור ישירות לאפליקציה עם הפרופיל הפעיל',
    account_section: 'חשבון', user_id_label: 'מזהה משתמש',
    tv_pair_title: 'חיבור טלוויזיה', tv_pair_sub: 'הזן את הקוד המוצג בטלוויזיה',
    tv_code_label: 'קוד מהטלוויזיה', tv_connect: '🔗 חבר טלוויזיה',
    tv_connecting: '⏳ מתחבר...', tv_success: '✓ הטלוויזיה התחברה! ניתן לסגור את הדף.',
    tv_err_code: 'אנא הזן את הקוד מהטלוויזיה',
    just_now: 'עכשיו', m_ago: (m) => `לפני ${m} דק׳`, h_ago: (h) => `לפני ${h} שע׳`, d_ago: (d) => `לפני ${d} ימים`,
  },
};

let currentLang = localStorage.getItem('arvio_lang') || 'en';

function t(key, ...args) {
  const s = STRINGS[currentLang][key];
  return typeof s === 'function' ? s(...args) : (s ?? key);
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('arvio_lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  if (state.session) { buildShell(state.session); renderSection(); }
}

// ── State ─────────────────────────────────────────────────────────────────
let state = {
  session: null,     // { access_token, refresh_token, email, id }
  syncPayload: null,
  activeSection: 'dashboard',
};

// ── Session persistence ───────────────────────────────────────────────────
function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  state.session = session;
}

function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  state.session = null;
}

// ── Toast ─────────────────────────────────────────────────────────────────
function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show toast-${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ''; }, 3000);
}

// ── Auth ──────────────────────────────────────────────────────────────────
async function signIn() {
  const email = document.getElementById('auth-email')?.value?.trim();
  const password = document.getElementById('auth-password')?.value;
  const statusEl = document.getElementById('auth-status');
  const btnSignin = document.getElementById('auth-btn-signin');
  const btnSignup = document.getElementById('auth-btn-signup');

  if (!email || !password) {
    statusEl.style.color = 'var(--red)';
    statusEl.textContent = t('auth_err_fields');
    return;
  }

  statusEl.style.color = 'var(--text-muted)';
  statusEl.textContent = t('auth_sending');
  btnSignin.disabled = btnSignup.disabled = true;

  try {
    const data = await apiCall('auth-login', { body: { email, password } });
    saveSession({ access_token: data.access_token, refresh_token: data.refresh_token, email: data.user?.email || email, id: data.user?.id });
    await bootApp();
  } catch (e) {
    statusEl.style.color = 'var(--red)';
    statusEl.textContent = e.message;
    btnSignin.disabled = btnSignup.disabled = false;
  }
}

async function signUp() {
  const email = document.getElementById('auth-email')?.value?.trim();
  const password = document.getElementById('auth-password')?.value;
  const statusEl = document.getElementById('auth-status');
  const btnSignin = document.getElementById('auth-btn-signin');
  const btnSignup = document.getElementById('auth-btn-signup');

  if (!email || !password) {
    statusEl.style.color = 'var(--red)';
    statusEl.textContent = t('auth_err_fields');
    return;
  }

  statusEl.style.color = 'var(--text-muted)';
  statusEl.textContent = t('auth_sending');
  btnSignin.disabled = btnSignup.disabled = true;

  try {
    const data = await apiCall('cloud-auth-email', { body: { email, password } });
    saveSession({ access_token: data.access_token, refresh_token: data.refresh_token, email: data.user?.email || email, id: data.user?.id });
    await bootApp();
  } catch (e) {
    statusEl.style.color = 'var(--red)';
    statusEl.textContent = e.message;
    btnSignin.disabled = btnSignup.disabled = false;
  }
}

async function signOut() {
  clearSession();
  location.reload();
}

// ── Account Sync ──────────────────────────────────────────────────────────
async function loadSyncPayload() {
  try {
    const data = await apiCall('account-sync-pull', { method: 'GET', token: state.session.access_token });
    return data.payload || null;
  } catch { return null; }
}

async function saveSyncPayload(payload) {
  await apiCall('account-sync-push', {
    body: { payload },
    token: state.session.access_token,
  });
  state.syncPayload = payload;
}

// ── Sections ──────────────────────────────────────────────────────────────
const sections = {
  dashboard: renderDashboard,
  profiles:  renderProfiles,
  addons:    renderAddons,
  iptv:      renderIPTV,
  plugins:   renderPlugins,
  watchlist: renderWatchlist,
  ai:        renderAI,
  settings:  renderSettings,
  tvpair:    renderTVPair,
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
  main.innerHTML = `<div class="loading"><div class="spinner"></div> ${t('loading')}</div>`;
  await sections[state.activeSection]?.();
}

// ── Dashboard ─────────────────────────────────────────────────────────────
async function renderDashboard() {
  const main = document.getElementById('main-content');
  const payload = state.syncPayload;
  const profiles = payload?.profiles ?? [];
  const addons = getAddons(payload);

  // collect watchlist count across profiles
  const wlCount = Object.values(payload?.watchlistByProfile ?? {})
    .reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);

  main.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">${t('nav_dashboard')}</div>
        <div class="section-sub">${t('dash_sub')}</div>
      </div>
    </div>
    <div class="card-grid">
      <div class="stat-card"><div class="stat-label">${t('stat_profiles')}</div><div class="stat-value gold">${profiles.length || 0}</div></div>
      <div class="stat-card"><div class="stat-label">${t('stat_addons')}</div><div class="stat-value">${addons.filter(a => a.isEnabled).length}</div></div>
      <div class="stat-card"><div class="stat-label">${t('stat_watchlist')}</div><div class="stat-value">${wlCount}</div></div>
    </div>
  `;
}

// ── Profiles ──────────────────────────────────────────────────────────────
async function renderProfiles() {
  const main = document.getElementById('main-content');
  const payload = state.syncPayload;
  const profiles = payload?.profiles ?? [];
  const activeId = payload?.activeProfileId;

  if (!profiles.length) {
    main.innerHTML = `<div class="section-header"><div class="section-title">${t('profiles_title')}</div></div>${emptyState(t('profiles_empty'))}`;
    return;
  }

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">${t('profiles_title')}</div><div class="section-sub">${t('profiles_sub', profiles.length)}</div></div>
    </div>
    <div class="profiles-grid">
      ${profiles.map(p => {
        const color = p.avatarColor ? '#' + (p.avatarColor >>> 0).toString(16).padStart(8, '0').slice(2) : '#F5C442';
        const letter = escapeHtml((p.name || '?')[0].toUpperCase());
        return `
          <div class="profile-card ${p.id === activeId ? 'active-profile' : ''}">
            <div class="profile-avatar-big" style="background:${color}22;color:${color}">${letter}</div>
            <div class="profile-name">${escapeHtml(p.name)}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">
              ${p.id === activeId ? `<span class="badge badge-gold">${t('badge_active')}</span>` : ''}
              ${p.isKidsProfile ? `<span class="badge badge-blue">${t('badge_kids')}</span>` : ''}
              ${p.pin ? `<span class="badge badge-gray">${t('badge_locked')}</span>` : ''}
            </div>
          </div>`;
      }).join('')}
    </div>
    <div class="card"><div style="font-size:13px;color:var(--text-muted)">${t('profiles_tip')}</div></div>
  `;
}

// ── Addons ────────────────────────────────────────────────────────────────
function getAddons(payload) {
  if (!payload) return [];
  const shared = payload.addons ?? [];
  const byProfile = payload.addonsByProfile ?? {};
  const seen = new Set();
  const all = [...shared];
  Object.values(byProfile).forEach(arr => {
    (arr || []).forEach(a => { if (!seen.has(a.id)) { seen.add(a.id); all.push(a); } });
  });
  return all;
}

async function renderAddons() {
  const main = document.getElementById('main-content');
  const addons = getAddons(state.syncPayload);

  if (!addons.length) {
    main.innerHTML = `<div class="section-header"><div class="section-title">${t('addons_title')}</div></div>${emptyState(t('addons_empty'))}`;
    return;
  }

  const stremio = addons.filter(a => a.runtimeKind !== 'TELEGRAM');
  const telegram = addons.filter(a => a.runtimeKind === 'TELEGRAM');

  function addonIcon(a) {
    const logo = safeUrl(a.manifest?.logo || a.logo);
    if (logo) return `<img src="${logo}" alt="" onerror="this.style.display='none'">`;
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>`;
  }

  function addonBadge(a) {
    const type = a.type || 'COMMUNITY';
    if (type === 'OFFICIAL') return `<span class="badge badge-gold">${t('badge_official')}</span>`;
    if (type === 'SUBTITLE') return `<span class="badge badge-blue">${t('badge_subtitles')}</span>`;
    if (type === 'METADATA') return `<span class="badge badge-gray">${t('badge_metadata')}</span>`;
    if (a.runtimeKind === 'TELEGRAM') return `<span class="badge badge-blue">${t('badge_telegram')}</span>`;
    return `<span class="badge badge-gray">${t('badge_community')}</span>`;
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
              <div class="item-title">${escapeHtml(a.name || a.id)}</div>
              <div class="item-sub">${escapeHtml(a.manifest?.description || a.description || a.id)}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              ${addonBadge(a)}
              <span class="badge ${a.isEnabled ? 'badge-green' : 'badge-red'}">${a.isEnabled ? t('badge_enabled') : t('badge_disabled')}</span>
            </div>
          </div>`).join('')}
      </div>`;
  }

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">${t('addons_title')}</div><div class="section-sub">${t('addons_sub', addons.filter(a=>a.isEnabled).length, addons.length)}</div></div>
    </div>
    ${renderAddonList(stremio, t('stremio_label', stremio.length))}
    ${renderAddonList(telegram, t('telegram_label', telegram.length))}
    <div class="card" style="margin-top:16px"><div style="font-size:13px;color:var(--text-muted)">${t('addons_tip')}</div></div>
  `;
}

// ── IPTV ──────────────────────────────────────────────────────────────────
async function renderIPTV() {
  const main = document.getElementById('main-content');
  const payload = state.syncPayload;
  const profiles = payload?.profiles ?? [];
  const activeId = payload?.activeProfileId;
  const iptvByProfile = payload?.iptvByProfile ?? {};

  const allPlaylists = [];
  const seenUrls = new Set();
  for (const [profileId, iptvState] of Object.entries(iptvByProfile)) {
    const pName = profiles.find(p => p.id === profileId)?.name ?? profileId.slice(0, 8);
    (iptvState.playlists ?? []).forEach(pl => {
      if (!seenUrls.has(pl.m3uUrl)) { seenUrls.add(pl.m3uUrl); allPlaylists.push({ ...pl, _profileName: pName }); }
    });
    if (iptvState.m3uUrl && !seenUrls.has(iptvState.m3uUrl)) {
      seenUrls.add(iptvState.m3uUrl);
      allPlaylists.push({ id: 'legacy', name: 'M3U', m3uUrl: iptvState.m3uUrl, enabled: true, _profileName: pName });
    }
  }

  const activeIPTV = iptvByProfile[activeId] ?? Object.values(iptvByProfile)[0] ?? {};
  const favGroups = activeIPTV.favoriteGroups ?? [];
  const favChannels = activeIPTV.favoriteChannels ?? [];

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">IPTV</div><div class="section-sub">${t('iptv_sub', allPlaylists.length)}</div></div>
    </div>
    ${allPlaylists.length === 0 ? emptyState(t('iptv_empty')) : `
    <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">${t('iptv_m3u')}</div>
    <div class="card" style="padding:0 20px">
      ${allPlaylists.map(pl => `
        <div class="list-item">
          <div class="item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
          <div class="item-info">
            <div class="item-title">${escapeHtml(pl.name) || 'M3U Playlist'}</div>
            <div class="item-sub" style="font-family:monospace;font-size:11px;max-width:380px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(pl.m3uUrl)}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
            <span class="badge ${pl.enabled !== false ? 'badge-green' : 'badge-red'}">${pl.enabled !== false ? t('iptv_active') : t('iptv_disabled')}</span>
            <span class="badge badge-gray">${escapeHtml(pl._profileName)}</span>
          </div>
        </div>`).join('')}
    </div>`}
    ${favGroups.length > 0 ? `
    <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin:24px 0 12px">${t('fav_groups', favGroups.length)}</div>
    <div class="card" style="padding:14px 20px;display:flex;flex-wrap:wrap;gap:8px">
      ${favGroups.map(g => `<span class="badge badge-gold">⭐ ${escapeHtml(g)}</span>`).join('')}
    </div>` : ''}
    ${favChannels.length > 0 ? `
    <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin:24px 0 12px">${t('fav_channels', favChannels.length)}</div>
    <div class="card" style="padding:14px 20px;display:flex;flex-wrap:wrap;gap:8px">
      ${favChannels.slice(0, 50).map(c => `<span class="badge badge-blue">📺 ${escapeHtml(c)}</span>`).join('')}
      ${favChannels.length > 50 ? `<span class="badge badge-gray">${t('iptv_more', favChannels.length - 50)}</span>` : ''}
    </div>` : ''}
    <div class="card" style="margin-top:16px"><div style="font-size:13px;color:var(--text-muted)">${t('iptv_tip')}</div></div>
  `;
}

// ── Plugins ───────────────────────────────────────────────────────────────
async function renderPlugins() {
  const main = document.getElementById('main-content');
  const payload = state.syncPayload;
  const repos = payload?.pluginRepositories ?? [];
  const scrapers = payload?.pluginScrapers ?? [];
  const pluginsEnabled = payload?.pluginsEnabled ?? false;

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">${t('plugins_title')}</div><div class="section-sub">${t('plugins_sub', repos.length, scrapers.length)}</div></div>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:13px;color:var(--text-muted)">${pluginsEnabled ? t('plugins_status_on') : t('plugins_status_off')}</span>
        <label class="toggle">
          <input type="checkbox" ${pluginsEnabled ? 'checked' : ''} onchange="updateSetting('pluginsEnabled',this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    ${repos.length === 0 ? emptyState(t('plugins_empty')) : `
    <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">${t('repos_label', repos.length)}</div>
    <div class="card" style="padding:0 20px">
      ${repos.map(r => `
        <div class="list-item">
          <div class="item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h18M3 12h18M3 17h18"/></svg></div>
          <div class="item-info">
            <div class="item-title">${escapeHtml(r.name)}</div>
            <div class="item-sub" style="font-family:monospace;font-size:11px">${escapeHtml(r.url)}</div>
            <div class="item-sub">${r.scraperCount ?? 0} scrapers · ${t('repo_updated')} ${r.lastUpdated ? timeAgo(new Date(r.lastUpdated).toISOString()) : t('repo_never')}</div>
          </div>
          <span class="badge ${r.enabled ? 'badge-green' : 'badge-red'}">${r.enabled ? t('plugin_active') : t('plugin_disabled')}</span>
        </div>`).join('')}
    </div>`}
    ${scrapers.length > 0 ? `
    <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin:24px 0 12px">${t('scrapers_label', scrapers.length)}</div>
    <div class="card" style="padding:0 20px">
      ${scrapers.map(s => `
        <div class="list-item">
          <div class="item-icon">${safeUrl(s.logo) ? `<img src="${safeUrl(s.logo)}" alt="" onerror="this.style.display='none'">` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`}</div>
          <div class="item-info">
            <div class="item-title">${escapeHtml(s.name)}</div>
            <div class="item-sub">${escapeHtml(s.description)} · v${escapeHtml(s.version)}</div>
            <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
              ${(s.supportedTypes ?? []).map(st => `<span class="badge badge-gray">${escapeHtml(st)}</span>`).join('')}
              ${(s.contentLanguage ?? []).map(l => `<span class="badge badge-blue">${escapeHtml(l)}</span>`).join('')}
            </div>
          </div>
          <span class="badge ${s.enabled && s.manifestEnabled ? 'badge-green' : 'badge-red'}">${s.enabled && s.manifestEnabled ? t('plugin_active') : t('plugin_disabled')}</span>
        </div>`).join('')}
    </div>` : ''}
    <div class="card" style="margin-top:16px"><div style="font-size:13px;color:var(--text-muted)">${t('plugins_tip')}</div></div>
  `;
}

// ── Watchlist ─────────────────────────────────────────────────────────────
async function renderWatchlist() {
  const main = document.getElementById('main-content');
  const payload = state.syncPayload;

  // Collect watchlist from all profiles
  const allItems = [];
  Object.values(payload?.watchlistByProfile ?? {}).forEach(arr => {
    (arr || []).forEach(item => allItems.push(item));
  });

  const movies = allItems.filter(i => i.media_type === 'movie' || i.mediaType === 'movie');
  const shows = allItems.filter(i => i.media_type === 'tv' || i.mediaType === 'tv');

  if (!allItems.length) {
    main.innerHTML = `<div class="section-header"><div class="section-title">${t('watchlist_title')}</div></div>${emptyState(t('watchlist_empty'))}`;
    return;
  }

  function renderWLSection(items, label) {
    if (!items.length) return '';
    return `
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin:20px 0 12px">${label} (${items.length})</div>
      <div class="card" style="padding:0 20px">
        ${items.map(i => `
          <div class="list-item">
            <div class="item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${(i.media_type || i.mediaType) === 'movie' ? '<path d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>' : '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'}
              </svg>
            </div>
            <div class="item-info">
              <div class="item-title">${escapeHtml(i.title || i.name || `TMDB #${i.tmdb_id || i.tmdbId}`)}</div>
              <div class="item-sub">${timeAgo(i.added_at || i.addedAt)}</div>
            </div>
          </div>`).join('')}
      </div>`;
  }

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">${t('watchlist_title')}</div><div class="section-sub">${t('watchlist_sub', allItems.length)}</div></div>
    </div>
    ${renderWLSection(movies, t('wl_movies'))}
    ${renderWLSection(shows, t('wl_tv'))}
  `;
}

// ── AI Subtitle Translation ────────────────────────────────────────────────
async function renderAI() {
  const main = document.getElementById('main-content');
  const p = state.syncPayload;
  const enabled = p?.subtitleAiEnabled ?? false;
  const autoSelect = p?.subtitleAiAutoSelect ?? false;
  const model = p?.subtitleAiModel ?? 'GROQ_LLAMA_70B';
  const removeHI = p?.subtitleRemoveHearingImpaired ?? false;

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">${t('ai_title')}</div><div class="section-sub">${t('ai_sub')}</div></div>
    </div>
    <div class="tv-banner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
      <div><div class="tv-banner-title">${t('ai_banner_title')}</div><div class="tv-banner-sub">${t('ai_banner_sub')}</div></div>
    </div>
    <div class="card">
      <div style="font-size:16px;font-weight:700;margin-bottom:16px">${t('ai_settings_title')}</div>
      ${toggleRow('ai-enabled', t('ai_enable'), t('ai_enable_desc'), enabled, `updateAISetting('subtitleAiEnabled', this.checked)`)}
      ${toggleRow('ai-auto', t('ai_auto'), t('ai_auto_desc'), autoSelect, `updateAISetting('subtitleAiAutoSelect', this.checked)`)}
      ${toggleRow('ai-hi', t('ai_hi'), t('ai_hi_desc'), removeHI, `updateAISetting('subtitleRemoveHearingImpaired', this.checked)`)}
    </div>
    <div class="card">
      <div style="font-size:16px;font-weight:700;margin-bottom:16px">${t('ai_model_title')}</div>
      <div class="models-grid">
        <label class="model-card ${model==='GROQ_LLAMA_70B'?'selected':''}">
          <input type="radio" name="ai-model" value="GROQ_LLAMA_70B" ${model==='GROQ_LLAMA_70B'?'checked':''} onchange="updateAISetting('subtitleAiModel',this.value)">
          <div><div class="model-name">⚡ Groq Llama 70B <span class="badge badge-gold" style="font-size:10px">${t('ai_recommended')}</span></div><div class="model-desc">${t('ai_groq_desc')}</div></div>
        </label>
        <label class="model-card ${model==='GEMINI_FLASH_25'?'selected':''}">
          <input type="radio" name="ai-model" value="GEMINI_FLASH_25" ${model==='GEMINI_FLASH_25'?'checked':''} onchange="updateAISetting('subtitleAiModel',this.value)">
          <div><div class="model-name">🤖 Gemini Flash 2.5</div><div class="model-desc">${t('ai_gemini_desc')}</div></div>
        </label>
      </div>
      <div style="background:var(--bg-card2);border-radius:8px;padding:14px 16px;margin-top:8px">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px">${t('ai_key_title')}</div>
        <div style="font-size:12px;color:var(--text-muted);line-height:1.7">${t('ai_key_desc')}</div>
      </div>
    </div>
  `;
}

async function updateAISetting(key, value) {
  if (!state.syncPayload) { toast(t('no_sync'), 'err'); return; }
  state.syncPayload[key] = value;
  try {
    await saveSyncPayload(state.syncPayload);
    toast(t('saved'));
    if (key === 'subtitleAiModel') {
      document.querySelectorAll('.model-card').forEach(card => {
        card.classList.toggle('selected', card.querySelector('input')?.value === value);
      });
    }
  } catch { toast(t('save_err'), 'err'); }
}

// ── Settings ──────────────────────────────────────────────────────────────
async function renderSettings() {
  const main = document.getElementById('main-content');
  const p = state.syncPayload;
  const cardLayout = p?.cardLayoutMode ?? 'landscape';
  const oled = p?.oledBlackBackground ?? true;
  const skipProfile = p?.skipProfileSelection ?? false;
  const lang = p?.lastAppLanguage ?? 'en';

  main.innerHTML = `
    <div class="section-header">
      <div><div class="section-title">${t('settings_title')}</div><div class="section-sub">${t('settings_sub')}</div></div>
    </div>
    <div class="card">
      <div style="font-size:16px;font-weight:700;margin-bottom:16px">${t('appearance')}</div>
      ${toggleRow('oled', t('oled_label'), t('oled_desc'), oled, `updateSetting('oledBlackBackground',this.checked)`)}
      <div class="form-group">
        <label class="form-label">${t('layout_label')}</label>
        <select class="form-select" onchange="updateSetting('cardLayoutMode',this.value)">
          <option value="landscape" ${cardLayout==='landscape'?'selected':''}>${t('layout_landscape')}</option>
          <option value="portrait" ${cardLayout==='portrait'?'selected':''}>${t('layout_portrait')}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">${t('lang_label')}</label>
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
      <div style="font-size:16px;font-weight:700;margin-bottom:16px">${t('profile_section')}</div>
      ${toggleRow('skip', t('skip_label'), t('skip_desc'), skipProfile, `updateSetting('skipProfileSelection',this.checked)`)}
    </div>
    <div class="card">
      <div style="font-size:16px;font-weight:700;margin-bottom:16px">${t('account_section')}</div>
      <div class="list-item" style="padding:10px 0;border:none">
        <div class="item-info">
          <div class="item-title">${t('user_id_label')}</div>
          <div class="item-sub" style="font-family:monospace;font-size:11px">${escapeHtml(state.session?.id || '—')}</div>
        </div>
      </div>
      <button class="btn btn-danger" onclick="signOut()" style="margin-top:8px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        ${t('sign_out')}
      </button>
    </div>
  `;
}

async function updateSetting(key, value) {
  if (!state.syncPayload) { toast(t('no_sync'), 'err'); return; }
  state.syncPayload[key] = value;
  try { await saveSyncPayload(state.syncPayload); toast(t('saved')); }
  catch { toast(t('save_err'), 'err'); }
}

// ── TV Pairing ────────────────────────────────────────────────────────────
async function renderTVPair() {
  const main = document.getElementById('main-content');
  const urlCode = new URLSearchParams(location.search).get('code') || '';

  main.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">📺 ${t('tv_pair_title')}</div>
        <div class="section-sub">${t('tv_pair_sub')}</div>
      </div>
    </div>
    <div class="card" style="max-width:480px">
      <div class="form-group">
        <label class="form-label">${t('tv_code_label')}</label>
        <input id="tv-code-input" class="form-select"
          placeholder="XXXX-XXXX"
          value="${escapeHtml(urlCode)}"
          maxlength="9"
          oninput="this.value=this.value.toUpperCase()"
          style="font-size:24px;text-align:center;letter-spacing:6px;font-weight:bold;padding:14px">
      </div>
      <div class="form-group">
        <label class="form-label">${t('auth_email')}</label>
        <input id="tv-email-input" type="email" class="form-select" placeholder="you@example.com" value="${escapeHtml(state.session?.email || '')}">
      </div>
      <div class="form-group" id="tv-pass-group" ${state.session ? 'style="display:none"' : ''}>
        <label class="form-label">${t('auth_password')}</label>
        <input id="tv-pass-input" type="password" class="form-select" placeholder="••••••••">
      </div>
      <button onclick="doTVPair()"
        style="width:100%;background:var(--gold);color:#000;font-weight:700;font-size:16px;padding:14px;border:none;border-radius:8px;cursor:pointer">
        ${t('tv_connect')}
      </button>
      <div id="tvpair-status" style="margin-top:14px;font-size:14px;text-align:center;min-height:20px"></div>
    </div>
  `;
}

async function doTVPair() {
  const code = document.getElementById('tv-code-input')?.value?.trim().toUpperCase();
  const email = document.getElementById('tv-email-input')?.value?.trim();
  const password = document.getElementById('tv-pass-input')?.value || '';
  const statusEl = document.getElementById('tvpair-status');

  if (!code) { statusEl.style.color='var(--red)'; statusEl.textContent=t('tv_err_code'); return; }
  if (!email) { statusEl.style.color='var(--red)'; statusEl.textContent=t('auth_err_fields'); return; }

  statusEl.style.color = 'var(--text-muted)';
  statusEl.textContent = t('tv_connecting');

  try {
    // If already signed in, use tv-auth-approve (no password needed)
    if (state.session?.access_token) {
      await apiCall('tv-auth-approve', {
        body: { code, refresh_token: state.session.refresh_token },
        token: state.session.access_token,
      });
    } else {
      // Not signed in — authenticate and pair in one call
      if (!password) { statusEl.style.color='var(--red)'; statusEl.textContent=t('auth_err_fields'); return; }
      await apiCall('tv-auth-complete', { body: { code, email, password, intent: 'signin' } });
    }

    statusEl.style.color = '#4CAF50';
    statusEl.textContent = t('tv_success');
  } catch (e) {
    statusEl.style.color = 'var(--red)';
    statusEl.textContent = e.message;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function safeUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return (u.protocol === 'https:' || u.protocol === 'http:') ? escapeHtml(u.href) : '';
  } catch { return ''; }
}

function timeAgo(iso) {
  if (!iso) return '';
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return t('just_now');
  if (m < 60) return t('m_ago', m);
  const h = Math.floor(m / 60);
  if (h < 24) return t('h_ago', h);
  const days = Math.floor(h / 24);
  if (days < 30) return t('d_ago', days);
  return new Date(iso).toLocaleDateString(currentLang === 'he' ? 'he-IL' : 'en-US');
}

function emptyState(msg) {
  return `<div class="empty">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
    <div class="empty-title">${msg}</div>
  </div>`;
}

function toggleRow(id, label, desc, checked, onchange) {
  return `<div class="form-group">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-weight:600">${label}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${desc}</div>
      </div>
      <label class="toggle">
        <input type="checkbox" id="${id}" ${checked?'checked':''} onchange="${onchange}">
        <span class="toggle-slider"></span>
      </label>
    </div>
  </div>`;
}

// ── Shell ─────────────────────────────────────────────────────────────────
function buildShell(session) {
  const name = session.email || t('user_fallback');
  const initial = escapeHtml(name[0].toUpperCase());

  const navItems = [
    { id: 'dashboard',  label: t('nav_dashboard'), icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { id: 'profiles',   label: t('nav_profiles'),  icon: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>' },
    { id: 'addons',     label: t('nav_addons'),    icon: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/>' },
    { id: 'iptv',       label: 'IPTV',             icon: '<path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
    { id: 'plugins',    label: t('nav_plugins'),   icon: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>' },
    { id: 'watchlist',  label: t('nav_watchlist'), icon: '<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>' },
    { id: 'ai',         label: t('nav_ai'),        icon: '<path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>' },
    { id: 'settings',   label: t('nav_settings'),  icon: '<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M1 12h2M21 12h2M12 1v2M12 21v2"/>' },
    { id: 'tvpair',     label: '📺 TV',            icon: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>' },
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
          </button>`).join('')}
      </nav>
      <div class="sidebar-user">
        <div class="user-avatar">${initial}</div>
        <div class="user-info">
          <div class="user-name">${escapeHtml(name)}</div>
          <div class="user-email">${escapeHtml(session.email || '')}</div>
        </div>
        <button class="btn-lang" onclick="setLang(currentLang==='en'?'he':'en')"
          style="background:none;border:1px solid var(--border);border-radius:6px;color:var(--text-muted);cursor:pointer;padding:4px 8px;font-size:12px;font-weight:600;margin-left:4px">
          ${currentLang === 'en' ? 'עב' : 'EN'}
        </button>
        <button class="btn-logout" onclick="signOut()" title="${t('sign_out')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>
    <main class="main" id="main-content"></main>
  `;
}

// ── Boot ──────────────────────────────────────────────────────────────────
async function bootApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'flex';

  buildShell(state.session);
  state.syncPayload = await loadSyncPayload();
  await renderSection();
}

async function boot() {
  // Check if arriving via TV pairing URL (?code=XXXX-XXXX)
  const tvCode = new URLSearchParams(location.search).get('code');
  if (tvCode) state.activeSection = 'tvpair';

  const session = loadSession();

  if (!session?.access_token) {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
    return;
  }

  state.session = session;
  await bootApp();
}

boot();
