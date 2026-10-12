import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import "@fontsource/noto-sans-jp/900.css";
import { Background, Camera, C, FlashLayer, progress } from "./fx";
import { Caption } from "./Caption";
import { SceneAlgebra, SceneCTA, SceneGap, SceneHook, SceneLimit, SceneThird, TopTag } from "./scenes";
import { LINES, SE, TOTAL, sec } from "./timeline";

const GLYPHS = LINES.map((l) => l.text).join("") + "0123456789.…＝＋−×÷（）()xGOAL証明①②数学Ⅲ極限これ、どっち？VSマジです来ない最後の「」はいつ来る？終わりがないからゼロフォローで脳汁ドバドバ次回⚡DOPAMATH高校数学で両辺";

const useFontReady = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    document.fonts.load('900 60px "Noto Sans JP"', GLYPHS).then(() => document.fonts.ready).then(() => setTimeout(() => continueRender(h), 300));
  }, [h]);
};

const volumeBgm = (f: number) => {
  const talking = LINES.some((l) => f >= sec(l.start) - 2 && f <= sec(l.start) + l.dur * 30 + 4);
  return talking ? 0.2 : 0.42;
};

export const DopaMath: React.FC = () => {
  useFontReady();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Camera>
        <Background />
        <Sequence from={0} durationInFrames={sec(6)}><SceneHook /></Sequence>
        <Sequence from={sec(6)} durationInFrames={sec(9)}><SceneThird /></Sequence>
        <Sequence from={sec(15)} durationInFrames={sec(12.5)}><SceneAlgebra /></Sequence>
        <Sequence from={sec(27.5)} durationInFrames={sec(7.5)}><SceneLimit /></Sequence>
        <Sequence from={sec(35)} durationInFrames={sec(3.7)}><SceneGap /></Sequence>
        <Sequence from={sec(38.7)} durationInFrames={TOTAL - sec(38.7)}><SceneCTA /></Sequence>
        <Caption />
        <TopTag />
      </Camera>
      <FlashLayer />
      {/* 進行バー */}
      <div style={{ position: "absolute", left: 0, top: 0, height: 14, width: `${progress(f) * 100}%`, background: `linear-gradient(90deg, ${C.pink}, ${C.yellow}, ${C.cyan})` }} />
      {/* 音 */}
      <Audio src={staticFile("bgm.wav")} volume={(fr) => volumeBgm(fr) * interpolate(fr, [0, 6], [0, 1], { extrapolateRight: "clamp" })} />
      {LINES.map((l) => (
        <Sequence key={l.id} from={sec(l.start)} durationInFrames={Math.ceil(l.dur * 30) + 6}>
          <Audio src={staticFile(`voice/${l.id}.wav`)} volume={1.6} />
        </Sequence>
      ))}
      {SE.map((s, i) => (
        <Sequence key={i} from={sec(s.t)} durationInFrames={90}>
          <Audio src={staticFile(`se/${s.n}.wav`)} volume={0.55 * (s.v ?? 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
