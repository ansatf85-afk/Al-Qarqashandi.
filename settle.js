/* ===== تبويب التسويات (بجانب المندي) ===== */
(function () {
  var tabs = document.getElementById('tabs'), menu = document.querySelector('main.menu'),
    view = document.getElementById('settle-view'), search = document.querySelector('.search');
  if (!tabs || !menu || !view) return;
  var $ = function (id) { return document.getElementById(id) };
  var LS = 'qarqashandi-settle', list = [], on = false, btn = null, activeCls = 'is-active', prev = [];
  try { list = (JSON.parse(localStorage.getItem(LS) || '[]') || []).filter(function (x) { return x && x.id }) } catch (e) { list = [] }
  var save = function () { try { localStorage.setItem(LS, JSON.stringify(list)) } catch (e) { } };
  var hx = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] }) };
  var fm = function (n) { return String(Math.round((+n || 0) * 100) / 100) };
  var norm = function (t) { return (t || '').replace(/[ً-ْـ]/g, '').replace(/[ىئ]/g, 'ي').replace(/\s+/g, ' ').trim() };

  function applyActive() {
    if (!btn) return;
    Array.prototype.forEach.call(tabs.querySelectorAll('button, a'), function (el) {
      if (el === btn) return;
      if (el.className && /active|selected/.test(el.className)) {
        el.className.split(/\s+/).forEach(function (c) { if (/active|selected/.test(c)) { activeCls = c; el.classList.remove(c); if (prev.indexOf(el) < 0) prev.push(el) } });
      }
    });
    btn.classList.add(activeCls);
  }
  function setOn(v) {
    on = v;
    view.hidden = !v;
    menu.style.display = v ? 'none' : '';
    if (search) search.style.display = v ? 'none' : '';
    if (v) { applyActive(); drawList(); }
    else {
      if (btn) btn.classList.remove(activeCls);
      prev.forEach(function (el) { el.classList.add(activeCls) });
      prev = [];
    }
  }
  function ensureBtn() {
    if (btn && tabs.contains(btn)) return;
    var all = tabs.querySelectorAll('button, a'); if (!all.length) return;
    if (!btn) {
      btn = document.createElement('button'); btn.type = 'button'; btn.id = 'tab-settle'; btn.textContent = 'التسويات';
      btn.className = all[0].className.split(/\s+/).filter(function (c) { return c && !/active|selected/.test(c) }).join(' ');
      btn.addEventListener('click', function (e) { e.stopPropagation(); setOn(true); });
    }
    var mandi = null;
    Array.prototype.forEach.call(all, function (el) { if (!mandi && /مندي/.test(norm(el.textContent))) mandi = el });
    if (mandi) mandi.parentNode.insertBefore(btn, mandi.nextSibling); else all[all.length - 1].parentNode.appendChild(btn);
    if (on) applyActive();
  }
  tabs.addEventListener('click', function (e) { if (btn && !btn.contains(e.target) && on) setOn(false) }, true);
  var se = $('search'); if (se) se.addEventListener('input', function () { if (on) setOn(false) });
  new MutationObserver(ensureBtn).observe(tabs, { childList: true, subtree: true });
  ensureBtn();
  setTimeout(function () {
    if (btn && tabs.contains(btn)) return;
    if (!btn) {
      btn = document.createElement('button'); btn.type = 'button'; btn.id = 'tab-settle'; btn.textContent = 'التسويات';
      btn.addEventListener('click', function (e) { e.stopPropagation(); setOn(true); });
    }
    tabs.appendChild(btn);
  }, 800);

  function num(id) { var e = $(id); return e ? (parseFloat(e.value) || 0) : 0 }
  function calc() { var p = num('st-weight') * num('st-kilo'); var o = $('st-price'); if (o) o.textContent = fm(p); return p }
  function drawList() {
    var box = $('st-list'), tot = list.reduce(function (s, x) { return s + x.price }, 0);
    $('st-count').textContent = list.length + ' تسوية';
    box.innerHTML = list.length
      ? '<div class="st-list">' + list.map(function (x) {
        return '<div class="st-item"><div class="top"><div class="nm">' + hx(x.name) + '</div>' + (x.price > 0 ? '<div class="pr">' + fm(x.price) + ' جنيه</div>' : '') + '</div>' +
          '<div class="meta"><span>الصنف: ' + hx(x.type) + '</span><span>الكمية: ' + hx(x.qty) + '</span>' + (x.weight ? '<span>الوزن: ' + fm(x.weight) + '</span>' : '') + (x.kilo ? '<span>سعر الكيلو: ' + fm(x.kilo) + '</span>' : '') + '</div>' +
          (x.notes ? '<div class="note">' + hx(x.notes) + '</div>' : '') +
          '</div>';
      }).join('') + '</div>' + (tot > 0 ? '<div class="st-total"><span>إجمالي التسويات</span><span>' + fm(tot) + ' جنيه</span></div>' : '')
      : '<div class="st-empty">لا توجد تسويات مسجلة بعد</div>';
  }
  $('st-list').addEventListener('click', function (e) {
    var d = e.target.closest('.del'), c = e.target.closest('#st-clear');
    if (d) { list = list.filter(function (x) { return String(x.id) !== d.dataset.id }); save(); drawList() }
    else if (c && confirm('مسح كل التسويات؟')) { list = []; save(); drawList() }
  });
  /* إرسال التسوية على واتساب كأنها طلب عادي */
  function sendWhatsApp(x) {
    var num = (typeof WHATSAPP_NUMBER !== 'undefined') ? WHATSAPP_NUMBER : '201070071158';
    var lines = ['طلب جديد (تسوية) من منيو القرقشندي', '',
      'الاسم: ' + x.name, 'الصنف: ' + x.type, 'الكمية: ' + x.qty];
    if (x.weight) lines.push('الوزن: ' + fm(x.weight));
    if (x.kilo) lines.push('سعر الكيلو: ' + fm(x.kilo));
    if (x.price > 0) lines.push('السعر: ' + fm(x.price) + ' جنيه');
    if (x.notes) lines.push('ملاحظات: ' + x.notes);
    var url = 'https://wa.me/' + num + '?text=' + encodeURIComponent(lines.join('\n'));
    var w = window.open(url, '_blank');
    if (!w) window.location.href = url;
  }
  var f = $('st-form');
  f.addEventListener('input', calc);
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var w = num('st-weight'), k = num('st-kilo');
    var it = { id: Date.now(), name: $('st-name').value.trim(), type: $('st-type').value.trim(), qty: $('st-qty').value || '1', notes: $('st-notes').value.trim(), weight: w, kilo: k, price: w * k };
    list.unshift(it);
    save(); f.reset(); $('st-qty').value = 1; calc(); drawList();
    sendWhatsApp(it);
  });
  drawList();
})();
