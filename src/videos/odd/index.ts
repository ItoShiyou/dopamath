import lines from "./lines.json";
import voiceMeta from "./voiceMeta.json";
import meta from "./meta.json";
import { SE } from "./se";
import { buildTimeline } from "../../timeline";

export const oddTL = buildTimeline("odd", lines, voiceMeta, SE, meta);
