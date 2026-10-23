// The orchestra analogy as an illustrated concert hall.
// stage(d3, {id}) returns a node with .update(step, progress); steps "st-*".

import { rng, } from "./model.js";
import { clamp, ease, stepper, SANS, DISPLAY } from "./ui.js";

const W = 1000, H = 680;
const FIG = "#0d0a08", RIM = "#e4c779", WOOD = "#8a4b20", BRASS = "#d4a73a";
const CREAM = "#f3ead9", GOLD = "#c9a24a", CRIMSON = "#a51c30";

// --- one seated musician at the origin (hips), facing the audience ---------
function musician(g, kind) {
  const legs = g.append("g").attr("fill", FIG);
  legs.append("rect").attr("x", -12).attr("y", -2).attr("width", 24).attr("height", 10).attr("rx", 4);
  legs.append("rect").attr("x", -11).attr("y", 6).attr("width", 7).attr("height", 24).attr("rx", 3);
  legs.append("rect").attr("x", 4).attr("y", 6).attr("width", 7).attr("height", 24).attr("rx", 3);
  g.append("rect").attr("x", -17).attr("y", -3).attr("width", 34).attr("height", 5)
    .attr("rx", 2).attr("fill", "#2b1d15");
  if (kind === "cello") cello(g);
  if (kind === "timpani") timpani(g);
  g.append("path").attr("d", "M-15,0 C-18,-20 -15,-34 0,-36 C15,-34 18,-20 15,0 Z")
    .attr("fill", FIG).attr("stroke", RIM).attr("stroke-opacity", .35).attr("stroke-width", .9);
  g.append("circle").attr("cy", -47).attr("r", 9.5)
    .attr("fill", FIG).attr("stroke", RIM).attr("stroke-opacity", .35).attr("stroke-width", .9);
  if (kind === "violin" || kind === "viola") {
    const s = kind === "viola" ? 1.15 : 1;
    g.append("ellipse").attr("cx", -12).attr("cy", -37).attr("rx", 8 * s).attr("ry", 4.6 * s)
      .attr("transform", "rotate(-28 -12 -37)").attr("fill", WOOD);
    g.append("line").attr("x1", -18).attr("y1", -34).attr("x2", -31).attr("y2", -27)
      .attr("stroke", "#3b2414").attr("stroke-width", 2);
    g.append("line").attr("class", "bow").attr("x1", -4).attr("y1", -52).attr("x2", 22).attr("y2", -18)
      .attr("stroke", "#d9c9a3").attr("stroke-width", 1.1);
  }
  if (kind === "flute") g.append("line").attr("x1", -8).attr("y1", -45).attr("x2", 30).attr("y2", -40)
    .attr("stroke", "#cfd3d6").attr("stroke-width", 2.4).attr("stroke-linecap", "round");
  if (kind === "clarinet") {
    g.append("line").attr("x1", 0).attr("y1", -43).attr("x2", 7).attr("y2", -12)
      .attr("stroke", "#050505").attr("stroke-width", 3.2);
    g.append("circle").attr("cx", 7.5).attr("cy", -11).attr("r", 3).attr("fill", "#cfd3d6");
  }
  if (kind === "trumpet") {
    g.append("line").attr("x1", 0).attr("y1", -45).attr("x2", 18).attr("y2", -44)
      .attr("stroke", BRASS).attr("stroke-width", 2.6);
    g.append("path").attr("d", "M17,-44 L27,-49 L27,-39 Z").attr("fill", BRASS);
  }
  if (kind === "horn") {
    g.append("circle").attr("cx", -12).attr("cy", -22).attr("r", 8.5)
      .attr("fill", "none").attr("stroke", BRASS).attr("stroke-width", 2.6);
    g.append("path").attr("d", "M-4,-18 L4,-12 L1,-6 Z").attr("fill", BRASS);
  }
  // back of the music stand, set to the player's right
  g.append("line").attr("x1", 24).attr("y1", -10).attr("x2", 24).attr("y2", 30)
    .attr("stroke", "#3a2a1f").attr("stroke-width", 1.6);
  g.append("rect").attr("x", 14).attr("y", -22).attr("width", 20).attr("height", 13).attr("rx", 1.5)
    .attr("fill", "#2b2018").attr("stroke", RIM).attr("stroke-opacity", .2);
}

function cello(g) {
  g.append("line").attr("x1", 2).attr("y1", -58).attr("x2", 2).attr("y2", 30)
    .attr("stroke", "#3b2414").attr("stroke-width", 2.2);
  g.append("path")
    .attr("d", "M2,-30 C-12,-30 -13,-20 -8,-14 C-15,-8 -15,8 2,9 C19,8 19,-8 12,-14 C17,-20 16,-30 2,-30 Z")
    .attr("fill", "#7a3f1a").attr("transform", "translate(0,6)");
  g.append("line").attr("class", "bow").attr("x1", -22).attr("y1", -8).attr("x2", 24).attr("y2", 0)
    .attr("stroke", "#d9c9a3").attr("stroke-width", 1.1);
}

function timpani(g) {
  g.append("path").attr("d", "M-26,0 Q-24,26 0,28 Q24,26 26,0 Z").attr("fill", "#b06a2c")
    .attr("transform", "translate(0,6)");
  g.append("ellipse").attr("cy", 6).attr("rx", 26).attr("ry", 6).attr("fill", "#e8dcc0");
  g.append("line").attr("x1", -10).attr("y1", -22).attr("x2", -18).attr("y2", 2)
    .attr("stroke", "#d9c9a3").attr("stroke-width", 1.4);
  g.append("line").attr("x1", 10).attr("y1", -22).attr("x2", 18).attr("y2", 2)
    .attr("stroke", "#d9c9a3").attr("stroke-width", 1.4);
}

function conductor(g) {
  g.append("rect").attr("x", -26).attr("y", 18).attr("width", 52).attr("height", 12).attr("rx", 2)
    .attr("fill", "#2b1d15").attr("stroke", GOLD).attr("stroke-opacity", .5);
  g.append("path").attr("d", "M-13,18 L-10,-12 L10,-12 L13,18 Z").attr("fill", FIG);
  g.append("path").attr("d", "M-17,-12 C-18,-38 -12,-50 0,-52 C12,-50 18,-38 17,-12 L12,4 L-12,4 Z")
    .attr("fill", FIG).attr("stroke", RIM).attr("stroke-opacity", .45).attr("stroke-width", .9);
  g.append("circle").attr("cy", -63).attr("r", 10.5).attr("fill", FIG)
    .attr("stroke", RIM).attr("stroke-opacity", .45).attr("stroke-width", .9);
  const arm = g.append("g").attr("class", "baton-arm");
  arm.append("line").attr("x1", 13).attr("y1", -44).attr("x2", 34).attr("y2", -70)
    .attr("stroke", FIG).attr("stroke-width", 6).attr("stroke-linecap", "round");
  arm.append("line").attr("x1", 34).attr("y1", -70).attr("x2", 52).attr("y2", -92)
    .attr("stroke", CREAM).attr("stroke-width", 1.4);
  g.append("line").attr("x1", -13).attr("y1", -44).attr("x2", -30).attr("y2", -62)
    .attr("stroke", FIG).attr("stroke-width", 6).attr("stroke-linecap", "round");
}

// --- a page of score; sparse (Haydn) or dense (Mahler) ---------------------
function score(g, w, h, dense, seed) {
  const rand = rng(seed);
  g.append("rect").attr("width", w).attr("height", h).attr("rx", 4)
    .attr("fill", CREAM).attr("stroke", GOLD).attr("stroke-width", 1.5);
  const ink = "#1d1914";
  const systems = 2, top = 56, gap = 6, sysGap = 58;
  for (let s = 0; s < systems; s++) {
    const y0 = top + s * sysGap;
    for (let l = 0; l < 5; l++) g.append("line").attr("x1", 16).attr("x2", w - 14)
      .attr("y1", y0 + l * gap).attr("y2", y0 + l * gap).attr("stroke", ink).attr("stroke-width", .7);
    g.append("text").attr("x", 18).attr("y", y0 + 22).attr("font-size", 30).attr("fill", ink)
      .attr("font-family", "serif").text("𝄞");
    const bars = dense ? 4 : 3, bw = (w - 60) / bars;
    for (let b = 1; b <= bars; b++) g.append("line").attr("x1", 44 + b * bw).attr("x2", 44 + b * bw)
      .attr("y1", y0).attr("y2", y0 + 4 * gap).attr("stroke", ink).attr("stroke-width", .8);
    const n = dense ? 30 : 9;
    const span = w - 70;
    let prev = null;
    for (let i = 0; i < n; i++) {
      const x = 52 + (i + 0.5) * span / n;
      const step = dense ? Math.round((rand() - 0.5) * 14) : [2, 4, 3, 4, 2, 4, 5, 4, 3][i % 9];
      const y = y0 + 4 * gap - step * gap / 2;
      g.append("ellipse").attr("cx", x).attr("cy", y).attr("rx", 3.4).attr("ry", 2.5)
        .attr("transform", `rotate(-20 ${x} ${y})`).attr("fill", ink);
      g.append("line").attr("x1", x + 3).attr("x2", x + 3).attr("y1", y).attr("y2", y - 17)
        .attr("stroke", ink).attr("stroke-width", .9);
      if (dense) {
        if (prev && i % 4 !== 0) {
          g.append("line").attr("x1", prev.x + 3).attr("x2", x + 3)
            .attr("y1", prev.y - 17).attr("y2", y - 17).attr("stroke", ink).attr("stroke-width", 2.2);
          g.append("line").attr("x1", prev.x + 3).attr("x2", x + 3)
            .attr("y1", prev.y - 13).attr("y2", y - 13).attr("stroke", ink).attr("stroke-width", 2.2);
        }
        if (rand() < 0.35) g.append("text").attr("x", x - 11).attr("y", y + 4).attr("font-size", 11)
          .attr("fill", ink).text(rand() < 0.5 ? "♯" : "♭");
        for (let ly = y0 - gap; ly >= y - 1; ly -= gap) g.append("line")
          .attr("x1", x - 6).attr("x2", x + 6).attr("y1", ly).attr("y2", ly).attr("stroke", ink).attr("stroke-width", .7);
        for (let ly = y0 + 5 * gap; ly <= y + 1; ly += gap) g.append("line")
          .attr("x1", x - 6).attr("x2", x + 6).attr("y1", ly).attr("y2", ly).attr("stroke", ink).attr("stroke-width", .7);
      }
      prev = { x, y };
    }
    if (dense) g.append("text").attr("x", w - 54).attr("y", y0 + 4 * gap + 20)
      .attr("font-size", 14).attr("font-style", "italic").attr("font-weight", 700)
      .attr("font-family", "serif").attr("fill", ink).text("fff");
    else g.append("text").attr("x", 56).attr("y", y0 + 4 * gap + 20)
      .attr("font-size", 13).attr("font-style", "italic").attr("font-family", "serif").attr("fill", ink).text("p");
  }
}

export function stage(d3, { id = "stage", prefix = "st-", finale = false } = {}) {
  const wrap = d3.create("div").attr("class", "viz stage-art");
  const svg = wrap.append("svg").attr("viewBox", `0 0 ${W} ${H}`)
    .attr("role", "img").attr("aria-label",
      "Illustration: a concert hall split between two school orchestras, District A and District B.")
    .style("font-family", SANS);
  const defs = svg.append("defs");
  const lg = (gid, stops, x2 = 0, y2 = 1, extra = {}) => {
    const g = defs.append("linearGradient").attr("id", `${id}-${gid}`)
      .attr("x1", 0).attr("y1", 0).attr("x2", x2).attr("y2", y2);
    Object.entries(extra).forEach(([k, v]) => g.attr(k, v));
    stops.forEach(([o, c, op = 1]) => g.append("stop").attr("offset", o).attr("stop-color", c).attr("stop-opacity", op));
  };
  lg("hall", [[0, "#0b0806"], [1, "#1f1510"]]);
  lg("floor", [[0, "#6b4528"], [1, "#2f1d12"]]);
  lg("pipe", [[0, "#7c6430"], [.5, "#d8bd72"], [1, "#6f5728"]], 1, 0);
  lg("fold", [[0, "#4a0812"], [.35, "#a51c30"], [.5, "#c8384b"], [.65, "#a51c30"], [1, "#4a0812"]], 1, 0,
    { gradientUnits: "userSpaceOnUse", x2: 64, y2: 0, spreadMethod: "repeat" });
  lg("beam", [[0, "#fff4d6", .26], [1, "#fff4d6", 0]]);
  const rg = defs.append("radialGradient").attr("id", `${id}-pool`);
  rg.append("stop").attr("offset", 0).attr("stop-color", "#ffe9b8").attr("stop-opacity", .35);
  rg.append("stop").attr("offset", 1).attr("stop-color", "#ffe9b8").attr("stop-opacity", 0);
  const url = k => `url(#${id}-${k})`;

  // hall, wall panels, organ
  svg.append("rect").attr("width", W).attr("height", H).attr("fill", url("hall"));
  const wall = svg.append("g").attr("opacity", .9);
  for (let i = 0; i < 10; i++) wall.append("rect").attr("x", 70 + i * 86).attr("y", 140)
    .attr("width", 82).attr("height", 335).attr("fill", i % 2 ? "#24180f" : "#2a1c13");
  const organ = svg.append("g").attr("opacity", .55);
  d3.range(17).forEach(i => {
    const hgt = 70 + 80 * Math.sin(Math.PI * (i + .5) / 17);
    organ.append("rect").attr("x", 404 + i * 11.5).attr("y", 300 - hgt)
      .attr("width", 8).attr("height", hgt).attr("rx", 3.5).attr("fill", url("pipe"));
  });

  // stage floor and boards
  svg.append("path").attr("d", "M60,470 H940 L1000,604 H0 Z").attr("fill", url("floor"));
  d3.range(1, 16).forEach(i => svg.append("line")
    .attr("x1", 60 + i * 55).attr("y1", 470).attr("x2", i * 62.5).attr("y2", 604)
    .attr("stroke", "#24160d").attr("stroke-opacity", .55));
  svg.append("rect").attr("y", 604).attr("width", W).attr("height", 14).attr("fill", "#1a100b");
  svg.append("line").attr("x1", 0).attr("x2", W).attr("y1", 604).attr("y2", 604)
    .attr("stroke", GOLD).attr("stroke-opacity", .6);

  // spotlights (one per district)
  const lights = svg.append("g").attr("class", "lights").attr("opacity", 0);
  [270, 730].forEach(cx => {
    lights.append("path").attr("d", `M${cx - 30},90 L${cx + 30},90 L${cx + 230},560 L${cx - 230},560 Z`)
      .attr("fill", url("beam"));
    lights.append("ellipse").attr("cx", cx).attr("cy", 540).attr("rx", 240).attr("ry", 60).attr("fill", url("pool"));
  });

  // the two orchestras
  const halves = [{ key: "A", cx: 270 }, { key: "B", cx: 730 }];
  const back = ["horn", "flute", "timpani", "clarinet", "trumpet"];
  const front = ["violin", "violin", "viola", "cello"];
  const players = [];
  halves.forEach(hf => {
    const g = svg.append("g").attr("class", `orch orch-${hf.key}`);
    back.forEach((k, i) => {
      const x = hf.cx + (i - 2) * 80, y = 452;
      const m = g.append("g").attr("transform", `translate(${x},${y}) scale(.84)`);
      musician(m, k); players.push({ half: hf.key, x, y: y - 46 * .84 });
    });
    front.forEach((k, i) => {
      const x = hf.cx + [-150, -55, 55, 150][i], y = 520;
      const m = g.append("g").attr("transform", `translate(${x},${y})`);
      musician(m, k); players.push({ half: hf.key, x, y: y - 47 });
    });
    conductor(g.append("g").attr("class", "conductor").attr("transform", `translate(${hf.cx},${574})`));
  });

  // divider + district labels
  svg.append("line").attr("x1", 500).attr("x2", 500).attr("y1", 150).attr("y2", 604)
    .attr("stroke", GOLD).attr("stroke-opacity", .45).attr("stroke-dasharray", "2 6");
  const labels = svg.append("g").attr("class", "district-labels").attr("opacity", 0);
  [["DISTRICT A", "rehearsals cut 75%", 270], ["DISTRICT B", "fully funded", 730]].forEach(([a, b, x]) => {
    labels.append("text").attr("x", x).attr("y", 128).attr("text-anchor", "middle")
      .attr("fill", CREAM).attr("font-size", 17).attr("letter-spacing", 3).attr("font-weight", 600).text(a);
    labels.append("text").attr("x", x).attr("y", 146).attr("text-anchor", "middle")
      .attr("fill", "#c9bba3").attr("font-size", 12.5).attr("letter-spacing", 1).text(b);
  });

  // audience
  const aud = svg.append("g");
  aud.append("rect").attr("y", 618).attr("width", W).attr("height", H - 618).attr("fill", "#0a0706");
  const ar = rng(5);
  for (let row = 0; row < 2; row++) for (let i = 0; i < 26; i++) {
    const x = 20 + i * 38 + (row ? 19 : 0), y = 652 + row * 22;
    aud.append("rect").attr("x", x - 15).attr("y", y - 6).attr("width", 30).attr("height", 26)
      .attr("rx", 7).attr("fill", "#3d0d14");
    if (ar() < 0.7) aud.append("circle").attr("cx", x + (ar() - .5) * 6).attr("cy", y - 10)
      .attr("r", 9 + ar() * 2).attr("fill", "#050403");
  }

  // scoreboards: concerts attended, then mistakes per concert
  const boards = svg.append("g").attr("class", "boards").attr("opacity", 0);
  const board = {};
  halves.forEach(hf => {
    const g = boards.append("g").attr("transform", `translate(${hf.cx - 115},168)`);
    g.append("rect").attr("width", 230).attr("height", 74).attr("rx", 8)
      .attr("fill", "#0b0807").attr("stroke", GOLD).attr("stroke-width", 1.4);
    const label = g.append("text").attr("x", 115).attr("y", 22).attr("text-anchor", "middle")
      .attr("fill", "#c9bba3").attr("font-size", 11.5).attr("letter-spacing", 2);
    const value = g.append("text").attr("x", 115).attr("y", 60).attr("text-anchor", "middle")
      .attr("fill", "#e4c779").attr("font-size", 34).attr("font-weight", 600)
      .style("font-variant-numeric", "tabular-nums");
    const tickets = g.append("g").attr("transform", "translate(8,84)");
    d3.range(15).forEach(i => tickets.append("g").attr("class", "ticket")
      .attr("transform", `translate(${i * 14.6},0)`).attr("opacity", 0)
      .call(t => {
        t.append("rect").attr("width", 12).attr("height", 18).attr("rx", 1.5).attr("fill", "#e4c779");
        t.append("line").attr("x1", 1).attr("x2", 11).attr("y1", 6).attr("y2", 6)
          .attr("stroke", "#0b0807").attr("stroke-dasharray", "1.5 1.5");
      }));
    board[hf.key] = { label, value, tickets };
  });

  // mistake sparks over a few players in each half
  const sparks = svg.append("g").attr("class", "sparks").attr("opacity", 0);
  const sr = rng(19);
  const star = "M0,-11 L2.6,-3 L11,-3 L4.2,2 L6.8,10 L0,5 L-6.8,10 L-4.2,2 L-11,-3 L-2.6,-3 Z";
  ["A", "B"].forEach(hk => {
    const ps = players.filter(p => p.half === hk);
    d3.range(3).forEach(j => {
      const p = ps[Math.floor(sr() * ps.length)];
      sparks.append("path").attr("d", star).attr("class", "spark")
        .attr("transform", `translate(${p.x + 14},${p.y - 18})`)
        .attr("fill", "#ff7a4d").style("animation-delay", `${(j * 1.1 + sr()).toFixed(2)}s`);
    });
  });

  // rehearsal calendars
  const cal = svg.append("g").attr("class", "calendars").attr("opacity", 0);
  const crosses = [];
  halves.forEach(hf => {
    const g = cal.append("g").attr("transform", `translate(${hf.cx - 120},282)`);
    g.append("rect").attr("width", 240).attr("height", 100).attr("rx", 8)
      .attr("fill", "#0b0807").attr("fill-opacity", .9).attr("stroke", GOLD).attr("stroke-opacity", .6);
    g.append("text").attr("x", 120).attr("y", 20).attr("text-anchor", "middle").attr("fill", "#c9bba3")
      .attr("font-size", 11.5).attr("letter-spacing", 2).text("REHEARSALS THIS TERM");
    d3.range(20).forEach(i => {
      const x = 16 + (i % 10) * 21.5, y = 34 + Math.floor(i / 10) * 26;
      g.append("rect").attr("x", x).attr("y", y).attr("width", 17).attr("height", 20).attr("rx", 2.5)
        .attr("fill", "#e4c779");
      if (hf.key === "A" && i >= 5) crosses.push(g.append("path")
        .attr("d", `M${x + 2},${y + 2} L${x + 15},${y + 18} M${x + 15},${y + 2} L${x + 2},${y + 18}`)
        .attr("stroke", "#ff6b5a").attr("stroke-width", 2.6).attr("stroke-linecap", "round").attr("opacity", 0));
    });
  });

  // the board member, in the aisle with her clipboard
  const member = svg.append("g").attr("class", "member").attr("opacity", 0)
    .attr("transform", "translate(70,560)");
  member.append("path").attr("d", "M-22,120 C-24,70 -20,40 0,34 C22,40 26,70 24,120 Z")
    .attr("fill", "#120d0b").attr("stroke", RIM).attr("stroke-width", 1.2);
  member.append("circle").attr("cy", 14).attr("r", 15).attr("fill", "#120d0b")
    .attr("stroke", RIM).attr("stroke-width", 1.2);
  member.append("circle").attr("cx", -11).attr("cy", 2).attr("r", 7).attr("fill", "#120d0b")
    .attr("stroke", RIM).attr("stroke-width", 1.2);
  member.append("rect").attr("x", 12).attr("y", 50).attr("width", 24).attr("height", 31).attr("rx", 2)
    .attr("fill", CREAM).attr("transform", "rotate(-12 24 65)");
  member.append("path").attr("d", "M16,62 h14 M16,68 h12 M16,74 h14")
    .attr("stroke", "#1d1914").attr("stroke-width", 1.2).attr("transform", "rotate(-12 24 65)");
  const bubble = svg.append("g").attr("class", "member-say").attr("opacity", 0);
  bubble.append("path")
    .attr("d", "M120,520 h250 a12,12 0 0 1 12,12 v40 a12,12 0 0 1 -12,12 h-214 l-26,22 l4,-22 h-14 a12,12 0 0 1 -12,-12 v-40 a12,12 0 0 1 12,-12 Z")
    .attr("fill", CREAM).attr("stroke", GOLD);
  bubble.append("text").attr("x", 245).attr("y", 546).attr("text-anchor", "middle")
    .attr("fill", "#1d1914").attr("font-size", 14.5).attr("font-family", DISPLAY).attr("font-style", "italic")
    .text("“Self-interested reasoning.");
  bubble.append("text").attr("x", 245).attr("y", 568).attr("text-anchor", "middle")
    .attr("fill", "#1d1914").attr("font-size", 14.5).attr("font-family", DISPLAY).attr("font-style", "italic")
    .text("I’ll count the mistakes myself.”");

  // her conclusion: hot tubs and Steinways
  const thought = svg.append("g").attr("class", "member-think").attr("opacity", 0);
  [[150, 548, 7], [176, 528, 11]].forEach(([x, y, r]) =>
    thought.append("circle").attr("cx", x).attr("cy", y).attr("r", r).attr("fill", CREAM).attr("stroke", GOLD));
  thought.append("rect").attr("x", 186).attr("y", 384).attr("width", 300).attr("height", 134).attr("rx", 60)
    .attr("fill", CREAM).attr("stroke", GOLD);
  const tub = thought.append("g").attr("transform", "translate(232,426)");
  tub.append("path").attr("d", "M0,14 H66 V34 Q66,44 56,44 H10 Q0,44 0,34 Z").attr("fill", "#2a78d6");
  tub.append("rect").attr("x", -3).attr("y", 10).attr("width", 72).attr("height", 6).attr("rx", 3).attr("fill", "#1d1914");
  [[12, 8], [26, 4], [42, 7], [54, 3]].forEach(([x, y]) =>
    tub.append("circle").attr("cx", x).attr("cy", y).attr("r", 3.5).attr("fill", "none").attr("stroke", "#2a78d6"));
  tub.append("path").attr("d", "M18,-4 q4,-6 0,-12 M34,-6 q4,-6 0,-12 M50,-4 q4,-6 0,-12")
    .attr("fill", "none").attr("stroke", "#857c6f").attr("stroke-width", 1.4);
  const piano = thought.append("g").attr("transform", "translate(338,418)");
  piano.append("path").attr("d", "M0,24 H78 C78,6 62,-2 46,6 C36,10 30,0 18,0 H0 Z").attr("fill", "#1d1914");
  piano.append("rect").attr("x", 0).attr("y", 24).attr("width", 34).attr("height", 7).attr("fill", "#f7f2e8")
    .attr("stroke", "#1d1914");
  [[4, 31, 4, 52], [70, 26, 70, 52], [40, 30, 40, 50]].forEach(([x1, y1, x2, y2]) =>
    piano.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2)
      .attr("stroke", "#1d1914").attr("stroke-width", 3));
  thought.append("text").attr("x", 336).attr("y", 497).attr("text-anchor", "middle")
    .attr("fill", "#1d1914").attr("font-size", 13).attr("font-family", DISPLAY).attr("font-style", "italic")
    .text("Rehearsals just buy hot tubs and Steinways.");

  // the repertoire reveal: two scores drop in over the stage
  const scores = svg.append("g").attr("class", "scores");
  const sc = {};
  [["A", "HAYDN", "difficulty  ●○○○○", false, 90], ["B", "MAHLER", "difficulty  ●●●●●", true, 545]]
    .forEach(([k, name, diff, dense, x]) => {
      const g = scores.append("g").attr("opacity", 0).attr("transform", `translate(${x},-260)`);
      score(g, 365, 200, dense, dense ? 3 : 4);
      g.append("text").attr("x", 18).attr("y", 30).attr("fill", "#1d1914").attr("font-size", 22)
        .attr("font-family", DISPLAY).attr("font-weight", 700).attr("letter-spacing", 2).text(name);
      g.append("text").attr("x", 347).attr("y", 30).attr("text-anchor", "end").attr("fill", "#4f4840")
        .attr("font-size", 12).text(diff);
      sc[k] = g;
    });

  // curtains + valance (drawn last so they sit on top)
  const curtains = svg.append("g").attr("class", "curtains");
  const left = curtains.append("g"), right = curtains.append("g");
  const drape = (g, x0) => g.append("path")
    .attr("d", `M${x0},0 H${x0 + 500} V600 Q${x0 + 437},618 ${x0 + 375},600 T${x0 + 250},600 T${x0 + 125},600 T${x0},600 Z`)
    .attr("fill", url("fold"));
  drape(left, 0); drape(right, 500);
  curtains.append("rect").attr("width", W).attr("height", 66).attr("fill", "#6d0f1d");
  curtains.append("path").attr("d", d3.range(20).map(i =>
    `M${i * 50},66 Q${i * 50 + 25},96 ${i * 50 + 50},66`).join(" ") + " Z")
    .attr("fill", "#6d0f1d").attr("stroke", GOLD).attr("stroke-width", 2);
  curtains.append("line").attr("x1", 0).attr("x2", W).attr("y1", 62).attr("y2", 62)
    .attr("stroke", GOLD).attr("stroke-width", 3);

  const setCurtain = p => {
    const e = ease(clamp(p));
    left.attr("transform", `translate(${-470 * e},0) scale(${1 - 0.25 * e},1)`);
    right.attr("transform", `translate(${1000 + 470 * e - 1000 * (1 - 0.25 * e)},0) scale(${1 - 0.25 * e},1)`);
  };
  setCurtain(0);

  const show = (sel, on, dur = 600) => sel.interrupt().transition().duration(dur).attr("opacity", on ? 1 : 0);
  const order = ["st-open", "st-member", "st-visits", "st-count", "st-rehearse", "st-conclude", "st-repertoire", "st-lesson"];
  const at = (step, k) => order.indexOf(step) >= order.indexOf(k);

  const node = wrap.node();
  if (finale) {
    // the closing bow: lights up on both orchestras, then the curtain falls
    const bravo = svg.append("text").attr("x", W / 2).attr("y", 330).attr("text-anchor", "middle")
      .attr("fill", "#e4c779").attr("font-family", DISPLAY).attr("font-style", "italic")
      .attr("font-size", 64).attr("opacity", 0).text("Rehearse.");
    setCurtain(1); lights.attr("opacity", 1); labels.attr("opacity", 1); svg.classed("playing", true);
    labels.selectAll("text").filter((_, i) => i === 1).text("rehearsals restored · playing Mahler");
    node.update = stepper(prefix, () => {}, (step, p) => {
      const c = clamp(p * 1.5);
      setCurtain(1 - c);
      lights.attr("opacity", 1 - c);
      bravo.attr("opacity", clamp((c - 0.75) * 4));
    });
    return node;
  }
  node.update = stepper(prefix, step => {
    if (step !== "st-open") setCurtain(1);
    show(lights, at(step, "st-open") && step !== "st-open");
    show(labels, at(step, "st-member"));
    show(member, at(step, "st-member"));
    show(bubble, step === "st-member");
    show(boards, at(step, "st-visits") && !at(step, "st-repertoire"));
    show(sparks, step === "st-count");
    show(cal, step === "st-rehearse" || step === "st-conclude");
    show(thought, step === "st-conclude");
    ["A", "B"].forEach(k => sc[k].interrupt().transition().duration(900).ease(d3.easeBackOut.overshoot(0.6))
      .attr("opacity", at(step, "st-repertoire") ? 1 : 0)
      .attr("transform", `translate(${k === "A" ? 90 : 545},${at(step, "st-repertoire") ? 168 : -260})`));
    svg.classed("playing", at(step, "st-member"));
    if (!at(step, "st-count")) {
      ["A", "B"].forEach(k => board[k].label.text("CONCERTS ATTENDED"));
    }
  }, (step, p) => {
    if (step === "st-open") { setCurtain(p * 1.6); lights.attr("opacity", clamp(p * 2 - 1)); }
    if (step === "st-visits") ["A", "B"].forEach(k => {
      const n = Math.round(clamp(p * 1.8) * 15);
      board[k].value.text(n);
      board[k].tickets.selectAll(".ticket").attr("opacity", (_, i) => i < n ? 1 : 0);
    });
    if (at(step, "st-count")) ["A", "B"].forEach(k => {
      const target = k === "A" ? 3.0 : 2.9;
      const v = step === "st-count" ? target * clamp(p * 1.8) : target;
      board[k].label.text("MISTAKES PER CONCERT");
      board[k].value.text(v.toFixed(1));
      board[k].tickets.selectAll(".ticket").attr("opacity", 1);
    });
    if (step === "st-rehearse") crosses.forEach((c, i) => c.attr("opacity", p * 1.7 > (i + 1) / 15 ? 1 : 0));
    if (at(step, "st-conclude")) crosses.forEach(c => c.attr("opacity", 1));
  });
  return node;
}
