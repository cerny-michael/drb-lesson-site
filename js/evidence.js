// Evidence and case charts. Numbers shown are the ones the article reports;
// positions on the schematic map are qualitative readings, labelled as such.

import { TOKENS, frame, styleAxis, hoverable, stepper, clamp, ease, fmt, lines, DISPLAY } from "./ui.js";

// ───────────────────────── 1. Depth vs enforcement: a schematic map ────────────
export function depthMap(d3) {
  const t = TOKENS.light, W = 860, H = 580, m = { l: 74, r: 30, t: 54, b: 66 };
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "Schematic map of agreements by depth of cooperation and strength of enforcement.");
  const x = d3.scaleLinear([0, 10], [m.l, W - m.r]);
  const y = d3.scaleLinear([0, 10], [H - m.b, m.t]);
  const area = { arms: t.s1, trade: t.s2, env: t.s3 };

  svg.append("rect").attr("x", m.l).attr("y", m.t).attr("width", W - m.l - m.r).attr("height", H - m.t - m.b)
    .attr("fill", "none").attr("stroke", t.axis);
  // the frontier: deeper treaties need more enforcement
  const frontier = svg.append("g");
  frontier.append("path").attr("d", `M${x(0)},${y(0)} L${x(10)},${y(10)} L${x(10)},${y(0)} Z`)
    .attr("fill", t.bad).attr("opacity", 0.05);
  frontier.append("line").attr("x1", x(0)).attr("y1", y(0)).attr("x2", x(10)).attr("y2", y(10))
    .attr("stroke", t.ink2).attr("stroke-width", 1.2).attr("stroke-dasharray", "5 5");
  lines(frontier.append("text").attr("x", x(9.7)).attr("y", y(5.0)).attr("text-anchor", "end")
    .attr("fill", t.ink2).attr("font-size", 13).attr("font-style", "italic"),
    "Deep but barely enforced.|Managerialists expect plenty here;|enforcement theorists expect few,|or rampant violations.");
  lines(frontier.append("text").attr("x", x(9.0)).attr("y", y(9.75)).attr("text-anchor", "end")
    .attr("fill", t.ink2).attr("font-size", 12.5), "deeper agreements|need more enforcement →");

  svg.append("text").attr("x", x(0)).attr("y", H - m.b + 24).attr("fill", t.muted).attr("font-size", 12.5).text("shallow");
  svg.append("text").attr("x", x(10)).attr("y", H - m.b + 24).attr("text-anchor", "end").attr("fill", t.muted).attr("font-size", 12.5).text("deep");
  svg.append("text").attr("x", (x(0) + x(10)) / 2).attr("y", H - 18).attr("text-anchor", "middle").attr("fill", t.ink2)
    .attr("font-size", 13.5).text("Depth of cooperation: departure from what states would have done anyway →");
  svg.append("text").attr("x", m.l - 10).attr("y", y(0.3)).attr("text-anchor", "end").attr("fill", t.muted).attr("font-size", 12.5).text("weak");
  svg.append("text").attr("x", m.l - 10).attr("y", y(9.7)).attr("text-anchor", "end").attr("fill", t.muted).attr("font-size", 12.5).text("strong");
  svg.append("text").attr("x", m.l).attr("y", 24).attr("fill", t.ink2).attr("font-size", 13.5).text("Enforcement, formal or tacit ↑");
  svg.append("text").attr("x", W - m.r).attr("y", 24).attr("text-anchor", "end").attr("fill", t.muted).attr("font-size", 12)
    .text("Schematic: positions are a reading of the article's qualitative claims, not measurements");

  const legend = svg.append("g").attr("transform", `translate(${m.l + 14},${m.t + 18})`);
  [["arms", "Arms control"], ["env", "Environment"], ["trade", "Trade and European integration"]].forEach(([k, s], i) => {
    const g = legend.append("g").attr("transform", `translate(0,${i * 21})`).attr("class", `leg-${k}`).attr("opacity", 0);
    g.append("circle").attr("cx", 6).attr("r", 5.5).attr("fill", area[k]);
    g.append("text").attr("x", 18).attr("y", 4.5).attr("fill", t.ink2).attr("font-size", 13).text(s);
  });

  const P = [
    { id: "seabed", g: "status", a: "arms", d: 0.35, e: 1.2, name: "Seabed (1971)" },
    { id: "antarctic", g: "status", a: "arms", d: 0.65, e: 1.55, name: "Antarctic (1959)" },
    { id: "space", g: "status", a: "arms", d: 0.95, e: 1.2, name: "Outer Space (1967)" },
    { id: "salt1", g: "salt", a: "arms", d: 2.0, e: 2.1, name: "SALT I Interim (1972)", lx: 12, ly: -8 },
    { id: "salt2", g: "salt", a: "arms", d: 2.5, e: 1.5, name: "SALT II (1979)", lx: 12, ly: 16 },
    { id: "abm", g: "abm", a: "arms", d: 1.5, e: 4.0, name: "ABM Treaty (1972)", lx: 12, ly: -12 },
    { id: "inf", g: "deep", a: "arms", d: 7.0, e: 2.9, name: "INF (1987)", hollow: true, lx: 12, ly: 4 },
    { id: "cfe", g: "deep", a: "arms", d: 6.4, e: 2.2, name: "CFE (1990)", hollow: true, lx: -12, ly: 4, anchor: "end" },
    { id: "start", g: "deep", a: "arms", d: 6.0, e: 3.2, name: "START (1991)", hollow: true, lx: -12, ly: -8, anchor: "end" },
    { id: "montreal", g: "env", a: "env", d: 1.4, e: 0.5, name: "Montreal Protocol (1987)", lx: 12, ly: 5 },
    { id: "gatt", g: "trade", a: "trade", d: 3.0, e: 3.2, name: "GATT, early rounds", lx: 12, ly: 16 },
    { id: "wto", g: "trade", a: "trade", d: 7.2, e: 7.6, name: "WTO, Uruguay Round (1994)", lx: -12, ly: -12, anchor: "end" },
    { id: "ec", g: "trade", a: "trade", d: 3.8, e: 4.6, name: "European Community", lx: -12, ly: -10, anchor: "end" },
    { id: "eu", g: "trade", a: "trade", d: 8.2, e: 8.6, name: "Maastricht + European Court (1992)", lx: -12, ly: -12, anchor: "end" }
  ];
  const notes = {
    seabed: "Maintained the status-quo trajectory: neither superpower had cost-effective plans for such weapons.",
    antarctic: "Status-quo treaty. Chayes and Chayes report no deviation in four decades.",
    space: "Status-quo treaty; tacit expectations of retaliation in kind also played a role.",
    salt1: "Froze ICBM launchers at the status quo, allowed more SLBMs, and barely restricted qualitative improvements.",
    salt2: "Let MIRVed ICBMs grow 40% and total weapons 50–70%: “remarkable compatibility” with planned programs (Goldblat).",
    abm: "Neither side could deploy a major system in 1972. As technology advanced, depth rose while enforcement weakened, and pressure followed.",
    inf: "Eliminated intermediate- and shorter-range missiles in Europe. Deep, but measured against a political system that no longer existed.",
    cfe: "Dramatically reduced conventional forces. The counterfactual is again a vanished Cold War trajectory.",
    start: "Cut delivery vehicles about 30% and warheads 40%. Deeper than SALT; how deep depends on the counterfactual.",
    montreal: "Codified CFC cuts polluters were voluntarily prepared to make; most cuts preceded ratification (Murdoch and Sandler; Barrett).",
    gatt: "Panels moved at a ponderous pace and could be blocked; sanctions were used once in GATT's history.",
    wto: "Deeper liberalization arrived together with automatic panels and automatic authorization to retaliate.",
    ec: "Before Maastricht.",
    eu: "States “chose to strengthen the Court's power to monitor and punish defections” (Burley and Mattli)."
  };
  const byId = Object.fromEntries(P.map(p => [p.id, p]));

  const arrows = svg.append("g").attr("fill", "none").attr("stroke-width", 1.8);
  const defs = svg.append("defs");
  Object.entries(area).forEach(([k, c]) => defs.append("marker").attr("id", `dm-arrow-${k}`)
    .attr("viewBox", "0 0 10 10").attr("refX", 8).attr("refY", 5).attr("markerWidth", 7).attr("markerHeight", 7)
    .attr("orient", "auto-start-reverse").append("path").attr("d", "M0,0 L10,5 L0,10 Z").attr("fill", c));
  const arrow = (from, to, k, cls) => arrows.append("path").attr("class", cls)
    .attr("d", `M${x(from[0])},${y(from[1])} Q${x((from[0] + to[0]) / 2 + 0.4)},${y((from[1] + to[1]) / 2 - 0.6)} ${x(to[0])},${y(to[1])}`)
    .attr("stroke", area[k]).attr("marker-end", `url(#dm-arrow-${k})`).attr("opacity", 0)
    .attr("stroke-dasharray", "600 600").attr("stroke-dashoffset", 600);
  const aGatt = arrow([3.25, 3.45], [6.95, 7.35], "trade", "a-trade");
  const aEc = arrow([4.05, 4.85], [7.95, 8.35], "trade", "a-trade");
  const abmTo = [4.6, 0.7];
  const aAbm = arrow([1.7, 3.85], abmTo, "arms", "a-abm");
  const abmLater = svg.append("g").attr("opacity", 0);
  abmLater.append("circle").attr("cx", x(abmTo[0])).attr("cy", y(abmTo[1])).attr("r", 6.5).attr("fill", t.bad)
    .attr("stroke", t.surface).attr("stroke-width", 2);
  lines(abmLater.append("text").attr("x", x(abmTo[0]) + 12).attr("y", y(abmTo[1]) - 8).attr("fill", t.ink).attr("font-size", 12.5),
    "ABM by the 1990s: deeper against today's|counterfactual, enforcement weaker → pressure");

  const pts = svg.append("g").selectAll("g").data(P).join("g")
    .attr("transform", d => `translate(${x(d.d)},${y(d.e)})`).attr("opacity", 0);
  pts.append("circle").attr("r", 7).attr("fill", d => d.hollow ? t.surface : area[d.a])
    .attr("stroke", d => d.hollow ? area[d.a] : t.surface).attr("stroke-width", d => d.hollow ? 2.5 : 2);
  pts.filter(d => d.hollow).append("text").attr("y", 4).attr("text-anchor", "middle").attr("font-size", 10)
    .attr("font-weight", 700).attr("fill", t.ink).text("?");
  pts.filter(d => d.g !== "status").append("text").attr("x", d => d.lx).attr("y", d => d.ly)
    .attr("text-anchor", d => d.anchor || "start").attr("fill", t.ink).attr("font-size", 12.5).text(d => d.name);
  hoverable(pts, d => `<b>${d.name}</b><br>${notes[d.id]}`);
  // one label for the status-quo trio
  const trio = svg.append("g").attr("opacity", 0);
  trio.append("path").attr("d", `M${x(0.65)},${y(1.85)} L${x(0.65)},${y(2.45)}`).attr("stroke", t.axis);
  lines(trio.append("text").attr("x", x(0.1)).attr("y", y(2.95)).attr("fill", t.ink).attr("font-size", 12.5),
    "Antarctic · Outer Space · Seabed|(keep the status quo)");

  const groups = {
    "ev-status": ["status"], "ev-salt": ["status", "salt"], "ev-abm": ["status", "salt", "abm"],
    "ev-deep": ["status", "salt", "abm", "deep"], "ev-montreal": ["status", "salt", "abm", "deep", "env"],
    "ev-trade": ["status", "salt", "abm", "deep", "env", "trade"]
  };
  const node = wrap.node();
  node.update = stepper("ev-", step => {
    const on = groups[step] || [];
    pts.transition().duration(600).attr("opacity", d => on.includes(d.g) ? 1 : 0)
      .style("pointer-events", d => on.includes(d.g) ? "all" : "none");
    trio.transition().duration(600).attr("opacity", on.includes("status") ? 1 : 0);
    legend.select(".leg-arms").transition().duration(600).attr("opacity", on.length ? 1 : 0);
    legend.select(".leg-env").transition().duration(600).attr("opacity", on.includes("env") ? 1 : 0);
    legend.select(".leg-trade").transition().duration(600).attr("opacity", on.includes("trade") ? 1 : 0);
    const showA = (sel, k) => sel.transition().duration(k ? 1100 : 300).attr("opacity", k ? 1 : 0).attr("stroke-dashoffset", k ? 0 : 600);
    showA(aAbm, on.includes("abm")); showA(aGatt, on.includes("trade")); showA(aEc, on.includes("trade"));
    abmLater.transition().delay(on.includes("abm") ? 700 : 0).duration(500).attr("opacity", on.includes("abm") ? 1 : 0);
  });
  return node;
}

// ───────────────────────── 2. What arms treaties permitted ─────────────────────
export function armsBars(d3) {
  const t = TOKENS.light, W = 860, H = 440, m = { l: 300, r: 70, t: 64, b: 46 };
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "Change in arsenals permitted by each treaty, as reported in the article.");
  const rows = [
    { g: "salt", label: "SALT I (1972) · ICBM launchers", v: 0, note: "frozen at the status quo" },
    { g: "salt", label: "SALT II (1979) · MIRVed ICBMs", v: 40, note: "+40%" },
    { g: "salt", label: "SALT II (1979) · all nuclear weapons", v: 50, hi: 70, note: "+50 to 70%" },
    { g: "deep", label: "START (1991) · delivery vehicles", v: -30, note: "about −30%" },
    { g: "deep", label: "START (1991) · warheads", v: -40, note: "−40%" },
    { g: "deep", label: "INF (1987) · intermediate-range missiles", v: -100, note: "eliminated", inside: true }
  ];
  const x = d3.scaleLinear([-100, 80], [m.l, W - m.r]);
  const yb = d3.scaleBand(rows.map(r => r.label), [m.t, H - m.b]).padding(0.38);
  svg.append("text").attr("x", 20).attr("y", 26).attr("fill", t.ink).attr("font-size", 15).attr("font-weight", 600)
    .text("How much did the treaty let arsenals change?");
  svg.append("text").attr("x", 20).attr("y", 44).attr("fill", t.muted).attr("font-size", 12)
    .text("Figures as reported in the article (ACDA; Goldblat)");
  svg.append("g").attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).tickValues([-100, -50, 0, 50]).tickFormat(d => (d > 0 ? "+" : "") + d + "%").tickSize(-(H - m.t - m.b)))
    .call(g => styleAxis(g, t, { grid: true })).call(g => g.select(".domain").remove());
  svg.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", m.t - 6).attr("y2", H - m.b).attr("stroke", t.ink2);
  const g = svg.append("g").selectAll("g").data(rows).join("g").attr("opacity", 0);
  g.append("text").attr("x", m.l - 14).attr("y", d => yb(d.label) + yb.bandwidth() / 2 + 4.5).attr("text-anchor", "end")
    .attr("fill", t.ink).attr("font-size", 13).text(d => d.label);
  const col = d => d.v >= 0 ? t.s2 : t.s1;
  const bw = Math.min(24, yb.bandwidth());
  const yy = d => yb(d.label) + (yb.bandwidth() - bw) / 2;
  const barPath = (x0, x1, yTop, h) => {
    const r = Math.min(4, Math.abs(x1 - x0));
    if (x1 >= x0) return `M${x0},${yTop} H${x1 - r} Q${x1},${yTop} ${x1},${yTop + r} V${yTop + h - r} Q${x1},${yTop + h} ${x1 - r},${yTop + h} H${x0} Z`;
    return `M${x0},${yTop} H${x1 + r} Q${x1},${yTop} ${x1},${yTop + r} V${yTop + h - r} Q${x1},${yTop + h} ${x1 + r},${yTop + h} H${x0} Z`;
  };
  const bars = g.append("path").attr("fill", col).attr("d", d => barPath(x(0), x(0), yy(d), bw));
  const ext = g.filter(d => d.hi).append("path").attr("fill", t.s2).attr("opacity", 0.35)
    .attr("d", d => barPath(x(d.v) + 2, x(d.v) + 2, yy(d), bw));
  g.filter(d => d.v === 0).append("circle").attr("cx", x(0)).attr("cy", d => yy(d) + bw / 2).attr("r", 5)
    .attr("fill", t.ink2).attr("stroke", t.surface).attr("stroke-width", 2);
  g.append("text").attr("x", d => d.inside ? x(d.v) + 10 : d.v === 0 ? x(0) + 12 : d.v > 0 ? x(d.hi || d.v) + 8 : x(d.v) - 8)
    .attr("text-anchor", d => d.v < 0 && !d.inside ? "end" : "start").attr("y", d => yy(d) + bw / 2 + 4.5)
    .attr("fill", d => d.inside ? "#fff" : t.ink).attr("font-size", 13).attr("font-weight", 600).text(d => d.note);
  const node = wrap.node();
  node.update = stepper("ar-", step => {
    const on = d => d.g === "salt" || step === "ar-deep";
    g.transition().duration(500).attr("opacity", d => on(d) ? 1 : 0);
    bars.transition().duration(900).attr("d", d => barPath(x(0), on(d) ? x(d.v) : x(0), yy(d), bw));
    ext.transition().duration(900).delay(500).attr("d", d => barPath(x(d.v) + 2, on(d) ? x(d.hi) : x(d.v) + 2, yy(d), bw));
  });
  return node;
}

// ───────────────────────── 3. GATT → WTO: enforcement gets teeth ───────────────
export function wtoCard(d3) {
  const wrap = d3.create("div").attr("class", "versus");
  wrap.append("div").attr("class", "versus-title").text("Deeper rules, sharper teeth");
  const rows = [
    ["Setting up a panel", "Open-ended: “inexorable delays”", "Within 9 months"],
    ["Concluding a panel", "No firm limit", "Within 18 months"],
    ["Adopting the ruling", "Consensus: each party to the dispute held a veto", "Automatic, unless a unanimous consensus rejects it"],
    ["Retaliation", "Used once in GATT's entire history", "Authorized automatically if the offending practice stays and no compensation is paid"]
  ];
  const tbl = wrap.append("div").attr("class", "versus-grid");
  tbl.append("div").attr("class", "vs-head");
  tbl.append("div").attr("class", "vs-head then").text("GATT");
  tbl.append("div").attr("class", "vs-head now").text("WTO (1995)");
  rows.forEach(([a, b, c]) => {
    tbl.append("div").attr("class", "vs-row").text(a);
    tbl.append("div").attr("class", "vs-cell then").text(b);
    tbl.append("div").attr("class", "vs-cell now").text(c);
  });
  wrap.append("div").attr("class", "versus-foot")
    .text("Rules from the article's account of the Uruguay Round (citing Bayard and Elliott 1994).");
  const node = wrap.node();
  node.update = stepper("wt-", step => wrap.classed("reveal", step === "wt-now"));
  return node;
}

// ───────────────────────── 4. Washington Naval Treaty: as announced vs as built ─
function hull(g, len, color, fill) {
  const h = 15, s = len / 250;
  const st = sel => sel.attr("fill", fill ? color : "none").attr("stroke", color)
    .attr("stroke-width", fill ? 0 : 1.4).attr("stroke-dasharray", fill ? null : "4 3");
  st(g.append("path").attr("d", `M0,1 L${len * 0.97},0 L${len},-5 L${len - 16 * s},${h} L${10 * s},${h} Z`));
  // deck structures as fractions of length: [start, width, height]
  [[0.30, 0.13, 10], [0.45, 0.07, 22], [0.56, 0.08, 30], [0.17, 0.06, 7], [0.68, 0.06, 7], [0.77, 0.06, 7]]
    .forEach(([a, w, hh]) => st(g.append("rect").attr("x", len * a).attr("y", -hh).attr("width", len * w).attr("height", hh).attr("rx", 1.5)));
  [[0.17, -1], [0.74, 1], [0.83, 1]].forEach(([a, dir]) => g.append("line")
    .attr("x1", len * a + (dir > 0 ? 0 : 0)).attr("x2", len * a + dir * len * 0.07).attr("y1", -4).attr("y2", -6)
    .attr("stroke", color).attr("stroke-width", 2).attr("stroke-dasharray", fill ? null : "3 2"));
  g.append("line").attr("x1", len * 0.6).attr("x2", len * 0.6).attr("y1", -30).attr("y2", -46)
    .attr("stroke", color).attr("stroke-width", 1.5);
}
export function navalBars(d3) {
  const t = TOKENS.light, W = 860, H = 500, m = { l: 220, r: 110, t: 70, b: 40 };
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "Warships that exceeded announced or permitted size, as reported in the article.");
  const ships = [
    { name: "Lexington & Saratoga", who: "United States", over: 9, note: "≈36,000 t against a 33,000 t cap" },
    { name: "Atago", who: "Japan", over: 20, note: "20% over its announced size" },
    { name: "Gorizia", who: "Italy", over: 20, note: "20% over its announced size" },
    { name: "Yamato", who: "Japan", over: 95, note: "95% heavier than announced; 18-inch guns, not 16" }
  ];
  svg.append("text").attr("x", 20).attr("y", 26).attr("fill", t.ink).attr("font-size", 15).attr("font-weight", 600)
    .text("The Washington Naval Treaty regime: ships as announced vs. as built");
  svg.append("text").attr("x", 20).attr("y", 44).attr("fill", t.muted).attr("font-size", 12)
    .text("Dashed outline = announced or permitted size; solid = as built. Figures as reported in the article (Kaufman; Goldman).");
  const base = 250;
  const yb = d3.scaleBand(ships.map(s => s.name), [m.t + 20, H - m.b]).padding(0.3);
  const rows = svg.append("g").selectAll("g").data(ships).join("g")
    .attr("transform", d => `translate(${m.l},${yb(d.name) + yb.bandwidth() - 10})`);
  rows.append("text").attr("x", -18).attr("y", -6).attr("text-anchor", "end").attr("fill", t.ink).attr("font-size", 14)
    .attr("font-weight", 600).text(d => d.name);
  rows.append("text").attr("x", -18).attr("y", 12).attr("text-anchor", "end").attr("fill", t.muted).attr("font-size", 12.5)
    .text(d => d.who);
  const built = rows.append("g").attr("class", "built");
  rows.each(function () { hull(d3.select(this).append("g"), base, t.ink2, false); });
  const pct = rows.append("text").attr("y", -2).attr("fill", t.ink).attr("font-size", 14).attr("font-weight", 700).attr("opacity", 0);
  const note = rows.append("text").attr("x", 0).attr("y", 36).attr("fill", t.ink2).attr("font-size", 12.5).attr("opacity", 0);
  const why = svg.append("g").attr("opacity", 0);
  lines(why.append("text").attr("x", W - 20).attr("y", 78).attr("text-anchor", "end").attr("fill", t.ink).attr("font-size", 13)
    .attr("font-style", "italic"), "“Naval base” and “fortification” were undefined.|Tonnage was not.");

  function drawBuilt(p) {
    built.selectAll("*").remove();
    built.each(function (d) {
      const len = base * (1 + d.over / 100 * p);
      hull(d3.select(this), len, t.s1, true);
    });
    pct.attr("x", d => base * (1 + d.over / 100 * p) + 14).text(d => `+${Math.round(d.over * p)}%`);
  }
  drawBuilt(0);
  note.text(d => d.note);
  const node = wrap.node();
  node.update = stepper("na-", step => {
    if (step === "na-limit") drawBuilt(0);
    if (step === "na-why") drawBuilt(1);
    pct.transition().duration(400).attr("opacity", step === "na-limit" ? 0 : 1);
    note.transition().duration(400).attr("opacity", step === "na-why" ? 1 : 0);
    why.transition().duration(500).attr("opacity", step === "na-why" ? 1 : 0);
  }, (step, p) => { if (step === "na-built") drawBuilt(ease(clamp(p * 1.7))); });
  return node;
}

// ───────────────────────── 5. Transparency × sanctions ─────────────────────────
export function txMatrix(d3) {
  const t = TOKENS.light, W = 860, H = 600, m = { l: 90, r: 24, t: 60, b: 64 };
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "Cases arranged by transparency and strength of sanctions, with outcomes.");
  const cw = (W - m.l - m.r) / 2, ch = (H - m.t - m.b) / 2;
  const qx = j => m.l + j * cw, qy = i => m.t + i * ch;
  [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([i, j]) => svg.append("rect").attr("x", qx(j) + 3).attr("y", qy(i) + 3)
    .attr("width", cw - 6).attr("height", ch - 6).attr("rx", 10).attr("fill", "#fffdf8").attr("stroke", t.grid));
  svg.append("text").attr("x", qx(0) + cw / 2).attr("y", H - m.b + 24).attr("text-anchor", "middle").attr("fill", t.muted).attr("font-size", 12.5).text("violations hard to see");
  svg.append("text").attr("x", qx(1) + cw / 2).attr("y", H - m.b + 24).attr("text-anchor", "middle").attr("fill", t.muted).attr("font-size", 12.5).text("violations easy to see");
  svg.append("text").attr("x", (W + m.l) / 2).attr("y", H - 14).attr("text-anchor", "middle").attr("fill", t.ink2).attr("font-size", 13.5).text("Transparency →");
  lines(svg.append("text").attr("x", m.l - 12).attr("y", qy(0) + ch / 2).attr("text-anchor", "end").attr("fill", t.muted).attr("font-size", 12.5), "costly|penalties");
  lines(svg.append("text").attr("x", m.l - 12).attr("y", qy(1) + ch / 2).attr("text-anchor", "end").attr("fill", t.muted).attr("font-size", 12.5), "little or|no penalty");
  svg.append("text").attr("x", m.l).attr("y", 30).attr("fill", t.ink2).attr("font-size", 13.5).text("Sanctions for violators ↑");
  svg.append("text").attr("x", W - m.r).attr("y", 30).attr("text-anchor", "end").attr("fill", t.muted).attr("font-size", 12)
    .text("Schematic placement of the article's cases");

  const cases = [
    { id: "wash", q: [1, 0], k: "fail", y: 0, name: "Washington Naval Treaty (1920s–30s)", out: "Violations mostly undetected, or unanswered" },
    { id: "fish", q: [1, 0], k: "fail", y: 1, name: "Fisheries commissions (pre-200-mile zones)", out: "Monitoring catches was costly; rules widely flouted" },
    { id: "marpol1", q: [1, 0], k: "fail", y: 2, name: "Oil discharge rules (1954–78)", out: "Discharges 3 to 30 times the legal limit" },
    { id: "med", q: [1, 1], k: "fail", y: 0, name: "Mediterranean Plan", out: "No meaningful limits, no enforcement: pollution rose" },
    { id: "marpol2", q: [0, 1], k: "win", y: 0, name: "Tanker equipment rules (MARPOL, 1978)", out: "Detention in port; compliance “almost perfect”" },
    { id: "fish95", q: [0, 1], k: "win", y: 1, name: "North Atlantic fisheries accord (1995)", out: "Elaborate verification plus stiff fines" },
    { id: "gatt301", q: [0, 1], k: "win", y: 2, name: "GATT under U.S. Section 301", out: "U.S. retaliated, or threatened to, in 50% of cases" }
  ];
  const cg = svg.append("g").selectAll("g").data(cases).join("g")
    .attr("transform", d => `translate(${qx(d.q[1]) + 22},${qy(d.q[0]) + 34 + d.y * 70})`).attr("opacity", 0);
  cg.append("circle").attr("cx", 9).attr("cy", 5).attr("r", 10).attr("fill", d => d.k === "win" ? t.good : t.bad);
  cg.append("text").attr("x", 9).attr("y", 9.5).attr("text-anchor", "middle").attr("fill", "#fff").attr("font-size", 12.5)
    .attr("font-weight", 700).text(d => d.k === "win" ? "✓" : "✗");
  cg.append("text").attr("x", 28).attr("y", 9).attr("fill", t.ink).attr("font-size", 13.5).attr("font-weight", 600).text(d => d.name);
  cg.append("text").attr("x", 28).attr("y", 27).attr("fill", t.ink2).attr("font-size", 12.5).text(d => d.out);
  const empty = svg.append("g").attr("opacity", 0);
  lines(empty.append("text").attr("x", qx(0) + cw / 2).attr("y", qy(0) + ch / 2 - 10).attr("text-anchor", "middle")
    .attr("fill", t.muted).attr("font-size", 13).attr("font-style", "italic"), "A penalty no one can trigger:|you cannot punish what you cannot see");
  lines(empty.append("text").attr("x", qx(1) + cw / 2).attr("y", qy(1) + 2 * 70 + 40).attr("text-anchor", "middle")
    .attr("fill", t.muted).attr("font-size", 13).attr("font-style", "italic"), "Transparency alone: “the benefits of cheating|are too great to be offset by transparency alone”");
  const arrowG = svg.append("g").attr("opacity", 0);
  arrowG.append("path").attr("d", `M${qx(1) - 34},${qy(1) + 20} Q${qx(1) - 6},${qy(1) + 6} ${qx(1) + 30},${qy(1) - 16}`)
    .attr("fill", "none").attr("stroke", t.accent).attr("stroke-width", 2.5).attr("marker-end", "url(#tx-arrow)");
  svg.append("defs").append("marker").attr("id", "tx-arrow").attr("viewBox", "0 0 10 10").attr("refX", 8).attr("refY", 5)
    .attr("markerWidth", 7).attr("markerHeight", 7).attr("orient", "auto").append("path").attr("d", "M0,0 L10,5 L0,10 Z").attr("fill", t.accent);
  arrowG.append("text").attr("x", qx(1) - 20).attr("y", qy(1) - 22).attr("text-anchor", "end").attr("fill", t.accent)
    .attr("font-size", 14).attr("font-weight", 700).attr("font-style", "italic").text("“After detection — what?”");

  const node = wrap.node();
  node.update = stepper("tx-", step => {
    const show = d => step === "tx-fail" ? d.k === "fail" : step === "tx-win" || step === "tx-ikle" ? true : false;
    cg.transition().duration(500).attr("opacity", d => show(d) ? 1 : 0);
    empty.transition().duration(500).attr("opacity", step === "tx-win" || step === "tx-ikle" ? 1 : 0);
    arrowG.transition().duration(600).attr("opacity", step === "tx-ikle" ? 1 : 0);
  });
  return node;
}

// ───────────────────────── 6. MARPOL: the tanker ───────────────────────────────
export function tanker(d3) {
  const W = 1000, H = 560;
  const wrap = d3.create("div").attr("class", "viz tanker-art");
  const svg = wrap.append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img")
    .attr("aria-label", "Illustration of an oil tanker under discharge rules and under equipment rules.")
    .style("font-family", "system-ui, sans-serif");
  const defs = svg.append("defs");
  const g1 = defs.append("linearGradient").attr("id", "tk-sky").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 1);
  [[0, "#0f1b2d"], [0.7, "#2a3550"], [1, "#6b4e5c"]].forEach(([o, c]) => g1.append("stop").attr("offset", o).attr("stop-color", c));
  const g2 = defs.append("linearGradient").attr("id", "tk-sea").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 1);
  [[0, "#1d3550"], [1, "#0a1522"]].forEach(([o, c]) => g2.append("stop").attr("offset", o).attr("stop-color", c));
  svg.append("rect").attr("width", W).attr("height", H).attr("fill", "url(#tk-sky)");
  svg.append("circle").attr("cx", 680).attr("cy", 84).attr("r", 30).attr("fill", "#f3ead9").attr("opacity", .85);
  svg.append("rect").attr("y", 330).attr("width", W).attr("height", H - 330).attr("fill", "url(#tk-sea)");
  const waves = svg.append("g").attr("stroke", "#3d5c7d").attr("stroke-width", 1.4).attr("fill", "none").attr("opacity", .6);
  d3.range(9).forEach(i => waves.append("path").attr("class", "wave")
    .attr("d", d3.range(0, 1040, 40).map((x, j) => `${j ? "L" : "M"}${x},${360 + i * 22 + (j % 2 ? 3 : -3)}`).join(" ")));

  // the port (right) appears in the last step
  const port = svg.append("g").attr("opacity", 0);
  port.append("rect").attr("x", 760).attr("y", 300).attr("width", 240).attr("height", 40).attr("fill", "#3a3f47");
  [790, 860, 930].forEach(x => {
    port.append("line").attr("x1", x).attr("x2", x).attr("y1", 140).attr("y2", 300).attr("stroke", "#c9a24a").attr("stroke-width", 4);
    port.append("line").attr("x1", x - 50).attr("x2", x + 20).attr("y1", 150).attr("y2", 150).attr("stroke", "#c9a24a").attr("stroke-width", 4);
  });
  port.append("text").attr("x", 860).attr("y", 128).attr("text-anchor", "middle").attr("fill", "#f3ead9").attr("font-size", 13)
    .attr("letter-spacing", 2).text("PORT INSPECTION");

  const ship = svg.append("g").attr("class", "ship").attr("transform", "translate(110,0)");
  const slick = ship.append("g").attr("opacity", 0);
  d3.range(14).forEach(i => slick.append("ellipse").attr("cx", -20 - i * 34).attr("cy", 352 + (i % 3) * 6)
    .attr("rx", 30 + i * 3).attr("ry", 7 + i * .6).attr("fill", "#050505").attr("opacity", 0.75 - i * 0.04));
  ship.append("path").attr("d", "M0,250 H560 L600,250 L580,345 H30 Z").attr("fill", "#7a1f2a").attr("stroke", "#2a0c10");
  ship.append("rect").attr("x", 0).attr("y", 238).attr("width", 600).attr("height", 14).attr("fill", "#3b3f46");
  ship.append("rect").attr("x", 20).attr("y", 178).attr("width", 86).attr("height", 62).attr("fill", "#e7e2d6");
  ship.append("rect").attr("x", 34).attr("y", 150).attr("width", 56).attr("height", 30).attr("fill", "#e7e2d6");
  ship.append("rect").attr("x", 70).attr("y", 112).attr("width", 18).attr("height", 40).attr("fill", "#2b2f36");
  d3.range(5).forEach(i => ship.append("rect").attr("x", 32 + i * 14).attr("y", 190).attr("width", 8).attr("height", 8).attr("fill", "#f5c25c"));
  // cargo tanks (cutaway)
  const tanks = ship.append("g").attr("class", "tanks");
  const cells = d3.range(8).map(i => ({ i, x: 130 + i * 56, ballast: i % 3 === 1 }));
  tanks.selectAll("rect").data(cells).join("rect").attr("x", d => d.x).attr("y", 262).attr("width", 50).attr("height", 70)
    .attr("rx", 3).attr("fill", "#1a1410").attr("stroke", "#c9a24a").attr("stroke-opacity", .5);
  const tankLab = ship.append("g").attr("opacity", 0);
  tankLab.append("rect").attr("x", 130).attr("y", 204).attr("width", 14).attr("height", 14).attr("fill", "#3987e5");
  tankLab.append("text").attr("x", 150).attr("y", 216).attr("fill", "#f3ead9").attr("font-size", 13).text("segregated ballast tanks: seawater never touches oil");

  const cap = svg.append("g").attr("transform", "translate(40,34)");
  const capTitle = cap.append("text").attr("fill", "#e4c779").attr("font-size", 13).attr("letter-spacing", 2);
  const capBig = cap.append("text").attr("y", 44).attr("fill", "#f3ead9").attr("font-size", 34).attr("font-family", DISPLAY).attr("font-weight", 700);
  const capSmall = cap.append("text").attr("y", 72).attr("fill", "#c9bba3").attr("font-size", 14.5);
  const stamp = svg.append("g").attr("transform", "translate(470,170) rotate(-10)").attr("opacity", 0);
  stamp.append("rect").attr("x", -120).attr("y", -34).attr("width", 240).attr("height", 62).attr("rx", 6)
    .attr("fill", "none").attr("stroke", "#e66767").attr("stroke-width", 4);
  stamp.append("text").attr("text-anchor", "middle").attr("y", 10).attr("fill", "#e66767").attr("font-size", 34)
    .attr("font-weight", 800).attr("letter-spacing", 4).text("DETAINED");
  const meter = svg.append("g").attr("transform", "translate(560,470)").attr("opacity", 0);
  meter.append("text").attr("fill", "#c9bba3").attr("font-size", 13).attr("letter-spacing", 1.5).text("OPPORTUNITY COST OF DETENTION");
  const meterV = meter.append("text").attr("y", 40).attr("fill", "#e4c779").attr("font-size", 34).attr("font-weight", 700)
    .style("font-variant-numeric", "tabular-nums");

  const node = wrap.node();
  node.update = stepper("tk-", step => {
    const caps = {
      "tk-discharge": ["1954–1978 · DISCHARGE RULES", "3–30× the legal limit", "Oil discharged at sea is hard to see and cheap to deny."],
      "tk-sbt": ["1978 · EQUIPMENT RULES", "Install segregated ballast tanks", "Costly, but visible to any inspector in any port."],
      "tk-port": ["THE SANCTION THAT BITES", "Detained in port", "“Compliance is almost perfect.” (Mitchell)"]
    }[step];
    capTitle.text(caps[0]); capBig.text(caps[1]); capSmall.text(caps[2]);
    slick.transition().duration(800).attr("opacity", step === "tk-discharge" ? 1 : 0);
    tanks.selectAll("rect").transition().duration(800)
      .attr("fill", d => step !== "tk-discharge" && d.ballast ? "#3987e5" : "#1a1410");
    tankLab.transition().duration(600).attr("opacity", step === "tk-sbt" ? 1 : 0);
    ship.transition().duration(1400).ease(d3.easeCubicInOut)
      .attr("transform", step === "tk-port" ? "translate(250,0)" : "translate(110,0)");
    port.transition().duration(900).attr("opacity", step === "tk-port" ? 1 : 0);
    stamp.transition().delay(step === "tk-port" ? 900 : 0).duration(300).attr("opacity", step === "tk-port" ? 1 : 0);
    meter.transition().duration(500).attr("opacity", step === "tk-port" ? 1 : 0);
  }, (step, p) => {
    if (step === "tk-port") meterV.text(`$${fmt(Math.round(clamp(p * 1.6) * 20000 / 100) * 100)} / day`);
  });
  return node;
}
