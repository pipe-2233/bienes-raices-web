/* Bienes Raíces Asociados — vitrina de proyectos, ventanas flotantes y animaciones */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA = '573106544931';
  var DATA = window.PROYECTOS || [];

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var money = function (n) { return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  var waLink = function (text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); };
  var norm = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  var byId = function (id) { for (var i = 0; i < DATA.length; i++) if (DATA[i].id === id) return DATA[i]; return null; };

  var ICON_PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.3-7-12a7 7 0 0 1 14 0c0 5.7-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';
  var ICON_WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.6-.1 1.2Z"/></svg>';

  /* ---------- Año ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* =========================================================
     1. VITRINA: filtros, orden y tarjetas
     ========================================================= */
  var state = { q: '', zonas: [], tipos: [], fin: false, precio: false, sort: 'relevancia' };
  var listing = $('#listing');

  var count = function (key, value) { return DATA.filter(function (p) { return p[key] === value; }).length; };
  var unique = function (key) {
    var seen = [];
    DATA.forEach(function (p) { if (seen.indexOf(p[key]) === -1) seen.push(p[key]); });
    return seen;
  };

  var buildOptions = function (container, key, list) {
    container.innerHTML = list.map(function (v) {
      return '<label class="opt"><input type="checkbox" value="' + esc(v) + '" data-key="' + key + '"> <span>' + esc(v) +
        '</span><em>' + count(key === 'zonas' ? 'zona' : 'tipo', v) + '</em></label>';
    }).join('');
  };
  buildOptions($('#fZona'), 'zonas', unique('zona'));
  buildOptions($('#fTipo'), 'tipos', unique('tipo'));

  var chips = $('#zoneChips');
  chips.innerHTML = '<button type="button" class="zchip is-on" data-zona="">Todos</button>' +
    unique('zona').map(function (z) { return '<button type="button" class="zchip" data-zona="' + esc(z) + '">' + esc(z) + '</button>'; }).join('');

  var filtered = function () {
    var q = norm(state.q.trim());
    var list = DATA.filter(function (p) {
      if (state.zonas.length && state.zonas.indexOf(p.zona) === -1) return false;
      if (state.tipos.length && state.tipos.indexOf(p.tipo) === -1) return false;
      if (state.fin && !p.fin) return false;
      if (state.precio && !p.precio) return false;
      if (q && norm([p.titulo, p.zona, p.sector, p.tipo].join(' ')).indexOf(q) === -1) return false;
      return true;
    });
    var noPrice = function (p) { return p.precio == null; };
    if (state.sort === 'precio-asc') list.sort(function (a, b) { return noPrice(a) - noPrice(b) || (a.precio || 0) - (b.precio || 0); });
    if (state.sort === 'precio-desc') list.sort(function (a, b) { return noPrice(a) - noPrice(b) || (b.precio || 0) - (a.precio || 0); });
    if (state.sort === 'area-desc') list.sort(function (a, b) { return b.areaNum - a.areaNum; });
    return list;
  };

  var cardHTML = function (p, i) {
    var price = p.precio
      ? '<p class="card__price"><small>' + (p.precioNota.indexOf('desde') === 0 ? 'Desde' : '&nbsp;') + '</small>' + money(p.precio) + '</p>'
      : '<p class="card__price card__price--ask"><small>&nbsp;</small>Consultar precio</p>';
    var fin = p.fin ? '<p class="card__fin">Financiación ' + esc(p.fin.toLowerCase().indexOf('financ') === 0 ? 'directa' : p.fin.toLowerCase()) + '</p>' : '';
    var more = p.imgs.length > 1 ? '<span class="card__more">' + p.imgs.length + ' fotos</span>' : '';
    return '<li style="--i:' + i + '"><a class="card" href="/proyectos/' + esc(p.id) + '" data-open="' + esc(p.id) + '" aria-label="Ver características de ' + esc(p.titulo) + '">' +
      '<span class="card__img"><img src="' + esc(p.imgs[0]) + '" alt="" loading="lazy" width="640" height="480">' +
      '<span class="card__tipo">' + esc(p.tipo) + '</span>' + more +
      '<span class="card__view">Ver características</span></span>' +
      '<span class="card__body">' + price +
      '<span class="card__area">' + esc(p.area) + '</span>' +
      '<span class="card__title">' + esc(p.titulo) + '</span>' +
      '<span class="card__place">' + ICON_PIN + esc(p.zona) + '</span>' + fin +
      '</span></a></li>';
  };

  var render = function () {
    var list = filtered();
    listing.classList.remove('is-in');
    listing.innerHTML = list.map(cardHTML).join('');
    $('#count').textContent = list.length + (list.length === 1 ? ' resultado' : ' resultados');
    var active = state.zonas.length + state.tipos.length + (state.fin ? 1 : 0) + (state.precio ? 1 : 0) + (state.q ? 1 : 0);
    var badge = $('#filterBadge');
    badge.hidden = !active;
    badge.textContent = active;
    // la cascada de entrada se repite cada vez que cambian los filtros
    requestAnimationFrame(function () { requestAnimationFrame(function () { listing.classList.add('is-in'); }); });
  };

  var syncInputs = function () {
    $$('.filters input[data-key]').forEach(function (input) {
      input.checked = state[input.getAttribute('data-key')].indexOf(input.value) !== -1;
    });
    $$('.zchip').forEach(function (b) {
      var z = b.getAttribute('data-zona');
      b.classList.toggle('is-on', z ? state.zonas.length === 1 && state.zonas[0] === z : state.zonas.length === 0);
    });
    $('#fFin').checked = state.fin;
    $('#fPrecio').checked = state.precio;
    $('#q').value = state.q;
  };

  $('.filters').addEventListener('change', function (e) {
    var t = e.target;
    var key = t.getAttribute('data-key');
    if (key) {
      var arr = state[key];
      var idx = arr.indexOf(t.value);
      if (t.checked && idx === -1) arr.push(t.value);
      if (!t.checked && idx !== -1) arr.splice(idx, 1);
    }
    if (t.id === 'fFin') state.fin = t.checked;
    if (t.id === 'fPrecio') state.precio = t.checked;
    syncInputs();
    render();
  });
  var searchTimer;
  $('#q').addEventListener('input', function (e) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { state.q = e.target.value; render(); }, 180);
  });
  $('#sort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('.zchip');
    if (!b) return;
    var z = b.getAttribute('data-zona');
    state.zonas = z ? [z] : [];
    syncInputs();
    render();
  });
  var clearAll = function () {
    state = { q: '', zonas: [], tipos: [], fin: false, precio: false, sort: state.sort };
    syncInputs();
    render();
  };
  $('#clearFilters').addEventListener('click', clearAll);

  // En celular los filtros arrancan cerrados
  var filtersBox = $('#filtersBox');
  var mqDesktop = window.matchMedia('(min-width: 961px)');
  var setFiltersOpen = function () { filtersBox.open = mqDesktop.matches; };
  setFiltersOpen();
  if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', setFiltersOpen);

  render();

  /* =========================================================
     2. VENTANAS FLOTANTES (detalle y agenda)
     ========================================================= */
  var openDialogs = [];

  var showSheet = function (dlg) {
    if (dlg.open) return;
    dlg.showModal();
    openDialogs.push(dlg);
    root.classList.add('modal-open');
    var scroller = $('.sheet__scroll', dlg);
    if (scroller) scroller.scrollTop = 0;
    requestAnimationFrame(function () { dlg.classList.add('is-open'); });
  };

  var hideSheet = function (dlg) {
    if (!dlg.open || dlg.classList.contains('is-closing')) return;
    dlg.classList.remove('is-open');
    dlg.classList.add('is-closing');
    var done = function () {
      dlg.classList.remove('is-closing');
      $('.sheet__panel', dlg).style.transform = '';
      dlg.close();
      openDialogs = openDialogs.filter(function (d) { return d !== dlg; });
      if (!openDialogs.length) root.classList.remove('modal-open');
    };
    if (reduceMotion) done(); else setTimeout(done, 380);
  };

  /* ---------- Detalle del proyecto ---------- */
  var detail = $('#detail');
  var detailBody = $('#detailBody');
  var pushedHash = false;

  var detailHTML = function (p) {
    var slides = p.imgs.map(function (src, i) {
      return '<div class="gal__slide"><img src="' + esc(src) + '" alt="' + esc(p.titulo) + ', foto ' + (i + 1) + '" ' + (i ? 'loading="lazy"' : '') + '></div>';
    }).join('');
    var multi = p.imgs.length > 1;
    var gallery = '<div class="gal' + (multi ? ' gal--multi' : '') + '">' +
      '<div class="gal__track" tabindex="0" aria-label="Fotos del proyecto">' + slides + '</div>' +
      (multi ? '<button class="gal__nav gal__nav--prev" type="button" aria-label="Foto anterior">‹</button>' +
        '<button class="gal__nav gal__nav--next" type="button" aria-label="Foto siguiente">›</button>' +
        '<div class="gal__dots">' + p.imgs.map(function (_, i) { return '<span' + (i ? '' : ' class="is-on"') + '></span>'; }).join('') + '</div>' +
        '<span class="gal__count"><b>1</b> / ' + p.imgs.length + '</span>' : '') +
      '</div>';

    var price = p.precio
      ? '<p class="d-price"><small>' + esc(p.precioNota) + '</small>' + money(p.precio) + '</p>'
      : '<p class="d-price d-price--ask">Consultar precio<small>' + esc(p.precioNota) + '</small></p>';

    var rows = p.detalle.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
    var fin = p.financiacion.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('');
    var dist = p.ubicacion.distancias.map(function (d) { return '<li><span>' + esc(d[0]) + '</span><b>' + esc(d[1]) + '</b></li>'; }).join('');
    var desc = p.descripcion.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');

    return '<div class="d">' +
      '<div class="d__media">' + gallery + '</div>' +
      '<div class="d__info">' +
        '<p class="d-kicker"><span class="d-status">Disponible</span>' + esc(p.tipo) + ' · ' + esc(p.zona) + '</p>' +
        '<h2 class="d-title" id="dTitle">' + esc(p.titulo) + '</h2>' +
        '<p class="d-place">' + ICON_PIN + esc(p.sector) + '</p>' +
        price +
        '<div class="d-quick"><div><span>Área</span><b>' + esc(p.area) + '</b></div><div><span>Financiación</span><b>' + esc(p.fin || 'Consultar') + '</b></div></div>' +

        '<section class="d-sec"><h3>Características</h3><dl class="d-specs">' + rows + '</dl></section>' +
        '<section class="d-sec"><h3>Modos de financiación</h3><ul class="d-fin">' + fin + '</ul></section>' +
        '<section class="d-sec"><h3>Ubicación</h3><p>' + esc(p.ubicacion.texto) + '</p><ul class="d-dist">' + dist + '</ul>' +
          '<a class="d-map" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.mapa) + '" target="_blank" rel="noopener">' + ICON_PIN + 'Ver zona en Google Maps</a></section>' +
        '<section class="d-sec"><h3>Descripción</h3>' + desc +
          '<a class="d-map" href="/proyectos/' + esc(p.id) + '">Ver la página de este proyecto →</a></section>' +
      '</div>' +
      '<div class="d__cta">' +
        '<a class="btn btn--sun" href="' + esc(waLink('Hola, me interesa ' + p.titulo + ' (' + p.zona + '). ¿Me envían precios y disponibilidad?')) + '" target="_blank" rel="noopener">' + ICON_WA + 'Me interesa</a>' +
        '<button class="btn btn--navy" type="button" data-agenda-for="' + esc(p.id) + '">Agendar visita</button>' +
      '</div>' +
    '</div>';
  };

  var wireGallery = function () {
    var gal = $('.gal--multi', detailBody);
    if (!gal) return;
    var track = $('.gal__track', gal);
    var dots = $$('.gal__dots span', gal);
    var counter = $('.gal__count b', gal);
    var current = function () { return Math.round(track.scrollLeft / track.clientWidth); };
    var go = function (i) {
      var n = dots.length;
      i = (i + n) % n;
      track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    $('.gal__nav--prev', gal).addEventListener('click', function () { go(current() - 1); });
    $('.gal__nav--next', gal).addEventListener('click', function () { go(current() + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); }
    });
    track.addEventListener('scroll', function () {
      var i = current();
      dots.forEach(function (d, n) { d.classList.toggle('is-on', n === i); });
      counter.textContent = i + 1;
    }, { passive: true });
  };

  var openDetail = function (id, push) {
    var p = byId(id);
    if (!p) return;
    detailBody.innerHTML = detailHTML(p);
    wireGallery();
    if (push) { history.pushState({ p: id }, '', '#p-' + id); pushedHash = true; }
    showSheet(detail);
  };

  var closeDetail = function () {
    if (pushedHash && history.state && history.state.p) { history.back(); return; } // popstate cierra
    hideSheet(detail);
    if (location.hash.indexOf('#p-') === 0) history.replaceState(null, '', location.pathname + location.search + '#proyectos');
  };

  listing.addEventListener('click', function (e) {
    var a = e.target.closest('[data-open]');
    if (!a) return;
    e.preventDefault();
    openDetail(a.getAttribute('data-open'), true);
  });

  window.addEventListener('popstate', function () {
    var m = location.hash.match(/^#p-(.+)$/);
    if (m) { openDetail(m[1], false); }
    else if (detail.open) { pushedHash = false; hideSheet(detail); }
  });

  // Enlace directo a un proyecto: .../#p-samanes
  var initial = location.hash.match(/^#p-(.+)$/);
  if (initial && byId(initial[1])) openDetail(initial[1], false);

  /* ---------- Agenda tu cita ---------- */
  var agenda = $('#agenda');
  var aProject = $('#aProject');
  aProject.innerHTML = '<option value="">Aún no sé, quiero asesoría</option>' +
    DATA.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.titulo) + ' · ' + esc(p.zona) + '</option>'; }).join('');
  var aDate = $('#aDate');
  aDate.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  var openAgenda = function (projectId) {
    aProject.value = projectId || '';
    $('#aError').hidden = true;
    showSheet(agenda);
    setTimeout(function () { $('#aName').focus({ preventScroll: true }); }, 60);
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-open-agenda]');
    if (a) { setMenu(false); openAgenda(''); return; }
    var b = e.target.closest('[data-agenda-for]');
    if (b) openAgenda(b.getAttribute('data-agenda-for'));
  });

  $('#agendaForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#aName').value.trim();
    if (!name) { $('#aError').hidden = false; $('#aName').focus(); return; }
    var p = byId(aProject.value);
    var when = '';
    if (aDate.value) {
      var parts = aDate.value.split('-');
      when = ' el ' + parts[2] + '/' + parts[1] + '/' + parts[0];
    }
    var msg = 'Hola, soy ' + name + '. Quiero agendar una cita' +
      (p ? ' para conocer ' + p.titulo + ' (' + p.zona + ')' : ' para recibir asesoría') +
      when + ' en la ' + $('#aTime').value.toLowerCase() + '.';
    var url = waLink(msg);
    var w = window.open(url, '_blank', 'noopener');
    if (!w) location.href = url;
    hideSheet(agenda);
  });

  /* ---------- Cerrar: botón, fondo, Esc y deslizar hacia abajo ---------- */
  [detail, agenda].forEach(function (dlg) {
    var close = function () { dlg === detail ? closeDetail() : hideSheet(dlg); };
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-close]')) close();
    });

    // Deslizar hacia abajo para cerrar (celular)
    var panel = $('.sheet__panel', dlg);
    var scroller = $('.sheet__scroll', dlg);
    var startY = null, dy = 0;
    panel.addEventListener('touchstart', function (e) {
      if (window.innerWidth > 720) return;
      if (scroller.scrollTop > 0 && !e.target.closest('.sheet__grab')) return;
      if (e.target.closest('.gal__track')) return;
      startY = e.touches[0].clientY; dy = 0;
    }, { passive: true });
    panel.addEventListener('touchmove', function (e) {
      if (startY === null) return;
      dy = Math.max(0, e.touches[0].clientY - startY);
      if (dy > 0) { panel.style.transition = 'none'; panel.style.transform = 'translateY(' + dy + 'px)'; }
    }, { passive: true });
    panel.addEventListener('touchend', function () {
      if (startY === null) return;
      panel.style.transition = '';
      if (dy > 110) close(); else panel.style.transform = '';
      startY = null;
    });
  });

  /* =========================================================
     3. HEADER, MENÚ Y SECCIÓN ACTIVA
     ========================================================= */
  var header = $('#top');
  var floatBtn = $('.wa-float');
  var onScroll = function () {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (floatBtn) floatBtn.classList.toggle('is-visible', y > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = $('#menuBtn');
  var nav = $('#nav');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });

  // Resalta en el menú la sección que se está viendo
  if ('IntersectionObserver' in window) {
    var links = $$('[data-spy]');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-spy') === en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = document.getElementById(l.getAttribute('data-spy')); if (s) spy.observe(s); });
  }

  /* =========================================================
     4. APARICIÓN AL HACER SCROLL
     ========================================================= */
  $$('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (el, n) { el.style.setProperty('--i', n); });
  });
  var targets = $$('[data-reveal], [data-stagger], [data-route]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* =========================================================
     5. COPIAR NÚMERO
     ========================================================= */
  var copyBtn = $('#copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var label = copyBtn.textContent;
      var done = function (text) {
        copyBtn.textContent = text;
        setTimeout(function () { copyBtn.textContent = label; }, 2000);
      };
      var select = function () {
        var range = document.createRange();
        range.selectNodeContents($('#num'));
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        done('Selecciona y copia');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('+57 310 654 4931').then(function () { done('Número copiado'); }, select);
      } else {
        select();
      }
    });
  }
})();
