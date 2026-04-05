import * as React from "react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog } from '@headlessui/react';
import {X} from "lucide-react";

interface SnapshotCarouselProps {
    snapshots?: string[];
}

export const SnapshotCarousel: React.FC<SnapshotCarouselProps> = ({ snapshots }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [activeSrc, setActiveSrc] = React.useState<string | null>(null);

    const openModal = (src: string) => {
        setActiveSrc(src);
        setIsOpen(true);
    };
    const closeModal = () => setIsOpen(false);

    if (!snapshots || snapshots.length === 0) return null;

    return (
        <>
            <div className="w-full overflow-x-auto no-scrollbar">
                <div className="flex gap-2">
                    {snapshots.map((src, idx) => (
                        <div key={idx} className="cursor-pointer relative w-[60%] min-w-50 rounded-md" onClick={() => openModal(src)}>
                            <AspectRatio ratio={4/3}>
                                <Image
                                    src={src}
                                    alt={`Snapshot ${idx + 1}`}
                                    fill
                                    className="object-cover rounded-md"
                                />
                            </AspectRatio>
                        </div>
                    ))}
                </div>
            </div>


            <Dialog
                open={isOpen}
                onClose={closeModal}
                className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-50"
            >
                <div className="absolute top-4 right-4 text-white" onClick={closeModal}>
                    <X size={30} />
                </div>
                <Dialog.Panel className="bg-background overflow-hidden w-full max-h-[95%]">
                    {activeSrc && (
                        <Image
                            src={activeSrc}
                            alt="Snapshot"
                            width={800}
                            height={600}
                            className="object-contain w-full h-auto"
                            // style={{ maxHeight: "95vh" }}
                        />
                    )}
                </Dialog.Panel>
            </Dialog>
        </>
    );
};