'use client';

import {
  getModelsForType,
  getModelById,
  type VideoGenerationType,
  type VideoResolution,
  type VideoAspectRatio,
  type VideoModelConfig,
} from '@/config/video-models';
import { computeCreditCost } from '@/lib/credit-utils';
import { VIDEO_MODE_TABS } from '@/config/video-models';
import { useUserCredit, useSubmitVideo } from '@/hooks/use-video';
import * as m from '@/paraglide/messages.js';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CreditsDisplay } from './credits-display';
import { GenerateButton } from './generate-button';
import { MediaUpload } from './media-upload';
import { ParamSelector } from './param-selector';
import { PromptInput } from './prompt-input';
import { IconLetterT, IconPhoto, IconVideo } from '@tabler/icons-react';

const MODE_ICONS: Record<string, React.ElementType> = {
  Type: IconLetterT,
  Image: IconPhoto,
  Video: IconVideo,
};

const MODE_LABELS: Record<VideoGenerationType, () => string> = {
  'text-to-video': m.video_mode_text_to_video,
  'reference-to-video': m.video_mode_reference_to_video,
  'video-edit': m.video_mode_video_edit,
  'image-to-video': m.video_mode_text_to_video,
};

export function VideoGenerateForm({
  defaultModelId,
}: {
  defaultModelId?: string;
}) {
  const navigate = useNavigate();

  const _defaultModel = defaultModelId ? getModelById(defaultModelId) : undefined;
  const initialMode: VideoGenerationType =
    _defaultModel?.supportedTypes[0] ?? 'text-to-video';

  const [mode, setMode] = useState<VideoGenerationType>(initialMode);
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [videoUrl, setVideoUrl] = useState<string | undefined>();

  const availableModels = useMemo(() => getModelsForType(mode), [mode]);
  const [selectedModelId, setSelectedModelId] = useState<string>(
    defaultModelId ?? ''
  );

  useEffect(() => {
    if (availableModels.length > 0) {
      const found = availableModels.find(
        (model) => model.id === selectedModelId
      );
      if (!found) {
        const first = availableModels[0];
        setSelectedModelId(first.id);
        setResolution(first.defaultResolution);
        setDuration(first.defaultDuration);
        setAspectRatio(first.defaultAspectRatio);
      }
    }
  }, [availableModels, selectedModelId]);

  const currentModel: VideoModelConfig | undefined = useMemo(
    () =>
      availableModels.find((model) => model.id === selectedModelId) ??
      availableModels[0],
    [availableModels, selectedModelId]
  );

  const [resolution, setResolution] = useState<VideoResolution>(
    _defaultModel?.defaultResolution ?? '720p'
  );
  const [duration, setDuration] = useState<number>(
    _defaultModel?.defaultDuration ?? 5
  );
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>(
    _defaultModel?.defaultAspectRatio ?? '16:9'
  );

  const { data: creditData, isLoading: isLoadingBalance } = useUserCredit();
  const balance = creditData?.credits;

  const submitMutation = useSubmitVideo();

  const handleModelChange = useCallback(
    (modelId: string) => {
      setSelectedModelId(modelId);
      const model = availableModels.find((m) => m.id === modelId);
      if (model) {
        if (!model.supportedResolutions.includes(resolution))
          setResolution(model.defaultResolution);
        if (!model.supportedDurations.includes(duration))
          setDuration(model.defaultDuration);
        if (!model.supportedAspectRatios.includes(aspectRatio))
          setAspectRatio(model.defaultAspectRatio);
      }
    },
    [availableModels, resolution, duration, aspectRatio]
  );

  const handleModeChange = useCallback((newMode: VideoGenerationType) => {
    setMode(newMode);
    setImageUrl(undefined);
    setVideoUrl(undefined);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!prompt.trim() && mode !== 'video-edit') return;
    if (mode === 'image-to-video' && !imageUrl) return;
    if ((mode === 'reference-to-video' || mode === 'video-edit') && !videoUrl)
      return;

    const cost = currentModel
      ? computeCreditCost(currentModel.creditCosts, resolution, duration)
      : 0;
    if (balance !== undefined && balance < cost) {
      toast.error(m.video_credits_insufficient());
      return;
    }

    submitMutation.mutate(
      {
        type: mode,
        modelId: currentModel?.id ?? '',
        prompt: prompt.trim() || undefined,
        imageUrl,
        videoUrl,
        resolution,
        duration,
        aspectRatio,
      },
      {
        onSuccess: (result) => {
          navigate({ to: '/creations/$id', params: { id: result.videoId } });
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Generation failed';
          if (msg === 'insufficient_credits') {
            toast.error(m.video_credits_insufficient());
          } else {
            toast.error(msg);
          }
        },
      }
    );
  }, [
    prompt,
    mode,
    imageUrl,
    videoUrl,
    resolution,
    duration,
    aspectRatio,
    balance,
    currentModel,
    submitMutation,
    navigate,
  ]);

  const cost = currentModel
    ? computeCreditCost(currentModel.creditCosts, resolution, duration)
    : 0;
  const canSubmit =
    (prompt.trim().length > 0 || mode === 'video-edit') &&
    !submitMutation.isPending &&
    availableModels.length > 0 &&
    (mode !== 'image-to-video' || !!imageUrl) &&
    (mode !== 'reference-to-video' || !!videoUrl) &&
    (mode !== 'video-edit' || !!videoUrl) &&
    (balance === undefined || balance >= cost);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Mode tabs */}
      <div className="flex gap-2">
        {VIDEO_MODE_TABS.map((tab) => {
          const Icon = MODE_ICONS[tab.icon] ?? IconLetterT;
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleModeChange(tab.id)}
              className={cn(
                'flex flex-1 items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                'hover:border-primary/50 hover:bg-accent/50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border bg-background text-muted-foreground'
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">
                {MODE_LABELS[tab.id]?.() ?? tab.id}
              </span>
            </button>
          );
        })}
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {m.video_prompt_label()}
        </label>
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          mode={mode}
          onSubmit={canSubmit ? handleSubmit : undefined}
          disabled={submitMutation.isPending}
        />
      </div>

      {/* Media upload */}
      {mode === 'image-to-video' && (
        <MediaUpload
          type="image"
          value={imageUrl}
          onChange={setImageUrl}
          disabled={submitMutation.isPending}
        />
      )}
      {(mode === 'reference-to-video' || mode === 'video-edit') && (
        <MediaUpload
          type="video"
          value={videoUrl}
          onChange={setVideoUrl}
          disabled={submitMutation.isPending}
        />
      )}

      {/* Settings */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-foreground">
          {m.video_params_settings()}
        </h3>

        <div className="flex items-center justify-between">
          <label
            htmlFor="model-selector"
            className="text-sm font-medium text-muted-foreground"
          >
            {m.video_params_model()}
          </label>
          <Select
            value={currentModel?.id ?? ''}
            onValueChange={(v) => v && handleModelChange(v)}
            disabled={availableModels.length === 0}
          >
            <SelectTrigger id="model-selector" className="w-52">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentModel && (
          <ParamSelector
            model={currentModel}
            resolution={resolution}
            duration={duration}
            aspectRatio={aspectRatio}
            onResolutionChange={setResolution}
            onDurationChange={setDuration}
            onAspectRatioChange={setAspectRatio}
          />
        )}
      </div>

      {/* Credits */}
      <CreditsDisplay
        resolution={resolution}
        duration={duration}
        balance={balance}
        isLoadingBalance={isLoadingBalance}
        creditCosts={currentModel?.creditCosts}
      />

      {/* Generate */}
      <GenerateButton
        disabled={!canSubmit}
        isSubmitting={submitMutation.isPending}
        onClick={handleSubmit}
      />
    </div>
  );
}
