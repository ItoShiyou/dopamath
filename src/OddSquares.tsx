import React from "react";
import { Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VideoShell } from "./VideoShell";
import { SceneCTA } from "./scenes";
import { Burst, C, Confetti, FONT, Glitch, Pop, Shock, Txt } from "./fx";
import { sec } from "./timeline";
import { oddTL } from "./videos/odd";
import { LAYER_AT } from "./videos/odd/se";

// 3Blue1Brown風パレット
const LAYER = ["#FFFF00", "#58C4DD", "#83C167", "#FC6255", "#C79CFF"];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GLYPHS = "0123456789.…＝＋−×÷（）()nL²GOAL絵一般奇数平方数個正方形完成なぜ次回を解くDOPAMATH⚡高校数学図解で脳汁フォローで脳汁ドバドバ";

const Center: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", ...style }}>{children}</div>
);

/** 色付きの項を並べた式 */
const Eq: React.FC<{ n: number; size: number; tail?: string }> = ({ n, size, tail }) => (
  <Txt size={size} glow="#58C4DD">
    {Array.from({ length: n }).map((_, i) => (
      <span key={i} style={{ color: LAYER[i] }}>{i ? "＋" : ""}{2 * i + 1}</span>
    ))}
    <span style={{ color: "#fff" }}>{tail}</span>
  </Txt>
);

/** ===== フック (0–3.2s): 平方数の式が連打で出る ===== */
const SceneHook: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    { n: 1, at: 9 }, { n: 2, at: 24 }, { n: 3, at: 39 }, { n: 4, at: 54 },
  ];
  return (
    <>
      {rows.map((r) => f >= r.at && (
        <div key={r.n} style={{ position: "absolute", left: 90, top: 250 + (r.n - 1) * 190 }}>
          <Pop from={0.3} style={{ transformOrigin: "left center" }}>
            <Eq n={r.n} size={86} tail={`＝ ${r.n * r.n}`} />
            <div style={{ position: "absolute", right: -20, top: 0, transform: "translateX(100%)" }} />
          </Pop>
        </div>
      ))}
      {rows.map((r) => f >= r.at + 5 && (
        <div key={`s${r.n}`} style={{ position: "absolute", right: 70, top: 230 + (r.n - 1) * 190 }}>
          <Pop from={0.1} rot={10}><Txt size={120} color="#FFFF00" glow="#FC6255">{r.n}²</Txt></Pop>
        </div>
      ))}
      {f >= 70 && (
        <Center top={1030}><Pop from={5} rot={-14}><Glitch size={240} intensity={1.4} color="#FC6255">なぜ！？</Glitch></Pop></Center>
      )}
    </>
  );
};

/** ===== L字グリッド ===== */
const Grid: React.FC<{ n: number; cell: number; x0: number; y0: number; at: number[]; offset: number; dim?: boolean }> = ({ n, cell, x0, y0, at, offset, dim }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = offset + f / 30;
  const pitch = cell + 8;
  const out: React.ReactNode[] = [];
  for (let k = 1; k <= n; k++) {
    for (let i = 0; i < 2 * k - 1; i++) {
      const r = i < k ? i : k - 1;
      const c = i < k ? k - 1 : 2 * k - 2 - i;
      const start = at[k - 1] + (i * 2) / 30;
      if (t < start) continue;
      const p = spring({ frame: (t - start) * fps, fps, config: { damping: 9, stiffness: 240, mass: 0.5 } });
      const fromX = i < k ? 1 : 0, fromY = i < k ? 0 : 1;
      out.push(
        <div key={`${k}-${i}`} style={{ position: "absolute", left: x0 + c * pitch + (1 - p) * fromX * 380, top: y0 + r * pitch + (1 - p) * fromY * 380,
          width: cell, height: cell, borderRadius: 14, background: LAYER[(k - 1) % 5], opacity: Math.min(1, p * 1.5) * (dim ? 0.9 : 1),
          boxShadow: `0 0 ${26 * p}px ${LAYER[(k - 1) % 5]}, inset 0 0 0 4px rgba(255,255,255,.55)`, transform: `scale(${0.4 + 0.6 * p}) rotate(${(1 - p) * 40}deg)` }} />
      );
    }
  }
  return <>{out}</>;
};

/** ===== 絵にする〜L字を足す (3.2–23.4s) ===== */
const SceneBuild: React.FC = () => {
  const f = useCurrentFrame();
  const OFF = 3.2;
  const t = OFF + f / 30;
  const CELL = 160, PITCH = 168, X0 = 120, Y0 = 440;
  // うっすらアウトライン(5x5の完成予想図)
  const outline = Array.from({ length: 25 }).map((_, i) => {
    const r = Math.floor(i / 5), c = i % 5;
    const p = interpolate(f, [8 + i * 1.2, 16 + i * 1.2], [0, 1], clamp);
    return <div key={i} style={{ position: "absolute", left: X0 + c * PITCH, top: Y0 + r * PITCH, width: CELL, height: CELL, borderRadius: 14, border: "3px dashed rgba(88,196,221,.55)", opacity: p, transform: `scale(${0.7 + 0.3 * p})` }} />;
  });
  // L08: 各正方形の枠を順にハイライト
  const hl = t >= 19.8 && t < 23.4 ? Math.floor((t - 19.8) / 0.6) % 5 : -1;
  const done = t >= 18.3;
  const eqSeqs = LAYER_AT.map((s, k) => {
    const from = sec(s - OFF - 0.1), to = k < 4 ? sec(LAYER_AT[k + 1] - OFF - 0.1) : sec(23.4 - OFF);
    const tails = ["＝ 1²", "＝ 4 ＝ 2²", "＝ 9 ＝ 3²", "＝ 16 ＝ 4²", "＝ 25 ＝ 5²"];
    const size = [110, 110, 104, 96, 88][k];
    return (
      <Sequence key={k} from={from} durationInFrames={to - from}>
        <Center top={240}><Pop from={0.3}><Eq n={k + 1} size={size} tail={tails[k]} /></Pop></Center>
      </Sequence>
    );
  });
  return (
    <>
      {f < sec(6.0 - OFF) && <Center top={230}><Pop from={0.3} rot={-6}><Glitch size={150} intensity={0.8} color="#58C4DD">絵にすると…</Glitch></Pop></Center>}
      {outline}
      <Grid n={5} cell={CELL} x0={X0} y0={Y0} at={LAYER_AT} offset={OFF} />
      {eqSeqs}
      {hl >= 0 && (
        <div style={{ position: "absolute", left: X0 - 10, top: Y0 - 10, width: (hl + 1) * PITCH + 12, height: (hl + 1) * PITCH + 12, border: "12px solid #fff", borderRadius: 24, boxShadow: `0 0 50px ${LAYER[hl]}, inset 0 0 50px ${LAYER[hl]}` }} />
      )}
      {hl >= 0 && <Center top={345}><Txt size={56} color="#fff" glow="#58C4DD">{hl + 1} × {hl + 1} ＝ {(hl + 1) ** 2}</Txt></Center>}
      {done && f < sec(19.8 - OFF) && (<><Shock at={sec(18.3 - OFF)} cx={540} cy={820} color="#fff" /><Burst at={sec(18.3 - OFF)} cx={540} cy={820} n={44} seed="g5" /></>)}
    </>
  );
};

/** ===== 一般化 + 50²=2500 (23.4–30.6s) ===== */
const SceneFormula: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 108) {
    return (
      <>
        <div style={{ position: "absolute", right: 60, top: 220, transform: "rotate(5deg)" }}><Pop from={0.2}><div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: "#fff", background: "#9A72AC", padding: "6px 30px", borderRadius: 16, border: "6px solid #fff" }}>一般化</div></Pop></div>
        <Center top={400}><Pop from={0.3}><Txt size={96} glow="#58C4DD">1＋3＋5＋…＋(2n−1)</Txt></Pop></Center>
        {f >= 66 && <Center top={620}><Pop from={6} rot={-20}><Txt size={400} color="#83C167" glow="#83C167">＝ n²</Txt></Pop></Center>}
        {f >= 66 && <><Shock at={66} cy={780} color="#83C167" /><Burst at={66} cy={780} n={44} seed="f1" /><Confetti at={70} n={30} /></>}
      </>
    );
  }
  const g = f - 108; // 27.0s 起点
  const count = Math.round(interpolate(g, [58, 88], [0, 2500], { ...clamp, easing: Easing.out(Easing.cubic) }));
  return (
    <>
      <Center top={290}><Pop from={0.3}><Txt size={110} glow="#58C4DD">1＋3＋5＋…＋99</Txt></Pop></Center>
      {g >= 10 && <Center top={470}><Pop from={0.2}><Txt size={64} color="#FFFF00" glow="#FC6255">奇数50個ぶん</Txt></Pop></Center>}
      {g >= 20 && <Center top={620}><Pop from={5} rot={-10}><Txt size={300} color="#58C4DD" glow="#58C4DD">50²</Txt></Pop></Center>}
      {g >= 58 && (
        <Center top={930}>
          <Txt size={g >= 88 ? 230 : 200} color={g >= 88 ? "#FFFF00" : "#fff"} glow={g >= 88 ? "#FC6255" : "#58C4DD"} style={{ fontVariantNumeric: "tabular-nums", transform: g >= 88 ? `scale(${1 + 0.05 * Math.sin(g)})` : undefined }}>
            ＝ {count}
          </Txt>
        </Center>
      )}
      {g >= 88 && <><Shock at={108 + 88} cy={1050} color="#FFFF00" /><Confetti at={0} n={0} /></>}
    </>
  );
};

/** ===== なぜL字は奇数？ (30.6–34.4s) ===== */
const SceneWhy: React.FC = () => {
  const f = useCurrentFrame();
  const CELL = 112, P = 120, X0 = 180, Y0 = 430;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
    const isL = r === 5 || c === 5;
    const idx = r === 5 ? 5 + (5 - c) : r; // L字を端から
    const appear = interpolate(f, [4 + (r * 6 + c) * 0.5, 12 + (r * 6 + c) * 0.5], [0, 1], clamp);
    const lp = isL ? interpolate(f, [30 + idx * 2.5, 38 + idx * 2.5], [0, 1], clamp) : 0;
    cells.push(
      <div key={`${r}-${c}`} style={{ position: "absolute", left: X0 + c * P, top: Y0 + r * P, width: CELL, height: CELL, borderRadius: 12,
        background: isL ? `rgba(252,98,85,${0.25 + 0.75 * lp})` : "rgba(88,196,221,.75)", opacity: appear,
        boxShadow: isL && lp > 0.5 ? "0 0 28px #FC6255, inset 0 0 0 4px rgba(255,255,255,.6)" : "inset 0 0 0 4px rgba(255,255,255,.35)", transform: `scale(${0.6 + 0.4 * appear + (isL ? 0.12 * lp : 0)})` }} />
    );
  }
  return (
    <>
      <Center top={235}><Pop from={0.3}><Txt size={72} color="#fff" glow="#58C4DD">6×6 から 5×5 を引くと</Txt></Pop></Center>
      {cells}
      {f >= 24 && <div style={{ position: "absolute", left: X0 + 40, top: Y0 + 2.2 * P, transform: "rotate(-4deg)" }}><Pop from={0.2}><Txt size={64} color="#0b0e1c" glow="#fff" style={{ background: "#58C4DD", padding: "4px 20px", borderRadius: 14, textShadow: "none" }}>(n−1)²</Txt></Pop></div>}
      {f >= 40 && <div style={{ position: "absolute", left: 0, right: 0, top: 335, display: "flex", justifyContent: "center", transform: "rotate(-2deg)" }}><Pop from={0.2}><Txt size={70} color="#FC6255" glow="#FC6255">L字＝11個</Txt></Pop></div>}
      {f >= 66 && <Center top={1185}><Pop from={0.3}><Txt size={68} color="#FFFF00" glow="#FC6255">n² − (n−1)² ＝ 2n−1</Txt></Pop></Center>}
      {f >= 66 && <Shock at={66} cy={1180} color="#FFFF00" />}
    </>
  );
};

export const OddSquares: React.FC = () => (
  <VideoShell tl={oddTL} glyphs={GLYPHS} calm tag="高校数学を図で解く">
    <Sequence from={0} durationInFrames={sec(3.2)}><SceneHook /></Sequence>
    <Sequence from={sec(3.2)} durationInFrames={sec(20.2)}><SceneBuild /></Sequence>
    <Sequence from={sec(23.4)} durationInFrames={sec(7.2)}><SceneFormula /></Sequence>
    <Sequence from={sec(30.6)} durationInFrames={sec(3.8)}><SceneWhy /></Sequence>
    <Sequence from={sec(34.4)} durationInFrames={oddTL.total - sec(34.4)}><SceneCTA teaser="次回:1+2+…+n を絵で解く" /></Sequence>
  </VideoShell>
);
