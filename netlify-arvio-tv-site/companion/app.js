// ── API Config ────────────────────────────────────────────────────────────
const API_BASE = 'https://auth.arvio.tv/.netlify/functions';
const APP_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZHd2b3J0Y2Zub3lrbHR6dXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NDU4NzMsImV4cCI6MjA4MjMyMTg3M30.YfKZbSwxGs6_xMd6jkDtn1PKkfuyOHo9qVhUvFRddGU';
const SESSION_KEY = 'arvio_companion_session';

async function apiCall(endpoint, { method = 'POST', body, token } = {}) {
  const headers = {
    'content-type': 'application/json',
    'apikey': APP_ANON_KEY,
    'authorization': `Bearer ${token || APP_ANON_KEY}`,
  };
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method, headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { code: data.code });
  return data;
}

// ── i18n ──────────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    nav_dashboard:'Dashboard', nav_profiles:'Profiles', nav_addons:'Add-ons',
    nav_iptv:'IPTV', nav_plugins:'Plugins', nav_watchlist:'Watchlist',
    nav_ai:'AI Subtitles', nav_settings:'Settings', nav_tv:'Connect TV',
    sign_out:'Sign out', user_fallback:'User', loading:'Loading…',
    saved:'Saved ✓', save_err:'Failed to save', no_sync:'No sync data',
    auth_sub:'Manage your ARVIO account — profiles, add-ons & AI subtitles',
    auth_sending:'Signing in…', auth_err:'Please enter email and password',
    dash_sub:'Overview of your ARVIO account',
    stat_profiles:'Profiles', stat_addons:'Active add-ons', stat_repos:'Plugin repos', stat_watchlist:'Watchlist',
    profiles_title:'Profiles', profiles_sub:function(n){return n+' profile'+(n!==1?'s':'')+' in account';},
    profiles_empty:'No profiles — open ARVIO on your TV to create one',
    profiles_tip:'💡 Profile management is available in ARVIO on your TV.',
    badge_active:'Active', badge_kids:'Kids', badge_locked:'🔒 Locked',
    addons_title:'Add-ons', addons_sub:function(a,t){return a+' active of '+t;},
    addons_empty:'No add-ons installed',
    addons_tip:'💡 To install add-ons, open Settings in ARVIO on your TV.',
    badge_official:'Official', badge_subtitles:'Subtitles', badge_metadata:'Metadata',
    badge_community:'Community', badge_telegram:'Telegram', badge_enabled:'On', badge_disabled:'Off',
    stremio_label:function(n){return 'Stremio Add-ons ('+n+')';},
    telegram_label:function(n){return 'Telegram ('+n+')';},
    iptv_title:'IPTV', iptv_sub:function(n){return n+' playlist'+(n!==1?'s':'');},
    iptv_empty:'No playlists yet — add your first M3U below',
    iptv_add:'Add Playlist', iptv_add_title:'New M3U Playlist',
    iptv_name:'Name', iptv_m3u:'M3U URL', iptv_epg:'EPG URL (optional)',
    iptv_name_ph:'My playlist', iptv_m3u_ph:'https://…/playlist.m3u', iptv_epg_ph:'https://…/epg.xml',
    iptv_active:'Active', iptv_disabled:'Disabled', iptv_tip:'Changes sync to your TV automatically.',
    plugins_title:'Plugins', plugins_sub:function(r,s){return r+' repo'+(r!==1?'s':'')+' · '+s+' scrapers';},
    plugins_status_on:'Enabled', plugins_status_off:'Disabled',
    plugins_empty:'No repos yet — add one below',
    plugins_add:'Add Repository', plugins_add_title:'New Plugin Repository',
    plugins_url:'Repository URL', plugins_url_ph:'https://…/manifest.json',
    plugins_fetching:'Fetching…', plugins_fetch_err:'Could not fetch repo — check the URL',
    repo_updated:'updated', repo_never:'never', scrapers_label:function(n){return 'Scrapers ('+n+')';},
    plugin_active:'Active', plugin_disabled:'Off', plugins_tip:'Plugin JS stays local on your TV only.',
    watchlist_title:'Watchlist', watchlist_sub:function(n){return n+' item'+(n!==1?'s':'');},
    watchlist_empty:'Watchlist is empty', wl_movies:'🎬 Movies', wl_tv:'📺 TV Shows',
    ai_title:'AI Subtitles', ai_sub:'Real-time subtitle translation settings',
    ai_banner_title:'🔑 API Key — set on your TV',
    ai_banner_sub:'For security the API key is stored locally on your TV only.',
    ai_settings_title:'Translation Settings',
    ai_enable:'Enable AI Translation', ai_enable_desc:'Automatically translate subtitles while watching',
    ai_auto:'Auto-select', ai_auto_desc:'Auto-pick subtitles for translation',
    ai_hi:'Remove Hearing Impaired', ai_hi_desc:'Strip audio descriptions from subtitles [SDH]',
    ai_model_title:'AI Model', ai_recommended:'Recommended',
    ai_groq_desc:'Fastest · Free · Best for subtitles',
    ai_gemini_desc:'Google Gemini · High quality',
    ai_key_title:'How to get a free API key',
    ai_key_desc:'🔹 <b>Groq</b>: <code>console.groq.com</code> &rarr; API Keys &rarr; Create<br>🔹 <b>Gemini</b>: <code>aistudio.google.com</code> &rarr; Get API Key',
    settings_title:'Settings', settings_sub:'Account & display preferences',
    appearance:'Appearance', oled_label:'OLED Black', oled_desc:'Pure black background for OLED screens',
    layout_label:'Card Layout', layout_landscape:'Landscape', layout_portrait:'Portrait',
    lang_label:'App Language', profile_section:'Profile',
    skip_label:'Skip Profile Selection', skip_desc:'Launch directly with the active profile',
    account_section:'Account', user_id_label:'User ID',
    tv_title:'Connect TV', tv_sub:'Enter the code displayed on your TV screen',
    tv_code_label:'TV Code', tv_email_label:'Email', tv_pass_label:'Password',
    tv_connect:'🔗 Connect TV', tv_connecting:'⏳ Connecting…',
    tv_success:'✓ TV connected! You can close this page.',
    tv_err_code:'Enter the code from your TV',
    just_now:'just now',
    m_ago:function(m){return m+'m ago';},
    h_ago:function(h){return h+'h ago';},
    d_ago:function(d){return d+'d ago';},
  },
  he: {
    nav_dashboard:'דשבורד', nav_profiles:'פרופילים', nav_addons:'הרחבות',
    nav_iptv:'IPTV', nav_plugins:'פלאגינים', nav_watchlist:'רשימת צפייה',
    nav_ai:'כתוביות AI', nav_settings:'הגדרות', nav_tv:'חיבור TV',
    sign_out:'התנתק', user_fallback:'משתמש', loading:'טוען…',
    saved:'נשמר ✓', save_err:'שגיאה בשמירה', no_sync:'אין נתוני סנכרון',
    auth_sub:'נהל את חשבון ה-ARVIO שלך',
    auth_sending:'מתחבר…', auth_err:'אנא הזן אימייל וסיסמא',
    dash_sub:'סקירה כללית של חשבון ה-ARVIO',
    stat_profiles:'פרופילים', stat_addons:'הרחבות פעילות', stat_repos:'מאגרי פלאגינים', stat_watchlist:'רשימת צפייה',
    profiles_title:'פרופילים', profiles_sub:function(n){return n+' פרופילים';},
    profiles_empty:'אין פרופילים — פתח ARVIO בטלוויזיה ליצירה',
    profiles_tip:'💡 ניהול פרופילים זמין ב-ARVIO על הטלוויזיה.',
    badge_active:'פעיל', badge_kids:'ילדים', badge_locked:'🔒 נעול',
    addons_title:'הרחבות', addons_sub:function(a,t){return a+' פעילות מתוך '+t;},
    addons_empty:'אין הרחבות מותקנות',
    addons_tip:'💡 להתקנת הרחבות — גש להגדרות ב-ARVIO.',
    badge_official:'רשמי', badge_subtitles:'כתוביות', badge_metadata:'מטאדאטה',
    badge_community:'קהילה', badge_telegram:'Telegram', badge_enabled:'פעיל', badge_disabled:'כבוי',
    stremio_label:function(n){return 'הרחבות Stremio ('+n+')';},
    telegram_label:function(n){return 'Telegram ('+n+')';},
    iptv_title:'IPTV', iptv_sub:function(n){return n+' רשימות';},
    iptv_empty:'אין רשימות — הוסף את הראשונה למטה',
    iptv_add:'הוסף רשימה', iptv_add_title:'רשימת M3U חדשה',
    iptv_name:'שם', iptv_m3u:'כתובת M3U', iptv_epg:'כתובת EPG (אופציונלי)',
    iptv_name_ph:'הרשימה שלי', iptv_m3u_ph:'https://…/playlist.m3u', iptv_epg_ph:'https://…/epg.xml',
    iptv_active:'פעיל', iptv_disabled:'כבוי', iptv_tip:'שינויים מסונכרנים לטלוויזיה אוטומטית.',
    plugins_title:'פלאגינים', plugins_sub:function(r,s){return r+' מאגרים · '+s+' scrapers';},
    plugins_status_on:'פעיל', plugins_status_off:'כבוי',
    plugins_empty:'אין מאגרים — הוסף אחד למטה',
    plugins_add:'הוסף מאגר', plugins_add_title:'מאגר פלאגינים חדש',
    plugins_url:'כתובת מאגר', plugins_url_ph:'https://…/manifest.json',
    plugins_fetching:'טוען…', plugins_fetch_err:'לא ניתן לטעון את המאגר',
    repo_updated:'עודכן', repo_never:'אף פעם', scrapers_label:function(n){return 'Scrapers ('+n+')';},
    plugin_active:'פעיל', plugin_disabled:'כבוי', plugins_tip:'קוד ה-JS נשמר מקומית בטלוויזיה בלבד.',
    watchlist_title:'רשימת צפייה', watchlist_sub:function(n){return n+' פריטים';},
    watchlist_empty:'רשימת הצפייה ריקה', wl_movies:'🎬 סרטים', wl_tv:'📺 סדרות',
    ai_title:'כתוביות AI', ai_sub:'הגדרות תרגום כתוביות בזמן אמת',
    ai_banner_title:'🔑 מפתח API — הגדר בטלוויזיה',
    ai_banner_sub:'מטעמי אבטחה, מפתח ה-API נשמר מקומית בטלוויזיה בלבד.',
    ai_settings_title:'הגדרות תרגום',
    ai_enable:'הפעל תרגום AI', ai_enable_desc:'תרגם כתוביות אוטומטית בזמן צפייה',
    ai_auto:'בחירה אוטומטית', ai_auto_desc:'בחר אוטומטית כתוביות לתרגום',
    ai_hi:'הסר כתוביות לכבדי שמיעה', ai_hi_desc:'הסר תיאורי קול [SDH]',
    ai_model_title:'מודל AI', ai_recommended:'מומלץ',
    ai_groq_desc:'מהיר ביותר · חינמי · מעולה לכתוביות',
    ai_gemini_desc:'Google Gemini · איכות גבוהה',
    ai_key_title:'איך לקבל מפתח API חינמי',
    ai_key_desc:'🔹 <b>Groq</b>: <code>console.groq.com</code> &larr; API Keys &larr; Create<br>🔹 <b>Gemini</b>: <code>aistudio.google.com</code> &larr; Get API Key',
    settings_title:'הגדרות', settings_sub:'העדפות חשבון ותצוגה',
    appearance:'מראה', oled_label:'רקע OLED שחור', oled_desc:'רקע שחור לחלוטין למסכי OLED',
    layout_label:'פריסת כרטיסים', layout_landscape:'Landscape', layout_portrait:'Portrait',
    lang_label:'שפת אפליקציה', profile_section:'פרופיל',
    skip_label:'דלג על בחירת פרופיל', skip_desc:'עבור ישירות לאפליקציה',
    account_section:'חשבון', user_id_label:'מזהה משתמש',
    tv_title:'חיבור טלוויזיה', tv_sub:'הזן את הקוד המוצג בטלוויזיה',
    tv_code_label:'קוד TV', tv_email_label:'אימייל', tv_pass_label:'סיסמא',
    tv_connect:'🔗 חבר טלוויזיה', tv_connecting:'⏳ מתחבר…',
    tv_success:'✓ הטלוויזיה התחברה! ניתן לסגור את הדף.',
    tv_err_code:'הזן את הקוד מהטלוויזיה',
    just_now:'עכשיו',
    m_ago:function(m){return 'לפני '+m+' דק׳';},
    h_ago:function(h){return 'לפני '+h+' שע׳';},
    d_ago:function(d){return 'לפני '+d+' ימים';},
  },
};

let currentLang = localStorage.getItem('arvio_lang') || 'en';
function t(k) {
  var args = Array.prototype.slice.call(arguments, 1);
  var s = STRINGS[currentLang][k];
  return typeof s === 'function' ? s.apply(null, args) : (s !== undefined ? s : k);
}
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('arvio_lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  if (state.session) { buildShell(state.session); renderSection(); }
}

// ── State ─────────────────────────────────────────────────────────────────
var state = { session: null, syncPayload: null, activeSection: 'dashboard' };

function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); state.session = s; }
function loadStoredSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch(e) { return null; } }
function clearSession() { localStorage.removeItem(SESSION_KEY); state.session = null; }

// ── Toast ─────────────────────────────────────────────────────────────────
function toast(msg, type) {
  type = type || 'ok';
  var el = document.getElementById('toast');
  el.textContent = msg; el.className = 'show toast-' + type;
  clearTimeout(el._t); el._t = setTimeout(function(){ el.className = ''; }, 3000);
}

// ── Auth ──────────────────────────────────────────────────────────────────
function signIn() { return _doAuth('auth-login'); }
function signUp() { return _doAuth('cloud-auth-email'); }

async function _doAuth(endpoint) {
  var email = (document.getElementById('auth-email') || {}).value || '';
  email = email.trim();
  var password = (document.getElementById('auth-password') || {}).value || '';
  var statusEl = document.getElementById('auth-status');
  var btn1 = document.getElementById('auth-btn-signin');
  var btn2 = document.getElementById('auth-btn-signup');
  if (!email || !password) { statusEl.style.color = 'var(--red)'; statusEl.textContent = t('auth_err'); return; }
  statusEl.style.color = 'var(--text-muted)'; statusEl.textContent = t('auth_sending');
  btn1.disabled = btn2.disabled = true;
  try {
    var data = await apiCall(endpoint, { body: { email: email, password: password } });
    saveSession({ access_token: data.access_token, refresh_token: data.refresh_token, email: (data.user && data.user.email) || email, id: data.user && data.user.id });
    await bootApp();
  } catch(e) {
    statusEl.style.color = 'var(--red)'; statusEl.textContent = e.message;
    btn1.disabled = btn2.disabled = false;
  }
}

async function signOut() { clearSession(); location.reload(); }

// ── Sync ──────────────────────────────────────────────────────────────────
async function loadSyncPayload() {
  try {
    var data = await apiCall('account-sync-pull', { method: 'GET', token: state.session.access_token });
    return data.payload || null;
  } catch(e) { return null; }
}

async function saveSyncPayload(payload) {
  await apiCall('account-sync-push', { body: { payload: payload }, token: state.session.access_token });
  state.syncPayload = payload;
}

async function patchAndSave(patchFn) {
  var payload = JSON.parse(JSON.stringify(state.syncPayload || {}));
  patchFn(payload);
  await saveSyncPayload(payload);
  toast(t('saved'));
}

// ── Sections ──────────────────────────────────────────────────────────────
var sections = {
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
  document.querySelectorAll('.nav-item').forEach(function(el){ el.classList.toggle('active', el.dataset.section === id); });
  renderSection();
}

async function renderSection() {
  var main = document.getElementById('main-content');
  main.innerHTML = '<div class="loading"><div class="spinner"></div>' + t('loading') + '</div>';
  if (sections[state.activeSection]) await sections[state.activeSection]();
}

// ── Icons ─────────────────────────────────────────────────────────────────
var ICO = {
  users:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
  addons:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>',
  plugins:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
  wl:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>',
  iptv:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  repo:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
  trash:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  plus:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  movie:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>',
  tv:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
};

// ── Helpers ───────────────────────────────────────────────────────────────
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function safeUrl(url) {
  if (!url) return '';
  try { var u = new URL(url); return (u.protocol==='https:'||u.protocol==='http:') ? esc(u.href) : ''; } catch(e) { return ''; }
}
function timeAgo(iso) {
  if (!iso) return '';
  var d = Date.now() - new Date(iso).getTime(), m = Math.floor(d/60000);
  if (m < 1) return t('just_now'); if (m < 60) return t('m_ago', m);
  var h = Math.floor(m/60); if (h < 24) return t('h_ago', h);
  var days = Math.floor(h/24); if (days < 30) return t('d_ago', days);
  return new Date(iso).toLocaleDateString();
}
function emptyState(title, sub) {
  return '<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg><div class="empty-title">' + title + '</div>' + (sub ? '<div class="empty-sub">' + sub + '</div>' : '') + '</div>';
}
function bdg(type, text) { return '<span class="badge badge-' + type + '">' + text + '</span>'; }
function toggleRowHtml(key, label, desc, checked, last) {
  return '<div class="toggle-row"' + (last ? ' style="border-bottom:none"' : '') + '><div class="toggle-row-left"><div class="toggle-row-label">' + label + '</div><div class="toggle-row-desc">' + desc + '</div></div><label class="toggle"><input type="checkbox"' + (checked ? ' checked' : '') + ' onchange="updateSetting(\'' + key + '\',this.checked)"><span class="toggle-slider"></span></label></div>';
}
function sectionWrap(title, sub, content, actionBtn, extraRight) {
  actionBtn = actionBtn || ''; extraRight = extraRight || '';
  return '<div class="section-header"><div><div class="section-title">' + title + '</div>' + (sub ? '<div class="section-sub">' + sub + '</div>' : '') + '</div><div style="display:flex;align-items:center;gap:10px;flex-shrink:0">' + extraRight + actionBtn + '</div></div>' + content;
}

// ── Dashboard ─────────────────────────────────────────────────────────────
async function renderDashboard() {
  var p = state.syncPayload;
  var profiles = (p && p.profiles) || [];
  var addons = getAllAddons(p).filter(function(a){ return a.isEnabled; });
  var repos = (p && p.pluginRepositories) || [];
  var wlCount = Object.values((p && p.watchlistByProfile) || {}).reduce(function(s,a){ return s + (Array.isArray(a) ? a.length : 0); }, 0);
  var initial = esc(((state.session && state.session.email) || 'U')[0].toUpperCase());
  var name = esc(((state.session && state.session.email) || '').split('@')[0]);

  document.getElementById('main-content').innerHTML =
    '<div class="dash-banner"><div><h2>' + (currentLang==='he'?'שלום':'Hello') + ', ' + name + ' 👋</h2><p>' + t('dash_sub') + '</p></div><div class="dash-avatar">' + initial + '</div></div>' +
    '<div class="card-grid">' +
    statCard(ICO.users, t('stat_profiles'), profiles.length || 0, 'gold') +
    statCard(ICO.addons, t('stat_addons'), addons.length, '') +
    statCard(ICO.plugins, t('stat_repos'), repos.length, '') +
    statCard(ICO.wl, t('stat_watchlist'), wlCount, '') +
    '</div>';
}
function statCard(icon, label, value, cls) {
  return '<div class="stat-card"><div class="stat-icon">' + icon + '</div><div class="stat-label">' + label + '</div><div class="stat-value ' + cls + '">' + value + '</div></div>';
}

// ── Profiles ──────────────────────────────────────────────────────────────
async function renderProfiles() {
  var p = state.syncPayload, profiles = (p && p.profiles) || [], activeId = p && p.activeProfileId;
  var main = document.getElementById('main-content');
  if (!profiles.length) { main.innerHTML = sectionWrap(t('profiles_title'),'',emptyState(t('profiles_empty'),t('profiles_tip'))); return; }
  var cards = profiles.map(function(pr) {
    var color = pr.avatarColor ? '#' + (pr.avatarColor >>> 0).toString(16).padStart(8,'0').slice(2) : '#F5C442';
    var letter = esc((pr.name||'?')[0].toUpperCase());
    return '<div class="profile-card' + (pr.id===activeId?' active-profile':'') + '"><div class="profile-avatar-big" style="background:' + color + '22;color:' + color + '">' + letter + '</div><div class="profile-name">' + esc(pr.name) + '</div><div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:center;margin-top:2px">' + (pr.id===activeId?bdg('gold',t('badge_active')):'') + (pr.isKidsProfile?bdg('blue',t('badge_kids')):'') + (pr.pin?bdg('gray',t('badge_locked')):'') + '</div></div>';
  }).join('');
  main.innerHTML = sectionWrap(t('profiles_title'),t('profiles_sub',profiles.length),'<div class="profiles-grid">'+cards+'</div><div class="card" style="margin-top:4px"><p style="font-size:13px;color:var(--text-muted)">'+t('profiles_tip')+'</p></div>');
}

// ── Add-ons ───────────────────────────────────────────────────────────────
function getAllAddons(p) {
  if (!p) return [];
  var seen = new Set(), all = [].concat(p.addons || []);
  Object.values(p.addonsByProfile || {}).forEach(function(arr){ (arr||[]).forEach(function(a){ if (!seen.has(a.id)){ seen.add(a.id); all.push(a); } }); });
  return all;
}

async function renderAddons() {
  var addons = getAllAddons(state.syncPayload);
  var main = document.getElementById('main-content');
  if (!addons.length) { main.innerHTML = sectionWrap(t('addons_title'),'',emptyState(t('addons_empty'),t('addons_tip'))); return; }
  var stremio = addons.filter(function(a){ return a.runtimeKind !== 'TELEGRAM'; });
  var telegram = addons.filter(function(a){ return a.runtimeKind === 'TELEGRAM'; });
  var active = addons.filter(function(a){ return a.isEnabled; }).length;

  function addonList(list, label) {
    if (!list.length) return '';
    var rows = list.map(function(a) {
      var logo = safeUrl((a.manifest && a.manifest.logo) || a.logo);
      var icon = logo ? '<img src="' + logo + '" alt="" onerror="this.style.display=\'none\'">' : ICO.addons;
      var tb = a.type==='OFFICIAL'?bdg('gold',t('badge_official')):a.type==='SUBTITLE'?bdg('blue',t('badge_subtitles')):a.type==='METADATA'?bdg('gray',t('badge_metadata')):a.runtimeKind==='TELEGRAM'?bdg('purple',t('badge_telegram')):bdg('gray',t('badge_community'));
      return '<div class="list-item"><div class="item-icon">'+icon+'</div><div class="item-info"><div class="item-title">'+esc(a.name||a.id)+'</div><div class="item-sub">'+esc((a.manifest&&a.manifest.description)||a.description||'')+'</div></div><div class="item-actions">'+tb+'<label class="toggle"><input type="checkbox"'+(a.isEnabled?' checked':'')+' onchange="toggleAddon(\''+esc(a.id)+'\',this.checked)"><span class="toggle-slider"></span></label></div></div>';
    }).join('');
    return '<div class="section-label">'+label+'</div><div class="card" style="padding:0 20px">'+rows+'</div>';
  }

  main.innerHTML = sectionWrap(t('addons_title'),t('addons_sub',active,addons.length),
    addonList(stremio,t('stremio_label',stremio.length)) +
    addonList(telegram,t('telegram_label',telegram.length)) +
    '<div class="card" style="margin-top:4px"><p style="font-size:13px;color:var(--text-muted)">'+t('addons_tip')+'</p></div>');
}

async function toggleAddon(id, enabled) {
  try {
    await patchAndSave(function(p) {
      if (p.addons) p.addons = p.addons.map(function(a){ return a.id===id ? Object.assign({},a,{isEnabled:enabled}) : a; });
      if (p.addonsByProfile) Object.keys(p.addonsByProfile).forEach(function(k){ p.addonsByProfile[k] = p.addonsByProfile[k].map(function(a){ return a.id===id ? Object.assign({},a,{isEnabled:enabled}) : a; }); });
    });
  } catch(e) { toast(t('save_err'),'err'); }
}

// ── IPTV ──────────────────────────────────────────────────────────────────
async function renderIPTV() {
  var p = state.syncPayload, profiles = (p&&p.profiles)||[], activeId = (p&&p.activeProfileId)||((profiles[0]&&profiles[0].id)||'');
  var iptvByProfile = (p&&p.iptvByProfile)||{};
  var allPlaylists = [], seen = new Set();
  Object.entries(iptvByProfile).forEach(function(entry) {
    var pid = entry[0], iptv = entry[1];
    var pname = (profiles.find(function(x){ return x.id===pid; })||{}).name || pid.slice(0,6);
    (iptv.playlists||[]).forEach(function(pl) {
      var key = pl.id||pl.m3uUrl;
      if (!seen.has(key)){ seen.add(key); allPlaylists.push(Object.assign({},pl,{_pid:pid,_pname:pname})); }
    });
    if (iptv.m3uUrl && !seen.has(iptv.m3uUrl)){
      seen.add(iptv.m3uUrl);
      allPlaylists.push({id:'legacy_'+pid,name:'M3U',m3uUrl:iptv.m3uUrl,epgUrl:iptv.epgUrl,enabled:true,_pid:pid,_pname:pname});
    }
  });

  var activeIPTV = iptvByProfile[activeId] || Object.values(iptvByProfile)[0] || {};
  var favGroups = activeIPTV.favoriteGroups || [];

  var listHtml = allPlaylists.length === 0 ? emptyState(t('iptv_empty'),'') :
    '<div class="card" style="padding:0 20px">' +
    allPlaylists.map(function(pl){
      return '<div class="list-item"><div class="item-icon">'+ICO.iptv+'</div><div class="item-info"><div class="item-title">'+esc(pl.name||'M3U')+'</div><div class="item-sub" style="font-family:monospace;font-size:11px">'+esc(pl.m3uUrl)+'</div></div><div class="item-actions">'+bdg(pl.enabled!==false?'green':'red',pl.enabled!==false?t('iptv_active'):t('iptv_disabled'))+'<button class="btn-remove" onclick="removeIPTVPlaylist(\''+esc(pl._pid)+'\',\''+esc(pl.id||pl.m3uUrl)+'\')">'+ICO.trash+' Remove</button></div></div>';
    }).join('') + '</div>';

  var favsHtml = favGroups.length ? '<div class="section-label">Favourite Groups ('+favGroups.length+')</div><div class="card" style="padding:14px 20px;display:flex;flex-wrap:wrap;gap:7px">'+favGroups.map(function(g){ return bdg('gold','⭐ '+esc(g)); }).join('')+'</div>' : '';

  var profileOptions = profiles.length > 1 ?
    '<div class="form-group"><label class="form-label">Profile</label><select id="iptv-profile" class="form-select">'+profiles.map(function(pr){ return '<option value="'+esc(pr.id)+'"'+(pr.id===activeId?' selected':'')+'>'+esc(pr.name)+'</option>'; }).join('')+'</select></div>' :
    '<input type="hidden" id="iptv-profile" value="'+esc(activeId)+'">';

  var form = '<div id="iptv-add-form" style="display:none"><div class="add-form"><div class="add-form-title">'+t('iptv_add_title')+'</div>'+profileOptions+'<div class="form-row"><div class="form-group"><label class="form-label">'+t('iptv_name')+'</label><input id="iptv-name" class="form-input" placeholder="'+t('iptv_name_ph')+'"></div><div class="form-group"><label class="form-label">'+t('iptv_m3u')+'</label><input id="iptv-m3u" class="form-input" placeholder="'+t('iptv_m3u_ph')+'"></div></div><div class="form-group"><label class="form-label">'+t('iptv_epg')+'</label><input id="iptv-epg" class="form-input" placeholder="'+t('iptv_epg_ph')+'"></div><div class="form-actions"><button class="btn-save" onclick="addIPTVPlaylist()">'+t('iptv_add')+'</button><button class="btn-cancel" onclick="toggleIPTVForm()">Cancel</button><span id="iptv-err" style="font-size:12px;color:var(--red);margin-left:8px"></span></div></div></div>';

  var btn = '<button class="btn-add" onclick="toggleIPTVForm()">'+ICO.plus+' '+t('iptv_add')+'</button>';
  document.getElementById('main-content').innerHTML = sectionWrap(t('iptv_title'),t('iptv_sub',allPlaylists.length), form+listHtml+favsHtml+'<div class="card" style="margin-top:4px"><p style="font-size:13px;color:var(--text-muted)">'+t('iptv_tip')+'</p></div>', btn);
}

function toggleIPTVForm() { var f=document.getElementById('iptv-add-form'); if(f) f.style.display=f.style.display==='none'?'block':'none'; }

async function addIPTVPlaylist() {
  var profileId = (document.getElementById('iptv-profile')||{}).value||'';
  var name = ((document.getElementById('iptv-name')||{}).value||'').trim();
  var m3uUrl = ((document.getElementById('iptv-m3u')||{}).value||'').trim();
  var epgUrl = ((document.getElementById('iptv-epg')||{}).value||'').trim();
  var errEl = document.getElementById('iptv-err');
  if (!m3uUrl) { errEl.textContent = 'M3U URL is required'; return; }
  errEl.textContent = '';
  var saveBtn = document.querySelector('#iptv-add-form .btn-save');
  saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
  try {
    await patchAndSave(function(p) {
      if (!p.iptvByProfile) p.iptvByProfile = {};
      if (!p.iptvByProfile[profileId]) p.iptvByProfile[profileId] = {};
      if (!p.iptvByProfile[profileId].playlists) p.iptvByProfile[profileId].playlists = [];
      p.iptvByProfile[profileId].playlists.push({ id:'pl_'+Date.now(), name:name||'M3U Playlist', m3uUrl:m3uUrl, epgUrl:epgUrl||'', enabled:true, addedAt:new Date().toISOString() });
    });
    await renderIPTV();
  } catch(e) { errEl.textContent = e.message; saveBtn.disabled=false; saveBtn.textContent=t('iptv_add'); }
}

async function removeIPTVPlaylist(profileId, idOrUrl) {
  if (!confirm('Remove this playlist?')) return;
  try {
    await patchAndSave(function(p) {
      var iptv = p.iptvByProfile && p.iptvByProfile[profileId]; if (!iptv) return;
      if (iptv.playlists) iptv.playlists = iptv.playlists.filter(function(pl){ return pl.id!==idOrUrl && pl.m3uUrl!==idOrUrl; });
      if (iptv.m3uUrl===idOrUrl){ delete iptv.m3uUrl; delete iptv.epgUrl; }
    });
    await renderIPTV();
  } catch(e) { toast(t('save_err'),'err'); }
}

// ── Plugins ───────────────────────────────────────────────────────────────
async function renderPlugins() {
  var p = state.syncPayload, repos=(p&&p.pluginRepositories)||[], scrapers=(p&&p.pluginScrapers)||[], enabled=(p&&p.pluginsEnabled)||false;
  var main = document.getElementById('main-content');

  var toggle = '<label class="toggle"><input type="checkbox"'+(enabled?' checked':'')+' onchange="togglePlugins(this.checked)"><span class="toggle-slider"></span></label>';

  var reposHtml = repos.length===0 ? emptyState(t('plugins_empty'),'') :
    '<div class="card" style="padding:0 20px">' +
    repos.map(function(r){
      return '<div class="list-item"><div class="item-icon">'+ICO.repo+'</div><div class="item-info"><div class="item-title">'+esc(r.name||r.url)+'</div><div class="item-sub" style="font-family:monospace;font-size:11px">'+esc(r.url)+'</div><div class="item-sub">'+(r.scraperCount||0)+' scrapers · '+t('repo_updated')+' '+(r.lastUpdated?timeAgo(new Date(r.lastUpdated).toISOString()):t('repo_never'))+'</div></div><div class="item-actions">'+bdg(r.enabled?'green':'red',r.enabled?t('plugin_active'):t('plugin_disabled'))+'<button class="btn-remove" onclick="removeRepo(\''+esc(r.url)+'\')">'+ICO.trash+' Remove</button></div></div>';
    }).join('') + '</div>';

  var scrapersHtml = scrapers.length ? '<div class="section-label">'+t('scrapers_label',scrapers.length)+'</div><div class="card" style="padding:0 20px">'+scrapers.map(function(s){
    var logo = safeUrl(s.logo);
    return '<div class="list-item"><div class="item-icon">'+(logo?'<img src="'+logo+'" alt="" onerror="this.style.display=\'none\'">':ICO.plugins)+'</div><div class="item-info"><div class="item-title">'+esc(s.name)+'</div><div class="item-sub">'+esc(s.description)+' · v'+esc(s.version)+'</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:4px">'+(s.supportedTypes||[]).map(function(x){return bdg('gray',esc(x));}).join('')+(s.contentLanguage||[]).map(function(x){return bdg('blue',esc(x));}).join('')+'</div></div>'+bdg((s.enabled&&s.manifestEnabled)?'green':'red',(s.enabled&&s.manifestEnabled)?t('plugin_active'):t('plugin_disabled'))+'</div>';
  }).join('')+'</div>' : '';

  var form = '<div id="plugin-add-form" style="display:none"><div class="add-form"><div class="add-form-title">'+t('plugins_add_title')+'</div><div class="form-group"><label class="form-label">'+t('plugins_url')+'</label><input id="plugin-url" class="form-input" placeholder="'+t('plugins_url_ph')+'"></div><div class="form-actions"><button class="btn-save" onclick="addPluginRepo()">'+t('plugins_add')+'</button><button class="btn-cancel" onclick="togglePluginForm()">Cancel</button><span id="plugin-err" style="font-size:12px;color:var(--red);margin-left:8px"></span></div></div></div>';

  var btn = '<button class="btn-add" onclick="togglePluginForm()">'+ICO.plus+' '+t('plugins_add')+'</button>';
  var extra = '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:var(--text-muted)">'+(enabled?t('plugins_status_on'):t('plugins_status_off'))+'</span>'+toggle+'</div>';

  main.innerHTML = sectionWrap(t('plugins_title'),t('plugins_sub',repos.length,scrapers.length), form+reposHtml+scrapersHtml+'<div class="card" style="margin-top:4px"><p style="font-size:13px;color:var(--text-muted)">'+t('plugins_tip')+'</p></div>', btn, extra);
}

function togglePluginForm() { var f=document.getElementById('plugin-add-form'); if(f) f.style.display=f.style.display==='none'?'block':'none'; }
async function togglePlugins(val) { try { await patchAndSave(function(p){ p.pluginsEnabled=val; }); } catch(e){ toast(t('save_err'),'err'); } }

async function addPluginRepo() {
  var url = ((document.getElementById('plugin-url')||{}).value||'').trim();
  var errEl = document.getElementById('plugin-err');
  var saveBtn = document.querySelector('#plugin-add-form .btn-save');
  if (!url) { errEl.textContent = 'URL is required'; return; }
  errEl.textContent = ''; saveBtn.disabled = true; saveBtn.textContent = t('plugins_fetching');

  var name = url, scraperCount = 0;
  try {
    var res = await fetch(url);
    if (res.ok) { var data = await res.json(); name = data.name || data.repoName || url; scraperCount = ((data.scrapers||data.plugins)||[]).length; }
  } catch(e) {}

  try {
    await patchAndSave(function(p) {
      if (!p.pluginRepositories) p.pluginRepositories = [];
      if (p.pluginRepositories.some(function(r){ return r.url===url; })) return;
      p.pluginRepositories.push({ id:'repo_'+Date.now(), url:url, name:name, enabled:true, scraperCount:scraperCount, lastUpdated:new Date().toISOString() });
    });
    await renderPlugins();
  } catch(e) { errEl.textContent = e.message; saveBtn.disabled=false; saveBtn.textContent=t('plugins_add'); }
}

async function removeRepo(url) {
  if (!confirm('Remove this repository?')) return;
  try {
    await patchAndSave(function(p){ if(p.pluginRepositories) p.pluginRepositories=p.pluginRepositories.filter(function(r){ return r.url!==url; }); });
    await renderPlugins();
  } catch(e) { toast(t('save_err'),'err'); }
}

// ── Watchlist ─────────────────────────────────────────────────────────────
async function renderWatchlist() {
  var p = state.syncPayload;
  var items = Object.values((p&&p.watchlistByProfile)||{}).reduce(function(a,b){ return a.concat(b||[]); },[]);
  var movies = items.filter(function(i){ return (i.media_type||i.mediaType)==='movie'; });
  var shows  = items.filter(function(i){ return (i.media_type||i.mediaType)==='tv'; });
  var main = document.getElementById('main-content');
  if (!items.length) { main.innerHTML = sectionWrap(t('watchlist_title'),'',emptyState(t('watchlist_empty'),'')); return; }
  function wlSection(list, label) {
    if (!list.length) return '';
    return '<div class="section-label">'+label+' ('+list.length+')</div><div class="card" style="padding:0 20px">'+
      list.map(function(i){ var isMovie=(i.media_type||i.mediaType)==='movie'; return '<div class="list-item"><div class="item-icon">'+(isMovie?ICO.movie:ICO.tv)+'</div><div class="item-info"><div class="item-title">'+esc(i.title||i.name||'TMDB #'+(i.tmdb_id||i.tmdbId))+'</div><div class="item-sub">'+timeAgo(i.added_at||i.addedAt)+'</div></div></div>'; }).join('')+'</div>';
  }
  main.innerHTML = sectionWrap(t('watchlist_title'),t('watchlist_sub',items.length),wlSection(movies,t('wl_movies'))+wlSection(shows,t('wl_tv')));
}

// ── AI ────────────────────────────────────────────────────────────────────
async function renderAI() {
  var p = state.syncPayload;
  var enabled=(p&&p.subtitleAiEnabled)||false, auto=(p&&p.subtitleAiAutoSelect)||false;
  var model=(p&&p.subtitleAiModel)||'GROQ_LLAMA_70B', hi=(p&&p.subtitleRemoveHearingImpaired)||false;

  function mCard(val, name, extra, desc) {
    return '<label class="model-card'+(model===val?' selected':'')+'"><input type="radio" name="ai-model" value="'+val+'"'+(model===val?' checked':'')+' onchange="updateAI(\'subtitleAiModel\',this.value)"><div><div class="model-name">'+name+' '+extra+'</div><div class="model-desc">'+desc+'</div></div></label>';
  }

  document.getElementById('main-content').innerHTML = sectionWrap(t('ai_title'),t('ai_sub'),
    '<div class="tv-banner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg><div><div class="tv-banner-title">'+t('ai_banner_title')+'</div><div class="tv-banner-sub">'+t('ai_banner_sub')+'</div></div></div>' +
    '<div class="card"><div style="font-size:15px;font-weight:700;margin-bottom:14px">'+t('ai_settings_title')+'</div>'+
    toggleRowHtml('subtitleAiEnabled',t('ai_enable'),t('ai_enable_desc'),enabled)+
    toggleRowHtml('subtitleAiAutoSelect',t('ai_auto'),t('ai_auto_desc'),auto)+
    toggleRowHtml('subtitleRemoveHearingImpaired',t('ai_hi'),t('ai_hi_desc'),hi,true)+'</div>' +
    '<div class="card"><div style="font-size:15px;font-weight:700;margin-bottom:12px">'+t('ai_model_title')+'</div><div class="models-grid">'+
    mCard('GROQ_LLAMA_70B','⚡ Groq Llama 70B',bdg('gold',t('ai_recommended')),t('ai_groq_desc'))+
    mCard('GEMINI_FLASH_25','🤖 Gemini Flash 2.5','',t('ai_gemini_desc'))+'</div>'+
    '<div style="background:var(--bg-card2);border-radius:8px;padding:14px 16px"><div style="font-size:13px;font-weight:700;margin-bottom:7px">'+t('ai_key_title')+'</div><div style="font-size:12px;color:var(--text-muted);line-height:1.7">'+t('ai_key_desc')+'</div></div></div>');
}

async function updateAI(key, val) {
  try {
    await patchAndSave(function(p){ p[key]=val; });
    if (key==='subtitleAiModel') document.querySelectorAll('.model-card').forEach(function(c){ c.classList.toggle('selected',c.querySelector('input')&&c.querySelector('input').value===val); });
  } catch(e) { toast(t('save_err'),'err'); }
}

// ── Settings ──────────────────────────────────────────────────────────────
async function renderSettings() {
  var p = state.syncPayload;
  var layout=(p&&p.cardLayoutMode)||'landscape', oled=(p&&p.oledBlackBackground)!==undefined?(p&&p.oledBlackBackground):true;
  var skip=(p&&p.skipProfileSelection)||false, lang=(p&&p.lastAppLanguage)||'en';
  var langs = [{v:'en',l:'English'},{v:'he',l:'עברית'},{v:'ar',l:'العربية'},{v:'fr',l:'Français'},{v:'de',l:'Deutsch'},{v:'es',l:'Español'},{v:'ru',l:'Русский'},{v:'tr',l:'Türkçe'}];

  document.getElementById('main-content').innerHTML = sectionWrap(t('settings_title'),t('settings_sub'),
    '<div class="card"><div style="font-size:15px;font-weight:700;margin-bottom:14px">'+t('appearance')+'</div>'+
    toggleRowHtml('oledBlackBackground',t('oled_label'),t('oled_desc'),oled)+
    '<div class="toggle-row" style="flex-direction:column;align-items:flex-start;gap:8px;padding-top:14px"><div style="font-weight:600">'+t('layout_label')+'</div><select class="form-select" style="width:auto;min-width:180px" onchange="updateSetting(\'cardLayoutMode\',this.value)"><option value="landscape"'+(layout==='landscape'?' selected':'')+'>'+t('layout_landscape')+'</option><option value="portrait"'+(layout==='portrait'?' selected':'')+'>'+t('layout_portrait')+'</option></select></div>'+
    '<div class="toggle-row" style="flex-direction:column;align-items:flex-start;gap:8px;padding-top:14px;border-bottom:none"><div style="font-weight:600">'+t('lang_label')+'</div><select class="form-select" style="width:auto;min-width:180px" onchange="updateSetting(\'lastAppLanguage\',this.value)">'+langs.map(function(x){return '<option value="'+x.v+'"'+(lang===x.v?' selected':'')+'>'+x.l+'</option>';}).join('')+'</select></div></div>'+
    '<div class="card"><div style="font-size:15px;font-weight:700;margin-bottom:14px">'+t('profile_section')+'</div>'+toggleRowHtml('skipProfileSelection',t('skip_label'),t('skip_desc'),skip,true)+'</div>'+
    '<div class="card"><div style="font-size:15px;font-weight:700;margin-bottom:14px">'+t('account_section')+'</div><div class="toggle-row" style="border-bottom:none"><div class="toggle-row-left"><div class="toggle-row-label">'+t('user_id_label')+'</div><div style="font-size:11px;font-family:monospace;color:var(--text-muted);margin-top:3px">'+esc((state.session&&state.session.id)||'—')+'</div></div></div><button onclick="signOut()" style="margin-top:14px;display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--red-dim);color:var(--red);border:1px solid rgba(248,113,113,0.2);border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'+t('sign_out')+'</button></div>');
}

async function updateSetting(key, val) { try { await patchAndSave(function(p){ p[key]=val; }); } catch(e){ toast(t('save_err'),'err'); } }

// ── TV Pairing ────────────────────────────────────────────────────────────
async function renderTVPair() {
  var urlCode = new URLSearchParams(location.search).get('code') || '';
  var hasSession = state.session && state.session.access_token;
  document.getElementById('main-content').innerHTML = sectionWrap(t('tv_title'),t('tv_sub'),
    '<div class="card" style="max-width:480px"><div class="form-group"><label class="form-label">'+t('tv_code_label')+'</label><input id="tv-code" class="form-input" placeholder="XXXX-XXXX" value="'+esc(urlCode)+'" maxlength="9" oninput="this.value=this.value.toUpperCase()" style="font-size:22px;text-align:center;letter-spacing:6px;font-weight:700"></div>'+
    (!hasSession ? '<div class="form-group"><label class="form-label">'+t('tv_email_label')+'</label><input id="tv-email" type="email" class="form-input" placeholder="you@example.com"></div><div class="form-group"><label class="form-label">'+t('tv_pass_label')+'</label><input id="tv-pass" type="password" class="form-input" placeholder="••••••••"></div>' :
    '<p style="font-size:13px;color:var(--text-muted);margin-bottom:14px">Signed in as <b style="color:var(--text)">'+esc(state.session.email)+'</b></p>') +
    '<button onclick="doTVPair()" style="width:100%;padding:13px;background:var(--gold);color:#000;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">'+t('tv_connect')+'</button><div id="tv-status" style="margin-top:14px;font-size:14px;text-align:center;min-height:20px"></div></div>');

  if (urlCode && hasSession) setTimeout(doTVPair, 600);
}

async function doTVPair() {
  var code = ((document.getElementById('tv-code')||{}).value||'').trim().toUpperCase();
  var statusEl = document.getElementById('tv-status');
  if (!code){ statusEl.style.color='var(--red)'; statusEl.textContent=t('tv_err_code'); return; }
  statusEl.style.color='var(--text-muted)'; statusEl.textContent=t('tv_connecting');
  try {
    if (state.session && state.session.access_token) {
      await apiCall('tv-auth-approve',{body:{code:code,refresh_token:state.session.refresh_token},token:state.session.access_token});
    } else {
      var email=((document.getElementById('tv-email')||{}).value||'').trim();
      var password=((document.getElementById('tv-pass')||{}).value)||'';
      if(!email||!password){ statusEl.style.color='var(--red)'; statusEl.textContent=t('auth_err'); return; }
      await apiCall('tv-auth-complete',{body:{code:code,email:email,password:password,intent:'signin'}});
    }
    statusEl.style.color='var(--green)'; statusEl.textContent=t('tv_success');
  } catch(e){ statusEl.style.color='var(--red)'; statusEl.textContent=e.message; }
}

// ── Shell ─────────────────────────────────────────────────────────────────
function buildShell(session) {
  var email = (session && session.email) || t('user_fallback');
  var initial = esc(email[0].toUpperCase());
  var name = esc(email.split('@')[0]);

  var navGroups = [
    { items: [
      {id:'dashboard', label:t('nav_dashboard'), icon:'<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'},
      {id:'profiles',  label:t('nav_profiles'),  icon:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>'},
    ]},
    { label:'Content', items: [
      {id:'addons',   label:t('nav_addons'),   icon:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/>'},
      {id:'iptv',     label:t('nav_iptv'),     icon:'<path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'},
      {id:'plugins',  label:t('nav_plugins'),  icon:'<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>'},
      {id:'watchlist',label:t('nav_watchlist'),icon:'<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>'},
    ]},
    { label:'Account', items: [
      {id:'ai',      label:t('nav_ai'),      icon:'<path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'},
      {id:'settings',label:t('nav_settings'),icon:'<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M1 12h2M21 12h2M12 1v2M12 21v2"/>'},
      {id:'tvpair',  label:t('nav_tv'),      icon:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'},
    ]},
  ];

  var navHtml = navGroups.map(function(g){
    return (g.label ? '<div class="nav-section"><span>'+g.label+'</span></div>' : '') +
      g.items.map(function(n){
        return '<button class="nav-item'+(n.id===state.activeSection?' active':'')+'" data-section="'+n.id+'" onclick="navigate(\''+n.id+'\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">'+n.icon+'</svg><span>'+n.label+'</span></button>';
      }).join('');
  }).join('');

  document.getElementById('app-screen').innerHTML =
    '<aside class="sidebar"><div class="sidebar-logo"><img src="../assets/arvio-icon-512.png" alt="ARVIO" onerror="this.style.display=\'none\'"><span>ARVIO</span></div><nav>'+navHtml+'</nav><div class="sidebar-user"><div class="user-avatar">'+initial+'</div><div class="user-info"><div class="user-name">'+name+'</div><div class="user-email">'+esc(email)+'</div></div><button class="btn-lang" onclick="setLang(currentLang===\'en\'?\'he\':\'en\')">'+(currentLang==='en'?'עב':'EN')+'</button><button class="btn-icon" onclick="signOut()" title="'+t('sign_out')+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button></div></aside><main class="main" id="main-content"></main>';
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
  var tvCode = new URLSearchParams(location.search).get('code');
  if (tvCode) state.activeSection = 'tvpair';
  var session = loadStoredSession();
  if (!session || !session.access_token) {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
    return;
  }
  state.session = session;
  await bootApp();
}

boot();
