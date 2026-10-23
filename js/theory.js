// Charts for the argument's theoretical core. Each factory returns a node
// with .update(step, progress) for scroll-driven use; some also expose
// setters for the hands-on "lab" panels.

import * as M from "./model.js";
import { TOKENS, frame, styleAxis, hoverable, stepper, clamp, ease, fmt, lines, DISPLAY, SERIF } from "./ui.js";

// ───────────────────────── 1. Mistakes vs difficulty ─────────────────────────
export function mistakesChart(d3) {
  const t = TOKENS.dark, W = 760, H = 520, m = { l: 74, r: 34, t: 64, b: 78 };
  const { wrap, svg } = frame(d3, W, H, "dark");
  svg.attr("aria-label", "Mistakes per concert against difficulty of the repertoire, for full and cut rehearsals.");
  const x = d3.scaleLinear([0, 10], [m.l, W - m.r]);
  const y = d3.scaleLinear([0, 20], [H - m.b, m.t]);
  const full = d => 1 + 0.03 * d * d, cut = d => 1 + 0.25 * d * d;

  const gx = svg.append("g").attr("transform", `translate(0,${H - m.b})`).attr("opacity", 0)
    .call(d3.axisBottom(x).ticks(0).tickSizeOuter(0)).call(g => styleAxis(g, t));
  const gy = svg.append("g").attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-(W - m.l - m.r))).call(g => styleAxis(g, t, { grid: true }))
    .call(g => g.select(".domain").remove());
  const composers = svg.append("g").attr("opacity", 0);
  [[1.2, "Folk tunes"], [2.8, "Haydn"], [5.4, "Beethoven"], [8, "Mahler"]].forEach(([d, n]) =>
    composers.append("text").attr("x", x(d)).attr("y", H - m.b + 22).attr("text-anchor", "middle")
      .attr("fill", t.muted).attr("font-size", 12.5).text(n));
  const xTitle = svg.append("text").attr("x", W - m.r).attr("y", H - 22).attr("text-anchor", "end")
    .attr("fill", t.ink2).attr("font-size", 14).attr("opacity", 0).text("Difficulty of the repertoire →");
  const yTitle = svg.append("text").attr("x", m.l - 8).attr("y", m.t - 22)
    .attr("fill", t.ink2).attr("font-size", 14).text("Mistakes per concert");

  const xs = d3.range(0, 10.001, 0.05);
  const line = f => d3.line().x(d => x(d)).y(d => y(Math.min(f(d), 20)))(xs.filter(d => f(d) <= 20.2));
  const pFull = svg.append("path").attr("d", line(full)).attr("fill", "none").attr("stroke", t.s1)
    .attr("stroke-width", 2.5).attr("stroke-linecap", "round");
  const pCut = svg.append("path").attr("d", line(cut)).attr("fill", "none").attr("stroke", t.s2)
    .attr("stroke-width", 2.5).attr("stroke-linecap", "round");
  [pFull, pCut].forEach(p => p.attr("stroke-dasharray", "1200 1200").attr("stroke-dashoffset", 1200));
  const lFull = svg.append("text").attr("x", x(10) - 4).attr("y", y(full(10)) - 12).attr("text-anchor", "end")
    .attr("fill", t.ink).attr("font-size", 13.5).attr("opacity", 0);
  const lCut = svg.append("text").attr("x", x(8.72) - 10).attr("y", y(20) + 4).attr("text-anchor", "end")
    .attr("fill", t.ink).attr("font-size", 13.5).attr("opacity", 0);

  // legend (always present for two series)
  const legend = svg.append("g").attr("transform", `translate(${m.l + 6},${m.t - 52})`).attr("opacity", 0);
  const legItems = [[t.s1, "Full rehearsals"], [t.s2, "75% fewer rehearsals"]].map(([c, s], i) => {
    const g = legend.append("g").attr("transform", `translate(${i * 210},0)`);
    g.append("line").attr("x2", 18).attr("y1", 0).attr("y2", 0).attr("stroke", c).attr("stroke-width", 3);
    return g.append("text").attr("x", 24).attr("y", 4.5).attr("fill", t.ink2).attr("font-size", 13).text(s);
  });

  const pts = [
    { k: "A", d0: 4.2, d: 2.8, v: 3.0, c: t.s2 },
    { k: "B", d0: 5.8, d: 8, v: 2.9, c: t.s1 }
  ];
  const dots = svg.append("g").selectAll("g").data(pts).join("g").attr("opacity", 0);
  dots.append("circle").attr("r", 9).attr("fill", d => d.c).attr("stroke", t.surface).attr("stroke-width", 3);
  const dotLab = dots.append("text").attr("y", -18).attr("text-anchor", "middle").attr("fill", t.ink)
    .attr("font-size", 13.5).attr("font-weight", 600);
  const place = (useD, dur = 900) => dots.transition("pos").duration(dur)
    .attr("transform", d => `translate(${x(useD ? d.d : d.d0)},${y(d.v)})`);
  dots.attr("transform", d => `translate(${x(d.d0)},${y(d.v)})`);

  const ghost = svg.append("g").attr("opacity", 0);
  ghost.append("line").attr("x1", x(8)).attr("x2", x(8)).attr("y1", y(3.4)).attr("y2", y(16.6))
    .attr("stroke", t.s2).attr("stroke-width", 1.5).attr("stroke-dasharray", "3 4");
  ghost.append("circle").attr("cx", x(8)).attr("cy", y(17)).attr("r", 9).attr("fill", "none")
    .attr("stroke", t.s2).attr("stroke-width", 2.5);
  const ghostLab = ghost.append("text").attr("x", x(8) - 16).attr("y", y(17) - 2).attr("text-anchor", "end")
    .attr("fill", t.ink).attr("font-size", 13.5);

  const terms = {
    music: { x: "Difficulty of the repertoire →", y: "Mistakes per concert",
      full: "Full rehearsals", cut: "75% fewer rehearsals",
      A: "District A · Haydn", B: "District B · Mahler",
      ghost: "District A attempts Mahler|≈17 mistakes: the concert|nobody schedules" },
    treaty: { x: "Depth of cooperation →", y: "Violations",
      full: "Strong enforcement", cut: "Weak enforcement",
      A: "Shallow treaty, weak enforcement", B: "Deep treaty, strong enforcement",
      ghost: "Deep treaty, weak enforcement|frequent violations: the treaty|nobody signs" }
  };
  const setTerms = (k, dur = 500) => {
    const T = terms[k];
    const swap = (sel, s) => sel.transition("swap").duration(dur / 2).style("fill-opacity", 0)
      .transition("swap").duration(dur / 2).style("fill-opacity", 1).on("start", function () {
        if (s.includes("|")) lines(d3.select(this), s, 1.25); else d3.select(this).text(s);
      });
    swap(xTitle, T.x); swap(yTitle, T.y); swap(lFull, T.full); swap(lCut, T.cut);
    swap(legItems[0], T.full); swap(legItems[1], T.cut);
    dotLab.each(function (d) { swap(d3.select(this), d.k === "A" ? T.A : T.B); });
    swap(ghostLab, T.ghost);
    composers.transition().duration(dur).attr("opacity", k === "music" && showComposers ? 1 : 0);
  };
  let showComposers = false;
  setTerms("music", 0);

  const order = ["mi-same", "mi-difficulty", "mi-curves", "mi-ghost", "mi-translate"];
  const at = (s, k) => order.indexOf(s) >= order.indexOf(k);
  const node = wrap.node();
  node.update = stepper("mi-", step => {
    dots.transition().duration(500).attr("opacity", 1);
    place(at(step, "mi-difficulty"));
    showComposers = at(step, "mi-difficulty") && !at(step, "mi-translate");
    gx.transition().duration(600).attr("opacity", at(step, "mi-difficulty") ? 1 : 0);
    xTitle.transition().duration(600).attr("opacity", at(step, "mi-difficulty") ? 1 : 0);
    const curves = at(step, "mi-curves");
    [lFull, lCut].forEach(s => s.transition().duration(600).attr("opacity", curves ? 1 : 0));
    legend.transition().duration(600).attr("opacity", curves ? 1 : 0);
    if (!curves) [pFull, pCut].forEach(p => p.attr("stroke-dashoffset", 1200));
    else if (step !== "mi-curves") [pFull, pCut].forEach(p => p.attr("stroke-dashoffset", 0));
    ghost.transition().duration(600).attr("opacity", at(step, "mi-ghost") ? 1 : 0);
    setTerms(step === "mi-translate" ? "treaty" : "music");
  }, (step, p) => {
    if (step === "mi-curves") [pFull, pCut].forEach(path => path.attr("stroke-dashoffset", 1200 * (1 - clamp(p * 1.8))));
  });
  return node;
}

// ───────────────────────── 2. The managerial "concert program" ─────────────────
export function programCard(d3) {
  const wrap = d3.create("div").attr("class", "program");
  wrap.append("div").attr("class", "program-kicker").text("The Managerial School presents");
  wrap.append("div").attr("class", "program-title").text("Symphony in Four Claims");
  wrap.append("div").attr("class", "program-sub")
    .text("Chayes & Chayes · Mitchell · Young · and others, ca. 1990–95");
  const mv = [
    ["I", "Allegro", "Compliance with international agreements is generally quite good."],
    ["II", "Andante", "That record was achieved with little attention to enforcement."],
    ["III", "Menuetto", "The compliance problems that remain are management problems, not enforcement problems."],
    ["IV", "Finale", "Management, not enforcement, holds the key to deeper cooperation in future."]
  ];
  const list = wrap.append("ol").attr("class", "program-movements");
  const items = list.selectAll("li").data(mv).join("li");
  items.append("span").attr("class", "mv-num").text(d => d[0]);
  const body = items.append("div");
  body.append("div").attr("class", "mv-tempo").text(d => d[1]);
  body.append("div").attr("class", "mv-text").text(d => d[2]);

  const inter = wrap.append("div").attr("class", "program-intermission");
  inter.append("div").attr("class", "program-kicker").text("Program notes · why states fall short");
  const cols = inter.append("div").attr("class", "program-cols");
  const c1 = cols.append("div"), c2 = cols.append("div");
  c1.append("h5").text("Diagnosis");
  c1.append("ul").selectAll("li").data([
    "Ambiguity and indeterminacy of treaties", "Limited capacity of states",
    "Social and economic change nobody controls"]).join("li").text(d => d);
  c2.append("h5").text("Prescription");
  c2.append("ul").selectAll("li").data([
    "Better dispute resolution", "Technical and financial assistance", "Transparency"])
    .join("li").text(d => d);
  const stamp = wrap.append("div").attr("class", "program-stamp")
    .html("Enforcement?<br><span>too costly · too political · too coercive</span>");

  const node = wrap.node();
  node.update = stepper("pr-", step => {
    const k = { "pr-1": 0, "pr-2": 1, "pr-3": 2, "pr-4": 3 }[step];
    items.classed("on", (_, i) => k === undefined ? true : i === k)
      .classed("dim", (_, i) => k !== undefined && i !== k);
    inter.classed("show", step === "pr-diagnosis" || step === "pr-enforce");
    list.classed("compact", step === "pr-diagnosis" || step === "pr-enforce");
    stamp.classed("show", step === "pr-enforce");
  });
  return node;
}

// ───────────────────────── 3. Selection: the treaties you never see ─────────────
export function selectionField(d3, { E = 8, lab = false } = {}) {
  const t = TOKENS.light, W = 820, H = 590, m = { l: 70, r: 26, t: 112, b: 58 };
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "Simulated pool of possible treaties by depth and punishment needed.");
  const pool = M.treatyPool();
  const x = d3.scaleLinear([0, 70], [m.l, W - m.r]);
  const y = d3.scaleLog([0.3, 300], [H - m.b, m.t + 34]);
  const yInf = m.t + 12;
  const yOf = d => Number.isFinite(d.L) ? y(clamp(d.L, 0.3, 300)) : yInf + (d.jitter - .5) * 14;
  const yRand = d => m.t + 34 + d.jitter * (H - m.b - m.t - 34);

  svg.append("g").attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d => d + "%").tickSizeOuter(0)).call(g => styleAxis(g, t));
  svg.append("text").attr("x", W - m.r).attr("y", H - 14).attr("text-anchor", "end").attr("fill", t.ink2)
    .attr("font-size", 13.5).text("Depth of cooperation: cut required relative to no treaty →");
  const gy = svg.append("g").attr("transform", `translate(${m.l},0)`).attr("opacity", lab ? 1 : 0)
    .call(d3.axisLeft(y).tickValues([0.3, 1, 3, 10, 30, 100, 300]).tickFormat(d3.format("~g"))
      .tickSize(-(W - m.l - m.r))).call(g => styleAxis(g, t, { grid: true }))
    .call(g => g.select(".domain").remove());
  gy.append("text").attr("x", -8).attr("y", yInf + 4).attr("text-anchor", "end").attr("fill", t.muted)
    .attr("font-size", 15).text("∞");
  const yTitle = svg.append("text").attr("x", m.l).attr("y", m.t - 14).attr("fill", t.ink2)
    .attr("font-size", 13.5).attr("opacity", lab ? 1 : 0)
    .text("Punishment needed to deter cheating (periods, log scale)");

  const thr = svg.append("g").attr("opacity", lab ? 1 : 0);
  const thrRect = thr.append("rect").attr("x", m.l).attr("width", W - m.l - m.r).attr("fill", t.s1).attr("opacity", .05);
  const thrLine = thr.append("line").attr("x1", m.l).attr("x2", W - m.r).attr("stroke", t.ink).attr("stroke-width", 1.5);
  const thrLab = thr.append("text").attr("x", W - m.r - 4).attr("text-anchor", "end").attr("fill", t.ink)
    .attr("font-size", 13).attr("font-weight", 600);

  const dots = svg.append("g").selectAll("circle").data(pool).join("circle")
    .attr("cx", d => x(d.r)).attr("cy", lab ? yOf : yRand).attr("r", 4.2)
    .attr("fill", t.muted).attr("stroke", t.surface).attr("stroke-width", 1.5);
  const xs = svg.append("g").selectAll("path").data(pool).join("path")
    .attr("d", "M-3.5,-3.5 L3.5,3.5 M3.5,-3.5 L-3.5,3.5").attr("stroke", t.bad).attr("stroke-width", 2)
    .attr("transform", d => `translate(${x(d.r)},${yOf(d)})`).attr("opacity", 0).attr("pointer-events", "none");
  hoverable(dots, { focus: false }, d => `<b>A possible treaty</b><br>Depth: ${fmt(d.r, 1)}% cut<br>` +
    `Temptation index: ${fmt(d.k / M.K, 2)}× typical<br>` +
    `Punishment needed: ${Number.isFinite(d.L) ? fmt(d.L, 1) + " periods" : "none is enough"}`);

  // stat tiles (top-left, where the cloud is empty)
  const tiles = svg.append("g").attr("transform", `translate(${m.l},18)`).attr("opacity", lab ? 1 : 0);
  const tile = (i, label) => {
    const g = tiles.append("g").attr("transform", `translate(${i * 230},0)`);
    g.append("text").attr("fill", t.ink2).attr("font-size", 12.5).text(label);
    return g.append("text").attr("y", 32).attr("fill", t.ink).attr("font-size", 28).attr("font-weight", 600);
  };
  const vSigned = tile(0, "Treaties signed");
  const vDepth = tile(1, "Average depth of signed treaties");
  const vComp = tile(2, "Compliance with signed treaties");
  const compNote = tiles.append("text").attr("x", 460).attr("y", 50).attr("fill", t.ink2).attr("font-size", 12);

  let mode = "pool";
  function render(Ecur, dur = 700) {
    const S = M.selection(pool, Ecur);
    const yy = Number.isFinite(Ecur) ? y(clamp(Ecur, 0.3, 300)) : m.t + 2;
    thrLine.transition().duration(dur).attr("y1", yy).attr("y2", yy);
    thrRect.transition().duration(dur).attr("y", yy).attr("height", Math.max(0, H - m.b - yy));
    thrLab.transition().duration(dur).attr("y", yy - 8);
    thrLab.text(`Enforcement states will supply: ${Number.isFinite(Ecur) ? fmt(Ecur) + " periods" : "unlimited"}`);
    const signed = d => d.L <= Ecur;
    const broken = d => signed(d) && d.noise < 0.04;
    dots.transition().duration(dur)
      .attr("cy", mode === "pool" ? yRand : yOf)
      .attr("fill", d => mode === "pool" || mode === "need" ? t.muted : signed(d) ? t.s1 : t.muted)
      .attr("opacity", d => signed(d) || mode === "pool" || mode === "need" ? 0.9
        : mode === "hidden" || mode === "lab-all" ? 0.3 : 0.15);
    xs.transition().duration(dur).attr("opacity", d =>
      (mode === "comply" || mode === "hidden" || mode === "lab") && broken(d) ? 1
        : (mode === "hidden" || mode === "lab-all") && !signed(d) ? 0.9 : 0);
    vSigned.text(`${S.signed.length} of ${pool.length}`);
    vDepth.text(`${fmt(S.depth, 1)}%`);
    if (mode === "hidden" || mode === "lab-all") {
      vComp.text(`${fmt(100 * S.complianceAll)}%`);
      compNote.text("…if states had signed every treaty");
    } else {
      vComp.text(S.signed.length ? `${fmt(100 * S.compliance)}%` : "–");
      compNote.text("violations: ambiguity, capacity, shocks");
    }
    return S;
  }

  const node = wrap.node();
  node.update = stepper("se-", step => {
    mode = { "se-pool": "pool", "se-need": "need", "se-line": "need", "se-select": "select",
      "se-comply": "comply", "se-hidden": "hidden" }[step];
    gy.transition().duration(600).attr("opacity", mode === "pool" ? 0 : 1);
    yTitle.transition().duration(600).attr("opacity", mode === "pool" ? 0 : 1);
    thr.transition().duration(600).attr("opacity", step === "se-pool" || step === "se-need" ? 0 : 1);
    tiles.transition().duration(600).attr("opacity", ["se-select", "se-comply", "se-hidden"].includes(step) ? 1 : 0);
    vComp.attr("opacity", step === "se-select" ? 0 : 1);
    compNote.attr("opacity", step === "se-select" ? 0 : 1);
    render(E);
  });
  node.setE = (Ecur, showAll = false) => { mode = showAll ? "lab-all" : "lab"; return render(Ecur, 250); };
  if (lab) { mode = "lab"; render(E, 0); }
  node.pool = pool;
  return node;
}

// Two small companion charts for the selection lab (no dual axes: two charts).
export function selectionCurves(d3, pool) {
  const t = TOKENS.light;
  const Es = d3.range(0, 101, 1);
  const data = Es.map(E => ({ E, ...M.selection(pool, E) })).filter(d => d.signed.length);
  const wrap = d3.create("div").attr("class", "viz small-multiples");
  const mk = (title, acc, domain, fmtY, color) => {
    const W = 400, H = 230, m = { l: 52, r: 20, t: 34, b: 40 };
    const svg = wrap.append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img")
      .attr("aria-label", title).style("font-family", "system-ui, sans-serif");
    const x = d3.scaleLinear([0, 100], [m.l, W - m.r]), y = d3.scaleLinear(domain, [H - m.b, m.t]);
    svg.append("g").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
      .call(g => styleAxis(g, t));
    svg.append("g").attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(4).tickFormat(fmtY).tickSize(-(W - m.l - m.r)))
      .call(g => styleAxis(g, t, { grid: true })).call(g => g.select(".domain").remove());
    svg.append("text").attr("x", m.l).attr("y", 18).attr("fill", t.ink).attr("font-size", 14)
      .attr("font-weight", 600).text(title);
    svg.append("text").attr("x", W - m.r).attr("y", H - 6).attr("text-anchor", "end").attr("fill", t.muted)
      .attr("font-size", 11.5).text("Enforcement states will supply (periods) →");
    svg.append("path").datum(data).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2)
      .attr("stroke-linejoin", "round").attr("d", d3.line().x(d => x(d.E)).y(d => y(acc(d))));
    const cursor = svg.append("g");
    cursor.append("line").attr("y1", m.t).attr("y2", H - m.b).attr("stroke", t.axis);
    cursor.append("circle").attr("r", 5).attr("fill", color).attr("stroke", t.surface).attr("stroke-width", 2);
    const lab = cursor.append("text").attr("x", 8).attr("fill", t.ink).attr("font-size", 13).attr("font-weight", 600);
    return E => {
      const d = data.reduce((a, b) => Math.abs(b.E - E) < Math.abs(a.E - E) ? b : a);
      cursor.attr("transform", `translate(${x(d.E)},0)`);
      cursor.select("circle").attr("cy", y(acc(d)));
      lab.attr("y", y(acc(d)) - 10).attr("text-anchor", d.E > 70 ? "end" : "start")
        .attr("x", d.E > 70 ? -8 : 8).text(fmtY(acc(d)));
    };
  };
  const a = mk("Observed compliance", d => d.compliance, [0, 1], d3.format(".0%"), t.s1);
  const b = mk("Average depth of what gets signed", d => d.depth, [0, 40], d => d3.format(".0f")(d) + "%", t.s2);
  const node = wrap.node();
  node.setE = E => { a(E); b(E); };
  return node;
}

// ───────────────────────── 4. Measuring depth against a counterfactual ──────────
export function depthChart(d3) {
  const t = TOKENS.light, W = 820, H = 500, m = { l: 62, r: 150, t: 54, b: 48 };
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "Illustrative emissions path with two counterfactuals and a treaty commitment.");
  const x = d3.scaleLinear([1960, 2000], [m.l, W - m.r]);
  const y = d3.scaleLinear([0, 130], [H - m.b, m.t]);
  const rand = M.rng(3);
  const noise = d3.range(1960, 2001).map(() => (rand() - .5) * 4);
  const scen = {
    rising: {
      hist: yr => 50 + 1.6 * (yr - 1960), slope: 1.6, cut: 0.2,
      label: "A rising pollutant"
    },
    falling: {
      hist: yr => yr <= 1974 ? 60 + 2.4 * (yr - 1960) : 93.6 - 2.1 * (yr - 1974), slope: -2.1, cut: 0.3,
      label: "A pollutant already in decline"
    }
  };
  const SIGN = 1985, DUE = 1995;
  const build = s => {
    const S = scen[s];
    const base = S.hist(SIGN);
    const hist = d3.range(1960, SIGN + 1).map((yr, i) => ({ yr, v: S.hist(yr) + noise[i] }));
    const sq = [{ yr: SIGN, v: base }, { yr: 2000, v: base }];
    const tr = [{ yr: SIGN, v: base }, { yr: 2000, v: base + S.slope * (2000 - SIGN) }];
    const target = base * (1 - S.cut);
    const treaty = [{ yr: SIGN, v: base }, { yr: DUE, v: target }, { yr: 2000, v: target }];
    const trendAt = base + S.slope * (DUE - SIGN);
    // what actually happened: for the declining case, the trend simply continued
    const after = d3.range(SIGN, 2001).map((yr, i) => ({ yr,
      v: s === "falling" ? base + S.slope * (yr - SIGN) + noise[i + 25] * .6
        : Math.max(target, base + (target - base) * (yr - SIGN) / (DUE - SIGN)) + noise[i + 25] * .6 }));
    return { S, base, hist, sq, tr, treaty, target, trendAt, after,
      depthSQ: 1 - target / base, depthTR: 1 - target / trendAt };
  };

  svg.append("g").attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")).tickSizeOuter(0)).call(g => styleAxis(g, t));
  svg.append("g").attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-(W - m.l - m.r))).call(g => styleAxis(g, t, { grid: true }))
    .call(g => g.select(".domain").remove());
  const title = svg.append("text").attr("x", m.l).attr("y", 22).attr("fill", t.ink).attr("font-size", 15).attr("font-weight", 600);
  svg.append("text").attr("x", m.l).attr("y", 40).attr("fill", t.muted).attr("font-size", 12)
    .text("Emissions, index · illustrative data");
  const signLine = svg.append("g");
  signLine.append("line").attr("x1", x(SIGN)).attr("x2", x(SIGN)).attr("y1", m.t).attr("y2", H - m.b)
    .attr("stroke", t.axis);
  signLine.append("text").attr("x", x(SIGN) + 6).attr("y", m.t + 12).attr("fill", t.ink2).attr("font-size", 12.5)
    .text("treaty signed");

  const ln = d3.line().x(d => x(d.yr)).y(d => y(d.v));
  const gap = svg.append("path").attr("fill", t.s1).attr("opacity", 0);
  const pHist = svg.append("path").attr("fill", "none").attr("stroke", t.ink).attr("stroke-width", 2);
  const pAfter = svg.append("path").attr("fill", "none").attr("stroke", t.ink).attr("stroke-width", 2).attr("opacity", 0);
  const pSQ = svg.append("path").attr("fill", "none").attr("stroke", t.muted).attr("stroke-width", 2)
    .attr("stroke-dasharray", "6 5").attr("opacity", 0);
  const pTR = svg.append("path").attr("fill", "none").attr("stroke", t.ink2).attr("stroke-width", 2)
    .attr("stroke-dasharray", "2 4").attr("stroke-linecap", "round").attr("opacity", 0);
  const pTreaty = svg.append("path").attr("fill", "none").attr("stroke", t.s1).attr("stroke-width", 2.5).attr("opacity", 0);
  const lab = cls => svg.append("text").attr("class", cls).attr("x", x(2000) + 8).attr("fill", t.ink)
    .attr("font-size", 12.5).attr("opacity", 0);
  const lSQ = lab("l-sq"), lTR = lab("l-tr"), lTreaty = lab("l-treaty"), lAfter = lab("l-after");
  const read = svg.append("g").attr("transform", `translate(${x(1962)},${m.t + 18})`).attr("opacity", 0);
  read.append("text").attr("fill", t.ink2).attr("font-size", 12.5).text("Depth of the treaty, measured against…");
  const r1 = read.append("text").attr("y", 26).attr("fill", t.ink).attr("font-size", 17).attr("font-weight", 600);
  const r2 = read.append("text").attr("y", 50).attr("fill", t.ink).attr("font-size", 17).attr("font-weight", 600);

  let cur = "rising";
  function draw(s, show, dur = 800) {
    const B = build(s);
    title.text(B.S.label);
    pHist.transition().duration(dur).attr("d", ln(B.hist));
    pSQ.transition().duration(dur).attr("d", ln(B.sq)).attr("opacity", show.sq ? 1 : 0);
    pTR.transition().duration(dur).attr("d", ln(B.tr)).attr("opacity", show.tr ? 1 : 0);
    pTreaty.transition().duration(dur).attr("d", ln(B.treaty)).attr("opacity", show.treaty ? 1 : 0);
    pAfter.transition().duration(dur).attr("d", ln(B.after)).attr("opacity", show.after ? 1 : 0);
    const area = d3.area().x(d => x(d.yr)).y0(d => y(d.cf)).y1(d => y(d.tv));
    const pts = d3.range(SIGN, 2001).map(yr => ({ yr,
      cf: B.base + B.S.slope * (yr - SIGN),
      tv: yr >= DUE ? B.target : B.base + (B.target - B.base) * (yr - SIGN) / (DUE - SIGN) }));
    gap.transition().duration(dur).attr("d", area(pts)).attr("opacity", show.treaty ? 0.1 : 0);
    const yEnd = arr => y(arr[arr.length - 1].v);
    const lbl = [[lSQ, yEnd(B.sq), "No treaty: status quo"], [lTR, yEnd(B.tr), "No treaty: trend"],
      [lTreaty, yEnd(B.treaty), "Treaty commitment"]];
    // keep end labels from colliding
    const sorted = lbl.slice().sort((a, b) => a[1] - b[1]);
    for (let i = 1; i < sorted.length; i++) if (sorted[i][1] - sorted[i - 1][1] < 16) sorted[i][1] = sorted[i - 1][1] + 16;
    const vis = { "l-sq": show.sq, "l-tr": show.tr, "l-treaty": show.treaty };
    lbl.forEach(([sel, yy, txt]) => sel.text(txt).transition().duration(dur).attr("y", yy + 4)
      .attr("opacity", vis[sel.attr("class")] ? 1 : 0));
    lAfter.text("What happened").transition().duration(dur).attr("y", yEnd(B.after) + 20).attr("opacity", show.after ? 1 : 0);
    r1.text(`the status quo: ${fmt(100 * B.depthSQ)}%`);
    r2.text(`the trend: ${fmt(100 * Math.max(0, B.depthTR))}%`);
    read.transition().duration(dur).attr("opacity", show.treaty ? 1 : 0);
  }
  draw("rising", {}, 0);
  const node = wrap.node();
  node.update = stepper("de-", step => {
    const s = step === "de-decline" || step === "de-comply" ? "falling" : "rising";
    draw(s, {
      sq: step !== "de-history", tr: !["de-history", "de-sq"].includes(step),
      treaty: ["de-treaty", "de-decline", "de-comply"].includes(step), after: step === "de-comply"
    });
  });
  return node;
}

// ───────────────────────── 5. The prisoners' dilemma at two tariff levels ───────
export function pdMatrix(d3) {
  const t = TOKENS.light, W = 720, H = 540;
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "Two-by-two payoff matrix for a 30 percent tariff treaty.");
  const r = 30;
  const R = M.utility(r, r), T = M.utility(0, r), S = M.utility(r, 0), P = 0;
  const cells = [
    { i: 0, j: 0, a: R, b: R }, { i: 0, j: 1, a: S, b: T },
    { i: 1, j: 0, a: T, b: S }, { i: 1, j: 1, a: P, b: P }];
  const x0 = 230, y0 = 150, cw = 210, ch = 140;
  svg.append("text").attr("x", x0 + cw).attr("y", 60).attr("text-anchor", "middle").attr("fill", t.ink)
    .attr("font-size", 15).attr("font-weight", 600).text("State B");
  svg.append("text").attr("x", 60).attr("y", y0 + ch).attr("text-anchor", "middle").attr("fill", t.ink)
    .attr("font-size", 15).attr("font-weight", 600).attr("transform", `rotate(-90 60 ${y0 + ch})`).text("State A");
  const heads = ["Keeps the treaty|tariff 70%", "Defects|tariff 100%"];
  heads.forEach((h, k) => {
    lines(svg.append("text").attr("x", x0 + k * cw + cw / 2).attr("y", y0 - 46).attr("text-anchor", "middle")
      .attr("fill", t.ink2).attr("font-size", 13.5), h);
    lines(svg.append("text").attr("x", x0 - 16).attr("y", y0 + k * ch + ch / 2 - 6).attr("text-anchor", "end")
      .attr("fill", t.ink2).attr("font-size", 13.5), h);
  });
  const g = svg.append("g").selectAll("g").data(cells).join("g")
    .attr("transform", d => `translate(${x0 + d.j * cw},${y0 + d.i * ch})`);
  const bg = g.append("rect").attr("width", cw - 4).attr("height", ch - 4).attr("rx", 10)
    .attr("fill", "#fffdf8").attr("stroke", t.grid).attr("stroke-width", 1.5);
  g.append("text").attr("x", 22).attr("y", 52).attr("fill", t.ink2).attr("font-size", 12).text("A gets");
  g.append("text").attr("x", 22).attr("y", 82).attr("fill", t.ink).attr("font-size", 26).attr("font-weight", 600)
    .text(d => fmt(d.a));
  g.append("text").attr("x", cw - 26).attr("y", 52).attr("text-anchor", "end").attr("fill", t.ink2).attr("font-size", 12).text("B gets");
  g.append("text").attr("x", cw - 26).attr("y", 82).attr("text-anchor", "end").attr("fill", t.ink)
    .attr("font-size", 26).attr("font-weight", 600).text(d => fmt(d.b));
  const tag = g.append("text").attr("x", (cw - 4) / 2).attr("y", ch - 24).attr("text-anchor", "middle")
    .attr("fill", t.ink2).attr("font-size", 12.5).attr("font-style", "italic")
    .text(d => d.i === 0 && d.j === 0 ? "the treaty works" : d.i === 1 && d.j === 1 ? "trade war"
      : d.i === 1 ? "A exploits B" : "B exploits A");
  const arrows = svg.append("g").attr("opacity", 0).attr("stroke", t.s2).attr("stroke-width", 2.5)
    .attr("fill", "none").attr("stroke-linecap", "round");
  const arr = (x1, y1, x2, y2) => {
    arrows.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
    const a = Math.atan2(y2 - y1, x2 - x1), L = 10;
    arrows.append("path").attr("d", `M${x2 - L * Math.cos(a - .5)},${y2 - L * Math.sin(a - .5)} L${x2},${y2} L${x2 - L * Math.cos(a + .5)},${y2 - L * Math.sin(a + .5)}`);
  };
  arr(x0 + 36, y0 + 92, x0 + 36, y0 + ch + 30);
  arr(x0 + cw + 36, y0 + 92, x0 + cw + 36, y0 + ch + 30);
  arr(x0 + cw - 70, y0 + 98, x0 + cw + 60, y0 + 98);
  arr(x0 + cw - 70, y0 + ch + 98, x0 + cw + 60, y0 + ch + 98);
  const note = svg.append("text").attr("x", W / 2).attr("y", H - 46).attr("text-anchor", "middle")
    .attr("fill", t.ink).attr("font-size", 14).attr("opacity", 0);
  svg.append("text").attr("x", W / 2).attr("y", H - 18).attr("text-anchor", "middle").attr("fill", t.muted)
    .attr("font-size", 12).text("Payoffs per period for a 30% tariff cut, from the calibrated Appendix A model; no treaty = 0.");

  const node = wrap.node();
  node.update = stepper("pd-", step => {
    arrows.transition().duration(500).attr("opacity", step === "pd-dominant" ? 1 : 0);
    bg.transition().duration(500)
      .attr("fill", d => step === "pd-dominant" && d.i === 1 && d.j === 1 ? "#fbe3dc"
        : step === "pd-pareto" && d.i === d.j ? (d.i === 0 ? "#dceaf9" : "#fbe3dc") : "#fffdf8")
      .attr("stroke", d => step === "pd-pareto" && d.i === 0 && d.j === 0 ? t.s1 : t.grid);
    note.transition().duration(500).attr("opacity", step === "pd-matrix" ? 0 : 1)
      .text(step === "pd-dominant" ? "Whatever B does, A does better at 100% (and vice versa): both end up in the trade war."
        : step === "pd-pareto" ? "Yet both prefer the treaty (22 each) to the trade war (0 each)." : "");
  });
  return node;
}

// ───────────────────────── 6. Figure 1: treaty value vs temptation ──────────────
export function temptationChart(d3) {
  const t = TOKENS.light, W = 820, H = 520, m = { l: 70, r: 40, t: 48, b: 58 };
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "One-period utility of keeping a treaty versus cheating on it, by depth.");
  const x = d3.scaleLinear([0, 70], [m.l, W - m.r]);
  const y = d3.scaleLinear([0, 32], [H - m.b, m.t]);
  const rs = d3.range(0, 70.01, 0.5);
  const gx = svg.append("g").attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d => d + "%").tickSizeOuter(0)).call(g => styleAxis(g, t));
  const gy = svg.append("g").attr("transform", `translate(${m.l},0)`);
  gy.call(d3.axisLeft(y).ticks(5).tickSize(-(W - m.l - m.r))).call(g => styleAxis(g, t, { grid: true }))
    .call(g => g.select(".domain").remove());
  svg.append("text").attr("x", W - m.r).attr("y", H - 14).attr("text-anchor", "end").attr("fill", t.ink2)
    .attr("font-size", 13.5).text("Depth of the treaty: % tariff reduction →");
  svg.append("text").attr("x", m.l).attr("y", 24).attr("fill", t.ink2).attr("font-size", 13.5)
    .text("Utility in a single period (gain over no treaty)");

  const area = svg.append("path").attr("fill", t.s2).attr("opacity", 0);
  const pT = svg.append("path").attr("fill", "none").attr("stroke", t.s1).attr("stroke-width", 2.5);
  const pD = svg.append("path").attr("fill", "none").attr("stroke", t.s2).attr("stroke-width", 2.5).attr("opacity", 0);
  const lT = svg.append("text").attr("fill", t.ink).attr("font-size", 13.5).attr("text-anchor", "end");
  const lD = svg.append("text").attr("fill", t.ink).attr("font-size", 13.5).attr("text-anchor", "end").attr("opacity", 0);
  const legend = svg.append("g").attr("transform", `translate(${m.l + 14},${m.t + 8})`);
  [[t.s1, "Keep the treaty"], [t.s2, "Cheat on it (best one-period response)"]].forEach(([c, s], i) => {
    const g = legend.append("g").attr("transform", `translate(0,${i * 22})`).attr("class", `leg${i}`);
    g.append("line").attr("x2", 18).attr("stroke", c).attr("stroke-width", 3);
    g.append("text").attr("x", 26).attr("y", 4.5).attr("fill", t.ink2).attr("font-size", 13).text(s);
  });
  const scrub = svg.append("g").attr("opacity", 0);
  scrub.append("line").attr("class", "v").attr("stroke", t.ink).attr("stroke-width", 1);
  const dT = scrub.append("circle").attr("r", 5.5).attr("fill", t.s1).attr("stroke", t.surface).attr("stroke-width", 2);
  const dD = scrub.append("circle").attr("r", 5.5).attr("fill", t.s2).attr("stroke", t.surface).attr("stroke-width", 2);
  const rd = scrub.append("g");
  const rd1 = rd.append("text").attr("fill", t.ink).attr("font-size", 13.5).attr("font-weight", 600);
  const rd2 = rd.append("text").attr("fill", t.ink2).attr("font-size", 13).attr("dy", 18);
  const rd3 = rd.append("text").attr("fill", t.ink2).attr("font-size", 13).attr("dy", 36);

  let showD = false;
  function paint(dur = 0) {
    const ln = f => d3.line().x(r => x(r)).y(r => y(f(r)))(rs);
    const tr = sel => dur ? sel.transition("paint").duration(dur) : sel;
    tr(pT).attr("d", ln(M.treatyU));
    tr(pD).attr("d", ln(M.defectU));
    tr(area).attr("d", d3.area().x(r => x(r)).y0(r => y(M.treatyU(r))).y1(r => y(M.defectU(r)))(rs));
    const yl = Math.min(M.treatyU(70), y.domain()[1]);
    tr(lT).attr("x", x(70)).attr("y", y.domain()[1] < 100 ? y(yl) + 22 : y(yl) - 10).text("Keep the treaty");
    tr(lD).attr("x", x(66) - 8).attr("y", y(Math.min(M.defectU(66), y.domain()[1] * .97)) + 4).text("Cheat");
  }
  paint();
  function setScrub(r) {
    const vT = M.treatyU(r), vD = M.defectU(r);
    scrub.select(".v").attr("x1", x(r)).attr("x2", x(r)).attr("y1", m.t).attr("y2", H - m.b);
    dT.attr("cx", x(r)).attr("cy", y(vT));
    dD.attr("cx", x(r)).attr("cy", y(Math.min(vD, y.domain()[1])));
    rd.attr("transform", `translate(${x(r) + (r > 30 ? -12 : 12)},${m.t + 120})`)
      .attr("text-anchor", r > 30 ? "end" : "start");
    rd1.text(`A ${fmt(r)}% cut`);
    rd2.text(`Keeping it: ${fmt(vT, 1)} per period`);
    rd3.text(`Cheating: ${fmt(vD, 0)} once (${fmt(vD / vT, 0)}× as much)`);
  }
  const node = wrap.node();
  node.update = stepper("te-", step => {
    showD = step !== "te-treaty";
    y.domain(showD ? [0, 1750] : [0, 32]);
    gy.transition().duration(1200).call(d3.axisLeft(y).ticks(5).tickSize(-(W - m.l - m.r)))
      .on("end", function () { styleAxis(d3.select(this), t, { grid: true }); d3.select(this).select(".domain").remove(); });
    styleAxis(gy, t, { grid: true }); gy.select(".domain").remove();
    paint(1200);
    pD.transition().duration(800).attr("opacity", showD ? 1 : 0);
    lD.transition().duration(800).attr("opacity", showD ? 1 : 0);
    legend.select(".leg1").transition().duration(800).attr("opacity", showD ? 1 : 0);
    area.transition().duration(800).attr("opacity", step === "te-limit" ? 0.12 : 0);
    scrub.transition().duration(500).attr("opacity", step === "te-gap" || step === "te-limit" ? 1 : 0);
    if (step === "te-limit") setScrub(37.19);
  }, (step, p) => { if (step === "te-gap") setScrub(5 + 55 * clamp(p * 1.25)); });
  legend.select(".leg1").attr("opacity", 0);
  return node;
}

// ───────────────────────── 7. The punishment ledger ─────────────────────────────
export function ledger(d3, { lab = false } = {}) {
  const t = TOKENS.light, W = 860, H = 430, m = { l: 118, r: 24, t: 64, b: 36 }, totW = 190;
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "Discounted payoffs per period from keeping a treaty versus cheating and being punished.");
  const N = 30, rowH = 120, gapY = 56;
  const x = d3.scaleBand(d3.range(N), [m.l, W - m.r - totW - 24]).padding(0.18);
  const rows = [{ k: "comply", y0: m.t + rowH, label: "Keep the treaty" },
    { k: "cheat", y0: m.t + 2 * rowH + gapY, label: "Cheat once" }];
  rows.forEach(r => {
    svg.append("line").attr("x1", m.l).attr("x2", W - m.r - totW - 24).attr("y1", r.y0).attr("y2", r.y0).attr("stroke", t.axis);
    lines(svg.append("text").attr("x", m.l - 12).attr("y", r.y0 - 40).attr("text-anchor", "end").attr("fill", t.ink)
      .attr("font-size", 13.5).attr("font-weight", 600), r.label);
  });
  svg.append("text").attr("x", m.l).attr("y", H - 8).attr("fill", t.muted).attr("font-size", 12)
    .text("Periods →   (bar height = payoff in that period, shrunk by the discount factor)");
  const pun = svg.append("g");
  const punRect = pun.append("rect").attr("y", rows[1].y0 - rowH + 6).attr("height", rowH - 6)
    .attr("fill", t.bad).attr("opacity", 0.08);
  const punLab = pun.append("text").attr("y", rows[1].y0 - rowH + 22).attr("fill", t.bad).attr("font-size", 12.5)
    .attr("font-weight", 600);
  const barsC = svg.append("g").selectAll("rect").data(d3.range(N)).join("rect")
    .attr("x", i => x(i)).attr("width", x.bandwidth()).attr("rx", 2).attr("fill", t.s1);
  const barsD = svg.append("g").selectAll("rect").data(d3.range(N)).join("rect")
    .attr("x", i => x(i)).attr("width", x.bandwidth()).attr("rx", 2);
  const head = svg.append("g").attr("transform", `translate(${m.l},26)`);
  const hTitle = head.append("text").attr("fill", t.ink).attr("font-size", 15).attr("font-weight", 600);
  // totals column: everything added up, discounted
  const tx0 = W - m.r - totW;
  svg.append("text").attr("x", tx0).attr("y", m.t + 2).attr("fill", t.ink2).attr("font-size", 12.5)
    .text("Total over all periods");
  svg.append("text").attr("x", tx0).attr("y", m.t + 18).attr("fill", t.muted).attr("font-size", 11.5)
    .text("(discounted)");
  const totBar = rows.map(r => svg.append("rect").attr("x", tx0).attr("y", r.y0 - 30).attr("height", 22).attr("rx", 4));
  const totTxt = rows.map(r => svg.append("text").attr("x", tx0).attr("y", r.y0 - 40).attr("fill", t.ink)
    .attr("font-size", 15).attr("font-weight", 600));
  const badge = svg.append("g").attr("transform", `translate(${W - m.r},26)`);
  const badgeBg = badge.append("rect").attr("y", -18).attr("height", 28).attr("rx", 14);
  const badgeTx = badge.append("text").attr("text-anchor", "end").attr("x", -14).attr("y", 1)
    .attr("font-size", 13.5).attr("font-weight", 700).attr("fill", "#fff");

  function set(r, L, delta = M.DELTA, k = M.K, dur = 600) {
    const uT = M.treatyU(r), uD = M.defectU(r, k);
    const sc = d3.scaleLinear([0, Math.max(uD, uT)], [0, rowH - 30]);
    const vC = i => uT * Math.pow(delta, i);
    const inPun = i => i >= 1 && i <= L;
    const vD = i => i === 0 ? uD : inPun(i) ? 0 : uT * Math.pow(delta, i);
    const tr = s => dur ? s.transition().duration(dur) : s;
    tr(barsC).attr("y", i => rows[0].y0 - sc(vC(i))).attr("height", i => sc(vC(i)));
    tr(barsD).attr("y", i => rows[1].y0 - sc(vD(i))).attr("height", i => sc(vD(i)))
      .attr("fill", i => i === 0 ? t.s2 : t.s1);
    const Lshow = Number.isFinite(L) ? Math.min(L, N - 1) : N - 1;
    tr(punRect).attr("x", x(1) - 2).attr("width", Math.max(0, x(Lshow) + x.bandwidth() - x(1) + 4));
    punLab.attr("x", x(1) + 4).text(Number.isFinite(L) ? `punished for ${L} period${L === 1 ? "" : "s"}` : "punished forever (grim trigger)");
    const pvC = uT / (1 - delta);
    const pvD = uD + (Number.isFinite(L) ? Math.pow(delta, L + 1) * uT / (1 - delta) : 0);
    const tsc = d3.scaleLinear([0, Math.max(pvC, pvD)], [0, totW]);
    [pvC, pvD].forEach((v, i) => {
      tr(totBar[i]).attr("width", Math.max(2, tsc(v)));
      totBar[i].attr("fill", i === 0 ? t.s1 : t.s2);
      totTxt[i].text(fmt(v, 0));
    });
    const ok = pvC >= pvD - 1e-9;
    hTitle.text(`A ${fmt(r, 0)}% tariff cut · cheating pays ${fmt(uD - uT, 0)} extra once`);
    badgeTx.text(ok ? "✓ Cheating doesn't pay: self-enforcing" : "✗ Cheating pays: the treaty unravels");
    const bw = ok ? 300 : 290;
    badgeBg.attr("x", -bw).attr("width", bw).attr("fill", ok ? "#0b7a0b" : "#b8302f");
    return { ok, pvC, pvD };
  }
  const scen = { "le-a": [5, 1], "le-b": [5, 2], "le-c": [30, 2], "le-d": [30, 27], "le-e": [40, Infinity] };
  set(5, 1, M.DELTA, M.K, 0);
  const node = wrap.node();
  node.update = stepper("le-", step => set(...scen[step]));
  node.set = set;
  return node;
}

// ───────────────────────── 8. Figure 2: punishment needed vs depth ──────────────
export function punishCurve(d3, { lab = false } = {}) {
  const t = TOKENS.light, W = 820, H = 520, m = { l: 70, r: 30, t: 58, b: 58 };
  const { wrap, svg } = frame(d3, W, H, "light");
  svg.attr("aria-label", "Punishment periods needed to deter cheating, by treaty depth.");
  const x = d3.scaleLinear([0, 70], [m.l, W - m.r]);
  const y = d3.scaleLinear([0, 100], [H - m.b, m.t]);
  svg.append("g").attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d => d + "%").tickSizeOuter(0)).call(g => styleAxis(g, t));
  svg.append("g").attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-(W - m.l - m.r))).call(g => styleAxis(g, t, { grid: true }))
    .call(g => g.select(".domain").remove());
  svg.append("text").attr("x", W - m.r).attr("y", H - 14).attr("text-anchor", "end").attr("fill", t.ink2)
    .attr("font-size", 13.5).text("Depth of the treaty: % tariff reduction →");
  svg.append("text").attr("x", m.l).attr("y", 26).attr("fill", t.ink2).attr("font-size", 13.5)
    .text("Punishment needed to deter cheating (periods)");

  const zone = svg.append("rect").attr("y", m.t).attr("height", H - m.b - m.t).attr("fill", t.bad).attr("opacity", 0);
  const zoneLab = svg.append("text").attr("y", m.t + 22).attr("fill", t.bad).attr("font-size", 13).attr("opacity", 0);
  const okArea = svg.append("path").attr("fill", t.good).attr("opacity", 0);
  const curves = svg.append("g");
  const curveLine = (delta, k) => {
    const c = M.ceiling(delta, k);
    const rs = d3.range(0.2, Math.min(c, 70), 0.1).concat(Math.min(c, 70) - 0.001);
    return d3.line().x(r => x(r)).y(r => y(Math.min(M.requiredL(r, delta, k), 100)))
      .defined(r => M.requiredL(r, delta, k) <= 100)(rs.filter(r => r < 70));
  };
  const mk = (cls, color) => curves.append("path").attr("class", cls).attr("fill", "none")
    .attr("stroke", color).attr("stroke-width", 2.5).attr("stroke-linejoin", "round");
  const main = mk("c95", t.s1), lo = mk("c90", t.s2).attr("opacity", 0), hi = mk("c98", t.s3).attr("opacity", 0);
  const ceilLine = svg.append("line").attr("y1", m.t).attr("y2", H - m.b).attr("stroke", t.ink)
    .attr("stroke-width", 1.2).attr("opacity", 0);
  const ceilLab = svg.append("text").attr("y", m.t - 10).attr("fill", t.ink).attr("font-size", 13).attr("font-weight", 600).attr("opacity", 0);
  const five = svg.append("g").attr("opacity", 0);
  five.append("circle").attr("cx", x(5)).attr("cy", y(2)).attr("r", 6).attr("fill", t.s1)
    .attr("stroke", t.surface).attr("stroke-width", 2);
  five.append("line").attr("x1", x(5)).attr("x2", x(5)).attr("y1", y(2) - 9).attr("y2", y(24)).attr("stroke", t.ink2);
  lines(five.append("text").attr("x", x(1.5)).attr("y", y(33)).attr("fill", t.ink).attr("font-size", 13.5),
    "A 5% cut needs only|a 2-period punishment");
  const labs = svg.append("g");
  const lab95 = labs.append("text").attr("fill", t.ink).attr("font-size", 13);
  const lab90 = labs.append("text").attr("fill", t.ink).attr("font-size", 13).attr("opacity", 0);
  const lab98 = labs.append("text").attr("fill", t.ink).attr("font-size", 13).attr("opacity", 0);
  const legend = svg.append("g").attr("transform", `translate(${x(47)},${y(24)})`).attr("opacity", 0);
  [[t.s2, "patience δ = 0.90"], [t.s1, "δ = 0.95 (the article's example)"], [t.s3, "δ = 0.98"]].forEach(([c, s], i) => {
    const g = legend.append("g").attr("transform", `translate(0,${i * 22})`);
    g.append("line").attr("x2", 18).attr("stroke", c).attr("stroke-width", 3);
    g.append("text").attr("x", 26).attr("y", 4.5).attr("fill", t.ink2).attr("font-size", 13).text(s);
  });
  const pt = svg.append("g").attr("opacity", lab ? 1 : 0);
  const ptC = pt.append("circle").attr("r", 7).attr("stroke", t.surface).attr("stroke-width", 2.5);
  const ptL = pt.append("text").attr("font-size", 13).attr("font-weight", 600).attr("fill", t.ink);

  // label each curve where it reaches the top of the chart
  const label = (sel, delta, k, txt) => {
    const c = Math.min(M.ceiling(delta, k), 70);
    let r = 0.5;
    while (r < c && M.requiredL(r, delta, k) < 94) r += 0.05;
    const L = Math.min(M.requiredL(Math.min(r, c - 0.01), delta, k), 94);
    sel.attr("x", x(Math.min(r, 70)) - 8).attr("y", y(L) + 4).attr("text-anchor", "end").text(txt);
  };
  function paint(k = M.K, dur = 0, delta = M.DELTA) {
    const tr = s => dur ? s.transition().duration(dur) : s;
    tr(main).attr("d", curveLine(delta, k));
    tr(lo).attr("d", curveLine(0.90, k));
    tr(hi).attr("d", curveLine(0.98, k));
    const c = M.ceiling(delta, k);
    tr(ceilLine).attr("x1", x(Math.min(c, 70))).attr("x2", x(Math.min(c, 70)));
    ceilLab.attr("x", x(Math.min(c, 70)) + (c > 55 ? -6 : 6)).attr("text-anchor", c > 55 ? "end" : "start")
      .text(c >= 70 ? "ceiling beyond 70%" : `ceiling: ${fmt(c, 2)}%`);
    tr(zone).attr("x", x(Math.min(c, 70))).attr("width", Math.max(0, x(70) - x(Math.min(c, 70))));
    zoneLab.attr("x", x(Math.min(c, 70)) + 10).attr("y", H / 2);
    lines(zoneLab, c < 58 ? "No punishment is long|enough: even a permanent|trade war can't hold|a treaty this deep" : "", 1.3);
    label(lab95, delta, k, lab ? "" : "δ = 0.95");
    label(lab90, 0.90, k, "δ = 0.90");
    label(lab98, 0.98, k, "δ = 0.98");
    const rs = d3.range(0.2, Math.min(c, 70), 0.2);
    okArea.attr("d", d3.area().x(r => x(r)).y0(m.t).y1(r => y(Math.min(M.requiredL(r, delta, k), 100)))(rs));
  }
  paint();
  main.attr("stroke-dasharray", "2000 2000").attr("stroke-dashoffset", lab ? 0 : 2000);

  const node = wrap.node();
  node.update = stepper("pc-", step => {
    const after = s => ["pc-curve", "pc-five", "pc-ceiling", "pc-patience"].indexOf(step) >= ["pc-curve", "pc-five", "pc-ceiling", "pc-patience"].indexOf(s);
    if (step !== "pc-curve") main.attr("stroke-dashoffset", 0);
    five.transition().duration(500).attr("opacity", after("pc-five") ? 1 : 0);
    [ceilLine, ceilLab].forEach(s => s.transition().duration(500).attr("opacity", after("pc-ceiling") ? 1 : 0));
    zone.transition().duration(500).attr("opacity", after("pc-ceiling") ? 0.07 : 0);
    zoneLab.transition().duration(500).attr("opacity", after("pc-ceiling") && step !== "pc-patience" ? 1 : 0);
    [lo, hi, lab90, lab98, legend].forEach(s => s.transition().duration(600).attr("opacity", step === "pc-patience" ? 1 : 0));
    lab95.transition().duration(500).attr("opacity", step === "pc-patience" ? 0 : 1);
  }, (step, p) => { if (step === "pc-curve") main.attr("stroke-dashoffset", 2000 * (1 - clamp(p * 1.6))); });

  // lab mode: place the reader's treaty on the plane
  node.set = ({ r, L, delta = M.DELTA, k = M.K, showAlt = false }) => {
    paint(k, 0, delta);
    [ceilLine, ceilLab].forEach(s => s.attr("opacity", 1));
    zone.attr("opacity", 0.07); zoneLab.attr("opacity", 1);
    okArea.attr("opacity", 0.06);
    [lo, hi, lab90, lab98].forEach(s => s.attr("opacity", showAlt ? 0.5 : 0));
    const v = M.verdict(r, L, delta, k);
    const yy = Number.isFinite(L) ? y(Math.min(L, 100)) : m.t + 2;
    ptC.attr("cx", x(r)).attr("cy", yy).attr("fill", v.deterred ? t.good : t.bad);
    ptL.attr("x", x(r) + (r > 50 ? -12 : 12)).attr("y", yy - 12).attr("text-anchor", r > 50 ? "end" : "start")
      .text(v.deterred ? "✓ your treaty holds" : "✗ your treaty unravels");
    return v;
  };
  return node;
}
