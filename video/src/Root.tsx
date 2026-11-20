import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import timings from "./timings.json";

export const Root: React.FC = () => (
  <Composition id="Main" component={Main} durationInFrames={timings.total} fps={timings.fps} width={1920} height={1080} />
);
