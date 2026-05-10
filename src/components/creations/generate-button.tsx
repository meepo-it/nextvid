'use client';

import { Button } from '@/components/ui/button';
import * as m from '@/paraglide/messages.js';
import { IconLoader2, IconPlayerPlay } from '@tabler/icons-react';

interface GenerateButtonProps {
  disabled: boolean;
  isSubmitting: boolean;
  onClick: () => void;
}

export function GenerateButton({
  disabled,
  isSubmitting,
  onClick,
}: GenerateButtonProps) {
  return (
    <Button
      type="button"
      size="lg"
      disabled={disabled || isSubmitting}
      onClick={onClick}
      className="w-full gap-2 text-base"
    >
      {isSubmitting ? (
        <>
          <IconLoader2 className="size-4 animate-spin" />
          <span>{m.video_generating()}</span>
        </>
      ) : (
        <>
          <IconPlayerPlay className="size-4" />
          <span>{m.video_generate()}</span>
        </>
      )}
    </Button>
  );
}
