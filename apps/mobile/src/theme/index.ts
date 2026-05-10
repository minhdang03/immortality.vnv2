/**
 * Theme barrel — re-exports @btd/ui-tokens for use inside apps/mobile.
 * Import from here instead of the package directly to allow mobile-specific overrides.
 */
export {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  fontSizes,
  lineHeights,
} from '@btd/ui-tokens';

export type {
  ColorKey,
  TypographyKey,
  SpacingKey,
  RadiiKey,
  ShadowKey,
  FontSizeKey,
} from '@btd/ui-tokens';
