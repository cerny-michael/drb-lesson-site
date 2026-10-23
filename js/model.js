// The repeated trade game from Downs, Rocke & Barsoom (1996), Appendix A.
//
// Near the noncooperative tariff P0, each state's utility is the quadratic
//   U_A = a(P_B - P0) + b(P_A - P0)^2 + c(P_A - P0)(P_B - P0) + d(P_B - P0)^2
// with a < 0, b < 0, c > 0, |c/2b| < 1.  A treaty cuts both tariffs by r
// percentage points (P0 = 100, so r is also the percent reduction).
//
// The article does not publish a, b, c, d.  It does report two numbers for its
// example (discount factor 0.95): a 5% treaty needs a two-period punishment,
// and the deepest treaty a permanent ("grim") punishment can hold is a 37.19%
// cut.  The values below are calibrated to reproduce both.

export const DELTA = 0.95;

// Per-period gain from the treaty:  U_T(r) = ALPHA r + BETA r^2
export const ALPHA = 1;
export const BETA = -0.0087727;
// One-period gain from cheating on a treaty of depth r:  K r^2
export const K = 0.344209;
// Underlying quadratic coefficients consistent with ALPHA, BETA, K, with the
// best-response slope -c/2b = 0.25 (so the 2x2 version is a true PD).
export const A = -ALPHA, B = -0.611927, C = 0.305964, D = 0.297191;

export const treatyU = r => ALPHA * r + BETA * r * r;
export const temptation = (r, k = K) => k * r * r;
export const defectU = (r, k = K) => treatyU(r) + temptation(r, k);

// Utility of state A at tariff cuts (rA, rB) below P0.
export const utility = (rA, rB) => {
  const xa = -rA, xb = -rB;
  return A * xb + B * xa * xa + C * xa * xb + D * xb * xb;
};

// Discounted weight of L punishment periods: sum_{t=1..L} delta^t.
export const punishWeight = (L, delta = DELTA) =>
  Number.isFinite(L) ? delta * (1 - Math.pow(delta, L)) / (1 - delta)
                     : delta / (1 - delta);

// Punishment length (continuous) that just removes the gain from cheating.
export function requiredL(r, delta = DELTA, k = K) {
  const ut = treatyU(r);
  if (r <= 0) return 0;
  if (ut <= 0) return Infinity;
  const x = 1 - (temptation(r, k) / ut) * (1 - delta) / delta;
  return x <= 0 ? Infinity : Math.log(x) / Math.log(delta);
}

// Smallest whole number of punishment periods that deters cheating.
export const requiredPeriods = (r, delta = DELTA, k = K) => {
  const L = requiredL(r, delta, k);
  return Number.isFinite(L) ? Math.max(1, Math.ceil(L - 1e-9)) : Infinity;
};

// Deepest treaty a permanent punishment can support.
export function ceiling(delta = DELTA, k = K) {
  const W = delta / (1 - delta);
  return Math.min(100, W * ALPHA / (k - W * BETA));
}

// Does a punishment of L periods deter cheating on a treaty of depth r?
export function verdict(r, L, delta = DELTA, k = K) {
  const gain = temptation(r, k);
  const loss = treatyU(r) * punishWeight(L, delta);
  return { gain, loss, deterred: gain <= loss + 1e-9 };
}

// Seeded random numbers, so every simulation on the page is reproducible.
export function rng(seed = 7) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.normal = () => {
    const u = Math.max(next(), 1e-12), v = next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  return next;
}

// The selection argument as a simulation: a large pool of possible treaties,
// each with a depth and an issue-specific temptation.  States only negotiate
// treaties whose required punishment fits the enforcement they will supply.
export function treatyPool(n = 420, seed = 11) {
  const rand = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const r = 0.5 + rand() * 69.5;
    const k = K * Math.exp(0.75 * rand.normal());
    const L = requiredL(r, DELTA, k);
    return { i, r, k, L, jitter: rand(), noise: rand() };
  });
}

// Treaties signed when states will supply at most E punishment periods.
// "Managerial" violations (ambiguity, capacity, shocks) hit 4% of them.
export function selection(pool, E) {
  const signed = pool.filter(t => t.L <= E);
  const violated = signed.filter(t => t.noise < 0.04).length;
  const unsigned = pool.filter(t => t.L > E);
  return {
    signed,
    unsigned,
    compliance: signed.length ? 1 - violated / signed.length : NaN,
    depth: signed.length ? signed.reduce((s, t) => s + t.r, 0) / signed.length : 0,
    // If states had signed everything, every treaty needing more than E is broken.
    complianceAll: 1 - (violated + unsigned.length) / pool.length
  };
}
