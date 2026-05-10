/** Normalized input passed to every provider adapter */
export interface VideoAdapterInput {
  prompt?: string;
  negativePrompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaUrls?: string[];
  resolution: string;
  duration: number;
  aspectRatio: string;
  withAudio?: boolean;
  /** Source task ID for remix/extend operations (e.g. Veo 3 Remix).
   *  When present, the adapter returns the remix request body and the
   *  provider layer uses the /videos/{sourceTaskId}/remix endpoint. */
  sourceTaskId?: string;
}

/** Each provider adapter converts VideoAdapterInput → provider-specific request body */
export type VideoAdapterFn = (
  providerModelName: string,
  input: VideoAdapterInput
) => unknown;
