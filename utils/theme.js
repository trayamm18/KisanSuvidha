/**
 * Professional Design System / Theme Configuration
 * Includes multiple color palettes and a ThemeProvider
 */

// Pre-defined color palettes. Add palettes here and reference them from screens.
export const PALETTES = {
  earth: {
    primary: "#6B4226", // warm brown
    primaryLight: "#A66E3A",
    primaryDark: "#4A2B1A",
    secondary: "#F6C94A", // mustard / yellow
    background: "#FFFFFF",
    surface: "#FFF8ED",
    text: "#2E1F16",
    muted: "#8C6A57",
    border: "#E6D7CA",
  },
  sage: {
    primary: "#3A6B48",
    primaryLight: "#6FAF78",
    primaryDark: "#1F442B",
    secondary: "#F3F7EE",
    background: "#FFFFFF",
    surface: "#F6FBF3",
    text: "#173023",
    muted: "#7C9B86",
    border: "#E6F0E9",
  },
  ocean: {
    primary: "#0B7285",
    primaryLight: "#2FB5C6",
    primaryDark: "#064A56",
    secondary: "#E6FAFF",
    background: "#FFFFFF",
    surface: "#F2FCFD",
    text: "#073642",
    muted: "#6BA9B3",
    border: "#D9F0F2",
  },
  midnight: {
    primary: "#133B5C",
    primaryLight: "#3A6EA5",
    primaryDark: "#0B2740",
    secondary: "#FFE8A1",
    background: "#0F1724",
    surface: "#0B1622",
    text: "#E6EEF6",
    muted: "#7A8FA6",
    border: "#122033",
  },
  sunrise: {
    primary: "#D97706",
    primaryLight: "#FFB84D",
    primaryDark: "#A85200",
    secondary: "#FFF7ED",
    background: "#FFFFFF",
    surface: "#FFF3E0",
    text: "#5A3400",
    muted: "#C08A45",
    border: "#FFE9C9",
  },
};

// Default palette used across the app (earth = brown/yellow/white)
export const DEFAULT_PALETTE_KEY = "earth";

// Base tokens that apply regardless of palette
export const BASE_TOKENS = {
  white: "#FFFFFF",
  lightGray: "#F5F5F5",
  disabled: "#D1D5DB",
  overlay: "rgba(0,0,0,0.5)",
};

// Colors derived from the selected palette (will be merged with BASE_TOKENS)
export const COLORS = {
  ...BASE_TOKENS,
  ...PALETTES[DEFAULT_PALETTE_KEY],
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  // Friendly aliases used across the app
  subText: PALETTES[DEFAULT_PALETTE_KEY].muted || "#9CA3AF",
  cardBorder: PALETTES[DEFAULT_PALETTE_KEY].border || "#E6E6E6",
  accent:
    PALETTES[DEFAULT_PALETTE_KEY].secondary ||
    PALETTES[DEFAULT_PALETTE_KEY].primaryLight,
  taskBtn:
    PALETTES[DEFAULT_PALETTE_KEY].primaryLight ||
    PALETTES[DEFAULT_PALETTE_KEY].secondary,
};

export const TYPOGRAPHY = {
  // Sizes
  h1: { fontSize: 32, fontWeight: "900", lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: "900", lineHeight: 35 },
  h3: { fontSize: 24, fontWeight: "800", lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: "800", lineHeight: 28 },
  h5: { fontSize: 18, fontWeight: "700", lineHeight: 24 },
  h6: { fontSize: 16, fontWeight: "700", lineHeight: 22 },

  // Body Text
  body1: { fontSize: 16, fontWeight: "400", lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: "400", lineHeight: 21 },
  bodySm: { fontSize: 12, fontWeight: "400", lineHeight: 18 },

  // Button Text
  button: { fontSize: 16, fontWeight: "700", lineHeight: 24 },
  buttonSm: { fontSize: 14, fontWeight: "600", lineHeight: 20 },

  // Label
  label: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    letterSpacing: 0.5,
  },

  // Caption
  caption: { fontSize: 11, fontWeight: "500", lineHeight: 16 },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const SHADOWS = {
  // Elevation levels
  sm: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  xl: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

export const ANIMATIONS = {
  // Duration (ms)
  fast: 200,
  normal: 300,
  slow: 500,

  // Easing values
  reactions: {
    springConfig: { tension: 50, friction: 7 },
    timingConfig: { duration: 300 },
  },
};

export const COMPONENTS = {
  // Button Sizes
  buttonSizes: {
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 12, paddingHorizontal: 20 },
    large: { paddingVertical: 16, paddingHorizontal: 24 },
  },

  // Input Sizes
  inputHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
};

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 100,
  modal: 200,
  popover: 250,
  notification: 300,
  toast: 9999,
};

// -------------------------
// Theme Provider (React Context)
// -------------------------
import { createContext, useContext, useMemo, useState } from "react";

const ThemeContext = createContext({
  paletteKey: DEFAULT_PALETTE_KEY,
  colors: COLORS,
  setPalette: () => {},
});

export function ThemeProvider({ children, initial = DEFAULT_PALETTE_KEY }) {
  const [paletteKey, setPaletteKey] = useState(initial);

  const colors = useMemo(() => {
    const palette = PALETTES[paletteKey] || PALETTES[DEFAULT_PALETTE_KEY];
    return {
      ...BASE_TOKENS,
      ...palette,
      success: "#10B981",
      error: "#EF4444",
      warning: "#F59E0B",
      info: "#3B82F6",
      // runtime aliases for compatibility
      subText: palette.muted || "#9CA3AF",
      cardBorder: palette.border || "#E6E6E6",
      accent: palette.secondary || palette.primaryLight,
      taskBtn: palette.primaryLight || palette.secondary,
    };
  }, [paletteKey]);

  const value = useMemo(
    () => ({ paletteKey, colors, setPalette: setPaletteKey }),
    [paletteKey, colors],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default {
  COLORS,
  PALETTES,
  DEFAULT_PALETTE_KEY,
  BASE_TOKENS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATIONS,
  COMPONENTS,
  BREAKPOINTS,
  Z_INDEX,
  ThemeProvider,
  useTheme,
};
