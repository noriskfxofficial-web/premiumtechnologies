const API = {
  content: '/.netlify/functions/content',
  login: '/.netlify/functions/login',
  publish: '/.netlify/functions/publish',
  lead: '/.netlify/functions/lead',
  leads: '/.netlify/functions/leads',
  upload: '/.netlify/functions/upload'
};

const state = {
  content: null,
  draft: null,
  lang: localStorage.getItem('pt-lang') || 'en',
  path: window.location.pathname,
  adminTab: localStorage.getItem('pt-admin-tab') || 'dashboard',
  token: localStorage.getItem('pt-admin-token') || '',
  leads: []
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const deepClone = (value) => JSON.parse(JSON.stringify(value));
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const isAdmin = () => state.path.startsWith('/admin');
const pageKey = () => state.path === '/' ? 'home' : state.path.replace(/^\//, '').split('/')[0] || 'home';
const t = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value[state.lang] || value.en || value.ar || '';
  return value ?? '';
};

function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => acc == null ? undefined : acc[key], obj);
}
function setPath(obj, path, value) {
  const parts = path.split('.');
  let target = obj;
  parts.slice(0, -1).forEach((part) => {
    if (target[part] == null) target[part] = /^\d+$/.test(part) ? [] : {};
    target = target[part];
  });
  target[parts[parts.length - 1]] = value;
}
function byAuth(headers = {}) {
  return { ...headers, Authorization: `Bearer ${state.token}` };
}

async function loadContent() {
  try {
    const res = await fetch(`${API.content}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Function unavailable');
    state.content = await res.json();
  } catch (error) {
    const fallback = await fetch('/assets/defaultContent.json');
    state.content = await fallback.json();
  }
  if (!state.draft) state.draft = deepClone(state.content);
}

function updateMeta() {
  const key = pageKey();
  const seo = state.content?.seo?.[key]?.[state.lang] || state.content?.seo?.home?.[state.lang] || {};
  document.title = seo.title || 'PT Solutions | Premium Technologies Solutions';
  const desc = $('meta[name="description"]');
  if (desc) desc.setAttribute('content', seo.description || 'Premium Technologies Solutions');
  document.documentElement.lang = state.lang;
  document.body.classList.toggle('rtl', state.lang === 'ar');
}

function navigate(path) {
  if (path === state.path) return;
  history.pushState({}, '', path);
  state.path = path;
  document.body.classList.remove('nav-open');
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sectionIntro(eyebrow, title, subtitle, center = false) {
  return `<div class="${center ? 'section-head center' : 'section-head'}">
    <span class="eyebrow">${escapeHtml(t(eyebrow))}</span>
    <h2 class="heading-lg text-gradient-dark">${escapeHtml(t(title))}</h2>
    ${subtitle ? `<p class="lead">${escapeHtml(t(subtitle))}</p>` : ''}
  </div>`;
}

function header() {
  const c = state.content;
  return `<header class="site-header">
    <div class="container header-inner">
      <a class="brand-lockup" href="/" data-route="/" aria-label="PT Solutions home">
        <img src="${escapeHtml(c.settings.logo)}" alt="PT Solutions logo" />
        <span><span class="brand-name">${escapeHtml(c.settings.companyName)}</span><span class="brand-legal">${escapeHtml(c.settings.legalName)}</span></span>
      </a>
      <nav class="nav" aria-label="Main navigation">
        ${c.navigation.map(item => `<a href="${item.path}" data-route="${item.path}" class="${state.path === item.path ? 'active' : ''}">${escapeHtml(t(item.label))}</a>`).join('')}
      </nav>
      <div class="header-actions">
        <button class="menu-btn" data-menu aria-label="Menu">☰</button>
        <button class="lang-btn" data-lang="${state.lang === 'en' ? 'ar' : 'en'}">${state.lang === 'en' ? 'عربي' : 'EN'}</button>
        <a class="btn btn-light" href="/admin" data-route="/admin">Admin</a>
      </div>
    </div>
  </header>`;
}

function footer() {
  const c = state.content;
  return `<footer class="footer">
    <div class="container">
      <div class="footer-top">
        <div>
          <a class="brand-lockup" href="/" data-route="/">
            <img src="${escapeHtml(c.settings.logo)}" alt="PT Solutions logo" />
            <span><span class="brand-name">${escapeHtml(c.settings.companyName)}</span><span class="brand-legal">${escapeHtml(c.settings.legalName)}</span></span>
          </a>
          <p class="lead">${escapeHtml(t(c.footer.tagline))}</p>
          <p>${escapeHtml(c.settings.email)} · ${escapeHtml(c.settings.whatsapp)} · ${escapeHtml(t(c.settings.location))}</p>${c.settings.socials ? `<p class="social-line">Instagram: ${escapeHtml(c.settings.socials.instagram || '')} · Telegram: ${escapeHtml(c.settings.socials.telegram || '')} · Facebook: ${escapeHtml(c.settings.socials.facebook || '')}</p>` : ''}
        </div>
        <div class="footer-links">
          ${c.navigation.map(item => `<a href="${item.path}" data-route="${item.path}">${escapeHtml(t(item.label))}</a>`).join('')}
          <a href="/careers" data-route="/careers">${state.lang === 'ar' ? 'الوظائف' : 'Careers'}</a>
        </div>
      </div>
      <div class="disclaimer">${escapeHtml(t(c.footer.disclaimer))}<br/>© ${new Date().getFullYear()} ${escapeHtml(c.settings.legalName)}. ${escapeHtml(t(c.footer.copyright))}</div>
    </div>
  </footer>`;
}

function heroSection() {
  const c = state.content;
  return `<section class="hero">
    <div class="container hero-inner">
      <div>
        <span class="eyebrow">${escapeHtml(t(c.hero.eyebrow))}</span>
        <h1 class="heading-xl">${escapeHtml(t(c.hero.title))}</h1>
        <h2 class="heading-md gradient-text">${escapeHtml(t(c.hero.highlight))}</h2>
        <p class="lead">${escapeHtml(t(c.hero.subtitle))}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="/brands" data-route="/brands">${escapeHtml(t(c.hero.primaryCta))} →</a>
          <a class="btn btn-secondary" href="/contact" data-route="/contact">${escapeHtml(t(c.hero.secondaryCta))}</a>
        </div>
        <div class="hero-micro">${escapeHtml(t(c.hero.visualTitle))}</div>
      </div>
      <div class="orbit-card" aria-label="PT Solutions technology ecosystem">
        <div class="logo-orb"><img src="${escapeHtml(c.settings.logo)}" alt="PT Solutions logo" /></div>
        <span class="float-chip">SaaS Platforms</span>
        <span class="float-chip">Fintech Ecosystems</span>
        <span class="float-chip">Commerce Systems</span>
        <span class="float-chip">Media Engines</span>
      </div>
    </div>
  </section>`;
}

function statsSection() {
  return `<div class="stat-strip"><div class="container"><div class="stats-grid">
    ${state.content.stats.map(stat => `<div class="stat"><strong>${escapeHtml(stat.value)}</strong><span>${escapeHtml(t(stat.label))}</span></div>`).join('')}
  </div></div></div>`;
}

function aboutSection() {
  const a = state.content.about;
  return `<section class="section"><div class="container split">
    <div class="panel dark">
      <span class="eyebrow">${state.lang === 'ar' ? 'عن الشركة' : 'About the Company'}</span>
      <h2 class="heading-lg">${escapeHtml(t(a.title))}</h2>
      <p class="lead">${escapeHtml(t(a.subtitle))}</p>
    </div>
    <div>
      <p class="lead">${escapeHtml(t(a.body))}</p>
      <div class="pillar-grid">
        ${a.pillars.map(p => `<div class="card"><h3>${escapeHtml(t(p.title))}</h3><p>${escapeHtml(t(p.text))}</p></div>`).join('')}
      </div>
    </div>
  </div></section>`;
}

function serviceCard(service) {
  return `<article class="card">
    <div class="card-icon">${escapeHtml(service.icon || 'PT')}</div>
    <h3>${escapeHtml(t(service.title))}</h3>
    <p>${escapeHtml(t(service.text))}</p>
    <div class="tags">${(service.items || []).map(item => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</div>
  </article>`;
}
function servicesSection(full = false) {
  const c = state.content;
  const list = full ? c.services : c.services.slice(0, 6);
  return `<section class="section"><div class="container">
    ${sectionIntro(c.servicesIntro.eyebrow, c.servicesIntro.title, c.servicesIntro.subtitle)}
    <div class="service-grid">${list.map(serviceCard).join('')}</div>
  </div></section>`;
}
function brandCard(brand) {
  return `<article class="card brand-card">
    <div class="brand-monogram ${brand.logo ? 'has-logo' : ''}">${brand.logo ? `<img src="${escapeHtml(brand.logo)}" alt="${escapeHtml(brand.name)} logo" />` : escapeHtml(initials(brand.name))}</div>
    <div class="status">${escapeHtml(t(brand.status))}</div>
    <div class="category">${escapeHtml(brand.category || '')}</div>
    <h3>${escapeHtml(brand.name)}</h3>
    <p>${escapeHtml(t(brand.description))}</p>
    <div class="tags">${(brand.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
    <div style="margin-top:20px"><a class="btn btn-ghost" href="${escapeHtml(brand.url || '#')}">${escapeHtml(t(brand.cta) || (state.lang === 'ar' ? 'اعرف أكثر' : 'Learn More'))}</a></div>
  </article>`;
}
function brandsSection(full = false) {
  const c = state.content;
  const list = full ? c.brands : c.brands.slice(0, 6);
  return `<section class="section tight"><div class="container">
    ${sectionIntro(c.brandsIntro.eyebrow, c.brandsIntro.title, c.brandsIntro.subtitle)}
    <div class="brand-grid">${list.map(brandCard).join('')}</div>
    ${!full ? `<div style="margin-top:32px"><a class="btn btn-primary" href="/brands" data-route="/brands">${state.lang === 'ar' ? 'عرض كل العلامات' : 'View All Brands'} →</a></div>` : ''}
  </div></section>`;
}

function technologySection() {
  const tech = state.content.technology;
  return `<section class="section dark-band"><div class="container">
    <div class="split">
      <div>
        <span class="eyebrow">${escapeHtml(t(tech.eyebrow))}</span>
        <h2 class="heading-lg">${escapeHtml(t(tech.title))}</h2>
        <p class="lead">${escapeHtml(t(tech.subtitle))}</p>
        <div class="feature-grid">${tech.features.map(f => `<article class="card"><h3>${escapeHtml(t(f.title))}</h3><p>${escapeHtml(t(f.text))}</p></article>`).join('')}</div>
      </div>
      <div class="vision-map"></div>
    </div>
  </div></section>`;
}

function whySection() {
  const why = state.content.why;
  return `<section class="section"><div class="container">
    ${sectionIntro(why.eyebrow, why.title, '')}
    <div class="why-grid">${why.items.map(item => `<article class="card"><h3>${escapeHtml(t(item.title))}</h3><p>${escapeHtml(t(item.text))}</p></article>`).join('')}</div>
  </div></section>`;
}

function visionSection() {
  const v = state.content.vision;
  return `<section class="section dark-band"><div class="container split">
    <div>
      <span class="eyebrow">${escapeHtml(t(v.eyebrow))}</span>
      <h2 class="heading-lg">${escapeHtml(t(v.title))}</h2>
      <p class="lead">${escapeHtml(t(v.text))}</p>
    </div>
    <div class="vision-map"></div>
  </div></section>`;
}

function partnersSection() {
  const p = state.content.partners;
  return `<section class="section"><div class="container">
    ${sectionIntro(p.eyebrow, p.title, p.subtitle)}
    <div class="partner-grid">${p.cards.map(card => `<article class="card"><h3>${escapeHtml(t(card.title))}</h3><p>${escapeHtml(t(card.text))}</p></article>`).join('')}</div>
    <div style="margin-top:32px"><a class="btn btn-primary" href="/contact" data-route="/contact">${state.lang === 'ar' ? 'ابدأ تواصل الآن' : 'Start the Conversation'} →</a></div>
  </div></section>`;
}

function insightsSection(full = false) {
  const i = state.content.insights;
  return `<section class="section"><div class="container">
    ${sectionIntro(i.eyebrow, i.title, '')}
    <div class="insight-grid">${i.items.map(item => `<article class="card"><div class="category">${escapeHtml(item.category)} · ${escapeHtml(item.date)}</div><h3>${escapeHtml(t(item.title))}</h3><p>${escapeHtml(t(item.excerpt))}</p></article>`).join('')}</div>
  </div></section>`;
}

function pageHero(key, intro) {
  const seo = state.content.seo[key] || state.content.seo.home;
  return `<section class="page-hero"><div class="container">
    <span class="eyebrow">${escapeHtml(intro?.eyebrow ? t(intro.eyebrow) : state.content.settings.companyName)}</span>
    <h1 class="heading-lg text-gradient-dark">${escapeHtml(intro?.title ? t(intro.title) : seo[state.lang].title)}</h1>
    <p class="lead">${escapeHtml(intro?.subtitle ? t(intro.subtitle) : seo[state.lang].description)}</p>
  </div></section>`;
}

function contactSection() {
  const c = state.content.contact;
  return `<section class="section"><div class="container contact-layout">
    <div class="panel dark">
      <span class="eyebrow">${escapeHtml(t(c.eyebrow))}</span>
      <h1 class="heading-lg">${escapeHtml(t(c.title))}</h1>
      <p class="lead">${escapeHtml(t(c.subtitle))}</p>
      <p class="lead">${escapeHtml(state.content.settings.email)}<br/>${escapeHtml(state.content.settings.whatsapp)}<br/>${state.content.settings.socials ? `Instagram: ${escapeHtml(state.content.settings.socials.instagram || '')}<br/>Telegram: ${escapeHtml(state.content.settings.socials.telegram || '')}<br/>Facebook: ${escapeHtml(state.content.settings.socials.facebook || '')}` : ''}</p>
    </div>
    <form class="panel form-grid" id="lead-form">
      <div id="lead-message"></div>
      <div class="form-row">
        ${fieldPublic('name', t(c.fields.name), 'text', true)}
        ${fieldPublic('email', t(c.fields.email), 'email', true)}
      </div>
      <div class="form-row">
        ${fieldPublic('company', t(c.fields.company), 'text')}
        <div class="field"><label>${escapeHtml(t(c.fields.interest))}</label><select name="interest">${c.options.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label>${escapeHtml(t(c.fields.message))}</label><textarea name="message" required></textarea></div>
      <button class="btn btn-primary" type="submit">${escapeHtml(t(c.fields.submit))} →</button>
      <div class="form-note">${state.lang === 'ar' ? 'سيتم حفظ الطلب داخل لوحة الأدمن.' : 'Your request will be saved inside the admin panel.'}</div>
    </form>
  </div></section>`;
}
function fieldPublic(name, label, type = 'text', required = false) {
  return `<div class="field"><label>${escapeHtml(label)}</label><input name="${name}" type="${type}" ${required ? 'required' : ''}/></div>`;
}

function careersPage() {
  const c = state.content.careers;
  return `${pageHero('careers', c)}<section class="section"><div class="container"><div class="service-grid">${c.roles.map(role => `<article class="card"><h3>${escapeHtml(role.title)}</h3><p>${escapeHtml(role.type)}</p><div class="tags"><span class="tag">${escapeHtml(t(role.status))}</span></div></article>`).join('')}</div><div style="margin-top:32px"><a class="btn btn-primary" href="/contact" data-route="/contact">${state.lang === 'ar' ? 'قدّم اهتمامك' : 'Submit Interest'} →</a></div></div></section>`;
}

function renderPublic() {
  const key = pageKey();
  let main = '';
  if (key === 'home') main = `${heroSection()}${statsSection()}${aboutSection()}${brandsSection()}${servicesSection()}${technologySection()}${whySection()}${visionSection()}${partnersSection()}${insightsSection()}${contactSection()}`;
  else if (key === 'about') main = `${pageHero('about', { eyebrow: { en: 'About PT Solutions', ar: 'عن PT Solutions' }, title: state.content.about.title, subtitle: state.content.about.subtitle })}${aboutSection()}${whySection()}${visionSection()}`;
  else if (key === 'brands') main = `${pageHero('brands', state.content.brandsIntro)}${brandsSection(true)}${partnersSection()}`;
  else if (key === 'services') main = `${pageHero('services', state.content.servicesIntro)}${servicesSection(true)}${technologySection()}`;
  else if (key === 'technology') main = `${pageHero('technology', state.content.technology)}${technologySection()}${whySection()}`;
  else if (key === 'partners') main = `${pageHero('partners', state.content.partners)}${partnersSection()}${contactSection()}`;
  else if (key === 'insights') main = `${pageHero('insights', state.content.insights)}${insightsSection(true)}`;
  else if (key === 'careers') main = careersPage();
  else if (key === 'contact') main = `${pageHero('contact', state.content.contact)}${contactSection()}`;
  else main = `${pageHero('home', { title: { en: 'Page not found', ar: 'الصفحة غير موجودة' }, subtitle: { en: 'Return to the homepage.', ar: 'ارجع إلى الصفحة الرئيسية.' } })}`;
  $('#app').innerHTML = `<div class="site-shell">${header()}<main>${main}</main>${footer()}</div>`;
  attachLeadForm();
}

function attachLeadForm() {
  const form = $('#lead-form');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const message = $('#lead-message');
    message.innerHTML = `<div class="notice">${state.lang === 'ar' ? 'جاري إرسال الطلب...' : 'Sending request...'}</div>`;
    try {
      const res = await fetch(API.lead, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Unable to submit');
      form.reset();
      message.innerHTML = `<div class="notice">${state.lang === 'ar' ? 'تم إرسال الطلب بنجاح.' : 'Request sent successfully.'}</div>`;
    } catch (error) {
      message.innerHTML = `<div class="notice error">${escapeHtml(error.message)}</div>`;
    }
  });
}

function adminLogin() {
  $('#app').innerHTML = `<div class="admin-login"><form class="admin-login-card" id="admin-login-form">
    <img class="admin-logo" src="${escapeHtml(state.content.settings.logo)}" alt="PT Solutions" />
    <h1 class="heading-md" style="text-align:center">PT Solutions Admin</h1>
    <p class="admin-small" style="text-align:center">Live content management for every page, language, brand, service, insight, and lead.</p>
    <div id="login-message"></div>
    <div class="admin-field"><label>Email</label><input name="email" type="email" placeholder="admin@ptsolutions.global" required /></div>
    <div class="admin-field"><label>Password</label><input name="password" type="password" placeholder="••••••••••" required /></div>
    <button class="btn btn-primary" style="width:100%" type="submit">Login</button>
    <p class="admin-small">Default demo login is inside README. Change environment variables before a real client launch.</p>
  </form></div>`;
  $('#admin-login-form').addEventListener('submit', handleLogin);
}

async function handleLogin(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  const msg = $('#login-message');
  msg.innerHTML = '';
  try {
    const res = await fetch(API.login, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Login failed');
    state.token = payload.token;
    localStorage.setItem('pt-admin-token', state.token);
    state.draft = deepClone(state.content);
    renderAdmin();
  } catch (error) {
    msg.innerHTML = `<div class="notice error">${escapeHtml(error.message)}</div>`;
  }
}

function renderAdmin() {
  if (!state.token) return adminLogin();
  document.body.classList.remove('rtl');
  document.body.classList.add('admin-body');
  const tabs = [
    ['dashboard', 'Dashboard'], ['company', 'Company & SEO'], ['hero', 'Homepage Hero'], ['pages', 'Page Content'], ['services', 'Services'], ['brands', 'Brands'], ['insights', 'Insights'], ['contact', 'Contact'], ['leads', 'Leads'], ['media', 'Media Upload'], ['json', 'Full JSON Control']
  ];
  $('#app').innerHTML = `<div class="admin-shell"><div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="brand-lockup"><img src="${escapeHtml(state.draft.settings.logo)}" alt="Logo"/><span><span class="brand-name">PT Solutions</span><span class="brand-legal">Admin CMS</span></span></div>
      ${tabs.map(([key, label]) => `<button data-admin-tab="${key}" class="${state.adminTab === key ? 'active' : ''}">${label}</button>`).join('')}
      <button data-action="logout" class="btn-danger">Logout</button>
    </aside>
    <main class="admin-main">
      <div class="admin-topbar">
        <div><button class="btn btn-ghost admin-mobile-toggle" data-action="toggle-admin-menu">☰ Menu</button><h1 class="heading-md">${tabs.find(t => t[0] === state.adminTab)?.[1] || 'Admin'}</h1><div class="admin-small">Edits are made in draft mode here. Click Publish Live to update the website instantly.</div></div>
        <div class="admin-actions"><button class="btn btn-light" data-route="/">Preview Site</button><button class="btn btn-ghost" data-action="reset-draft">Reset Draft</button><button class="btn btn-primary" data-action="publish">Publish Live</button></div>
      </div>
      <div id="admin-panel">${adminPanel()}</div>
    </main>
  </div></div>`;
  if (state.adminTab === 'leads') loadLeads();
}

function adminPanel() {
  const tab = state.adminTab;
  if (tab === 'dashboard') return adminDashboard();
  if (tab === 'company') return adminCompany();
  if (tab === 'hero') return adminHero();
  if (tab === 'pages') return adminPages();
  if (tab === 'services') return adminServices();
  if (tab === 'brands') return adminBrands();
  if (tab === 'insights') return adminInsights();
  if (tab === 'contact') return adminContact();
  if (tab === 'leads') return adminLeads();
  if (tab === 'media') return adminMedia();
  if (tab === 'json') return adminJson();
  return adminDashboard();
}

function adminDashboard() {
  const c = state.draft;
  return `<div class="kpi-grid">
    ${kpi(c.brands.length, 'Brands')}${kpi(c.services.length, 'Services')}${kpi(c.insights.items.length, 'Insights')}${kpi(c.navigation.length, 'Pages')}
  </div>
  <div class="admin-card"><h2>Final website status</h2><p class="lead">The project is configured for Netlify with a live CMS powered by Netlify Functions and Netlify Blobs. Public pages fetch live content, so published edits appear without rebuilding the site.</p><div class="tags"><span class="tag">Bilingual Arabic/English</span><span class="tag">Admin CMS</span><span class="tag">Live Publish</span><span class="tag">Lead Inbox</span><span class="tag">Media Upload</span><span class="tag">SEO Control</span></div></div>`;
}
function kpi(value, label) { return `<div class="kpi"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`; }

function translatedField(path, label, textarea = false) {
  const value = getPath(state.draft, path) || { en: '', ar: '' };
  const tag = textarea ? 'textarea' : 'input';
  return `<div class="admin-grid">
    <div class="admin-field"><label>${escapeHtml(label)} EN</label>${tag === 'input' ? `<input data-path="${path}" data-lang="en" value="${escapeHtml(value.en || '')}"/>` : `<textarea data-path="${path}" data-lang="en">${escapeHtml(value.en || '')}</textarea>`}</div>
    <div class="admin-field"><label>${escapeHtml(label)} AR</label>${tag === 'input' ? `<input data-path="${path}" data-lang="ar" value="${escapeHtml(value.ar || '')}"/>` : `<textarea data-path="${path}" data-lang="ar">${escapeHtml(value.ar || '')}</textarea>`}</div>
  </div>`;
}
function plainField(path, label, type = 'text', textarea = false) {
  const value = getPath(state.draft, path) || '';
  if (textarea) return `<div class="admin-field"><label>${escapeHtml(label)}</label><textarea data-path="${path}">${escapeHtml(value)}</textarea></div>`;
  return `<div class="admin-field"><label>${escapeHtml(label)}</label><input type="${type}" data-path="${path}" value="${escapeHtml(value)}"/></div>`;
}
function arrayField(path, label) {
  const value = getPath(state.draft, path) || [];
  return `<div class="admin-field"><label>${escapeHtml(label)} <span class="admin-small">one per line</span></label><textarea data-path="${path}" data-array="lines">${escapeHtml(value.join('\n'))}</textarea></div>`;
}

function adminCompany() {
  return `<div class="admin-card"><h2>Company Identity</h2>
    <div class="admin-grid">${plainField('settings.companyName', 'Short Name')}${plainField('settings.legalName', 'Official Legal Name')}${plainField('settings.logo', 'Logo URL')}${plainField('settings.email', 'Email')}${plainField('settings.whatsapp', 'WhatsApp')}${translatedField('settings.location', 'Location')}</div>
  </div>
  <div class="admin-card"><h2>SEO Pages</h2>${Object.keys(state.draft.seo).map(key => `<div class="admin-item"><h3>${escapeHtml(key)}</h3>${translatedField(`seo.${key}.title`, 'Title')}${translatedField(`seo.${key}.description`, 'Description', true)}</div>`).join('')}</div>`;
}
function adminHero() {
  return `<div class="admin-card"><h2>Homepage Hero</h2>${translatedField('hero.eyebrow', 'Eyebrow')}${translatedField('hero.title', 'Main Title', true)}${translatedField('hero.highlight', 'Highlighted line', true)}${translatedField('hero.subtitle', 'Subtitle', true)}${translatedField('hero.primaryCta', 'Primary CTA')}${translatedField('hero.secondaryCta', 'Secondary CTA')}${translatedField('hero.visualTitle', 'Micro Text')}</div>`;
}
function adminPages() {
  const c = state.draft;
  return `<div class="admin-card"><h2>About</h2>${translatedField('about.title', 'Title', true)}${translatedField('about.subtitle', 'Subtitle', true)}${translatedField('about.body', 'Body', true)}${c.about.pillars.map((p, i) => `<div class="admin-item"><h3>Pillar ${i+1}</h3>${translatedField(`about.pillars.${i}.title`, 'Title')}${translatedField(`about.pillars.${i}.text`, 'Text', true)}</div>`).join('')}</div>
  <div class="admin-card"><h2>Technology</h2>${translatedField('technology.eyebrow', 'Eyebrow')}${translatedField('technology.title', 'Title', true)}${translatedField('technology.subtitle', 'Subtitle', true)}${c.technology.features.map((f, i) => `<div class="admin-item"><h3>Feature ${i+1}</h3>${translatedField(`technology.features.${i}.title`, 'Title')}${translatedField(`technology.features.${i}.text`, 'Text', true)}</div>`).join('')}</div>
  <div class="admin-card"><h2>Why PT Solutions</h2>${translatedField('why.eyebrow', 'Eyebrow')}${translatedField('why.title', 'Title', true)}${c.why.items.map((item, i) => `<div class="admin-item"><h3>Why Item ${i+1}</h3>${translatedField(`why.items.${i}.title`, 'Title')}${translatedField(`why.items.${i}.text`, 'Text', true)}</div>`).join('')}</div>
  <div class="admin-card"><h2>Vision</h2>${translatedField('vision.eyebrow', 'Eyebrow')}${translatedField('vision.title', 'Title', true)}${translatedField('vision.text', 'Text', true)}</div>
  <div class="admin-card"><h2>Partners</h2>${translatedField('partners.eyebrow', 'Eyebrow')}${translatedField('partners.title', 'Title', true)}${translatedField('partners.subtitle', 'Subtitle', true)}${c.partners.cards.map((card, i) => `<div class="admin-item"><h3>Partner Card ${i+1}</h3>${translatedField(`partners.cards.${i}.title`, 'Title')}${translatedField(`partners.cards.${i}.text`, 'Text', true)}</div>`).join('')}</div>`;
}

function adminServices() {
  const c = state.draft;
  return `<div class="admin-card"><h2>Services Intro</h2>${translatedField('servicesIntro.eyebrow', 'Eyebrow')}${translatedField('servicesIntro.title', 'Title', true)}${translatedField('servicesIntro.subtitle', 'Subtitle', true)}</div>
  <div class="admin-card"><div class="admin-item-head"><h2>Services</h2><button class="btn btn-primary" data-action="add-service">Add Service</button></div><div class="admin-list">
    ${c.services.map((s, i) => `<div class="admin-item"><div class="admin-item-head"><h3>${escapeHtml(t(s.title) || `Service ${i+1}`)}</h3><button class="btn btn-danger" data-action="remove-service" data-index="${i}">Remove</button></div>${plainField(`services.${i}.icon`, 'Icon Code')}${translatedField(`services.${i}.title`, 'Title')}${translatedField(`services.${i}.text`, 'Text', true)}${arrayField(`services.${i}.items`, 'Tags / items')}</div>`).join('')}
  </div></div>`;
}
function adminBrands() {
  const c = state.draft;
  return `<div class="admin-card"><h2>Brands Intro</h2>${translatedField('brandsIntro.eyebrow', 'Eyebrow')}${translatedField('brandsIntro.title', 'Title', true)}${translatedField('brandsIntro.subtitle', 'Subtitle', true)}</div>
  <div class="admin-card"><div class="admin-item-head"><h2>Brands</h2><button class="btn btn-primary" data-action="add-brand">Add Brand</button></div><div class="admin-list">
    ${c.brands.map((b, i) => `<div class="admin-item"><div class="admin-item-head"><h3>${escapeHtml(b.name || `Brand ${i+1}`)}</h3><button class="btn btn-danger" data-action="remove-brand" data-index="${i}">Remove</button></div><div class="admin-grid">${plainField(`brands.${i}.name`, 'Brand Name')}${plainField(`brands.${i}.category`, 'Category')}${plainField(`brands.${i}.url`, 'URL')}</div>${translatedField(`brands.${i}.status`, 'Status')}${translatedField(`brands.${i}.description`, 'Description', true)}${translatedField(`brands.${i}.cta`, 'CTA')}${arrayField(`brands.${i}.tags`, 'Tags')}</div>`).join('')}
  </div></div>`;
}
function adminInsights() {
  const i = state.draft.insights;
  return `<div class="admin-card"><h2>Insights Intro</h2>${translatedField('insights.eyebrow', 'Eyebrow')}${translatedField('insights.title', 'Title', true)}</div>
  <div class="admin-card"><div class="admin-item-head"><h2>Insight Articles</h2><button class="btn btn-primary" data-action="add-insight">Add Insight</button></div><div class="admin-list">
    ${i.items.map((item, index) => `<div class="admin-item"><div class="admin-item-head"><h3>${escapeHtml(t(item.title) || `Insight ${index+1}`)}</h3><button class="btn btn-danger" data-action="remove-insight" data-index="${index}">Remove</button></div><div class="admin-grid">${plainField(`insights.items.${index}.date`, 'Date')}${plainField(`insights.items.${index}.category`, 'Category')}</div>${translatedField(`insights.items.${index}.title`, 'Title')}${translatedField(`insights.items.${index}.excerpt`, 'Excerpt', true)}</div>`).join('')}
  </div></div>`;
}
function adminContact() {
  return `<div class="admin-card"><h2>Contact Page</h2>${translatedField('contact.eyebrow', 'Eyebrow')}${translatedField('contact.title', 'Title', true)}${translatedField('contact.subtitle', 'Subtitle', true)}${arrayField('contact.options', 'Dropdown Options')}</div>
  <div class="admin-card"><h2>Footer</h2>${translatedField('footer.tagline', 'Footer Tagline', true)}${translatedField('footer.disclaimer', 'Disclaimer', true)}${translatedField('footer.copyright', 'Copyright')}</div>`;
}
function adminLeads() {
  return `<div class="admin-card"><div class="admin-item-head"><h2>Lead Inbox</h2><button class="btn btn-ghost" data-action="export-leads">Export CSV</button></div><div id="leads-table"><p class="admin-small">Loading leads...</p></div></div>`;
}
function adminMedia() {
  return `<div class="admin-card"><h2>Upload Media</h2><p class="admin-small">Upload images to Netlify Blobs. Copy the returned URL and paste it into any logo/image field or JSON section.</p><div id="upload-message"></div><div class="admin-field"><label>Image File</label><input type="file" id="media-file" accept="image/*" /></div><button class="btn btn-primary" data-action="upload-media">Upload Image</button></div>`;
}
function adminJson() {
  return `<div class="admin-card"><h2>Full JSON Control</h2><p class="admin-small">Advanced full-site control. You can edit every page, section, language, brand, service, and setting here. Validate before publishing.</p><div id="json-message"></div><textarea id="json-editor" class="code-editor">${escapeHtml(JSON.stringify(state.draft, null, 2))}</textarea><div class="admin-actions" style="margin-top:14px"><button class="btn btn-ghost" data-action="apply-json">Apply JSON to Draft</button><button class="btn btn-primary" data-action="publish">Publish Live</button></div></div>`;
}

async function loadLeads() {
  const box = $('#leads-table');
  if (!box) return;
  try {
    const res = await fetch(API.leads, { headers: byAuth() });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Unable to load leads');
    state.leads = payload.leads || [];
    box.innerHTML = state.leads.length ? `<div class="table-wrap"><table class="admin-table"><thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Company</th><th>Interest</th><th>Message</th></tr></thead><tbody>${state.leads.map(lead => `<tr><td>${escapeHtml(new Date(lead.createdAt).toLocaleString())}</td><td>${escapeHtml(lead.name)}</td><td>${escapeHtml(lead.email)}</td><td>${escapeHtml(lead.company)}</td><td>${escapeHtml(lead.interest)}</td><td>${escapeHtml(lead.message)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="admin-small">No leads yet.</p>';
  } catch (error) {
    box.innerHTML = `<div class="notice error">${escapeHtml(error.message)}</div>`;
  }
}

async function publishDraft() {
  try {
    const res = await fetch(API.publish, { method: 'POST', headers: byAuth({ 'Content-Type': 'application/json' }), body: JSON.stringify(state.draft) });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Publish failed');
    state.content = deepClone(state.draft);
    toast('Published live successfully.');
  } catch (error) {
    toast(error.message, true);
  }
}
function toast(message, error = false) {
  const old = $('.toast');
  if (old) old.remove();
  const div = document.createElement('div');
  div.className = `toast ${error ? 'error' : ''}`;
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3600);
}
function exportLeads() {
  const rows = [['createdAt', 'name', 'email', 'company', 'interest', 'message'], ...state.leads.map(l => [l.createdAt, l.name, l.email, l.company, l.interest, l.message])];
  const csv = rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `pt-solutions-leads-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleAdminInput(event) {
  const target = event.target;
  if (!target.matches('[data-path]')) return;
  const path = target.dataset.path;
  let value = target.value;
  if (target.dataset.array === 'lines') value = value.split('\n').map(x => x.trim()).filter(Boolean);
  if (target.dataset.lang) {
    const current = getPath(state.draft, path) || {};
    current[target.dataset.lang] = value;
    setPath(state.draft, path, current);
  } else {
    setPath(state.draft, path, value);
  }
}

function addService() {
  state.draft.services.push({ icon: 'NEW', title: { en: 'New Service', ar: 'خدمة جديدة' }, text: { en: 'Describe the service.', ar: 'اكتب وصف الخدمة.' }, items: ['Item'] });
  renderAdmin();
}
function addBrand() {
  state.draft.brands.push({ name: 'New Brand', category: 'Category', status: { en: 'In Development', ar: 'قيد التطوير' }, description: { en: 'Brand description.', ar: 'وصف العلامة.' }, cta: { en: 'Learn More', ar: 'اعرف أكثر' }, url: '#', tags: ['Brand'] });
  renderAdmin();
}
function addInsight() {
  state.draft.insights.items.push({ date: String(new Date().getFullYear()), category: 'Business', title: { en: 'New Insight', ar: 'رؤية جديدة' }, excerpt: { en: 'Insight excerpt.', ar: 'ملخص الرؤية.' } });
  renderAdmin();
}
async function uploadMedia() {
  const input = $('#media-file');
  const msg = $('#upload-message');
  if (!input?.files?.[0]) return toast('Choose an image first.', true);
  const file = input.files[0];
  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  msg.innerHTML = '<div class="notice">Uploading...</div>';
  try {
    const res = await fetch(API.upload, { method: 'POST', headers: byAuth({ 'Content-Type': 'application/json' }), body: JSON.stringify({ filename: file.name, data }) });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Upload failed');
    msg.innerHTML = `<div class="notice">Uploaded. Copy this URL:<br/><strong>${escapeHtml(payload.url)}</strong></div>`;
  } catch (error) {
    msg.innerHTML = `<div class="notice error">${escapeHtml(error.message)}</div>`;
  }
}

function render() {
  updateMeta();
  document.body.classList.toggle('rtl', state.lang === 'ar' && !isAdmin());
  document.body.classList.remove('admin-menu-open');
  if (isAdmin()) renderAdmin(); else renderPublic();
}

document.addEventListener('click', async (event) => {
  const route = event.target.closest('[data-route]');
  if (route) {
    event.preventDefault();
    navigate(route.dataset.route || route.getAttribute('href'));
    return;
  }
  const lang = event.target.closest('[data-lang]');
  if (lang) {
    state.lang = lang.dataset.lang;
    localStorage.setItem('pt-lang', state.lang);
    render();
    return;
  }
  if (event.target.closest('[data-menu]')) {
    document.body.classList.toggle('nav-open');
    return;
  }
  const tab = event.target.closest('[data-admin-tab]');
  if (tab) {
    state.adminTab = tab.dataset.adminTab;
    localStorage.setItem('pt-admin-tab', state.adminTab);
    renderAdmin();
    return;
  }
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  if (action === 'logout') { localStorage.removeItem('pt-admin-token'); state.token = ''; renderAdmin(); }
  if (action === 'toggle-admin-menu') document.body.classList.toggle('admin-menu-open');
  if (action === 'reset-draft') { state.draft = deepClone(state.content); renderAdmin(); toast('Draft reset.'); }
  if (action === 'publish') publishDraft();
  if (action === 'add-service') addService();
  if (action === 'remove-service') { state.draft.services.splice(Number(actionEl.dataset.index), 1); renderAdmin(); }
  if (action === 'add-brand') addBrand();
  if (action === 'remove-brand') { state.draft.brands.splice(Number(actionEl.dataset.index), 1); renderAdmin(); }
  if (action === 'add-insight') addInsight();
  if (action === 'remove-insight') { state.draft.insights.items.splice(Number(actionEl.dataset.index), 1); renderAdmin(); }
  if (action === 'apply-json') {
    try { state.draft = JSON.parse($('#json-editor').value); $('#json-message').innerHTML = '<div class="notice">JSON applied to draft.</div>'; }
    catch (error) { $('#json-message').innerHTML = `<div class="notice error">${escapeHtml(error.message)}</div>`; }
  }
  if (action === 'upload-media') uploadMedia();
  if (action === 'export-leads') exportLeads();
});

document.addEventListener('input', handleAdminInput);
window.addEventListener('popstate', () => { state.path = window.location.pathname; render(); });

(async function init() {
  await loadContent();
  render();
})();
