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
    var drag = 0;        // смещение пальцем/мышью во время свайпа, px
    var dragging = false;
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
        el.style.transition = dragging ? 'none' : 'transform .6s cubic-bezier(.22,.8,.3,1),opacity .6s';
        el.style.transform = (drag ? 'translateX(' + drag + 'px) ' : '') + tf;
        el.style.opacity = op;
        el.style.zIndex = z;
        el.style.pointerEvents = ev;
        el.style.cursor = off === 0 ? 'grab' : 'pointer';
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
    function go(k) { cur = Math.max(0, Math.min(slides.length - 1, k)); renderCarousel(); }

    var moved = false;   // был ли свайп — тогда клик после него не срабатывает
    slides.forEach(function (el, k) {
      el.addEventListener('click', function () { if (!moved && k !== cur) go(k); });
    });
    dots.forEach(function (d, k) {
      d.addEventListener('click', function () { go(k); });
    });

    /* Свайп пальцем и перетаскивание мышью */
    car.style.touchAction = 'pan-y';
    car.style.userSelect = 'none';
    car.querySelectorAll('img').forEach(function (im) { im.draggable = false; });
    var sx = 0, sy = 0, pid = null, horiz = null;
    car.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pid = e.pointerId; sx = e.clientX; sy = e.clientY; horiz = null; moved = false;
    });
    car.addEventListener('pointermove', function (e) {
      if (e.pointerId !== pid) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (horiz === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        horiz = Math.abs(dx) > Math.abs(dy);
        if (!horiz) { pid = null; return; }   // вертикальный жест — это прокрутка страницы
        dragging = true;
        try { car.setPointerCapture(pid); } catch (err) {}
      }
      moved = true;
      // у крайних слайдов тянется с сопротивлением
      var edge = (cur === 0 && dx > 0) || (cur === slides.length - 1 && dx < 0);
      drag = edge ? dx / 3 : dx;
      renderCarousel();
    });
    function endDrag(e) {
      if (e.pointerId !== pid) return;
      pid = null;
      if (!dragging) return;
      dragging = false;
      var limit = Math.min(120, car.clientWidth * 0.15);
      var dir = drag < -limit ? 1 : drag > limit ? -1 : 0;
      drag = 0;
      go(cur + dir);
      setTimeout(function () { moved = false; }, 0);
    }
    car.addEventListener('pointerup', endDrag);
    car.addEventListener('pointercancel', endDrag);
    // клик по ссылке «Подробнее» после свайпа не должен открывать страницу
    car.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

    /* Свайп двумя пальцами по тачпаду (горизонтальная прокрутка) */
    var acc = 0, lock = false, accTimer;
    car.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (lock) return;
      acc += e.deltaX;
      clearTimeout(accTimer);
      accTimer = setTimeout(function () { acc = 0; }, 200);
      if (Math.abs(acc) > 50) {
        go(cur + (acc > 0 ? 1 : -1));
        acc = 0; lock = true;
        setTimeout(function () { lock = false; }, 650);
      }
    }, { passive: false });

    /* Стрелки клавиатуры, когда карусель в фокусе */
    car.tabIndex = 0;
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(cur + 1);
      if (e.key === 'ArrowLeft') go(cur - 1);
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

  /* ---------- Автопарк: лента фото и просмотр ---------- */
  document.querySelectorAll('[data-fleet]').forEach(function (box) {
    var track = box.querySelector('[data-fleet-track]');
    var prev = box.querySelector('[data-fleet-prev]');
    var next = box.querySelector('[data-fleet-next]');
    var items = Array.prototype.slice.call(track.querySelectorAll('[data-fleet-open]'));
    function step() { return items[0] ? items[0].getBoundingClientRect().width + 12 : 240; }
    function upd() {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();

    var view = document.createElement('div');
    view.className = 'lb'; view.hidden = true;
    view.setAttribute('role', 'dialog'); view.setAttribute('aria-label', 'Фото автомобиля');
    view.innerHTML = '<button type="button" class="lb-bg" data-x aria-label="Закрыть"></button>' +
      '<figure class="lb-fig"><img alt=""><figcaption><span data-t></span><span class="lb-n" data-n></span></figcaption></figure>' +
      '<button type="button" class="lb-btn lb-prev" data-p aria-label="Предыдущее фото"><svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#030303" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 3L5 9l6 6"></path></svg></button>' +
      '<button type="button" class="lb-btn lb-next" data-nx aria-label="Следующее фото"><svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#030303" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3l6 6-6 6"></path></svg></button>' +
      '<button type="button" class="lb-btn lb-close" data-x aria-label="Закрыть"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#030303" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14"></path></svg></button>';
    document.body.appendChild(view);
    var vImg = view.querySelector('img'), vT = view.querySelector('[data-t]'), vN = view.querySelector('[data-n]');
    var cur = 0;
    function show(k) {
      cur = (k + items.length) % items.length;
      var im = items[cur].querySelector('img');
      vImg.src = im.src; vImg.alt = im.alt;
      vT.textContent = im.alt; vN.textContent = (cur + 1) + ' из ' + items.length;
      view.hidden = false; document.documentElement.style.overflow = 'hidden';
    }
    function close() { view.hidden = true; document.documentElement.style.overflow = ''; }
    items.forEach(function (b, k) { b.addEventListener('click', function () { show(k); }); });
    view.querySelectorAll('[data-x]').forEach(function (b) { b.addEventListener('click', close); });
    view.querySelector('[data-p]').addEventListener('click', function () { show(cur - 1); });
    view.querySelector('[data-nx]').addEventListener('click', function () { show(cur + 1); });
    document.addEventListener('keydown', function (e) {
      if (view.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  });

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
