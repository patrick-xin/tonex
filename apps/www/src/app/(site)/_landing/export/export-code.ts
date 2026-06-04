import type { ExportTab } from '@/features/export'

export const EXPORT_CODE: Record<ExportTab, string> = {
  Tailwind: `@theme inline {
  --color-primary: var(--color-primary);
  --color-on-primary: var(--color-on-primary);
  --color-primary-container: var(--color-primary-container);
  --color-on-primary-container: var(--color-on-primary-container);
  --color-secondary: var(--color-secondary);
  --color-on-secondary: var(--color-on-secondary);
  --color-secondary-container: var(--color-secondary-container);
  --color-on-secondary-container: var(--color-on-secondary-container);
  --color-tertiary: var(--color-tertiary);
  --color-on-tertiary: var(--color-on-tertiary);
  --color-tertiary-container: var(--color-tertiary-container);
  --color-on-tertiary-container: var(--color-on-tertiary-container);
  --color-error: var(--color-error);
  --color-on-error: var(--color-on-error);
  --color-error-container: var(--color-error-container);
  --color-on-error-container: var(--color-on-error-container);
  --color-surface: var(--color-surface);
  --color-on-surface: var(--color-on-surface);
  --color-on-surface-variant: var(--color-on-surface-variant);
  --color-surface-dim: var(--color-surface-dim);
  --color-surface-bright: var(--color-surface-bright);
  --color-surface-container-lowest: var(--color-surface-container-lowest);
  --color-surface-container-low: var(--color-surface-container-low);
  --color-surface-container: var(--color-surface-container);
  --color-surface-container-high: var(--color-surface-container-high);
  --color-surface-container-highest: var(--color-surface-container-highest);
  --color-outline: var(--color-outline);
  --color-outline-variant: var(--color-outline-variant);
}
`,
  CSS: `:root {
  color-scheme: light dark;
  --color-primary: light-dark(#5b4497, #a890e9);
  --color-on-primary: light-dark(#eadeff, #270762);
  --color-primary-container: light-dark(#6750a4, #6750a4);
  --color-on-primary-container: light-dark(#fcf6ff, #fcf6ff);
  --color-primary-fixed: light-dark(#6750a4, #6750a4);
  --color-primary-fixed-dim: light-dark(#5b4497, #5b4497);
  --color-on-primary-fixed: light-dark(#ffffff, #ffffff);
  --color-on-primary-fixed-variant: light-dark(#e0d2ff, #e0d2ff);
  --color-primary-dim: light-dark(#5b4497, #a890e9);
  --color-secondary: light-dark(#645a7d, #a398be);
  --color-on-secondary: light-dark(#fdf7ff, #231b3a);
  --color-secondary-container: light-dark(#ded1fa, #342b4b);
  --color-on-secondary-container: light-dark(#4f4667, #b6aad2);
  --color-secondary-fixed: light-dark(#ded1fa, #ded1fa);
  --color-secondary-fixed-dim: light-dark(#d0c3eb, #d0c3eb);
  --color-on-secondary-fixed: light-dark(#3c3353, #3c3353);
  --color-on-secondary-fixed-variant: light-dark(#594f71, #594f71);
  --color-secondary-dim: light-dark(#645a7d, #a398be);
  --color-tertiary: light-dark(#594982, #a694d3);
  --color-on-tertiary: light-dark(#eadeff, #25154c);
  --color-tertiary-container: light-dark(#65558f, #65558f);
  --color-on-tertiary-container: light-dark(#fcf6ff, #fcf6ff);
}
`,
  shadcn: `:root {
  --background: oklch(0.983 0.0123 317.74);
  --foreground: oklch(0.3203 0.0359 298.11);
  --card: oklch(0.9503 0.0295 305.12);
  --card-foreground: oklch(0.3203 0.0359 298.11);
  --popover: oklch(0.9503 0.0295 305.12);
  --popover-foreground: oklch(0.3203 0.0359 298.11);
  --primary: oklch(0.4537 0.1307 293.26);
  --primary-foreground: oklch(0.9202 0.0461 302.03);
  --secondary: oklch(0.8841 0.0574 299.71);
  --secondary-foreground: oklch(0.417 0.0551 296.46);
  --muted: oklch(0.8912 0.0365 301.4);
  --muted-foreground: oklch(0.4885 0.0355 297.56);
  --accent: oklch(0.9167 0.0378 302.46);
  --accent-foreground: oklch(0.3203 0.0359 298.11);
  --destructive: oklch(0.5003 0.1278 17.99);
  --border: oklch(0.5835 0.0356 299.2);
  --input: oklch(0.5835 0.0356 299.2);
  --ring: oklch(0.4537 0.1307 293.26);
  --sidebar: oklch(0.9676 0.0199 308.23);
  --sidebar-foreground: oklch(0.4885 0.0355 297.56);
  --sidebar-primary: oklch(0.4537 0.1307 293.26);
  --sidebar-primary-foreground: oklch(0.9202 0.0461 302.03);
  --sidebar-accent: oklch(0.9328 0.0322 303.47);
  --sidebar-accent-foreground: oklch(0.3203 0.0359 298.11);
  --sidebar-border: oklch(0.5835 0.0356 299.2);
  --sidebar-ring: oklch(0.5835 0.0356 299.2);
  --brand: oklch(0.4955 0.1305 293.71);
  --brand-foreground: oklch(0.983 0.0123 317.74);
}`,
  JSON: `"schemes": {
  "light": {
    "primary": "#5B4497",
    "onPrimary": "#EADEFF",
    "primaryContainer": "#6750A4",
    "onPrimaryContainer": "#FCF6FF",
    "secondary": "#645A7D",
    "onSecondary": "#FDF7FF",
    "secondaryContainer": "#DED1FA",
    "onSecondaryContainer": "#4F4667",
    "tertiary": "#594982",
    "onTertiary": "#EADEFF",
    "tertiaryContainer": "#65558F",
    "onTertiaryContainer": "#FCF6FF",
    "error": "#9F3F47",
    "onError": "#FFF7F6",
    "errorContainer": "#FA868D",
    "onErrorContainer": "#580817",
    "surface": "#FDF7FF",
    "onSurface": "#352F43",
    "onSurfaceVariant": "#625C72",
    "surfaceDim": "#DFD6F0",
    "surfaceBright": "#FDF7FF",
    "surfaceContainerLowest": "#FFFFFF",
    "surfaceContainerLow": "#F8F1FF",
    "surfaceContainer": "#F3EAFF",
    "surfaceContainerHigh": "#EDE4FB",
    "surfaceContainerHighest": "#E8DEF9",
    "outline": "#7E778E",
    "outlineVariant": "#B7AEC7"
        }
}
`,
  Dart: `import "package:flutter/material.dart";

class MaterialTheme {
  final TextTheme textTheme;

  const MaterialTheme(this.textTheme);

  static ColorScheme lightScheme() {
    return const ColorScheme(
      brightness: Brightness.light,
      primary: Color(0xff5b4497),
      surfaceTint: Color(0xff5b4497),
      onPrimary: Color(0xffeadeff),
      primaryContainer: Color(0xff6750a4),
      onPrimaryContainer: Color(0xfffcf6ff),
      secondary: Color(0xff645a7d),
      onSecondary: Color(0xfffdf7ff),
      secondaryContainer: Color(0xffded1fa),
      onSecondaryContainer: Color(0xff4f4667),
      tertiary: Color(0xff594982),
      onTertiary: Color(0xffeadeff),
      tertiaryContainer: Color(0xff65558f),
      onTertiaryContainer: Color(0xfffcf6ff),
      error: Color(0xff9f3f47),
      onError: Color(0xfffff7f6),
      errorContainer: Color(0xfffa868d),
      onErrorContainer: Color(0xff580817),
      surface: Color(0xfffdf7ff),
      onSurface: Color(0xff352f43),
      onSurfaceVariant: Color(0xff625c72),
      outline: Color(0xff7e778e),
      outlineVariant: Color(0xffb7aec7),
      shadow: Color(0xff000000),
      scrim: Color(0xff000000),
      inverseSurface: Color(0xff100b1d),
      onInverseSurface: Color(0xffa09ba8),
      inversePrimary: Color(0xffbba2fd),
      primaryFixed: Color(0xff6750a4),
      onPrimaryFixed: Color(0xffffffff),
      primaryFixedDim: Color(0xff5b4497),
      onPrimaryFixedVariant: Color(0xffe0d2ff),
      secondaryFixed: Color(0xffded1fa),
      onSecondaryFixed: Color(0xff3c3353),
      secondaryFixedDim: Color(0xffd0c3eb),
      onSecondaryFixedVariant: Color(0xff594f71),
      tertiaryFixed: Color(0xff65558f),
      onTertiaryFixed: Color(0xffffffff),
      tertiaryFixedDim: Color(0xff594982),
      onTertiaryFixedVariant: Color(0xffe0d2ff),
      surfaceDim: Color(0xffdfd6f0),
      surfaceBright: Color(0xfffdf7ff),
      surfaceContainerLowest: Color(0xffffffff),
      surfaceContainerLow: Color(0xfff8f1ff),
      surfaceContainer: Color(0xfff3eaff),
      surfaceContainerHigh: Color(0xffede4fb),
      surfaceContainerHighest: Color(0xffe8def9),
    );
  }

  ThemeData light() {
    return theme(lightScheme());
  }

  static ColorScheme darkScheme() {
    return const ColorScheme(
      brightness: Brightness.dark,
      primary: Color(0xffa890e9),
      surfaceTint: Color(0xffa890e9),
      onPrimary: Color(0xff270762),
      primaryContainer: Color(0xff6750a4),
      onPrimaryContainer: Color(0xfffcf6ff),
      secondary: Color(0xffa398be),
      onSecondary: Color(0xff231b3a),
      secondaryContainer: Color(0xff342b4b),
      onSecondaryContainer: Color(0xffb6aad2),
      tertiary: Color(0xffa694d3),
      onTertiary: Color(0xff25154c),
      tertiaryContainer: Color(0xff65558f),
      onTertiaryContainer: Color(0xfffcf6ff),
      error: Color(0xfffa868d),
      onError: Color(0xff580817),
      errorContainer: Color(0xff4c000f),
      onErrorContainer: Color(0xffef7e84),
      surface: Color(0xff0f0d16),
      onSurface: Color(0xffebe1fc),
      onSurfaceVariant: Color(0xffb0a7c0),
      outline: Color(0xff797289),
      outlineVariant: Color(0xff4b455a),
      shadow: Color(0xff000000),
      scrim: Color(0xff000000),
}
`,
  'Design.md': `colors:
  primary: "#a890e9"
  on-primary: "#270762"
  primary-container: "#6750a4"
  on-primary-container: "#fcf6ff"
  secondary: "#a398be"
  on-secondary: "#231b3a"
  secondary-container: "#342b4b"
  on-secondary-container: "#b6aad2"
  tertiary: "#a694d3"
  on-tertiary: "#25154c"
  tertiary-container: "#65558f"
  on-tertiary-container: "#fcf6ff"
  error: "#fa868d"
  on-error: "#580817"
  error-container: "#4c000f"
  on-error-container: "#ef7e84"
  surface: "#0f0d16"
  on-surface: "#ebe1fc"
  on-surface-variant: "#b0a7c0"
  surface-dim: "#0f0d16"
  surface-bright: "#2f293d"
  surface-container-lowest: "#000000"
  surface-container-low: "#15111e"
  surface-container: "#1b1726"
  surface-container-high: "#221d2d"
  surface-container-highest: "#282336"
  outline: "#797289"
  outline-variant: "#4b455a"
`,
}
