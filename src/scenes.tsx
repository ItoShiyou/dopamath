import React from "react";
import { interpolate, random, useCurrentFrame, Easing } from "remotion";
import { Burst, C, Confetti, FONT, Glitch, Pop, Shock, Txt } from "./fx";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Center: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", ...style }}>{children}</div>
);
const Badge: React.FC<{ children: React.ReactNode; color?: string; delay?: number; rot?: number }> = ({ children, color = C.pink, delay = 0, rot = -6 }) => (
  <Pop delay={delay} rot={rot} from={0.2}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: "#fff", background: color, padding: "6px 34px", borderRadius: 18, border: "6px solid #fff", boxShadow: "0 10px 0 rgba(0,0,0,.5)", transform: `rotate(${rot}deg)` }}>{children}</div>
  </Pop>
);

/** ===== 1. フック (0–6s) ===== */
export const SceneHook: React.FC = () => {
  const f = useCurrentFrame();
  const nines = Math.min(9, Math.floor(f / 2.2));
  const str = "0." + "9".repeat(nines) + (nines >= 9 ? "…" : "");
  const slam = f - 96; // 3.2s
  const zoom = f < 96 ? interpolate(f, [60, 96], [1, 1.25], clamp) : 1;
  const wobble = f > 40 && f < 96 ? Math.sin(f * 1.7) * 4 : 0;
  if (slam < 0) {
    return (
      <>
        <Center top={250}><Pop from={0.3} rot={-10}><Txt size={96} color={C.yellow} glow={C.red}>これ、どっち？</Txt></Pop></Center>
        <Center top={470} style={{ transform: `scale(${zoom}) rotate(${wobble}deg)` }}>
          <Glitch size={Math.min(230, Math.floor(980 / (str.length * 0.58)))} intensity={f > 44 ? 1.6 : 0.8}>{str}</Glitch>
        </Center>
        {f > 28 && <Center top={820}><Pop from={0.1}><Txt size={80} color={C.cyan} glow={C.cyan}>VS</Txt></Pop></Center>}
        {f > 28 && <Center top={920}><Pop from={0.1} rot={8}><Txt size={300} color={C.white} glow={C.lime}>1</Txt></Pop></Center>}
        {f > 46 && f < 96 && (
          <div style={{ position: "absolute", left: 120, top: 560, transform: `rotate(-18deg) scale(${1 + 0.15 * Math.sin(f)})` }}>
            <Pop from={0.1}><Txt size={230} color={C.red} glow={C.red}>？？</Txt></Pop>
          </div>
        )}
        {f > 46 && f < 96 && (
          <div style={{ position: "absolute", right: 90, top: 1040, transform: "rotate(12deg)" }}>
            <Pop from={0.1}><Txt size={110} color={C.yellow} glow={C.red}>1より小さくね？</Txt></Pop>
          </div>
        )}
      </>
    );
  }
  const s = interpolate(slam, [0, 6], [7, 1], { ...clamp, easing: Easing.out(Easing.exp) });
  return (
    <>
      <Center top={380}><Txt size={200} glow={C.cyan}>0.999…</Txt></Center>
      <Center top={620} style={{ transform: `scale(${s}) rotate(${(1 - s / 7) * -20}deg)` }}><Txt size={520} color={C.yellow} glow={C.pink}>＝</Txt></Center>
      <Center top={1020}><Txt size={330} color={C.lime} glow={C.lime}>1</Txt></Center>
      <div style={{ position: "absolute", right: 40, top: 280, transform: "rotate(-9deg)" }}><Badge delay={10} color={C.red} rot={0}>マジです</Badge></div>
      <Shock at={96} cy={760} /><Shock at={99} cy={760} color={C.yellow} />
      <Burst at={96} cy={760} n={44} />
    </>
  );
};

/** ===== 2. 証明① 1/3 (6–15s) ===== */
export const SceneThird: React.FC = () => {
  const f = useCurrentFrame();
  const digit = (i: number, cutIn: number, flipAt: number) => {
    const shown = f > cutIn;
    if (!shown) return null;
    const flip = interpolate(f, [flipAt, flipAt + 8], [0, 180], clamp);
    const is9 = flip > 90;
    return (
      <div style={{ width: 210, textAlign: "center", transform: `rotateX(${is9 ? flip - 180 : flip}deg) scale(${1 + (f - cutIn < 6 ? 0.3 : 0)})` }}>
        <Txt size={260} color={is9 ? C.yellow : C.cyan} glow={is9 ? C.pink : C.cyan}>{is9 ? "9" : "3"}</Txt>
      </div>
    );
  };
  const reveal = f > 231 - 0;
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 220 }}><Badge delay={0}>証明①</Badge></div>
      {f < 176 && (
        <>
          <Center top={400}><Pop from={0.2}><Txt size={190} glow={C.cyan}>1 ÷ 3</Txt></Pop></Center>
          {f > 20 && <Center top={650}><Pop from={0.2}><Txt size={170} glow={C.cyan}>＝ 0.</Txt></Pop></Center>}
          <div style={{ position: "absolute", left: 110, top: 860, display: "flex" }}>
            {digit(0, 38, 100)}{digit(1, 48, 109)}{digit(2, 58, 118)}
            {f > 68 && f < 100 && <Pop from={0.1}><Txt size={260} glow={C.cyan}>…</Txt></Pop>}
            {f >= 100 && <Txt size={260} color={f > 118 ? C.yellow : C.cyan} glow={C.pink}>…</Txt>}
          </div>
          {f > 90 && (
            <div style={{ position: "absolute", right: 60, top: 600, transform: "rotate(8deg)" }}>
              <Pop from={0.1} rot={20}><Txt size={260} color={C.pink} glow={C.pink}>×3</Txt></Pop>
            </div>
          )}
          {f >= 122 && <Center top={1130}><Pop from={0.2}><Txt size={90} color={C.yellow} glow={C.pink}>＝ 0.999…</Txt></Pop></Center>}
        </>
      )}
      {f >= 176 && (
        <>
          <Center top={430}><Pop from={0.3}><Txt size={150} glow={C.cyan}>1 ÷ 3 × 3</Txt></Pop></Center>
          <Center top={640}>
            {!reveal ? (
              <Txt size={420} color={C.red} glow={C.red} style={{ transform: `scale(${1 + 0.06 * Math.sin(f)})` }}>＝ ？</Txt>
            ) : (
              <Pop from={4} rot={-30}><Txt size={420} color={C.lime} glow={C.lime}>＝ 1</Txt></Pop>
            )}
          </Center>
          {reveal && <Center top={1040}><Pop delay={6} from={0.1}><Txt size={86} color={C.yellow} glow={C.pink}>だから 0.999… ＝ 1</Txt></Pop></Center>}
          {reveal && (<><Shock at={231} cy={780} /><Burst at={231} cy={780} n={40} seed="t" /></>)}
        </>
      )}
    </>
  );
};

/** ===== 3. 証明② 代数 (15–27.5s) ===== */
export const SceneAlgebra: React.FC = () => {
  const f = useCurrentFrame();
  const row = (label: string, value: string, top: number, delay: number, color = C.white) => (
    f >= delay ? (
      <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
        <Pop delay={0} from={0.3}><Txt size={128} color={color} glow={C.cyan} style={{ fontVariantNumeric: "tabular-nums" }}>{label} ＝ {value}</Txt></Pop>
      </div>
    ) : null
  );
  const shift = f > 170 ? 0 : 0;
  const crossed = f > 230;
  const wipe = interpolate(f, [230, 245], [0, 100], clamp);
  const final = f >= 300; // 24.8s
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 220 }}><Badge delay={0}>証明②</Badge></div>
      {!final && (
        <>
          {row("x", "0.999…", 340 + shift, 0, C.yellow)}
          {row("10x", "9.999…", 520, 90, C.cyan)}
          {f >= 170 && (
            <>
              <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center" }}>
                <Pop from={0.2}><Txt size={110} color={C.pink} glow={C.pink}>10x − x</Txt></Pop>
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 910, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 }}>
                <Pop from={0.2}>
                  <div style={{ position: "relative" }}>
                    <Txt size={104} color={C.white} glow={C.cyan}>9.<span style={{ color: crossed ? "#665" : C.lime }}>999…</span> − 0.<span style={{ color: crossed ? "#665" : C.lime }}>999…</span></Txt>
                    {crossed && <div style={{ position: "absolute", left: 0, top: "50%", height: 14, width: `${wipe}%`, background: C.red, transform: "rotate(-3deg)", boxShadow: `0 0 30px ${C.red}` }} />}
                  </div>
                </Pop>
              </div>
              {crossed && (
                <Center top={1090}><Pop from={0.2}><Txt size={140} color={C.yellow} glow={C.pink}>＝ 9</Txt></Pop></Center>
              )}
            </>
          )}
        </>
      )}
      {final && (
        <>
          <Center top={340}><Pop from={0.3}><Txt size={150} glow={C.cyan}>9x ＝ 9</Txt></Pop></Center>
          <Center top={560}>{f > 308 && <Pop from={0.1}><Txt size={110} color={C.pink} glow={C.pink}>両辺 ÷ 9</Txt></Pop>}</Center>
          <Center top={760}>
            {f > 318 && <Pop from={5} rot={-20}><Txt size={400} color={C.lime} glow={C.lime}>x ＝ 1</Txt></Pop>}
          </Center>
          <Shock at={300} cy={900} /><Burst at={300} cy={900} n={50} seed="x" /><Confetti at={304} n={40} />
          {f > 335 && <Center top={1130}><Pop from={0.1}><Txt size={76} color={C.yellow} glow={C.pink}>x ＝ 0.999… だったよね？</Txt></Pop></Center>}
        </>
      )}
    </>
  );
};

/** ===== 4. 極限・無限級数 (27.5–35s) ===== */
export const SceneLimit: React.FC = () => {
  const f = useCurrentFrame();
  const terms = [
    { t: "0.9", at: 21, c: C.pink, w: 0.9 },
    { t: "0.09", at: 36, c: C.cyan, w: 0.09 },
    { t: "0.009", at: 51, c: C.yellow, w: 0.009 },
    { t: "0.0009", at: 63, c: C.lime, w: 0.0009 },
  ];
  const BAR = 920;
  let x = 0;
  const barRow = terms.map((tm) => { const w = tm.w * BAR; const el = { ...tm, x, wpx: w }; x += w; return el; });
  const form = f >= 105;
  const glow = f >= 165;
  return (
    <>
      <div style={{ position: "absolute", right: 50, top: 230 }}><Badge delay={0} color={C.purple} rot={5}>数学Ⅲ ｜ 極限</Badge></div>
      <div style={{ position: "absolute", left: 120, top: 330 }}>
        {terms.map((tm, i) => f >= tm.at && (
          <Pop key={i} from={0.2} style={{ transformOrigin: "left center" }}>
            <Txt size={104} color={tm.c} glow={tm.c} style={{ lineHeight: 1.18 }}>{i === 0 ? "" : "＋ "}{tm.t}</Txt>
          </Pop>
        ))}
        {f >= 70 && <Pop from={0.2}><Txt size={104} color={C.white} glow={C.white} style={{ lineHeight: 1.18 }}>＋ …（無限に）</Txt></Pop>}
      </div>
      {/* ゴールバー */}
      <div style={{ position: "absolute", left: 80, top: 960, width: BAR, height: 90, border: "6px solid #fff", borderRadius: 16, background: "rgba(0,0,0,.45)", overflow: "hidden" }}>
        {barRow.map((b, i) => f >= terms[i].at && (
          <div key={i} style={{ position: "absolute", left: b.x, top: 0, bottom: 0, width: Math.max(b.wpx, 4) * interpolate(f - terms[i].at, [0, 6], [0, 1], clamp), background: b.c, boxShadow: `0 0 30px ${b.c}` }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 80, top: 1060 }}><Txt size={50} color={C.white} glow={C.cyan}>0</Txt></div>
      <div style={{ position: "absolute", left: 80 + BAR - 190, top: 1060 }}><Txt size={64} color={C.lime} glow={C.lime}>GOAL 1</Txt></div>
      {form && (
        <Center top={1150} style={{ left: 0 }}>
          <Pop from={0.2}>
            <Txt size={74} color={glow ? C.lime : C.white} glow={glow ? C.lime : C.cyan}>{glow ? "0.9 ÷ (1 − 0.1) ＝ 1" : "0.9 ÷ (1 − 0.1) ＝ ?"}</Txt>
          </Pop>
        </Center>
      )}
      {glow && <><Shock at={165} cy={1000} color={C.lime} /><Burst at={165} cx={540} cy={1000} n={36} seed="l" /></>}
    </>
  );
};

/** ===== 5. 隙間ゼロ (35–38.7s) ===== */
export const SceneGap: React.FC = () => {
  const f = useCurrentFrame();
  const zeros = Math.min(9, Math.floor(f / 3));
  const dead = f >= 66; // 37.2s
  const tries = f > 36 && f < 66 ? Math.floor(f / 3) % 2 === 0 : false;
  return (
    <>
      <Center top={250}><Pop from={0.3}><Txt size={110} color={C.cyan} glow={C.cyan}>1 − 0.999… ＝</Txt></Pop></Center>
      <Center top={470}>
        <Glitch size={Math.min(200, Math.floor(980 / ((zeros + 3) * 0.58)))} intensity={f < 66 ? 1.1 : 0.2}>{"0." + "0".repeat(zeros) + "…"}</Glitch>
      </Center>
      {tries && (
        <div style={{ position: "absolute", left: 120, top: 900, transform: "rotate(-5deg)" }}>
          <Txt size={170} color={C.red} glow={C.red}>1 来ない</Txt>
        </div>
      )}
      {f > 30 && !dead && <Center top={780}><Pop from={0.1}><Txt size={70} color={C.yellow} glow={C.pink}>最後の「1」はいつ来る？</Txt></Pop></Center>}
      {dead && (
        <>
          <Center top={760}><Pop from={5} rot={-15}><Txt size={330} color={C.lime} glow={C.lime}>＝ 0</Txt></Pop></Center>
          <Center top={1090}><Pop delay={8} from={0.1} rot={-4}><Txt size={80} color={C.yellow} glow={C.pink}>終わりがないから ゼロ！</Txt></Pop></Center>
          <Shock at={66} cy={900} /><Burst at={66} cy={900} n={44} seed="g" />
        </>
      )}
    </>
  );
};

/** ===== 6. CTA (38.7–42.5s) ===== */
export const SceneCTA: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.07 * Math.sin(f * 0.9);
  return (
    <>
      <Confetti at={0} n={70} />
      <Center top={300}><Pop from={0.2} rot={-8}><Txt size={190} color={C.yellow} glow={C.pink}>フォローで</Txt></Pop></Center>
      <Center top={520}><Pop delay={5} from={0.2} rot={6}><Txt size={150} color={C.white} glow={C.cyan}>脳汁ドバドバ</Txt></Pop></Center>
      <Center top={760} style={{ transform: `scale(${pulse})` }}>
        {f > 14 && (
          <Pop from={0.1}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 120, color: "#fff", background: "#ff2d55", padding: "20px 80px", borderRadius: 40, border: "8px solid #fff", boxShadow: "0 0 80px #ff2d55, 0 14px 0 rgba(0,0,0,.5)" }}>＋ フォロー</div>
          </Pop>
        )}
      </Center>
      {f > 30 && (
        <Center top={1000} style={{ left: 380, right: "auto" }}>
          <Pop from={0.1} style={{ transform: `translateY(${Math.sin(f * 0.8) * 16}px)` }}><div style={{ fontSize: 150, fontFamily: FONT }}>👆</div></Pop>
        </Center>
      )}
      {f > 50 && (
        <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center", top: 1150, transform: "rotate(-3deg)" }}>
          <Pop from={0.1}><Txt size={54} color={C.cyan} glow={C.cyan}>次回:1+2+3+…＝−1/12？</Txt></Pop>
        </div>
      )}
    </>
  );
};

export const TopTag: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 40, top: 70, display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 50, color: "#fff", background: C.pink, padding: "2px 22px", borderRadius: 14, transform: `rotate(${Math.sin(f / 6) * 2}deg)` }}>⚡DOPAMATH</div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.yellow, WebkitTextStroke: "6px #12002b", paintOrder: "stroke fill" }}>高校数学で脳汁</div>
    </div>
  );
};
