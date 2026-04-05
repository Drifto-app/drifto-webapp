'use client';

export type EventThemeColors = [string, string, ...string[]];

export const DEFAULT_EVENT_THEME: EventThemeColors = ['#ffffff', '#ffffff'];
export const LIGHT_EVENT_FALLBACK: EventThemeColors = ['#ffffff', '#ffffff'];
export const DARK_EVENT_FALLBACK: EventThemeColors = ['#121212', '#121212'];

const normalizeHexColor = (color: string) => {
  const normalized = color.trim().toLowerCase().replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized.slice(0, 6);

  return `#${expanded}`;
};

export const isDefaultEventTheme = (
  eventTheme: string[] | null | undefined,
) => {
  if (!eventTheme || eventTheme.length < 2) {
    return true;
  }

  return (
    eventTheme.length === DEFAULT_EVENT_THEME.length &&
    normalizeHexColor(eventTheme[0]) === normalizeHexColor(DEFAULT_EVENT_THEME[0]) &&
    normalizeHexColor(eventTheme[1]) === normalizeHexColor(DEFAULT_EVENT_THEME[1])
  );
};

export const getEventThemeColors = (
  eventTheme: string[] | null | undefined,
  resolvedTheme?: string,
): EventThemeColors => {
  if (eventTheme && eventTheme.length >= 2 && !isDefaultEventTheme(eventTheme)) {
    return eventTheme as EventThemeColors;
  }

  return resolvedTheme === 'dark' ? DARK_EVENT_FALLBACK : LIGHT_EVENT_FALLBACK;
};

export const getEventThemeBackground = (
  eventTheme: string[] | null | undefined,
  resolvedTheme?: string,
) => {
  if (isDefaultEventTheme(eventTheme)) {
    return undefined;
  }

  const colors = getEventThemeColors(eventTheme, resolvedTheme);
  return { background: `linear-gradient(to bottom, ${colors.join(', ')})` } as const;
};

const hexToRgb = (hex: string) => {
  const normalized = normalizeHexColor(hex).replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized.slice(0, 6);

  const value = Number.parseInt(expanded, 16);

  if (Number.isNaN(value)) {
    return null;
  }

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const getRelativeLuminance = (channel: number) => {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
};

const getColorLuminance = (hex: string) => {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return 0;
  }

  return (
    0.2126 * getRelativeLuminance(rgb.r) +
    0.7152 * getRelativeLuminance(rgb.g) +
    0.0722 * getRelativeLuminance(rgb.b)
  );
};

export const isEventThemeLight = (
  eventTheme: string[] | null | undefined,
  resolvedTheme?: string,
) => {
  const colors = getEventThemeColors(eventTheme, resolvedTheme);
  const averageLuminance =
    colors.reduce((sum, color) => sum + getColorLuminance(color), 0) / colors.length;
  return averageLuminance > 0.55;
};
