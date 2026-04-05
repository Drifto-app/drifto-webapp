import * as React from "react";

/**
 * Regex to match URLs starting with http://, https://, or www.
 * - Captures the full URL including path, query params, and fragments
 * - Avoids trailing punctuation (.,;:!?) that is likely part of the sentence
 */
const URL_REGEX =
  /(?:https?:\/\/|www\.)[^\s<>"'`)\]]+[^\s<>"'`)\].,;:!?]/gi;

/**
 * Maximum number of characters to display for a URL before truncating.
 */
const MAX_DISPLAY_LENGTH = 40;

/**
 * Ensures a URL has a protocol prefix. Adds https:// if it starts with www.
 */
function ensureProtocol(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

/**
 * Truncates a URL for display purposes while keeping the full href intact.
 * e.g. "https://very-long-url.com/some/very/deep/path" → "https://very-long-url.com/some/ver…"
 */
function truncateUrl(url: string, maxLength: number = MAX_DISPLAY_LENGTH): string {
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength) + "…";
}

interface LinkifyProps {
  /** The raw text string to scan for URLs */
  text: string | undefined | null;
  /** CSS class name applied to the wrapping element */
  className?: string;
  /** HTML tag to use as the wrapper (defaults to "p") */
  as?: keyof React.JSX.IntrinsicElements;
  /** Inline styles applied to the wrapper */
  style?: React.CSSProperties;
}

/**
 * Renders a text string with auto-detected URLs converted to clickable links.
 * Long URLs are visually truncated with "…" while linking to the full URL.
 *
 * Usage:
 * ```tsx
 * <Linkify text="Visit https://drifto.com for events" className="text-sm" />
 * ```
 *
 * Works in both client and server components (no hooks or state).
 */
export function Linkify({ text, className, as: Tag = "p", style }: LinkifyProps) {
  if (!text) {
    return <Tag className={className} style={style} />;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const matchedUrl = match[0];
    const matchStart = match.index;

    // Add the plain text before this match
    if (matchStart > lastIndex) {
      parts.push(text.slice(lastIndex, matchStart));
    }

    // Add the link with truncated display text
    parts.push(
      <a
        key={matchStart}
        href={ensureProtocol(matchedUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline break-all"
        onClick={(e) => e.stopPropagation()}
        title={matchedUrl}
      >
        {truncateUrl(matchedUrl)}
      </a>
    );

    lastIndex = matchStart + matchedUrl.length;
  }

  // Add remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // If no URLs were found, render the text as-is
  if (parts.length === 0) {
    return <Tag className={className} style={style}>{text}</Tag>;
  }

  return <Tag className={className} style={style}>{parts}</Tag>;
}
