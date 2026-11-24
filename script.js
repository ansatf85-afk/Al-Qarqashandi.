(function () {
  var KEY = "qarqashandi_settlements";
  var tabs = document.getElementById("tabs");
  var menu = document.querySelector("main.menu");
  var view = document.getElementById("settle-view");
  var form = document.getElementById("st-form");
  var list = document.getElementById("st-list");
  var count = document.getElementById("st-count");
  if (!tabs || !menu || !view || !form) return;

  var items = [];
  try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { items = []; }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function render() {
    count.textContent = items.length ? items.length : "";
    if (!items.length) {
      list.innerHTML = '<p class="st-empty">مفيش تسويات لسه.</p>';
      return;
    }
    list.innerHTML = items.map(function (it, i) {
      return '<div class="st-item"><div>' +
        '<div class="st-item__name">' + esc(it.name) + '</div>' +
        '<div class="st-item__meta">' + esc(it.type) + ' — الكمية: ' + esc(it.qty) + '</div>' +
        (it.notes ? '<div class="st-item__notes">' + esc(it.notes) + '</div>' : '') +
        '<div class="st-item__date">' + esc(it.date) + '</div>' +
        '</div><button type="button" class="st-del" data-i="' + i + '">حذف</button></div>';
    }).join("");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("st-name").value.trim();
    var type = document.getElementById("st-type").value.trim();
    if (!name || !type) return;
    items.unshift({
      name: name,
      type: type,
      qty: document.getElementById("st-qty").value || "1",
      notes: document.getElementById("st-notes").value.trim(),
      date: new Date().toLocaleString("ar-EG")
    });
    save();
    render();
    form.reset();
    document.getElementById("st-qty").value = "1";
  });

  list.addEventListener("click", function (e) {
    var btn = e.target.closest(".st-del");
    if (!btn) return;
    if (!confirm("متأكد إنك عايز تحذف التسوية دي؟")) return;
    items.splice(Number(btn.getAttribute("data-i")), 1);
    save();
    render();
  });

  // ----- tab -----
  var open = false;

  function setOpen(v) {
    open = v;
    menu.hidden = v;
    view.hidden = !v;
    var btn = document.getElementById("settle-tab");
    if (btn) btn.classList.toggle("is-active", v);
    if (v) window.scrollTo({ top: 0 });
  }

  function ensureTab() {
    if (document.getElementById("settle-tab")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.id = "settle-tab";
    b.className = "tab" + (open ? " is-active" : "");
    b.textContent = "التسويات";
    tabs.appendChild(b);
  }

  tabs.addEventListener("click", function (e) {
    var t = e.target.closest(".tab");
    if (!t) return;
    if (t.id === "settle-tab") {
      setOpen(true);
      // other tabs lose active look
      Array.prototype.forEach.call(tabs.querySelectorAll(".tab"), function (x) {
        if (x !== t) x.classList.remove("is-active");
      });
    } else if (open) {
      setOpen(false);
    }
  });

  new MutationObserver(function () { ensureTab(); }).observe(tabs, { childList: true });
  ensureTab();
  render();
})();
