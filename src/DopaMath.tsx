import React from "react";
import { Sequence } from "remotion";
import { VideoShell } from "./VideoShell";
import { SceneAlgebra, SceneCTA, SceneGap, SceneHook, SceneLimit, SceneThird } from "./scenes";
import { sec } from "./timeline";
import { nineTL } from "./videos/nine";

const GLYPHS = "0123456789.…＝＋−×÷（）()xGOAL証明①②数学Ⅲ極限これ、どっち？VSマジです来ない最後の「」はいつ来る？終わりがないからゼロフォローで脳汁ドバドバ次回⚡DOPAMATH高校数学で両辺";

export const DopaMath: React.FC = () => (
  <VideoShell tl={nineTL} glyphs={GLYPHS}>
    <Sequence from={0} durationInFrames={sec(6)}><SceneHook /></Sequence>
    <Sequence from={sec(6)} durationInFrames={sec(9)}><SceneThird /></Sequence>
    <Sequence from={sec(15)} durationInFrames={sec(12.5)}><SceneAlgebra /></Sequence>
    <Sequence from={sec(27.5)} durationInFrames={sec(7.5)}><SceneLimit /></Sequence>
    <Sequence from={sec(35)} durationInFrames={sec(3.7)}><SceneGap /></Sequence>
    <Sequence from={sec(38.7)} durationInFrames={nineTL.total - sec(38.7)}><SceneCTA /></Sequence>
  </VideoShell>
);
