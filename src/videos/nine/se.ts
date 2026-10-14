import type { SEvent } from "../../timeline";

export const SE: SEvent[] = [
  // --- フック ---
  { t: 0.0, n: "hit" }, { t: 0.0, n: "glitch", v: 0.6 },
  { t: 0.95, n: "tick" }, { t: 1.25, n: "pop" },
  { t: 1.6, n: "glitch" }, { t: 1.62, n: "hit", v: 0.7 },
  { t: 2.2, n: "riser", v: 0.9 },
  { t: 3.2, n: "boom" }, { t: 3.22, n: "sparkle" },
  // --- 証明① (1/3) ---
  { t: 6.0, n: "whoosh" }, { t: 6.15, n: "pop" },
  { t: 7.2, n: "tick" }, { t: 7.5, n: "tick" }, { t: 7.8, n: "tick" },
  { t: 9.0, n: "swoosh" }, { t: 9.1, n: "hit" },
  { t: 10.0, n: "pop" }, { t: 10.33, n: "pop" }, { t: 10.66, n: "pop" },
  { t: 11.8, n: "whoosh" }, { t: 12.6, n: "riser", v: 0.8 },
  { t: 13.6, n: "boom" }, { t: 13.62, n: "sparkle" },
  // --- 証明② (代数) ---
  { t: 15.0, n: "whoosh" }, { t: 15.2, n: "pop" },
  { t: 18.0, n: "swoosh" }, { t: 18.15, n: "hit", v: 0.8 },
  { t: 20.7, n: "whoosh" }, { t: 21.9, n: "tick" },
  { t: 22.8, n: "glitch" }, { t: 23.0, n: "swoosh" },
  { t: 24.0, n: "riser", v: 0.7 },
  { t: 24.8, n: "boom" }, { t: 24.82, n: "sparkle" },
  // --- 極限 ---
  { t: 27.5, n: "whoosh" }, { t: 27.7, n: "pop" },
  { t: 28.2, n: "tick" }, { t: 28.7, n: "tick" }, { t: 29.2, n: "tick" }, { t: 29.6, n: "tick" },
  { t: 31.0, n: "swoosh" }, { t: 31.1, n: "hit", v: 0.8 },
  { t: 32.3, n: "riser", v: 0.8 },
  { t: 33.2, n: "ding" }, { t: 33.2, n: "sparkle" },
  // --- 隙間ゼロ ---
  { t: 35.0, n: "whoosh" }, { t: 35.05, n: "glitch" },
  { t: 36.0, n: "riser", v: 0.9 },
  { t: 37.2, n: "boom" },
  // --- CTA ---
  { t: 38.7, n: "whoosh" }, { t: 38.8, n: "hit" },
  { t: 39.6, n: "pop" }, { t: 40.2, n: "ding" }, { t: 40.8, n: "sparkle" }, { t: 41.4, n: "pop" },
];

