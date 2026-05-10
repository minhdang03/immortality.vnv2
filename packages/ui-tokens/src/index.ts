/**
 * @btd/ui-tokens — Design tokens shared across web + mobile
 * Ported from docs/redesign-mockup-ios-community-v3.html CSS variables
 *
 * Palette: gold/cream/ink for content; mint = Pro tier accent ONLY.
 * NO TIER BADGES in UI — mint is purely for "Xem gói nâng cao" chip.
 */

export const colors = {
  // Backgrounds
  bg: '#f8f3ea',
  surface: '#ffffff',

  // Ink (text)
  ink: '#161310',
  inkSoft: '#3d3833',
  inkMuted: '#8a8273',

  // Gold palette (brand)
  gold: '#b08642',
  goldDeep: '#7a5a28',
  goldSoft: '#e9d9b4',
  goldTint: 'rgba(176,134,66,0.10)',

  // Dividers / borders
  rule: 'rgba(22,19,16,0.10)',

  // Pro accent — ONLY for "Xem gói nâng cao" chip and Pro feature labels.
  // NEVER use on user profiles, ranks, or any social comparison UI.
  mint: '#4a9d7e',
} as const;

export type ColorKey = keyof typeof colors;

export const typography = {
  /** Cormorant Garamond 600 SemiBold — titles & display text ONLY */
  serif: 'CormorantGaramond_600SemiBold',
  /** Cormorant Garamond 600 SemiBold Italic — editorial pull-quotes */
  serifItalic: 'CormorantGaramond_600SemiBold_Italic',
  /** Be Vietnam Pro 400 Regular — body, labels, UI text */
  sans: 'BeVietnamPro_400Regular',
  /** Be Vietnam Pro 500 Medium */
  sansMedium: 'BeVietnamPro_500Medium',
  /** Be Vietnam Pro 600 SemiBold — emphasis, buttons, headings */
  sansSemiBold: 'BeVietnamPro_600SemiBold',
  /** Be Vietnam Pro 700 Bold — large screen titles */
  sansBold: 'BeVietnamPro_700Bold',
  /** JetBrains Mono 500 Medium — technical labels, metadata, mono code */
  mono: 'JetBrainsMono_500Medium',
} as const;

export type TypographyKey = keyof typeof typography;

/** 4-pt grid spacing scale */
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export type SpacingKey = keyof typeof spacing;

export const radii = {
  xs: 6,
  sm: 8,
  md: 14,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export type RadiiKey = keyof typeof radii;

export const shadows = {
  card: {
    shadowColor: '#161310',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  float: {
    shadowColor: '#161310',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export type ShadowKey = keyof typeof shadows;

/** Font size scale matching mockup */
export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
} as const;

export type FontSizeKey = keyof typeof fontSizes;

/** Line heights */
export const lineHeights = {
  tight: 1.15,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
} as const;
