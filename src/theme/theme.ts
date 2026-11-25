import {Platform, TextStyle, ViewStyle} from 'react-native';

export const COLORS = {
  // Brand Palette
  primary: '#1677FF',
  primaryDark: '#0D5BD9',
  primarySoft: '#EAF3FF',
  primaryMuted: '#C7DFFF',

  secondary: '#071B3A',
  secondarySoft: '#0F2B57',

  accent: '#20C8F5',
  accentSoft: '#E5F9FF',

  // Surfaces
  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  overlayLight: 'rgba(255, 255, 255, 0.94)',
  overlayDark: 'rgba(7, 27, 58, 0.88)',

  // Text
  textPrimary: '#101828',
  textSecondary: '#667085',
  textMuted: '#98A2B3',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#F8FAFC',

  // Borders
  border: '#E4E9F2',
  borderSubtle: '#EEF2F7',

  // Semantic Status
  success: '#12B76A',
  successSoft: '#ECFDF3',
  successDark: '#027A48',

  warning: '#F79009',
  warningSoft: '#FFFAEB',
  warningDark: '#B54708',

  error: '#F04438',
  errorSoft: '#FEF3F2',
  errorDark: '#B42318',
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
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
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
      elevation: 2,
    },
    default: {
      shadowColor: '#071B3A',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
  }) as ViewStyle,
  floating: Platform.select({
    android: {
      elevation: 6,
    },
    default: {
      shadowColor: '#071B3A',
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.12,
      shadowRadius: 14,
    },
  }) as ViewStyle,
  button: Platform.select({
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: '#1677FF',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.25,
      shadowRadius: 10,
    },
  }) as ViewStyle,
};

export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
