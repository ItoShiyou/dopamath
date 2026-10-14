import React from "react";
import { Composition } from "remotion";
import { DopaMath } from "./DopaMath";
import { OddSquares } from "./OddSquares";
import { FPS, H, W } from "./timeline";
import { nineTL } from "./videos/nine";
import { oddTL } from "./videos/odd";

export const Root: React.FC = () => (
  <>
    <Composition id="DopaMath" component={DopaMath} durationInFrames={nineTL.total} fps={FPS} width={W} height={H} />
    <Composition id="OddSquares" component={OddSquares} durationInFrames={oddTL.total} fps={FPS} width={W} height={H} />
  </>
);
