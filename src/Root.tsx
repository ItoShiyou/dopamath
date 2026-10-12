import React from "react";
import { Composition } from "remotion";
import { DopaMath } from "./DopaMath";
import { FPS, H, TOTAL, W } from "./timeline";

export const Root: React.FC = () => (
  <Composition id="DopaMath" component={DopaMath} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
