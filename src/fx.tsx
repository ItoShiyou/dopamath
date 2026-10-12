import React from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT, HITS, TOTAL } from "./timeline";

export const C = {
  bg: "#0a0518", pink: "#ff2d95", cyan: "#00e5ff", yellow: "#ffe600", lime: "#b6ff00",
  red: "#ff3b3b", white: "#ffffff", purple: "#7b2cff",
};
export const FONT = '"Noto Sans JP", "Noto Color Emoji", sans-serif';

/** 効果音ヒットから計算する揺れ量 */
export const shakeAt = (f: number) => {
  let x = 0, y = 0, r = 0, flash = 0;
  for (const h of HITS) {
    const d = f - h.f;
    if (d < 0 || d > 14) continue;
    const a = Math.exp(-d / 3.2) * h.mag;
    x += (random(`sx${f}${h.f}`) - 0.5) * 2 * 34 * a;
    y += (random(`sy${f}${h.f}`) - 0.5) * 2 * 34 * a;
    r += (random(`sr${f}${h.f}`) - 0.5) * 2 * 1.6 * a;
    flash += d < 6 ? Math.exp(-d / 1.8) * 0.55 * Math.min(h.mag, 1.6) : 0;
  }
  return { x, y, r, flash: Math.min(flash, 0.85) };
};

export const beatPulse = (f: number) => Math.exp(-(f % BEAT) / 3.5);

export const Camera: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const s = shakeAt(f);
  const zoom = 1 + 0.018 * beatPulse(f);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg) scale(${zoom})` }}>
      {children}
    </div>
  );
};

export const FlashLayer: React.FC = () => {
  const f = useCurrentFrame();
  const { flash } = shakeAt(f);
  const hue = (f * 7) % 360;
  return <div style={{ position: "absolute", inset: 0, background: `hsl(${hue},100%,85%)`, opacity: flash, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const hue = (f * 1.6 + 260) % 360;
  const pulse = beatPulse(f);
  const cols = 14;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: C.bg }}>
      <div style={{ position: "absolute", inset: -400, background: `radial-gradient(circle at ${50 + 20 * Math.sin(f / 20)}% ${40 + 15 * Math.cos(f / 25)}%, hsla(${hue},100%,45%,0.55), transparent 60%)` }} />
      {/* 回転サンバースト */}
      <div style={{ position: "absolute", left: "50%", top: "42%", width: 3200, height: 3200, marginLeft: -1600, marginTop: -1600,
        background: `repeating-conic-gradient(from ${f * 2.5}deg, hsla(${hue + 60},100%,60%,${0.12 + 0.12 * pulse}) 0deg 9deg, transparent 9deg 24deg)` }} />
      {/* グリッド */}
      <div style={{ position: "absolute", left: -200, right: -200, bottom: -200, height: 1100, transform: "perspective(700px) rotateX(62deg)", transformOrigin: "bottom",
        backgroundImage: `linear-gradient(hsla(${hue + 120},100%,70%,0.55) 3px, transparent 3px), linear-gradient(90deg, hsla(${hue + 120},100%,70%,0.55) 3px, transparent 3px)`,
        backgroundSize: "110px 110px", backgroundPosition: `0 ${(f * 14) % 110}px` }} />
      {/* 9の雨 */}
      {Array.from({ length: cols }).map((_, i) => {
        const speed = 10 + random(`sp${i}`) * 22;
        const y = ((f * speed + random(`y${i}`) * 3000) % 2300) - 300;
        return (
          <div key={i} style={{ position: "absolute", left: (i / cols) * 1080 + 10, top: y, fontFamily: FONT, fontWeight: 900,
            fontSize: 70 + random(`fs${i}`) * 90, color: `hsla(${hue + i * 12},100%,75%,0.2)`, lineHeight: 1 }}>
            {"9"}
          </div>
        );
      })}
      {/* ビネット */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)" }} />
    </div>
  );
};

/** スプリングで跳ねて登場 */
export const Pop: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties; from?: number; rot?: number }> = ({ delay = 0, children, style, from = 0, rot = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 8, stiffness: 260, mass: 0.55 } });
  if (f < delay) return null;
  return <div style={{ transform: `scale(${from + (1 - from) * p}) rotate(${(1 - p) * rot}deg)`, ...style }}>{children}</div>;
};

export const Txt: React.FC<{ size: number; color?: string; glow?: string; stroke?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ size, color = C.white, glow = C.pink, stroke = 0, style, children }) => (
  <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color, whiteSpace: "nowrap", letterSpacing: -2,
    textShadow: `0 0 ${size * 0.12}px ${glow}, 0 0 ${size * 0.35}px ${glow}, 0 ${size * 0.04}px 0 rgba(0,0,0,.6)`,
    WebkitTextStroke: stroke ? `${stroke}px rgba(0,0,0,.85)` : undefined, paintOrder: "stroke fill", ...style }}>
    {children}
  </div>
);

/** RGBずらしのグリッチ文字 */
export const Glitch: React.FC<{ size: number; intensity?: number; children: string; color?: string }> = ({ size, intensity = 1, children, color = C.white }) => {
  const f = useCurrentFrame();
  const on = random(`g${Math.floor(f / 2)}`) < 0.45 * intensity;
  const d = on ? 14 * intensity : 3;
  const j = on ? (random(`gj${f}`) - 0.5) * 30 * intensity : 0;
  const base: React.CSSProperties = { position: "absolute", left: 0, top: 0 };
  return (
    <div style={{ position: "relative", transform: `translateX(${j}px) skewX(${on ? j / 3 : 0}deg)` }}>
      <div style={{ ...base, transform: `translateX(${-d}px)`, mixBlendMode: "screen" }}><Txt size={size} color={C.cyan} glow="transparent">{children}</Txt></div>
      <div style={{ ...base, transform: `translateX(${d}px)`, mixBlendMode: "screen" }}><Txt size={size} color={C.pink} glow="transparent">{children}</Txt></div>
      <Txt size={size} color={color} glow={C.purple}>{children}</Txt>
    </div>
  );
};

/** 破裂する火花 */
export const Burst: React.FC<{ n?: number; at?: number; cx?: number; cy?: number; power?: number; seed?: string }> = ({ n = 36, at = 0, cx = 540, cy = 760, power = 1, seed = "b" }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 40) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`${seed}a${i}`);
        const v = (260 + random(`${seed}v${i}`) * 700) * power;
        const t = f / 30;
        const x = cx + Math.cos(a) * v * t * (1 - t * 0.4);
        const y = cy + Math.sin(a) * v * t * (1 - t * 0.4) + 500 * t * t;
        const s = 10 + random(`${seed}s${i}`) * 22;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s * (1 + random(`${seed}l${i}`) * 2), borderRadius: 6,
          background: [C.yellow, C.pink, C.cyan, C.lime, "#fff"][i % 5], opacity: 1 - f / 40, transform: `rotate(${a + f * 0.4}rad)` }} />;
      })}
    </>
  );
};

/** 衝撃波リング */
export const Shock: React.FC<{ at?: number; cx?: number; cy?: number; color?: string }> = ({ at = 0, cx = 540, cy = 760, color = C.white }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 18) return null;
  const r = 80 + f * 70;
  return <div style={{ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${Math.max(2, 26 - f * 1.4)}px solid ${color}`, opacity: 1 - f / 18 }} />;
};

export const Confetti: React.FC<{ at?: number; n?: number }> = ({ at = 0, n = 60 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const x = random(`cx${i}`) * 1080;
        const y = -100 + ((f * (14 + random(`cv${i}`) * 18)) % 2200) * 1;
        return <div key={i} style={{ position: "absolute", left: x + Math.sin(f / 5 + i) * 40, top: y, width: 22, height: 38, background: [C.yellow, C.pink, C.cyan, C.lime][i % 4],
          transform: `rotate(${f * (6 + (i % 7)) + i * 30}deg)`, borderRadius: 4 }} />;
      })}
    </>
  );
};

export const progress = (f: number) => interpolate(f, [0, TOTAL], [0, 1], { extrapolateRight: "clamp" });
