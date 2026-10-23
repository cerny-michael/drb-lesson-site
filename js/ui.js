// Shared chart chrome: colour tokens, axes, tooltip, small helpers.
// Colours follow the page's two surfaces: "paper" (light) and "stage" (dark).
// Series hues are validated for both surfaces (adjacent and all-pairs CVD).

export const TOKENS = {
  light: {
    surface: "#f7f2e8", ink: "#1d1914", ink2: "#4f4840", muted: "#857c6f",
    grid: "#e4dccb", axis: "#c3b9a6",
    s1: "#2a78d6", s2: "#eb6834", s3: "#1baf7a",
    good: "#0ca30c", goodText: "#006300", bad: "#d03b3b",
    seqLo: "#cde2fb", seqHi: "#104281",
    accent: "#a51c30", gold: "#9a7424"
  },
  dark: {
    surface: "#17120f", ink: "#f3ead9", ink2: "#c9bba3", muted: "#93887a",
    grid: "#2e2620", axis: "#4a3f35",
    s1: "#3987e5", s2: "#d95926", s3: "#199e70",
    good: "#0ca30c", goodText: "#0ca30c", bad: "#e66767",
    seqLo: "#184f95", seqHi: "#cde2fb",
    accent: "#e4c779", gold: "#e4c779"
  }
};

export const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif';
export const SERIF = '"Source Serif 4", "Iowan Old Style", Georgia, serif';
export const DISPLAY = '"Playfair Display", "Iowan Old Style", Georgia, serif';

// A responsive SVG inside a wrapper div; returns { wrap, svg }.
export function frame(d3, w, h, cls = "") {
  const wrap = d3.create("div").attr("class", `viz ${cls}`);
  const svg = wrap.append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("role", "img")
    .style("font-family", SANS);
  return { wrap, svg };
}

// Recessive hairline axes with muted tick labels.
export function styleAxis(g, t, { grid = false } = {}) {
  g.selectAll(".domain").attr("stroke", t.axis);
  g.selectAll(".tick line").attr("stroke", grid ? t.grid : t.axis);
  g.selectAll(".tick text").attr("fill", t.muted).attr("font-size", 12)
    .style("font-variant-numeric", "tabular-nums");
  return g;
}

// One tooltip shared by every chart on the page.
let tipEl = null;
export function tooltip() {
  if (!tipEl) {
    tipEl = document.createElement("div");
    tipEl.className = "viz-tip";
    tipEl.setAttribute("role", "tooltip");
    document.body.appendChild(tipEl);
  }
  return {
    show(html, ev) {
      tipEl.innerHTML = html;
      tipEl.style.opacity = 1;
      const pad = 14, r = tipEl.getBoundingClientRect();
      let x = ev.clientX + pad, y = ev.clientY + pad;
      if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - pad;
      if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - pad;
      tipEl.style.transform = `translate(${x}px, ${y}px)`;
    },
    hide() { tipEl.style.opacity = 0; }
  };
}

// Attach hover + keyboard focus tooltips to a selection.
export function hoverable(sel, opts, html) {
  if (typeof opts === "function") { html = opts; opts = {}; }
  const tip = tooltip();
  if (opts.focus !== false) sel.attr("tabindex", 0);
  sel.on("pointerenter pointermove", (ev, d) => tip.show(html(d), ev))
    .on("pointerleave blur", () => tip.hide())
    .on("focus", function (ev, d) {
      const b = this.getBoundingClientRect();
      tip.show(html(d), { clientX: b.right, clientY: b.top });
    });
}

// Set an SVG <text> to several lines. Charts are built detached from the
// page, so text can't be measured; lines are broken by hand ("|" separates).
export function lines(textSel, str, lineHeight = 1.25) {
  textSel.each(function () {
    const x = this.getAttribute("x");
    this.textContent = "";
    String(str).split("|").forEach((ln, i) => {
      const s = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      s.setAttribute("x", x);
      s.setAttribute("dy", i ? `${lineHeight}em` : 0);
      s.textContent = ln;
      this.appendChild(s);
    });
  });
  return textSel;
}

// Step bookkeeping: run enter(step) only when the step changes.
export function stepper(prefix, enter, progress) {
  let last = null;
  return (step, p) => {
    if (!step || !step.startsWith(prefix)) return;
    if (step !== last) { enter(step, last); last = step; }
    if (progress) progress(step, p ?? 0);
  };
}

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const fmt = (x, d = 0) => Number.isFinite(x)
  ? x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d })
  : "∞";
