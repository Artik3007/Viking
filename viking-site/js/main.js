/* Скрипты сайта лаборатории «ВИКИНГ»: меню, карусель услуг, круг «Почему мы», полоса документов, просмотр сканов, форма заявки */
(function () {
  'use strict';

  /* ---------- Меню в шапке ---------- */
  var menu = document.querySelector('[data-menu]');
  var openBtn = document.querySelector('[data-menu-open]');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  if (openBtn) openBtn.addEventListener('click', function () { setMenu(true); });
  document.querySelectorAll('[data-menu-close]').forEach(function (el) {
    el.addEventListener('click', function () { setMenu(false); });
  });

  /* ---------- Карусель услуг на главной ---------- */
  var car = document.querySelector('[data-carousel]');
  if (car) {
    var slides = Array.prototype.slice.call(car.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-dot]'));
    var W = 'min(765px, 84vw)';
    var cur = 0;
    function renderCarousel() {
      slides.forEach(function (el, k) {
        var off = k - cur, tf, op, z, ev;
        if (off === 0) { tf = 'translateX(0) scale(1)'; op = 1; z = 3; ev = 'auto'; }
        else if (Math.abs(off) === 1) {
          tf = 'translateX(calc(' + W + ' * ' + off + ' + ' + (24 * off) + 'px)) translateZ(-120px) rotateY(' + (off > 0 ? -10 : 10) + 'deg) scale(0.94)';
          op = 1; z = 2; ev = 'auto';
        } else {
          tf = 'translateX(calc(' + W + ' * ' + off + ' + ' + (24 * off) + 'px)) scale(0.9)';
          op = 0; z = 1; ev = 'none';
        }
        el.style.transform = tf;
        el.style.opacity = op;
        el.style.zIndex = z;
        el.style.pointerEvents = ev;
        el.style.cursor = off === 0 ? 'default' : 'pointer';
        el.style.transformOrigin = off === 0 ? '' : (off > 0 ? 'left' : 'right') + ' center';
        var link = el.querySelector('.car-link');
        if (link) { link.style.opacity = off === 0 ? 1 : 0; link.style.pointerEvents = off === 0 ? 'auto' : 'none'; }
      });
      dots.forEach(function (d, k) {
        var s = d.querySelector('span');
        s.style.width = k === cur ? '34px' : '7px';
        s.style.background = k === cur ? '#030303' : '#d3d9dc';
      });
    }
    slides.forEach(function (el, k) {
      el.addEventListener('click', function () { if (k !== cur) { cur = k; renderCarousel(); } });
    });
    dots.forEach(function (d, k) {
      d.addEventListener('click', function () { cur = k; renderCarousel(); });
    });
    renderCarousel();
  }

  /* ---------- Круг «Почему лаборатория ВИКИНГ?» ---------- */
  var ring = document.querySelector('[data-ring]');
  var ringData = document.getElementById('ring-data');
  if (ring && ringData) {
    var items = JSON.parse(ringData.textContent);
    var nodes = ring.querySelectorAll('[data-node]');
    var labels = ring.querySelectorAll('[data-label]');
    var arc = ring.querySelector('[data-ring-arc]');
    var tEl = ring.querySelector('[data-ring-title]');
    var xEl = ring.querySelector('[data-ring-text]');
    var circ = 2 * Math.PI * 323;
    function setRing(a) {
      nodes.forEach(function (n, k) {
        var on = k === a;
        n.style.borderColor = on ? '#1f8724' : '#c3c9cd';
        n.style.background = on ? '#1f8724' : '#ffffff';
        n.style.color = on ? '#ffffff' : '#6b7175';
      });
      labels.forEach(function (l, k) { l.style.color = k === a ? '#030303' : '#6b7175'; });
      if (arc) arc.setAttribute('stroke-dasharray', Math.max(0.001, (a / 6) * circ) + ' ' + circ * 2);
      if (tEl) tEl.textContent = items[a].title;
      if (xEl) xEl.textContent = items[a].text;
    }
    nodes.forEach(function (n, k) { n.addEventListener('click', function () { setRing(k); }); });
  }

  /* ---------- Полоса «Нормативные документы» ---------- */
  document.querySelectorAll('[data-docs-strip]').forEach(function (strip) {
    var track = strip.querySelector('[data-docs-track]');
    var prev = strip.querySelector('[data-docs-prev]');
    var next = strip.querySelector('[data-docs-next]');
    var max = parseInt(track.getAttribute('data-max'), 10) || 3;
    var i = 0;
    function render() {
      track.style.transform = 'translateX(calc(' + (-i) + ' * (min(372px, 84%) + 22px)))';
      prev.style.opacity = i === 0 ? 0.35 : 1;
      next.style.opacity = i === max ? 0.35 : 1;
    }
    prev.addEventListener('click', function () { i = Math.max(0, i - 1); render(); });
    next.addEventListener('click', function () { i = Math.min(max, i + 1); render(); });
  });

  /* ---------- Просмотр сканов на странице документов ---------- */
  var lb = document.querySelector('[data-lightbox]');
  var galData = document.getElementById('gallery-data');
  if (lb && galData) {
    var gallery = JSON.parse(galData.textContent);
    var img = lb.querySelector('[data-lb-img]');
    var title = lb.querySelector('[data-lb-title]');
    var count = lb.querySelector('[data-lb-count]');
    var o = 0;
    function show(k) {
      o = (k + gallery.length) % gallery.length;
      img.src = gallery[o].src;
      img.alt = gallery[o].title;
      title.textContent = gallery[o].title;
      count.textContent = (o + 1) + ' из ' + gallery.length;
      lb.hidden = false;
      document.documentElement.style.overflow = 'hidden';
    }
    function close() { lb.hidden = true; document.documentElement.style.overflow = ''; }
    document.querySelectorAll('[data-open]').forEach(function (b) {
      b.addEventListener('click', function () { show(parseInt(b.getAttribute('data-open'), 10)); });
    });
    lb.querySelectorAll('[data-lb-close]').forEach(function (b) { b.addEventListener('click', close); });
    lb.querySelector('[data-lb-prev]').addEventListener('click', function () { show(o - 1); });
    lb.querySelector('[data-lb-next]').addEventListener('click', function () { show(o + 1); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'ArrowLeft') show(o - 1);
      if (e.key === 'ArrowRight') show(o + 1);
    });
  }

  /* ---------- Клавиша Esc закрывает меню и просмотр ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    setMenu(false);
    if (lb && !lb.hidden) { lb.hidden = true; document.documentElement.style.overflow = ''; }
  });

  /* ---------- Форма заявки ----------
     Заявка отправляется на send.php (лежит в корне сайта, нужен хостинг с PHP).
     Если обработчик недоступен (например, сайт открыт как файл), посетителю
     предлагается отправить ту же заявку письмом на info@viking-lab.ru. */
  var MAIL = 'info@viking-lab.ru';
  document.querySelectorAll('[data-lead-form]').forEach(function (f) {
    var hp = document.createElement('input');
    hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off';
    hp.className = 'hp'; hp.setAttribute('aria-hidden', 'true');
    f.appendChild(hp);
    var msg = document.createElement('div');
    msg.className = 'form-msg'; msg.hidden = true; msg.setAttribute('role', 'status');
    f.appendChild(msg);
    var btn = f.querySelector('[type="submit"]');

    function say(ok, html) { msg.className = 'form-msg ' + (ok ? 'ok' : 'err'); msg.innerHTML = html; msg.hidden = false; }
    function mailtoLink() {
      var v = function (n) { var el = f.elements[n]; return el ? el.value.trim() : ''; };
      var body = 'Имя: ' + v('name') + '\nТелефон: ' + v('phone') + '\n\n' + v('message') + '\n\nСтраница: ' + location.href;
      return 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Заявка на исследование с сайта') + '&body=' + encodeURIComponent(body);
    }
    function fail() {
      say(false, 'Не удалось отправить заявку автоматически. <a href="' + mailtoLink() + '">Отправьте её письмом</a> на ' + MAIL + ' или позвоните: <a href="tel:+74954111723">+7&nbsp;(495)&nbsp;411-17-23</a>.');
    }

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (location.protocol === 'file:' || !window.fetch) { fail(); return; }
      if (btn) { btn.disabled = true; btn.style.opacity = 0.6; }
      var data = new FormData(f);
      data.append('page', document.title);
      fetch(f.getAttribute('action') || 'send.php', { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j && j.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok) { f.reset(); say(true, 'Спасибо! Заявка отправлена — мы свяжемся с вами в рабочее время.'); }
          else fail();
        })
        .catch(fail)
        .then(function () { if (btn) { btn.disabled = false; btn.style.opacity = ''; } });
    });
  });
})();
