// The article's closing arguments: changing the game, the agency problem, and
// the broader-vs-deeper trade-off. The last two are illustrations of verbal
// claims (labelled as such), built on the same calibrated model.

import * as M from "./model.js";
import { TOKENS, frame, styleAxis, stepper, clamp, fmt, lines } from "./ui.js";

// ───────────────────────── 1. When the game itself changes ─────────────────────
export function shiftCurve(d3) {
  const t = TOKENS.light, W = 820, H = 500, m = { l: 70, r: 30, t: 56, b: 58 };
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "Punishment needed by depth, before and after a change in the temptation to cheat.");
  const x = d3.scaleLinear([0, 70], [m.l, W - m.r]);
  const y = d3.scaleLinear([0, 100], [H - m.b, m.t]);
  svg.append("g").attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d => d + "%").tickSizeOuter(0)).call(g => styleAxis(g, t));
  svg.append("g").attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-(W - m.l - m.r))).call(g => styleAxis(g, t, { grid: true }))
    .call(g => g.select(".domain").remove());
  svg.append("text").attr("x", W - m.r).attr("y", H - 14).attr("text-anchor", "end").attr("fill", t.ink2)
    .attr("font-size", 13.5).text("Depth of the treaty →");
  svg.append("text").attr("x", m.l).attr("y", 26).attr("fill", t.ink2).attr("font-size", 13.5)
    .text("Punishment needed to deter cheating (periods)");
  const path = k => {
    const c = M.ceiling(M.DELTA, k);
    const rs = d3.range(0.2, Math.min(c, 70), 0.1).filter(r => M.requiredL(r, M.DELTA, k) <= 100);
    return d3.line().x(r => x(r)).y(r => y(M.requiredL(r, M.DELTA, k)))(rs);
  };
  svg.append("path").attr("d", path(M.K)).attr("fill", "none").attr("stroke", t.muted).attr("stroke-width", 2);
  const baseLab = svg.append("text").attr("x", x(M.ceiling()) - 8).attr("y", y(92)).attr("text-anchor", "end")
    .attr("fill", t.ink2).attr("font-size", 13).text("today's game");
  const moved = svg.append("path").attr("d", path(M.K)).attr("fill", "none").attr("stroke", t.s1).attr("stroke-width", 2.5);
  const movedLab = svg.append("text").attr("fill", t.ink).attr("font-size", 13).attr("font-weight", 600);
  const cl = svg.append("line").attr("y1", m.t).attr("y2", H - m.b).attr("stroke", t.s1).attr("stroke-width", 1.2);
  const clLab = svg.append("text").attr("y", m.t - 10).attr("fill", t.ink).attr("font-size", 13).attr("font-weight", 600);
  svg.append("line").attr("x1", x(M.ceiling())).attr("x2", x(M.ceiling())).attr("y1", m.t).attr("y2", H - m.b)
    .attr("stroke", t.muted);
  function set(mult, label, dur = 900) {
    const k = M.K * mult, c = M.ceiling(M.DELTA, k);
    moved.transition().duration(dur).attr("d", path(k)).attr("opacity", mult === 1 ? 0 : 1);
    cl.transition().duration(dur).attr("x1", x(c)).attr("x2", x(c)).attr("opacity", mult === 1 ? 0 : 1);
    clLab.transition().duration(dur).attr("x", x(c) + (c > M.ceiling() ? 6 : -6)).attr("opacity", mult === 1 ? 0 : 1);
    clLab.attr("text-anchor", c > M.ceiling() ? "start" : "end").text(`new ceiling: ${fmt(c, 1)}%`);
    movedLab.transition().duration(dur).attr("x", x(Math.min(c, 70)) + (c > M.ceiling() ? -8 : -8))
      .attr("y", y(70)).attr("text-anchor", "end").attr("opacity", mult === 1 ? 0 : 1);
    movedLab.text(label);
  }
  set(1, "", 0);
  const node = wrap.node();
  node.update = stepper("fu-", step => {
    if (step === "fu-base") set(1, "");
    if (step === "fu-ideas") set(0.5, "temptation halved");
    if (step === "fu-npt") set(1.5, "temptation up 50%");
  });
  node.set = mult => set(mult, mult < 1 ? "less temptation" : mult > 1 ? "more temptation" : "", 200);
  return node;
}

// ───────────────────────── 2. The agency problem ───────────────────────────────
export function agencySim(d3, { lab = false } = {}) {
  const t = TOKENS.light, W = 860, H = 440, m = { l: 64, r: 150, t: 58, b: 48 };
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "Simulated protectionist premium over time against a penalty threshold.");
  const N = 120, rand = M.rng(23);
  const rec = [[18, 26], [52, 63], [94, 100]];
  const inRec = i => rec.some(([a, b]) => i >= a && i <= b);
  let v = 3; const prem = d3.range(N).map(i => {
    v = 0.75 * v + 0.25 * 3 + rand.normal() * 0.8;
    const bump = rec.reduce((s, [a, b]) => s + (i >= a && i <= b ? 9 * Math.sin(Math.PI * (i - a + 1) / (b - a + 2)) : 0), 0);
    return { i, v: Math.max(0.3, v + bump) };
  });
  prem[58].v = 17.5;  // one deep recession beyond any penalty a leader would sign
  const x = d3.scaleLinear([0, N - 1], [m.l, W - m.r]);
  const y = d3.scaleLinear([0, 20], [H - m.b, m.t]);
  rec.forEach(([a, b]) => svg.append("rect").attr("x", x(a)).attr("width", x(b) - x(a)).attr("y", m.t)
    .attr("height", H - m.t - m.b).attr("fill", t.ink).attr("opacity", 0.05));
  svg.append("text").attr("x", (x(52) + x(63)) / 2).attr("y", m.t + 14).attr("text-anchor", "middle")
    .attr("fill", t.muted).attr("font-size", 12).text("recession");
  svg.append("g").attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).ticks(6).tickSizeOuter(0)).call(g => styleAxis(g, t));
  svg.append("g").attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(4).tickSize(-(W - m.l - m.r))).call(g => styleAxis(g, t, { grid: true }))
    .call(g => g.select(".domain").remove());
  svg.append("text").attr("x", m.l).attr("y", 22).attr("fill", t.ink).attr("font-size", 14.5).attr("font-weight", 600)
    .text("The “protectionist premium” interest groups will pay a leader to defect");
  svg.append("text").attr("x", m.l).attr("y", 40).attr("fill", t.muted).attr("font-size", 12)
    .text("Simulated illustration of the article's argument; periods on the x-axis");
  svg.append("path").datum(prem).attr("fill", "none").attr("stroke", t.s1).attr("stroke-width", 2)
    .attr("d", d3.line().x(d => x(d.i)).y(d => y(d.v)).curve(d3.curveMonotoneX));
  const pen = svg.append("g").attr("opacity", lab ? 1 : 0);
  const penLine = pen.append("line").attr("x1", m.l).attr("x2", W - m.r).attr("stroke", t.ink).attr("stroke-width", 2);
  const penLab = pen.append("text").attr("x", W - m.r + 8).attr("fill", t.ink).attr("font-size", 13).attr("font-weight", 600);
  const marks = svg.append("g").selectAll("path").data(prem).join("path")
    .attr("d", "M-4,-4 L4,4 M4,-4 L-4,4").attr("stroke", t.s2).attr("stroke-width", 2.2)
    .attr("transform", d => `translate(${x(d.i)},${y(d.v)})`).attr("opacity", 0);
  const stat = svg.append("g").attr("transform", `translate(${W - m.r + 8},${H - m.b - 70})`).attr("opacity", lab ? 1 : 0);
  stat.append("text").attr("fill", t.ink2).attr("font-size", 12.5).text("Periods with");
  stat.append("text").attr("y", 16).attr("fill", t.ink2).attr("font-size", 12.5).text("a defection");
  const statV = stat.append("text").attr("y", 50).attr("fill", t.ink).attr("font-size", 30).attr("font-weight", 600);
  const note = svg.append("text").attr("x", W - m.r + 8).attr("fill", t.ink2).attr("font-size", 12.5).attr("opacity", 0);

  function set(P, dur = 700) {
    const tr = s => dur ? s.transition().duration(dur) : s;
    tr(penLine).attr("y1", y(P)).attr("y2", y(P));
    tr(penLab).attr("y", y(P) + 4);
    lines(penLab, `penalty|for defecting`, 1.2);
    tr(marks).attr("opacity", d => d.v > P ? 1 : 0);
    const n = prem.filter(d => d.v > P).length;
    statV.text(`${n}`);
    return n;
  }
  const node = wrap.node();
  node.update = stepper("ag-", step => {
    const P = { "ag-premium": 25, "ag-low": 3, "ag-high": 16, "ag-mid": 9.5 }[step];
    pen.transition().duration(500).attr("opacity", step === "ag-premium" ? 0 : 1);
    stat.transition().duration(500).attr("opacity", step === "ag-premium" ? 0 : 1);
    set(P);
    note.transition().duration(400).attr("opacity", step === "ag-high" ? 1 : 0);
    note.attr("y", y(16) - 40);
    lines(note, "even a stiff penalty|is swamped when the|premium spikes", 1.2);
  });
  node.set = P => { pen.attr("opacity", 1); stat.attr("opacity", 1); return set(P, 150); };
  if (lab) set(9.5, 0);
  return node;
}

// ───────────────────────── 3. Broader vs deeper ────────────────────────────────
const KMULT = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.5, 1.9, 2.4, 3.0];
const NAMES = ["Arda", "Belmar", "Corvia", "Dalen", "Estor", "Feria", "Galt", "Hesper", "Istra", "Jorvik", "Kessa", "Lumen"];
export function clubToy(d3, { lab = false } = {}) {
  const t = TOKENS.light, W = 860, H = 560;
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "Toy model: as more tempted states join, the deepest self-enforcing treaty gets shallower.");
  const data = KMULT.map((k, i) => ({ i, k, name: NAMES[i] }));
  const ceilFor = n => M.ceiling(M.DELTA, M.K * KMULT[n - 1]);
  const totals = d3.range(1, 13).map(n => ({ n, depth: ceilFor(n), total: n * M.treatyU(ceilFor(n)) }));

  svg.append("text").attr("x", 30).attr("y", 26).attr("fill", t.ink).attr("font-size", 14.5).attr("font-weight", 600)
    .text("Twelve would-be members, ordered by how tempted they are to defect");
  svg.append("text").attr("x", 30).attr("y", 44).attr("fill", t.muted).attr("font-size", 12)
    .text("Toy model of the article's closing conjecture: fictional states, calibrated trade game, permanent punishment");
  const sx = d3.scalePoint(d3.range(12), [70, W - 70]).padding(0.2);
  const rr = d3.scaleSqrt([0.4, 3], [11, 26]);
  const states = svg.append("g").selectAll("g").data(data).join("g")
    .attr("transform", d => `translate(${sx(d.i)},${110})`);
  const circ = states.append("circle").attr("r", d => rr(d.k)).attr("stroke", t.surface).attr("stroke-width", 2);
  states.append("text").attr("y", 48).attr("text-anchor", "middle").attr("fill", t.ink2).attr("font-size", 12).text(d => d.name);
  states.append("text").attr("y", 64).attr("text-anchor", "middle").attr("fill", t.muted).attr("font-size", 11.5)
    .text(d => `${d.k}×`);
  svg.append("text").attr("x", W - 70).attr("y", 196).attr("text-anchor", "end").attr("fill", t.muted).attr("font-size", 11.5)
    .text("circle size and × = temptation to defect, relative to the article's example");

  // two small charts: depth by members, total gains by members
  const mk = (x0, title, acc, domain, fmtY, color) => {
    const w = 380, h = 300, m = { l: 50, r: 16, t: 34, b: 38 }, top = 230;
    const g = svg.append("g").attr("transform", `translate(${x0},${top})`);
    const x = d3.scaleLinear([1, 12], [m.l, w - m.r]), y = d3.scaleLinear(domain, [h - m.b, m.t]);
    g.append("g").attr("transform", `translate(0,${h - m.b})`).call(d3.axisBottom(x).ticks(12).tickSizeOuter(0))
      .call(s => styleAxis(s, t));
    g.append("g").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(fmtY).tickSize(-(w - m.l - m.r)))
      .call(s => styleAxis(s, t, { grid: true })).call(s => s.select(".domain").remove());
    g.append("text").attr("x", m.l).attr("y", 16).attr("fill", t.ink).attr("font-size", 13.5).attr("font-weight", 600).text(title);
    g.append("text").attr("x", w - m.r).attr("y", h - 4).attr("text-anchor", "end").attr("fill", t.muted).attr("font-size", 11.5).text("members admitted →");
    g.append("path").datum(totals).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2)
      .attr("d", d3.line().x(d => x(d.n)).y(d => y(acc(d))));
    const dot = g.append("circle").attr("r", 6).attr("fill", color).attr("stroke", t.surface).attr("stroke-width", 2);
    const lab = g.append("text").attr("fill", t.ink).attr("font-size", 13).attr("font-weight", 600);
    return (n, dur) => {
      const d = totals[n - 1];
      const tr = s => dur ? s.transition().duration(dur) : s;
      tr(dot).attr("cx", x(n)).attr("cy", y(acc(d)));
      tr(lab).attr("x", x(n) + (n > 8 ? -10 : 10)).attr("y", y(acc(d)) - 10);
      lab.attr("text-anchor", n > 8 ? "end" : "start").text(fmtY(acc(d)));
    };
  };
  const cDepth = mk(20, "Deepest treaty every member will keep", d => d.depth, [0, 70], d => `${fmt(d, 0)}%`, t.s1);
  const cTot = mk(450, "Total gains: members × value of that treaty", d => d.total, [0, 220], d => fmt(d, 0), t.s2);
  const question = svg.append("text").attr("x", W / 2).attr("y", H - 6).attr("text-anchor", "middle").attr("fill", t.accent)
    .attr("font-size", 14).attr("font-style", "italic").attr("opacity", 0)
    .text("“Is this trade-off real? … We do not know.”");

  function set(n, dur = 700) {
    circ.transition().duration(dur).attr("fill", d => d.i < n ? t.s1 : t.grid);
    cDepth(n, dur); cTot(n, dur);
    return totals[n - 1];
  }
  set(lab ? 9 : 12, 0);
  const node = wrap.node();
  node.update = stepper("cl-", step => {
    set({ "cl-all": 12, "cl-few": 5, "cl-question": 9 }[step]);
    question.transition().duration(500).attr("opacity", step === "cl-question" ? 1 : 0);
  });
  node.set = n => set(n, 200);
  return node;
}
