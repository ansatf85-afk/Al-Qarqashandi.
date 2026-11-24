/* ===== قسم جديد (تبويب إضافي) — التنسيق في extra.css ===== */
(function () {
  var NAME = 'قسم جديد'; // غيّر اسم القسم من هنا
  var tabs = document.getElementById('tabs'), menu = document.querySelector('main.menu'),
    search = document.querySelector('.search'), settle = document.getElementById('settle-view');
  if (!tabs || !menu) return;

  /* القسم نفسه */
  var view = document.createElement('section'); view.className = 'x-view'; view.id = 'x-view'; view.hidden = true;
  view.innerHTML =
    '<h2 class="x-title"><span>' + NAME + '</span><span class="x-count" id="x-count"></span></h2>' +
    '<div class="x-grid">' +
    '<div class="x-box"><h3>إضافة</h3><form class="x-form" id="x-form" autocomplete="off">' +
    '<div class="full"><label for="x-name">الاسم</label><input class="field" id="x-name" required placeholder="اسم العميل أو العملية"></div>' +
    '<div><label for="x-type">الصنف</label><input class="field" id="x-type" required placeholder="نوع المنتج أو الأكل"></div>' +
    '<div><label for="x-qty">الكمية</label><input class="field" id="x-qty" type="number" min="0" step="any" value="1" inputmode="decimal"></div>' +
    '<div class="full"><label for="x-weight">الوزن</label><input class="field" id="x-weight" type="number" min="0" step="any" inputmode="decimal" placeholder="0"></div>' +
    '<div class="full"><label for="x-notes">الملاحظات</label><textarea class="field" id="x-notes" rows="2" placeholder="أي تفاصيل إضافية..."></textarea></div>' +
    '<div class="full"><button class="x-btn" type="submit">إضافة</button></div>' +
    '</form></div>' +
    '<div class="x-box"><h3>السجل</h3><div id="x-list"></div></div></div>';
  (settle || menu).parentNode.insertBefore(view, (settle || menu).nextSibling);

  var $ = function (id) { return document.getElementById(id) };
  var LS = 'qarqashandi-extra', list = [], on = false, btn = null, activeCls = 'is-active', prev = [];
  try { list = (JSON.parse(localStorage.getItem(LS) || '[]') || []).filter(function (x) { return x && x.id }) } catch (e) { list = [] }
  var save = function () { try { localStorage.setItem(LS, JSON.stringify(list)) } catch (e) { } };
  var hx = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] }) };
  var fm = function (n) { return String(Math.round((+n || 0) * 100) / 100) };

  function setOn(v) {
    if (on === v) return;
    on = v;
    view.hidden = !v;
    menu.style.display = v ? 'none' : '';
    if (search) search.style.display = v ? 'none' : '';
    if (v) {
      Array.prototype.forEach.call(tabs.querySelectorAll('button'), function (el) {
        if (el !== btn && el.classList.contains(activeCls)) { el.classList.remove(activeCls); prev.push(el) }
      });
      btn.classList.add(activeCls);
      draw();
    } else {
      btn.classList.remove(activeCls);
      prev.forEach(function (el) { el.classList.add(activeCls) });
      prev = [];
    }
  }
  function ensureBtn() {
    if (btn && tabs.contains(btn)) return;
    var all = tabs.querySelectorAll('button'); if (!all.length) return;
    if (!btn) {
      btn = document.createElement('button'); btn.type = 'button'; btn.id = 'tab-extra'; btn.textContent = NAME;
      btn.className = 'tab';
      btn.addEventListener('click', function (e) { e.stopPropagation(); setOn(true) });
    }
    tabs.appendChild(btn);
    if (on) btn.classList.add(activeCls);
  }
  tabs.addEventListener('click', function (e) { if (btn && !btn.contains(e.target) && on) setOn(false) }, true);
  var se = $('search'); if (se) se.addEventListener('input', function () { if (on) setOn(false) });
  new MutationObserver(ensureBtn).observe(tabs, { childList: true });
  ensureBtn();

  function draw() {
    $('x-count').textContent = list.length + ' عنصر';
    $('x-list').innerHTML = list.length
      ? '<div class="x-list">' + list.map(function (x) {
        return '<div class="x-item"><div class="nm">' + hx(x.name) + '</div>' +
          '<div class="meta"><span>الصنف: ' + hx(x.type) + '</span><span>الكمية: ' + hx(x.qty) + '</span>' +
          (x.weight ? '<span>الوزن: ' + fm(x.weight) + '</span>' : '') + '</div>' +
          (x.notes ? '<div class="note">' + hx(x.notes) + '</div>' : '') +
          '<button class="x-del" type="button" data-id="' + x.id + '">حذف</button></div>';
      }).join('') + '</div><button class="x-clear" type="button" id="x-clear">مسح الكل</button>'
      : '<div class="x-empty">لا يوجد شيء مسجل بعد</div>';
  }
  $('x-list').addEventListener('click', function (e) {
    var d = e.target.closest('.x-del'), c = e.target.closest('#x-clear');
    if (d) { list = list.filter(function (x) { return String(x.id) !== d.dataset.id }); save(); draw() }
    else if (c && confirm('مسح الكل؟')) { list = []; save(); draw() }
  });
  var f = $('x-form');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    list.unshift({ id: Date.now(), name: $('x-name').value.trim(), type: $('x-type').value.trim(), qty: $('x-qty').value || '1', weight: parseFloat($('x-weight').value) || 0, notes: $('x-notes').value.trim() });
    save(); f.reset(); $('x-qty').value = 1; draw();
  });
  draw();
})();
