"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  ComponentProps,
} from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@headlessui/react";
import { X, Play, Plus } from 'lucide-react';
import { showTopToast } from "@/components/toast/toast-util";
import { LoaderSmall } from "@/components/ui/loader";
import { cn, MAX_VIDEO_SIZE, uploadMedia } from "@/lib/utils";
import * as React from 'react';

interface CoverVideoUploaderProps extends ComponentProps<"div"> {
  videoValue?: string;
  onVideoValueChange?: (url: string | null) => void;
  mediaFileType: string;
  setSubmitDisabled: (loading: boolean) => void;
}

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/webm",
  "video/x-m4v",
  "video/3gpp",
  "video/x-flv",
];

export function CoverVideoUploader({
  videoValue,
  setSubmitDisabled,
  onVideoValueChange,
  mediaFileType,
  className,
  ...props
}: CoverVideoUploaderProps) {
  const [localPreview, setLocalPreview] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // Clear any transient preview whenever the parent-controlled value changes
  useEffect(() => {
    setLocalPreview(undefined);
  }, [videoValue]);

  const preview = localPreview ?? videoValue;

  // Handle video metadata to display duration
  const handleVideoMetadata = useCallback(() => {
    if (videoRef.current) {
      setVideoDuration(Math.round(videoRef.current.duration));
    }
  }, []);

  // Memoize the file change handler to prevent unnecessary re-renders
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (
        !file ||
        !ALLOWED_VIDEO_TYPES.includes(file.type) ||
        file.size > MAX_VIDEO_SIZE
      ) {
        showTopToast(
          "error",
          "Please upload a valid video file (MP4, WebM, or MOV) under the size limit."
        );
        return;
      }

      // 1) Show instant preview
      const previewUrl = URL.createObjectURL(file);
      setLocalPreview(previewUrl);
      setUploading(true);
      setSubmitDisabled(true);

      try {
        const response = await uploadMedia(file, mediaFileType);

        if (!response) {
          showTopToast("error", "Upload failed.");
          return;
        }

        if (response) {
          onVideoValueChange?.(response);
          // Clean up the local preview URL
          URL.revokeObjectURL(previewUrl);
        }
      } catch (error: any) {
        showTopToast("error", "Upload failed. Please try again.");
        // Reset local preview on error
        setLocalPreview(undefined);
        URL.revokeObjectURL(previewUrl);
      } finally {
        setUploading(false);
        setSubmitDisabled(false);
      }

      // Reset the input value to allow re-uploading the same file
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onVideoValueChange, setSubmitDisabled, mediaFileType]
  );

  const handleButtonClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleContentClear = () => {
    if (onVideoValueChange) {
      onVideoValueChange(null);
    }
  }

  const openModal = () => {
    if (preview && !uploading) {
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div className={cn("w-full", className)} {...props}>
        <div
          className={cn(
            "relative w-full h-64 rounded-lg overflow-hidden border-2 border-dashed",
            preview ? "border-transparent" : "border-gray-300 bg-white"
          )}
        >
          {preview ? (
            <>
              <div
                className="w-full h-full cursor-pointer relative group"
                onClick={openModal}
              >
                <video
                  ref={videoRef}
                  src={preview}
                  className="w-full h-full object-cover"
                  onLoadedMetadata={handleVideoMetadata}
                />
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center  transition-opacity">
                  <div className="bg-white bg-opacity-90 rounded-full p-4">
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>
                {videoDuration > 0 && (
                  <div className="absolute top-3 left-3 bg-black/80 px-2 py-1 rounded text-white text-xs font-medium">
                    {formatDuration(videoDuration)}
                  </div>
                )}
                <button
                  className={cn(
                    "absolute top-2 right-2 rounded-full bg-neutral-800 p-1 opacity-60 ",
                    "text-white"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContentClear()
                  }}
                  aria-label="Remove image"
                >
                  <X size={22} />
                </button>
              </div>
            </>
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
              onClick={handleButtonClick}
            >
              <div className="text-center flex flex-col items-center">
                <Plus className="w-10 h-10 text-gray-400 mb-2" />
                <div className="text-gray-400 text-base font-medium">
                  No Video Added
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Tap to add a short video (optional)
                </div>
              </div>
            </div>
          )}

          {preview && (
            <div className="absolute bottom-3 right-3">
              <Button
                variant="secondary"
                disabled={uploading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick();
                }}
                type="button"
                className="flex items-center gap-2 h-9 px-3 text-sm"
              >
                {uploading ? (
                  <LoaderSmall />
                ) : (
                  <span>Change Video</span>
                )}

              </Button>
            </div>
          )}

          <input
            ref={inputRef}
            multiple={false}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Video Player Modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-999"
      >
        {/* Close Button */}
        <div
          className="absolute top-4 right-4 text-white cursor-pointer z-10"
          onClick={closeModal}
        >
          <X size={30} />
        </div>

        <Dialog.Panel className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center">
          {preview && (
            <video
              ref={modalVideoRef}
              src={preview}
              controls
              autoPlay
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          )}
        </Dialog.Panel>
      </Dialog>
    </>
  );
}