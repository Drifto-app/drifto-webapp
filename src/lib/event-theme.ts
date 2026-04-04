'use client';

export const DEFAULT_EVENT_THEME: [string, string] = ['#ffffff', '#ffffff'];
export const LIGHT_EVENT_FALLBACK: [string, string] = ['#ffffff', '#ffffff'];
export const DARK_EVENT_FALLBACK: [string, string] = ['#121212', '#121212'];

export const isDefaultEventTheme = (
  eventTheme: [string, string] | null | undefined,
) => {
  if (!eventTheme || eventTheme.length !== 2) {
    return true;
  }

  return (
    eventTheme[0].toLowerCase() === DEFAULT_EVENT_THEME[0] &&
    eventTheme[1].toLowerCase() === DEFAULT_EVENT_THEME[1]
  );
};

export const getEventThemeColors = (
  eventTheme: [string, string] | null | undefined,
  resolvedTheme?: string,
): [string, string] => {
  if (eventTheme && eventTheme.length === 2 && !isDefaultEventTheme(eventTheme)) {
    return eventTheme;
  }

  return resolvedTheme === 'dark' ? DARK_EVENT_FALLBACK : LIGHT_EVENT_FALLBACK;
};

export const getEventThemeBackground = (
  eventTheme: [string, string] | null | undefined,
  resolvedTheme?: string,
) => {
  const [c1, c2] = getEventThemeColors(eventTheme, resolvedTheme);
  return { background: `linear-gradient(to bottom, ${c1}, ${c2})` } as const;
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '').trim();
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
  eventTheme: [string, string] | null | undefined,
  resolvedTheme?: string,
) => {
  const [c1, c2] = getEventThemeColors(eventTheme, resolvedTheme);
  const averageLuminance = (getColorLuminance(c1) + getColorLuminance(c2)) / 2;
  return averageLuminance > 0.55;
};
