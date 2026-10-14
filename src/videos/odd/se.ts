import type { SEvent } from "../../timeline";

/** n×n グリッドの各層(L字)が現れる時刻(秒) */
export const LAYER_AT = [6.4, 9.0, 11.8, 14.6, 17.4];

const cells: SEvent[] = LAYER_AT.flatMap((s, i) =>
  Array.from({ length: 2 * (i + 1) - 1 }, (_, c) => ({ t: s + c * (2 / 30), n: "tick", v: 0.5 }))
);

export const SE: SEvent[] = [
  // フック: 平方数の式が連打で出る
  { t: 0.0, n: "hit" }, { t: 0.3, n: "tick" }, { t: 0.8, n: "tick" }, { t: 1.3, n: "tick" }, { t: 1.8, n: "tick" },
  { t: 2.3, n: "glitch" }, { t: 2.5, n: "riser", v: 0.9 },
  { t: 3.2, n: "boom" }, { t: 3.22, n: "sparkle" },
  // 絵にする
  { t: 3.6, n: "whoosh" }, { t: 4.1, n: "tick" }, { t: 4.4, n: "tick" }, { t: 4.7, n: "tick" }, { t: 5.0, n: "riser", v: 0.7 },
  { t: 6.0, n: "whoosh" },
  ...LAYER_AT.map((t, i) => ({ t, n: "hit", v: 0.5 + i * 0.1 })),
  ...LAYER_AT.slice(1).map((t) => ({ t: t - 0.4, n: "swoosh", v: 0.7 })),
  ...cells,
  { t: 18.3, n: "boom", v: 0.8 }, { t: 18.32, n: "sparkle" },
  // 完成するたびに
  { t: 19.8, n: "whoosh" }, { t: 20.4, n: "pop" }, { t: 21.0, n: "pop" }, { t: 21.6, n: "pop" }, { t: 22.2, n: "pop" }, { t: 22.8, n: "pop" },
  // 一般化
  { t: 23.4, n: "whoosh" }, { t: 23.6, n: "pop" }, { t: 24.6, n: "riser", v: 0.8 }, { t: 25.6, n: "boom" }, { t: 25.62, n: "sparkle" },
  // 50²=2500
  { t: 27.0, n: "hit" }, { t: 27.1, n: "whoosh" }, { t: 28.0, n: "pop" }, { t: 28.6, n: "riser", v: 0.8 },
  ...Array.from({ length: 8 }, (_, i) => ({ t: 28.9 + i * 0.12, n: "tick", v: 0.6 })),
  { t: 29.9, n: "boom" }, { t: 29.92, n: "ding" },
  // なぜ
  { t: 30.6, n: "whoosh" }, { t: 31.1, n: "pop" }, { t: 31.4, n: "tick" }, { t: 31.6, n: "tick" }, { t: 31.8, n: "tick" },
  { t: 32.6, n: "hit" }, { t: 32.7, n: "pop" }, { t: 33.5, n: "ding" },
  // CTA
  { t: 34.4, n: "whoosh" }, { t: 34.5, n: "hit" }, { t: 35.3, n: "pop" }, { t: 36.0, n: "ding" }, { t: 36.6, n: "sparkle" }, { t: 37.2, n: "pop" },
];
