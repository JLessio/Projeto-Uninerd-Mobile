export const Colors = {
  light: {
    background: '#F0F4F8',
    surface: '#FFFFFF',
    text: '#172033',
    mutedText: '#64748B',
    tint: '#004A8C',
    danger: '#B91C1C',
    success: '#15803D',
    disabled: '#94A3B8',
    border: '#DCE3ED',
  },
  dark: {
    background: '#0B1120',
    surface: '#172033',
    elevatedSurface: '#1E293B',
    text: '#F8FAFC',
    mutedText: '#CBD5E1',
    tint: '#60A5FA',
    danger: '#FCA5A5',
    success: '#86EFAC',
    disabled: '#64748B',
    border: '#475569',
    input: '#263449',
    errorSurface: '#451A1A',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
