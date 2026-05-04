import type { POLL_MODES } from "@/constants";

export type PollMode = (typeof POLL_MODES)[keyof typeof POLL_MODES];
