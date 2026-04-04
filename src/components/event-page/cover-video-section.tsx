import { AspectRatio } from "@/components/ui/aspect-ratio";
import { FaPlay } from "react-icons/fa";
import Image from "next/image";
import { MdCancel } from "react-icons/md";
import { EventSingleContentText } from '@/components/ui/content';
import { ComponentProps, useState } from 'react';
import { cn } from '@/lib/utils';
import { Dialog } from '@headlessui/react';

interface CoverVideoSectionProps extends ComponentProps<"div"> {
  coverVideo?: string;
  poster: string;
}

export const CoverVideoSection = ({
  coverVideo, poster, className, ...props
}: CoverVideoSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!coverVideo) return null;

  return (
    <>
      <div
        className={cn(
          'w-full cursor-pointer',
        )}
        onClick={() => setIsOpen(true)}
      >
        <AspectRatio ratio={16 / 9}>
          <video
            src={coverVideo}
            // poster={poster}
            className="h-full w-full object-cover rounded-lg"
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
            <button className="h-14 w-14 rounded-full bg-background/90 flex items-center justify-center shadow-lg">
              <FaPlay className="ml-1" />
            </button>
          </div>
        </AspectRatio>
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-70"
      >
        <div className="absolute top-4 right-4 text-white">
          <button onClick={() => setIsOpen(false)}>
            <MdCancel size={30} />
          </button>
        </div>

        <Dialog.Panel className="bg-black w-full max-w-3xl max-h-[80vh] overflow-hidden">
          <video
            src={coverVideo}
            className="w-full h-full"
            controls
            autoPlay
            playsInline
          />
        </Dialog.Panel>
      </Dialog>
    </>
  );
};
