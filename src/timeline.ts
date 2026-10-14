import { createContext, useContext } from "react";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const sec = (s: number) => Math.round(s * FPS);

export type Line = { id: string; start: number; max: number; text: string; yomi: string };
export type SEvent = { t: number; n: string; v?: number };
export type Hit = { f: number; mag: number };
export type VideoMeta = { duration: number; bpm: number; bgmPrompt?: string };

export type Timeline = {
  id: string;
  lines: (Line & { dur: number })[];
  se: SEvent[];
  hits: Hit[];
  total: number;
  beat: number;
};

export const buildTimeline = (id: string, lines: Line[], voiceMeta: Record<string, number>, se: SEvent[], meta: VideoMeta): Timeline => ({
  id,
  lines: lines.map((l) => ({ ...l, dur: voiceMeta[l.id] ?? l.max })),
  se,
  hits: se.filter((s) => s.n === "hit" || s.n === "boom").map((s) => ({ f: sec(s.t), mag: (s.n === "boom" ? 1.8 : 1) * (s.v ?? 1) })),
  total: Math.round(meta.duration * FPS),
  beat: (FPS * 60) / meta.bpm,
});

export const TLCtx = createContext<Timeline>(null as unknown as Timeline);
export const useTL = () => useContext(TLCtx);
