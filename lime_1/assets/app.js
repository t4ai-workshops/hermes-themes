/* Hermes Dashboard preview — nav + theme switching (mirrors real shell) */
(function () {
  "use strict";

  var root = document.getElementById("app");
  var pop = document.getElementById("themePop");
  var themeName = document.getElementById("themeName");
  var STORE = "hermes-preview-theme";

  /* ---------- Theme switching ---------- */
  function applyTheme(name, label) {
    root.setAttribute("data-theme", name);
    try { localStorage.setItem(STORE, name); } catch (e) {}
    document.querySelectorAll(".hx-opt").forEach(function (b) {
      var on = b.dataset.theme === name;
      b.classList.toggle("active", on);
      if (on && themeName) themeName.textContent = label || b.dataset.name;
    });
  }
  document.getElementById("themeBtn").addEventListener("click", function (e) {
    e.stopPropagation();
    pop.classList.toggle("open");
  });
  document.addEventListener("click", function (e) {
    if (!pop.contains(e.target)) pop.classList.remove("open");
  });
  document.querySelectorAll(".hx-opt").forEach(function (b) {
    b.addEventListener("click", function () {
      applyTheme(b.dataset.theme, b.dataset.name);
      pop.classList.remove("open");
    });
  });

  var saved = "lime-signal";
  try { saved = localStorage.getItem(STORE) || "lime-signal"; } catch (e) {}
  var savedBtn = document.querySelector('.hx-opt[data-theme="' + saved + '"]');
  applyTheme(saved, savedBtn ? savedBtn.dataset.name : "Lime Signal");

  /* ---------- Nav switching ---------- */
  var pageTitle = document.getElementById("pageTitle");
  var pagePill = document.getElementById("pagePill");
  var segtabs = document.getElementById("segtabs");
  var rangeTabs = document.getElementById("rangeTabs");
  var phName = document.getElementById("phName");

  function show(screen) {
    document.querySelectorAll(".hx-screen").forEach(function (s) {
      s.classList.toggle("active", s.dataset.screen === screen);
    });
  }

  document.querySelectorAll(".hx-navitem").forEach(function (item) {
    item.addEventListener("click", function () {
      var nav = item.dataset.nav;
      var label = item.dataset.label;
      document.querySelectorAll(".hx-navitem").forEach(function (x) { x.classList.toggle("active", x === item); });

      pageTitle.textContent = label;
      // Sessions shows Overview/History tabs; Models shows the date-range toggle.
      segtabs.hidden = nav !== "sessions";
      rangeTabs.hidden = nav !== "models";
      pagePill.hidden = nav !== "sessions";

      if (nav === "sessions") { show("sessions"); }
      else if (nav === "models") { show("models"); }
      else { phName.textContent = label; show("placeholder"); }

      document.querySelector(".hx-main").scrollTop = 0;
    });
  });

  /* segmented + range tabs are visual only */
  document.querySelectorAll(".hx-seg").forEach(function (s) {
    s.addEventListener("click", function () {
      s.parentElement.querySelectorAll(".hx-seg").forEach(function (x) { x.classList.toggle("active", x === s); });
    });
  });
  document.querySelectorAll(".hx-range button").forEach(function (s) {
    s.addEventListener("click", function () {
      s.parentElement.querySelectorAll("button").forEach(function (x) { x.classList.toggle("active", x === s); });
    });
  });
})();
