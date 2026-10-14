import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import "@fontsource/noto-sans-jp/900.css";
import { Background, Camera, C, FlashLayer, progress } from "./fx";
import { Caption } from "./Caption";
import { TopTag } from "./scenes";
import { TLCtx, sec, type Timeline } from "./timeline";

const useFontReady = (glyphs: string) => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    document.fonts.load('900 60px "Noto Sans JP"', glyphs).then(() => document.fonts.ready).then(() => setTimeout(() => continueRender(h), 300));
  }, [h, glyphs]);
};

/** 背景・カメラ揺れ・字幕・フラッシュ・BGM/ナレ/SE をまとめた共通シェル */
export const VideoShell: React.FC<{ tl: Timeline; glyphs: string; calm?: boolean; tag?: string; children: React.ReactNode }> = ({ tl, glyphs, calm, tag, children }) => {
  useFontReady(tl.lines.map((l) => l.text).join("") + glyphs);
  const f = useCurrentFrame();
  const talking = tl.lines.some((l) => f >= sec(l.start) - 2 && f <= sec(l.start) + l.dur * 30 + 4);
  return (
    <TLCtx.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <Camera>
          <Background calm={calm} />
          {children}
          <Caption />
          <TopTag tag={tag} />
        </Camera>
        <FlashLayer />
        <div style={{ position: "absolute", left: 0, top: 0, height: 14, width: `${progress(f, tl.total) * 100}%`, background: `linear-gradient(90deg, ${C.pink}, ${C.yellow}, ${C.cyan})` }} />
        <Audio src={staticFile(`${tl.id}/bgm.wav`)} volume={(fr) => (talking && fr >= 0 ? (tl.lines.some((l) => fr >= sec(l.start) - 2 && fr <= sec(l.start) + l.dur * 30 + 4) ? 0.2 : 0.42) : 0.42) * interpolate(fr, [0, 6], [0, 1], { extrapolateRight: "clamp" })} />
        {tl.lines.map((l) => (
          <Sequence key={l.id} from={sec(l.start)} durationInFrames={Math.ceil(l.dur * 30) + 6}>
            <Audio src={staticFile(`${tl.id}/voice/${l.id}.wav`)} volume={1.6} />
          </Sequence>
        ))}
        {tl.se.map((s, i) => (
          <Sequence key={i} from={sec(s.t)} durationInFrames={90}>
            <Audio src={staticFile(`se/${s.n}.wav`)} volume={0.55 * (s.v ?? 1)} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </TLCtx.Provider>
  );
};
