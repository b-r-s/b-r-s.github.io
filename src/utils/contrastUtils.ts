/**
 * Utility functions for color contrast detection
 */

/**
 * Parses a hex color string to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}

/**
 * Calculates relative luminance of a color (0-1 scale)
 * Based on WCAG 2.0 formula
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Returns a high-contrast highlight color based on the background color
 * For dark backgrounds: returns bright green for visibility
 * For light backgrounds: returns darker green for visibility
 */
export function getContrastingHighlightColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) {
    return '#92ef7a'; // Default to accent-light green if parsing fails
  }

  const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);

  // If background is dark (low luminance), use bright green
  // If background is light (high luminance), use darker green
  if (luminance < 0.4) {
    return '#92ef7a'; // accent-light - high visibility on dark backgrounds
  } else {
    return '#5bc441'; // accent-medium - good visibility on light backgrounds
  }
}
