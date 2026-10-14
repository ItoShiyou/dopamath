import lines from "./lines.json";
import voiceMeta from "./voiceMeta.json";
import meta from "./meta.json";
import { SE } from "./se";
import { buildTimeline } from "../../timeline";

export const nineTL = buildTimeline("nine", lines, voiceMeta, SE, meta);
