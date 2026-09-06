import { MD3DarkTheme } from "react-native-paper";

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#e50914",
    secondary: "#b20710",
    background: "#080b12",
    surface: "#111827",
  },
};

export const tvTokens = {
  colors: {
    canvas: "#070a11",
    surface: "#101725",
    surfaceRaised: "#172033",
    surfaceMuted: "#1d293d",
    border: "rgba(148,163,184,0.16)",
    text: "#f8fafc",
    textMuted: "#a8b4c7",
    textSubtle: "#71809a",
    accent: "#e50914",
    accentBright: "#ff3440",
    series: "#818cf8",
  },
  radius: {
    chip: 999,
    card: 14,
    surface: 18,
  },
  shadow: {
    card: "0px 5px 14px rgba(0, 0, 0, 0.24)",
    raised: "0px 8px 18px rgba(0, 0, 0, 0.32)",
    focus: "0px 0px 0px 2px rgba(255,255,255,0.95), 0px 9px 20px rgba(229,9,20,0.42)",
  },
} as const;
