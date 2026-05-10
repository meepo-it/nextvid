'use client';

import { cn } from '@/lib/utils';
import type {
  VideoAspectRatio,
  VideoModelConfig,
  VideoResolution,
} from '@/config/video-models';
import * as m from '@/paraglide/messages.js';

interface ButtonGroupProps<T extends string | number> {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  formatLabel?: (value: T) => string;
}

function ButtonGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  formatLabel,
}: ButtonGroupProps<T>) {
  return (
    <div className="flex items-center justify-between">
      <span className="shrink-0 text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex gap-1.5">
        {options.map((option) => {
          const isActive = value === option;
          const display = formatLabel ? formatLabel(option) : String(option);
          return (
            <button
              key={String(option)}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {display}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ParamSelectorProps {
  model: VideoModelConfig;
  resolution: VideoResolution;
  duration: number;
  aspectRatio: VideoAspectRatio;
  onResolutionChange: (value: VideoResolution) => void;
  onDurationChange: (value: number) => void;
  onAspectRatioChange: (value: VideoAspectRatio) => void;
}

export function ParamSelector({
  model,
  resolution,
  duration,
  aspectRatio,
  onResolutionChange,
  onDurationChange,
  onAspectRatioChange,
}: ParamSelectorProps) {
  return (
    <div className="space-y-4">
      <ButtonGroup
        label={m.video_params_aspect_ratio()}
        options={model.supportedAspectRatios}
        value={aspectRatio}
        onChange={onAspectRatioChange}
      />
      <ButtonGroup
        label={m.video_params_duration()}
        options={model.supportedDurations}
        value={duration}
        onChange={onDurationChange}
        formatLabel={(v) => (v === 0 ? 'Auto' : `${v}s`)}
      />
      <ButtonGroup
        label={m.video_params_resolution()}
        options={model.supportedResolutions}
        value={resolution}
        onChange={onResolutionChange}
      />
    </div>
  );
}
