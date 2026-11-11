// Página web de Bienes Raíces Asociados (servicio aparte del CRM, sin dependencias).
// - Toma los proyectos del CRM (sección "Página web") y guarda una copia por si el CRM no responde.
// - Arma en el servidor la página de inicio y una página por proyecto (/proyectos/<id>) para Google.
// - Sirve las fotos desde su propio dominio (/img/...) y las guarda en caché.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT || 3000);
const CRM = (process.env.CRM_URL || 'http://crm:3000').replace(/\/$/, '');
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');
const DATA = process.env.DATA_DIR || './data';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'site');
const IMG_DIR = path.join(DATA, 'img');
fs.mkdirSync(IMG_DIR, { recursive: true });

const WA = '573106544931';
const BRAND = 'Bienes Raíces Asociados';

// ---------- Datos de los proyectos ----------
const SAVED = path.join(DATA, 'proyectos.json');
let projects = [];
let fetchedAt = 0;
let refreshing = null;

function fromBundle() {
  // Respaldo final: los datos que venían escritos en la página (js/projects.js).
  try {
    const ctx = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/projects.js'), 'utf8'), ctx);
    return (ctx.window.PROYECTOS || []).map((p) => ({ ...p, imgs: p.imgs.map((s) => '/' + s.replace(/^\//, '')) }));
  } catch { return []; }
}
try { projects = JSON.parse(fs.readFileSync(SAVED, 'utf8')); } catch { projects = fromBundle(); }

const localImg = (src) => {
  const m = /\/web\/img\/([a-z0-9-]+\.(?:jpg|png|webp))$/.exec(String(src || ''));
  return m ? `/img/${m[1]}` : src;
};
async function refresh() {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const res = await fetch(`${CRM}/api/public/proyectos`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error('CRM ' + res.status);
      const list = await res.json();
      if (!Array.isArray(list)) throw new Error('respuesta inválida');
      const next = list.map((p) => ({ ...p, imgs: (p.imgs || []).map(localImg) }));
      fetchedAt = Date.now();
      if (JSON.stringify(next) !== JSON.stringify(projects)) {
        projects = next;
        fs.writeFile(SAVED, JSON.stringify(projects), () => {});
      }
    } catch (e) {
      fetchedAt = Date.now() - 50000; // reintenta pronto
      console.error('[web] no se pudieron leer los proyectos del CRM:', e.message);
    } finally { refreshing = null; }
  })();
  return refreshing;
}
// Antes de armar una página: si los datos tienen más de 10 s, se piden de nuevo (máx. 2,5 s de espera).
async function fresh() {
  if (Date.now() - fetchedAt > 10000) await Promise.race([refresh(), new Promise((r) => setTimeout(r, 2500))]);
  return projects;
}
refresh();
setInterval(refresh, 60000);

// ---------- Utilidades HTML ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = (n) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const cut = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '').replace(/[\s.,;:·(]+$/, '') + '…' : s; };
const baseOf = (req) => SITE_URL || `https://${req.headers['x-forwarded-host'] || req.headers.host}`;
const abs = (base, u) => (/^https?:/.test(u) ? u : base + (u.startsWith('/') ? u : '/' + u));
const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
const ICON_PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.3-7-12a7 7 0 0 1 14 0c0 5.7-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';
const ICON_WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.6-.1 1.2Z"/></svg>';

function cardHTML(p, i) {
  const price = p.precio
    ? `<p class="card__price"><small>${String(p.precioNota || '').indexOf('desde') === 0 ? 'Desde' : '&nbsp;'}</small>${money(p.precio)}</p>`
    : '<p class="card__price card__price--ask"><small>&nbsp;</small>Consultar precio</p>';
  const fin = p.fin ? `<p class="card__fin">Financiación ${esc(p.fin.toLowerCase().indexOf('financ') === 0 ? 'directa' : p.fin.toLowerCase())}</p>` : '';
  const more = p.imgs.length > 1 ? `<span class="card__more">${p.imgs.length} fotos</span>` : '';
  return `<li style="--i:${i}"><a class="card" href="/proyectos/${esc(p.id)}" data-open="${esc(p.id)}" aria-label="Ver características de ${esc(p.titulo)}">` +
    `<span class="card__img">${p.imgs[0] ? `<img src="${esc(p.imgs[0])}" alt="${esc(p.titulo)}" loading="lazy" width="640" height="480">` : ''}` +
    `<span class="card__tipo">${esc(p.tipo)}</span>${more}<span class="card__view">Ver características</span></span>` +
    `<span class="card__body">${price}<span class="card__area">${esc(p.area)}</span><span class="card__title">${esc(p.titulo)}</span>` +
    `<span class="card__place">${ICON_PIN}${esc(p.zona)}</span>${fin}</span></a></li>`;
}

const describe = (p) => cut([
  `${p.titulo} en ${p.zona}${p.sector ? ` (${p.sector})` : ''}.`,
  p.area && p.area !== 'Consultar' ? `Área: ${p.area}.` : '',
  p.precio ? `${p.precioNota && p.precioNota.indexOf('desde') === 0 ? 'Desde' : 'Precio'} ${money(p.precio)}.` : 'Consulta el precio.',
  p.fin ? `Financiación ${p.fin.toLowerCase()}.` : '',
  (p.descripcion || [])[0] || '',
].filter(Boolean).join(' '), 160);

const agentLD = (base) => ({
  '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: BRAND, url: base + '/',
  logo: base + '/assets/logo/logo.png', image: base + '/assets/img/og-image.jpg', telephone: '+57 310 654 4931',
  address: { '@type': 'PostalAddress', addressLocality: 'Tuluá', addressRegion: 'Valle del Cauca', addressCountry: 'CO' },
  areaServed: ['Tuluá', 'Bugalagrande', 'Andalucía', 'La Tulia', 'Sevilla', 'Valle del Cauca'],
  sameAs: ['https://www.instagram.com/bienesraicessociedad/'],
});
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const footLinks = (list) => `<nav class="wrap footer__links" aria-label="Proyectos"><b>Proyectos</b>${list.map((p) => `<a href="/proyectos/${esc(p.id)}">${esc(p.titulo)} · ${esc(p.zona)}</a>`).join('')}</nav>`;

// ---------- Inicio ----------
const indexTpl = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
function renderHome(list, base) {
  const head = [
    `<link rel="canonical" href="${base}/">`,
    `<meta property="og:url" content="${base}/">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    ld(agentLD(base)),
    ld({ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Proyectos activos', itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${base}/proyectos/${p.id}`, name: p.titulo })) }),
  ].join('\n  ');
  return indexTpl
    .replace('<!--HEAD-->', head)
    .replace('content="/assets/img/og-image.jpg"', `content="${base}/assets/img/og-image.jpg"`)
    .replace('<!--COUNT-->', `${list.length} ${list.length === 1 ? 'resultado' : 'resultados'}`)
    .replace('<!--CARDS-->', list.map(cardHTML).join(''))
    .replace('<!--FOOTLINKS-->', footLinks(list))
    .replace('<!--DATA-->', `<script>window.PROYECTOS=${JSON.stringify(list).replace(/</g, '\\u003c')};</script>`);
}

// ---------- Página de cada proyecto ----------
const HEADER = `<header class="top is-scrolled" id="top"><div class="wrap top__inner">
  <a class="brand" href="/" aria-label="${BRAND}, inicio"><span class="brand__badge"><img src="/assets/logo/logo-mark.png" alt="" width="120" height="61"></span>
  <span class="brand__text"><b>${BRAND}</b><small>Confianza en la inversión inmobiliaria</small></span></a>
  <nav class="nav pp-nav" aria-label="Secciones"><a href="/#proyectos">Proyectos</a><a href="/#ubicacion">Ubicación</a><a href="/#contacto">Contacto</a></nav>
</div></header>`;
const FOOTER = (list) => `<footer class="footer">${footLinks(list)}<div class="wrap footer__inner"><span>© ${new Date().getFullYear()} ${BRAND} · Tuluá, Valle del Cauca</span><a href="#top">Volver arriba ↑</a></div></footer>
<a class="wa-float" href="${esc(waLink('Hola, quiero información de los lotes'))}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">${ICON_WA}</a>`;
const HEAD_COMMON = `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#0A2E50">
  <link rel="icon" type="image/png" href="/assets/logo/favicon.png"><link rel="apple-touch-icon" href="/assets/logo/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&family=Figtree:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="/css/styles.css?v=4"><link rel="stylesheet" href="/css/proyecto.css?v=1">`;

function renderProject(p, list, base) {
  const url = `${base}/proyectos/${p.id}`;
  const title = cut(`${p.titulo} · ${p.tipo} en ${p.zona} | ${BRAND}`, 90);
  const desc = describe(p);
  const imgs = p.imgs.map((s) => abs(base, s));
  const multi = p.imgs.length > 1;
  const gallery = `<div class="gal${multi ? ' gal--multi' : ''}"><div class="gal__track" tabindex="0" aria-label="Fotos del proyecto">` +
    p.imgs.map((src, i) => `<div class="gal__slide"><img src="${esc(src)}" alt="${esc(p.titulo)}, foto ${i + 1}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} width="1200" height="1200"></div>`).join('') + '</div>' +
    (multi ? `<button class="gal__nav gal__nav--prev" type="button" aria-label="Foto anterior">‹</button><button class="gal__nav gal__nav--next" type="button" aria-label="Foto siguiente">›</button>
      <div class="gal__dots">${p.imgs.map((_, i) => `<span${i ? '' : ' class="is-on"'}></span>`).join('')}</div><span class="gal__count"><b>1</b> / ${p.imgs.length}</span>` : '') + '</div>';
  const price = p.precio ? `<p class="d-price"><small>${esc(p.precioNota)}</small>${money(p.precio)}</p>` : `<p class="d-price d-price--ask">Consultar precio<small>${esc(p.precioNota)}</small></p>`;
  const sec = (h, body) => (body ? `<section class="d-sec"><h2>${h}</h2>${body}</section>` : '');
  const rows = (p.detalle || []).map((r) => `<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('');
  const fin = (p.financiacion || []).map((f) => `<li>${esc(f)}</li>`).join('');
  const dist = (p.ubicacion?.distancias || []).map((d) => `<li><span>${esc(d[0])}</span><b>${esc(d[1])}</b></li>`).join('');
  const descr = (p.descripcion || []).map((t) => `<p>${esc(t)}</p>`).join('');
  const others = list.filter((x) => x.id !== p.id);
  const wa = waLink(`Hola, me interesa ${p.titulo} (${p.zona}). ¿Me envían precios y disponibilidad?`);
  const visit = waLink(`Hola, quiero agendar una visita a ${p.titulo} (${p.zona}).`);
  const listing = {
    '@context': 'https://schema.org', '@type': 'RealEstateListing', name: p.titulo, description: desc, url, image: imgs,
    ...(p.precio ? { offers: { '@type': 'Offer', price: p.precio, priceCurrency: 'COP', availability: 'https://schema.org/InStock', url } } : {}),
    contentLocation: { '@type': 'Place', name: p.sector || p.zona, address: { '@type': 'PostalAddress', addressLocality: p.zona, addressRegion: 'Valle del Cauca', addressCountry: 'CO' } },
    provider: { '@type': 'RealEstateAgent', name: BRAND, telephone: '+57 310 654 4931', url: base + '/' },
  };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: base + '/' },
    { '@type': 'ListItem', position: 2, name: 'Proyectos', item: base + '/#proyectos' },
    { '@type': 'ListItem', position: 3, name: p.titulo, item: url }] };

  return `<!doctype html>
<html lang="es">
<head>
  ${HEAD_COMMON}
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${esc(url)}">
  <meta property="og:type" content="website"><meta property="og:locale" content="es_CO"><meta property="og:site_name" content="${BRAND}">
  <meta property="og:title" content="${esc(p.titulo + ' · ' + p.zona)}"><meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${esc(url)}">${imgs[0] ? `<meta property="og:image" content="${esc(imgs[0])}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  ${ld(listing)}
  ${ld(crumbs)}
</head>
<body class="pp-body">
  ${HEADER}
  <main class="wrap pp">
    <nav class="pp-crumbs" aria-label="Ruta"><a href="/">Inicio</a><span aria-hidden="true">›</span><a href="/#proyectos">Proyectos</a><span aria-hidden="true">›</span><span>${esc(p.titulo)}</span></nav>
    <article class="pp-card"><div class="d">
      <div class="d__media">${gallery}</div>
      <div class="d__info">
        <p class="d-kicker"><span class="d-status">Disponible</span>${esc(p.tipo)} · ${esc(p.zona)}</p>
        <h1 class="d-title">${esc(p.titulo)}</h1>
        ${p.sector ? `<p class="d-place">${ICON_PIN}${esc(p.sector)}</p>` : ''}
        ${price}
        <div class="d-quick"><div><span>Área</span><b>${esc(p.area || 'Consultar')}</b></div><div><span>Financiación</span><b>${esc(p.fin || 'Consultar')}</b></div></div>
        ${(p.etiquetas || []).length ? `<ul class="pp-tags">${p.etiquetas.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
        ${sec('Características', rows && `<dl class="d-specs">${rows}</dl>`)}
        ${sec('Modos de financiación', fin && `<ul class="d-fin">${fin}</ul>`)}
        ${sec('Ubicación', `${p.ubicacion?.texto ? `<p>${esc(p.ubicacion.texto)}</p>` : ''}${dist ? `<ul class="d-dist">${dist}</ul>` : ''}<a class="d-map" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.mapa || p.zona)}" target="_blank" rel="noopener">${ICON_PIN}Ver zona en Google Maps</a>`)}
        ${sec('Descripción', descr)}
      </div>
      <div class="d__cta">
        <a class="btn btn--sun" href="${esc(wa)}" target="_blank" rel="noopener">${ICON_WA}Me interesa</a>
        <a class="btn btn--navy" href="${esc(visit)}" target="_blank" rel="noopener">Agendar visita</a>
      </div>
    </div></article>
    ${others.length ? `<section class="pp-more" aria-labelledby="more-title"><h2 id="more-title">Otros proyectos</h2><ul class="listing">${others.map(cardHTML).join('')}</ul></section>` : ''}
  </main>
  ${FOOTER(list)}
  <script>
  (function(){var g=document.querySelector('.gal--multi');if(!g)return;var t=g.querySelector('.gal__track'),d=g.querySelectorAll('.gal__dots span'),c=g.querySelector('.gal__count b');
  var cur=function(){return Math.round(t.scrollLeft/t.clientWidth)};var go=function(i){var n=d.length;i=(i+n)%n;t.scrollTo({left:i*t.clientWidth,behavior:'smooth'})};
  g.querySelector('.gal__nav--prev').onclick=function(){go(cur()-1)};g.querySelector('.gal__nav--next').onclick=function(){go(cur()+1)};
  t.addEventListener('scroll',function(){var i=cur();d.forEach(function(x,n){x.classList.toggle('is-on',n===i)});c.textContent=i+1},{passive:true});})();
  </script>
</body>
</html>`;
}

function sitemap(list, base) {
  const day = new Date().toISOString().slice(0, 10);
  const urls = [`${base}/`, ...list.map((p) => `${base}/proyectos/${p.id}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u, i) => `  <url><loc>${esc(u)}</loc><lastmod>${day}</lastmod><priority>${i ? '0.8' : '1.0'}</priority></url>`).join('\n')}\n</urlset>\n`;
}

// ---------- Fotos (desde el CRM, guardadas en caché) ----------
const IMG_TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
async function serveImg(res, file) {
  if (!/^[a-z0-9-]{1,60}\.(jpg|png|webp)$/.test(file)) return notFound(res);
  const full = path.join(IMG_DIR, file);
  if (!fs.existsSync(full)) {
    try {
      const r = await fetch(`${CRM}/web/img/${file}`, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) return notFound(res);
      fs.writeFileSync(full, Buffer.from(await r.arrayBuffer()));
    } catch { return notFound(res); }
  }
  res.writeHead(200, { 'Content-Type': IMG_TYPES[file.split('.').pop()], 'Content-Length': fs.statSync(full).size, 'Cache-Control': 'public, max-age=31536000, immutable' });
  fs.createReadStream(full).pipe(res);
}

// ---------- Respuestas ----------
const SEC = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' };
function send(req, res, status, body, type, cache = 'public, max-age=0, must-revalidate') {
  const headers = { 'Content-Type': type, 'Cache-Control': cache, Vary: 'Accept-Encoding', ...SEC };
  let buf = Buffer.from(body);
  if (/\bgzip\b/.test(req.headers['accept-encoding'] || '') && buf.length > 1024) { buf = zlib.gzipSync(buf); headers['Content-Encoding'] = 'gzip'; }
  headers['Content-Length'] = buf.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : buf);
}
const notFound404 = fs.readFileSync(path.join(ROOT, '404.html'));
function notFound(res) { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', ...SEC }); res.end(notFound404); }

const STATIC = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp' };
function serveStatic(req, res, pathname) {
  const file = path.normalize(path.join(ROOT, decodeURIComponent(pathname)));
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return notFound(res);
  const ext = path.extname(file);
  if (!STATIC[ext]) return notFound(res);
  const cache = pathname.startsWith('/assets/') ? 'public, max-age=86400' : 'public, max-age=0, must-revalidate';
  if (ext === '.css' || ext === '.js') return send(req, res, 200, fs.readFileSync(file), STATIC[ext], cache);
  res.writeHead(200, { 'Content-Type': STATIC[ext], 'Content-Length': fs.statSync(file).size, 'Cache-Control': cache, ...SEC });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

http.createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    const url = new URL(req.url, 'http://x');
    let p = url.pathname;
    const base = baseOf(req);
    if (p === '/' || p === '/index.html') return send(req, res, 200, renderHome(await fresh(), base), 'text/html; charset=utf-8');
    if (p === '/robots.txt') return send(req, res, 200, `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`, 'text/plain; charset=utf-8');
    if (p === '/sitemap.xml') return send(req, res, 200, sitemap(await fresh(), base), 'application/xml; charset=utf-8');
    if (p === '/salud') return send(req, res, 200, JSON.stringify({ ok: true, proyectos: projects.length, actualizado: fetchedAt ? new Date(fetchedAt).toISOString() : null }), 'application/json');
    if (p.startsWith('/img/')) return serveImg(res, p.slice(5));
    const m = /^\/proyectos\/([a-z0-9-]+)\/?$/.exec(p);
    if (m) {
      const list = await fresh();
      const proj = list.find((x) => x.id === m[1]);
      if (!proj) return notFound(res);
      if (p.endsWith('/')) { res.writeHead(301, { Location: `/proyectos/${proj.id}` }); return res.end(); }
      return send(req, res, 200, renderProject(proj, list, base), 'text/html; charset=utf-8');
    }
    if (p === '/proyectos' || p === '/proyectos/') { res.writeHead(301, { Location: '/#proyectos' }); return res.end(); }
    return serveStatic(req, res, p);
  } catch (e) {
    console.error('[web]', req.url, e);
    if (!res.headersSent) { res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Error interno'); }
  }
}).listen(PORT, () => console.log(`[web] escuchando en :${PORT} · proyectos: ${projects.length}`));
