/* Hermes Dashboard preview — interactions + live telemetry */
(function () {
  "use strict";

  /* ---------- Theme switching ---------- */
  var root = document.getElementById("app");
  var pop = document.getElementById("themePop");
  var STORE = "hermes-preview-theme";

  function applyTheme(name) {
    root.setAttribute("data-theme", name);
    try { localStorage.setItem(STORE, name); } catch (e) {}
    document.querySelectorAll(".theme-opt").forEach(function (b) {
      b.classList.toggle("active", b.dataset.theme === name);
    });
  }

  document.getElementById("themeBtn").addEventListener("click", function (e) {
    e.stopPropagation();
    pop.classList.toggle("open");
  });
  document.addEventListener("click", function (e) {
    if (!pop.contains(e.target)) pop.classList.remove("open");
  });
  document.querySelectorAll(".theme-opt").forEach(function (b) {
    b.addEventListener("click", function () {
      applyTheme(b.dataset.theme);
      pop.classList.remove("open");
    });
  });

  var saved = "lime-signal";
  try { saved = localStorage.getItem(STORE) || "lime-signal"; } catch (e) {}
  applyTheme(saved);

  /* ---------- Nav tabs ---------- */
  document.querySelectorAll(".tab").forEach(function (t) {
    t.addEventListener("click", function () {
      var screen = t.dataset.screen;
      if (!screen) return;
      document.querySelectorAll(".tab").forEach(function (x) { x.classList.toggle("active", x === t); });
      document.querySelectorAll(".screen").forEach(function (s) {
        s.classList.toggle("active", s.dataset.screen === screen);
      });
      document.querySelector(".main").scrollTop = 0;
    });
  });

  /* ---------- Toggles ---------- */
  document.querySelectorAll(".switch").forEach(function (s) {
    s.addEventListener("click", function () { s.classList.toggle("on"); });
  });

  /* ---------- Range value ---------- */
  document.querySelectorAll(".range").forEach(function (r) {
    var out = document.getElementById(r.dataset.out);
    function upd() { if (out) out.textContent = r.value; }
    r.addEventListener("input", upd); upd();
  });

  /* ---------- Live telemetry ---------- */
  var tele = [
    { id: "cpu", base: 34, span: 22, unit: "%" },
    { id: "mem", base: 58, span: 14, unit: "%" },
    { id: "tok", base: 71, span: 18, unit: "%" },
    { id: "ctx", base: 46, span: 10, unit: "%" }
  ];
  function jitter() {
    tele.forEach(function (m) {
      var v = Math.round(m.base + (Math.random() - 0.5) * m.span);
      v = Math.max(6, Math.min(97, v));
      var fill = document.getElementById("fill-" + m.id);
      var val = document.getElementById("val-" + m.id);
      if (fill) fill.style.width = v + "%";
      if (val) val.textContent = v + m.unit;
    });
    // tokens/sec readout
    var tps = document.getElementById("tps");
    if (tps) tps.textContent = (38 + Math.floor(Math.random() * 9)) + " tok/s";
  }
  jitter();
  setInterval(jitter, 2200);

  /* ---------- Uptime counter ---------- */
  var up = document.getElementById("uptime");
  var start = Date.now() - (3 * 3600 + 42 * 60) * 1000;
  function tickUptime() {
    if (!up) return;
    var s = Math.floor((Date.now() - start) / 1000);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    up.textContent = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  }
  tickUptime(); setInterval(tickUptime, 1000);
})();
