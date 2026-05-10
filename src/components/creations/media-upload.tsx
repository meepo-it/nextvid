'use client';

import { cn } from '@/lib/utils';
import { uploadUserFile } from '@/api/user-files';
import * as m from '@/paraglide/messages.js';
import {
  IconImageInPicture,
  IconUpload,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useRef, useState } from 'react';

interface MediaUploadProps {
  type: 'image' | 'video';
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
}

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export function MediaUpload({
  type,
  value,
  onChange,
  disabled,
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const isImage = type === 'image';
  const accept = isImage ? IMAGE_ACCEPT : VIDEO_ACCEPT;
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  const formatLabel = isImage
    ? m.video_upload_image_formats()
    : m.video_upload_video_formats();

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > maxSize) {
        setError(`File too large (max ${isImage ? '10' : '50'} MB)`);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      try {
        setUploading(true);
        const form = new FormData();
        form.append('file', file);
        form.append('folder', isImage ? 'video-images' : 'video-refs');
        form.append('isPublic', 'true');
        const result = await uploadUserFile({ data: form });
        const url = (result as { url?: string })?.url;
        onChange(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        setPreview(null);
        onChange(undefined);
      } finally {
        setUploading(false);
      }
    },
    [isImage, maxSize, onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    setError(null);
    onChange(undefined);
  }, [onChange]);

  if (value || preview) {
    return (
      <div className="relative group">
        <div className="relative overflow-hidden rounded-lg border bg-muted/30">
          {isImage ? (
            <img
              src={value || preview || ''}
              alt="Preview"
              className="h-40 w-full object-cover"
            />
          ) : (
            <video
              src={value || preview || ''}
              className="h-40 w-full object-cover"
              muted
            />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <IconUpload className="size-6 animate-bounce text-primary" />
            </div>
          )}
        </div>
        {!uploading && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              'absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-white shadow-md',
              'opacity-0 transition-opacity group-hover:opacity-100',
              'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            <IconX className="size-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8',
          'text-muted-foreground transition-all',
          'hover:border-primary/50 hover:bg-accent/30',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          dragOver && 'border-primary bg-primary/5'
        )}
      >
        {uploading ? (
          <IconUpload className="size-6 animate-bounce" />
        ) : isImage ? (
          <IconImageInPicture className="size-8 text-muted-foreground/60" />
        ) : (
          <IconVideo className="size-8 text-muted-foreground/60" />
        )}
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <IconUpload className="size-3.5" />
          <span>
            {isImage ? m.video_upload_image() : m.video_upload_video()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground/70">{formatLabel}</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
