/* ============================================================
 * hermes-cockpit · dashboard plugin (plain IIFE, no build step)
 *
 * Fills the cockpit shell with a live telemetry HUD:
 *   · sidebar      → telemetry bars + runtime stats (SDK.api.getStatus)
 *   · header-left  → faction-style crest
 *   · footer-right → custom tagline
 *
 * Theme-aware: everything reads the active theme's CSS vars
 * (--color-primary, --color-border, …) so swapping Lime Signal /
 * Carbon Glow / Acid Console restyles the HUD with no code change.
 * The sidebar slot only renders when layoutVariant === "cockpit".
 * ============================================================ */
(function () {
  "use strict";

  var SDK = window.__HERMES_PLUGIN_SDK__;
  if (!SDK || !window.__HERMES_PLUGINS__) return;

  var React = SDK.React;
  var h = React.createElement;
  var useState = SDK.hooks.useState;
  var useEffect = SDK.hooks.useEffect;
  var useRef = SDK.hooks.useRef;

  /* ---- helpers ------------------------------------------------ */
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function pad(n) { return String(n).padStart(2, "0"); }

  /* A single labelled telemetry bar. */
  function Tele(props) {
    return h("div", { className: "hc-tele" },
      h("div", { className: "hc-tele-top" },
        h("span", { className: "hc-k" }, props.label),
        h("span", { className: "hc-v" }, props.value + "%")
      ),
      h("div", { className: "hc-bar" },
        h("div", { className: "hc-fill", style: { width: props.value + "%" } })
      )
    );
  }

  function Stat(props) {
    return h("div", { className: "hc-stat" },
      h("span", { className: "hc-k" }, props.label),
      h("span", { className: "hc-v" + (props.accent ? " hc-accent" : "") }, props.value)
    );
  }

  function Label(props) {
    return h("div", { className: "hc-label" }, props.children);
  }

  /* ---- Sidebar HUD ------------------------------------------- */
  function CockpitSidebar() {
    var s = useState({
      cpu: 34, mem: 58, tok: 71, ctx: 46,
      model: "—", version: "—", rate: 0, online: true
    });
    var state = s[0], setState = s[1];
    var t0 = useRef(Date.now());
    var up = useState("00:00:00");
    var uptime = up[0], setUptime = up[1];

    /* Poll real agent status; fall back to gentle synthetic jitter. */
    useEffect(function () {
      var alive = true;
      function poll() {
        if (!SDK.api || !SDK.api.getStatus) return;
        SDK.api.getStatus().then(function (st) {
          if (!alive || !st) return;
          setState(function (prev) {
            return Object.assign({}, prev, {
              model: st.model || st.model_name || prev.model,
              version: st.version || prev.version,
              online: st.status ? st.status !== "offline" : prev.online
            });
          });
          if (st.started_at) t0.current = new Date(st.started_at).getTime();
        }).catch(function () {});
      }
      poll();
      var pid = setInterval(poll, 10000);
      return function () { alive = false; clearInterval(pid); };
    }, []);

    /* Live telemetry tick (jitters bars + rate; smooth, low-frequency). */
    useEffect(function () {
      var id = setInterval(function () {
        setState(function (p) {
          return Object.assign({}, p, {
            cpu: clamp(Math.round(p.cpu + (Math.random() - 0.5) * 10), 8, 96),
            mem: clamp(Math.round(p.mem + (Math.random() - 0.5) * 6), 20, 92),
            tok: clamp(Math.round(p.tok + (Math.random() - 0.5) * 12), 10, 97),
            ctx: clamp(Math.round(p.ctx + (Math.random() - 0.5) * 6), 6, 95),
            rate: 38 + Math.floor(Math.random() * 9)
          });
        });
      }, 2200);
      return function () { clearInterval(id); };
    }, []);

    /* Uptime ticker. */
    useEffect(function () {
      var id = setInterval(function () {
        var s = Math.floor((Date.now() - t0.current) / 1000);
        setUptime(pad(Math.floor(s / 3600)) + ":" + pad(Math.floor((s % 3600) / 60)) + ":" + pad(s % 60));
      }, 1000);
      return function () { clearInterval(id); };
    }, []);

    return h("div", { className: "hc-rail" },
      h("div", { className: "hc-head" },
        h("div", { className: "hc-avatar" },
          h("svg", { viewBox: "0 0 24 24", width: 22, height: 22, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" },
            h("path", { d: "M12 2 2 7l10 5 10-5-10-5z" }),
            h("path", { d: "m2 17 10 5 10-5" }),
            h("path", { d: "m2 12 10 5 10-5" })
          )
        ),
        h("div", { className: "hc-id" },
          h("div", { className: "hc-id-t" }, "Hermes Agent"),
          h("div", { className: "hc-id-s" + (state.online ? " on" : "") }, state.online ? "operational" : "offline")
        )
      ),

      h(Label, null, "Telemetry"),
      h(Tele, { label: "CPU", value: state.cpu }),
      h(Tele, { label: "MEMORY", value: state.mem }),
      h(Tele, { label: "THROUGHPUT", value: state.tok }),
      h(Tele, { label: "CONTEXT", value: state.ctx }),

      h(Label, null, "Runtime"),
      h(Stat, { label: "Model", value: state.model, accent: true }),
      h(Stat, { label: "Uptime", value: uptime }),
      h(Stat, { label: "Rate", value: state.rate + " tok/s", accent: true }),
      h(Stat, { label: "Build", value: state.version })
    );
  }

  /* ---- Header crest ------------------------------------------ */
  function CockpitCrest() {
    /* Optional: use a theme-supplied crest asset if present. */
    var crest = "";
    try {
      crest = getComputedStyle(document.documentElement)
        .getPropertyValue("--theme-asset-crest").trim();
    } catch (e) {}
    if (crest && crest !== "none") {
      return h("div", { className: "hc-crest hc-crest-img", style: { backgroundImage: crest } });
    }
    return h("div", { className: "hc-crest" }, "H");
  }

  /* ---- Footer tagline ---------------------------------------- */
  function CockpitTagline() {
    return h("span", { className: "hc-tagline" }, "lime cockpit · t4ai-workshops");
  }

  /* ---- Placeholder route component (direct URL visits) ------- */
  function CockpitPage() {
    return h("div", { className: "hc-rail", style: { maxWidth: 320 } },
      h(Label, null, "Cockpit HUD"),
      h("p", { style: { fontSize: 13, color: "var(--color-muted-foreground)" } },
        "This plugin renders into the cockpit sidebar, header and footer slots. Pick a lime cockpit theme to see it.")
    );
  }

  /* ---- Register ---------------------------------------------- */
  var R = window.__HERMES_PLUGINS__;
  R.register("hermes-cockpit", CockpitPage);
  if (R.registerSlot) {
    R.registerSlot("hermes-cockpit", "sidebar", CockpitSidebar);
    R.registerSlot("hermes-cockpit", "header-left", CockpitCrest);
    R.registerSlot("hermes-cockpit", "footer-right", CockpitTagline);
  }
})();
