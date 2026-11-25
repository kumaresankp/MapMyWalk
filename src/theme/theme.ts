import {Platform, TextStyle, ViewStyle} from 'react-native';

export const COLORS = {
  // Reference Dark Obsidian + Electric Lime + Emerald Palette
  primary: '#B4FF2A', // Electric Lime (Primary CTA, active pills, highlights)
  primaryDark: '#8EE014',
  primarySoft: 'rgba(180, 255, 42, 0.14)',
  primaryMuted: 'rgba(180, 255, 42, 0.35)',

  secondary: '#183D24', // Deep Forest Emerald glow
  secondarySoft: '#122619',

  accent: '#2EE66E', // Vibrant Emerald Mint
  accentSoft: 'rgba(46, 230, 110, 0.14)',

  coral: '#FF6B35', // Warm Athletic Coral/Orange (Run & Calories accent)
  coralSoft: 'rgba(255, 107, 53, 0.16)',

  mapRoute: '#1677FF', // High-contrast route line over light OpenFreeMap tiles

  // Dark Surfaces
  background: '#0A0C0B', // Deep Obsidian
  surface: '#151817', // Elevated Dark Charcoal Card
  surfaceElevated: '#1C201E', // Nested Dark Pill / Input Surface
  surfaceSubtle: '#111413',
  overlayLight: 'rgba(18, 21, 20, 0.92)',
  overlayDark: 'rgba(10, 12, 11, 0.94)',

  // Text
  textPrimary: '#F8FAF9',
  textSecondary: '#949B97',
  textMuted: '#68706C',
  textOnPrimary: '#0A0C0B', // High-contrast dark text on Electric Lime
  textOnDark: '#F8FAF9',

  // Borders
  border: '#262B28',
  borderSubtle: '#1E2320',

  // Semantic Status
  success: '#2EE66E',
  successSoft: 'rgba(46, 230, 110, 0.15)',
  successDark: '#6BF29B',

  warning: '#FFB020',
  warningSoft: 'rgba(255, 176, 32, 0.15)',
  warningDark: '#FFD166',

  error: '#FF4D4F',
  errorSoft: 'rgba(255, 77, 79, 0.15)',
  errorDark: '#FF8587',
} as const;

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const RADII = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

export const ICON_SIZES = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
} as const;

export const TYPOGRAPHY: Record<string, TextStyle> = {
  heroMetric: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  titleLarge: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: COLORS.textPrimary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  overline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
};

export const SHADOWS: Record<'none' | 'card' | 'floating' | 'button', ViewStyle> = {
  none: {},
  card: Platform.select({
    android: {
      elevation: 3,
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.28,
      shadowRadius: 10,
    },
  }) as ViewStyle,
  floating: Platform.select({
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.4,
      shadowRadius: 16,
    },
  }) as ViewStyle,
  button: Platform.select({
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: '#B4FF2A',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.22,
      shadowRadius: 12,
    },
  }) as ViewStyle,
};

export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
