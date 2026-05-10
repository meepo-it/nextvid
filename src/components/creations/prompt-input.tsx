'use client';

import { cn } from '@/lib/utils';
import type { VideoGenerationType } from '@/config/video-models';
import * as m from '@/paraglide/messages.js';
import { useCallback } from 'react';

const MAX_CHARS = 1500;

const PLACEHOLDERS: Record<VideoGenerationType, () => string> = {
  'text-to-video': m.video_prompt_placeholder_text_to_video,
  'image-to-video': m.video_prompt_placeholder_image_to_video,
  'reference-to-video': m.video_prompt_placeholder_reference_to_video,
  'video-edit': m.video_prompt_placeholder_video_edit,
};

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  mode: VideoGenerationType;
  onSubmit?: () => void;
  disabled?: boolean;
}

export function PromptInput({
  value,
  onChange,
  mode,
  onSubmit,
  disabled,
}: PromptInputProps) {
  const placeholder = PLACEHOLDERS[mode]?.() ?? '';

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onSubmit?.();
      }
    },
    [onSubmit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length <= MAX_CHARS) onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="relative">
      <textarea
        id="prompt-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        className={cn(
          'w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-[color,box-shadow]'
        )}
      />
      <span
        aria-live="polite"
        role="status"
        aria-label="Character count"
        className="absolute right-3 bottom-3 text-xs text-muted-foreground"
      >
        {value.length} / {MAX_CHARS}
      </span>
    </div>
  );
}
