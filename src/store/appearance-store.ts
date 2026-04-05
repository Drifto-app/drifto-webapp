'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SearchBorderColorId = 'blue' | 'cyan' | 'purple' | 'teal' | 'pink';

export interface SearchBorderColorOption {
  id: SearchBorderColorId;
  label: string;
  value: string;
}

export const SEARCH_BORDER_COLORS: SearchBorderColorOption[] = [
  { id: 'blue', label: 'Blue', value: '#0041c2' },
  { id: 'cyan', label: 'Cyan', value: '#22d3ee' },
  { id: 'purple', label: 'Purple', value: '#c084fc' },
  { id: 'teal', label: 'Teal', value: '#14b8a6' },
  { id: 'pink', label: 'Pink', value: '#ff0f7b' },
];

const DEFAULT_SEARCH_BORDER_COLOR = SEARCH_BORDER_COLORS[0];

interface AppearanceState {
  homeSearchBorderColor: SearchBorderColorId;
  setHomeSearchBorderColor: (color: SearchBorderColorId) => void;
}

export const getSearchBorderColorValue = (colorId: SearchBorderColorId) => {
  return SEARCH_BORDER_COLORS.find((color) => color.id === colorId)?.value ?? DEFAULT_SEARCH_BORDER_COLOR.value;
};

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      homeSearchBorderColor: DEFAULT_SEARCH_BORDER_COLOR.id,
      setHomeSearchBorderColor: (color) => set({ homeSearchBorderColor: color }),
    }),
    {
      name: 'appearance-storage',
      partialize: (state) => ({
        homeSearchBorderColor: state.homeSearchBorderColor,
      }),
    },
  ),
);
