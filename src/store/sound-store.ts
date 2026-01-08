import { create } from "zustand";

interface SoundState {
    // Global mute state - applies to ALL videos
    isGlobalMuted: boolean;
    // The ID of the currently active/playing video (only one at a time)
    activeVideoId: string | null;
    // Toggle mute state for all videos
    toggleGlobalMute: () => void;
    // Set mute state explicitly
    setGlobalMuted: (muted: boolean) => void;
    // Set the active video (pauses others)
    setActiveVideo: (videoId: string | null) => void;
    // Check if a video should be playing
    isVideoActive: (videoId: string) => boolean;
}

export const useSoundStore = create<SoundState>()((set, get) => ({
    isGlobalMuted: true, // Start muted by default
    activeVideoId: null,

    toggleGlobalMute: () => {
        set((state) => ({ isGlobalMuted: !state.isGlobalMuted }));
    },

    setGlobalMuted: (muted: boolean) => {
        set({ isGlobalMuted: muted });
    },

    setActiveVideo: (videoId: string | null) => {
        set({ activeVideoId: videoId });
    },

    isVideoActive: (videoId: string) => {
        return get().activeVideoId === videoId;
    },
}));
