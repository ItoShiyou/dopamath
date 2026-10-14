import React from "react";
import { random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "./fx";
import { sec, useTL } from "./timeline";

const parse = (chunk: string) => {
  const segs = chunk.split(/(\[[^\]]*\])/).filter(Boolean).map((t) => (t.startsWith("[") ? { t: t.slice(1, -1), hot: true } : { t, hot: false }));
  return { text: segs.map((x) => x.t).join(""), hot: segs.some((x) => x.hot), segs };
};

/** 1フレーズずつドンドン切り替わる字幕 */
export const Caption: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const LINES = useTL().lines;
  const line = [...LINES].reverse().find((l) => f >= sec(l.start) - 1);
  if (!line) return null;
  const chunks = line.text.split("|").map(parse);
  const total = chunks.reduce((a, c) => a + c.text.length + 1, 0);
  const t0 = sec(line.start);
  const durF = Math.max(line.dur * fps, 20);
  let acc = 0;
  const starts = chunks.map((c) => { const s = t0 + (acc / total) * durF; acc += c.text.length + 1; return s; });
  let idx = 0;
  starts.forEach((s, i) => { if (f >= s - 1) idx = i; });
  const c = chunks[idx];
  const local = f - starts[idx];
  const p = spring({ frame: local, fps, config: { damping: 7, stiffness: 300, mass: 0.5 } });
  const rot = (random(`cr${line.id}${idx}`) - 0.5) * 8;
  const len = c.text.length;
  const size = Math.min(150, Math.floor(960 / Math.max(len * 0.95, 4)));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290, height: 280, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `scale(${0.4 + 0.6 * p + (c.hot ? 0.12 * Math.sin(f / 2) : 0)}) rotate(${rot * (1 - p * 0.4)}deg)`,
        fontFamily: FONT, fontWeight: 900, fontSize: size, whiteSpace: "nowrap", letterSpacing: -3,
        WebkitTextStroke: `${size * 0.14}px #12002b`, paintOrder: "stroke fill",
        textShadow: c.hot ? `0 0 40px ${C.pink}, 0 12px 0 #12002b` : `0 10px 0 #12002b, 0 0 30px ${C.purple}` }}>
        {c.segs.map((g, i) => <span key={i} style={{ color: g.hot ? C.yellow : C.white }}>{g.t}</span>)}
      </div>
    </div>
  );
};
