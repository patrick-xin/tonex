import type { ExportTab } from '@/features/export'

export const EXPORT_CODE: Record<ExportTab, string> = {
  Tailwind: `:root {
  --primary: oklch(0.5057 0.1635 317.07);
  --on-primary: oklch(0.9834 0.01 345.41);
  --primary-container: oklch(0.5795 0.164 317.85);
  --on-primary-container: oklch(1 0 0);
  --secondary: oklch(0.4943 0.0719 320.24);
  --on-secondary: oklch(0.9834 0.01 345.41);
  --secondary-container: oklch(0.8877 0.0764 321.28);
  --on-secondary-container: oklch(0.4204 0.0717 319.03);
  --tertiary: oklch(0.4984 0.1162 318.23);
  --on-tertiary: oklch(0.9834 0.01 345.41);
  --tertiary-container: oklch(0.5734 0.1177 319.18);
  --on-tertiary-container: oklch(1 0 0);
  --error: oklch(0.5036 0.1454 18.37);
  --on-error: oklch(0.982 0.0087 26.02);
  --error-container: oklch(0.7262 0.1614 17.78);
  --on-error-container: oklch(0.2686 0.1076 18.47);
  --surface: oklch(0.9834 0.01 345.41);
  --on-surface: oklch(0.3237 0.0465 318.79);
  --on-surface-variant: oklch(0.4904 0.0469 320.91);
  --surface-dim: oklch(0.8929 0.0504 323.92);
  --surface-bright: oklch(0.9834 0.01 345.41);
  --surface-container-lowest: oklch(1 0 0);
  --surface-container-low: oklch(0.9687 0.0251 329.71);
  --surface-container: oklch(0.9534 0.0401 324.63);
  --surface-container-high: oklch(0.9346 0.0437 324.75);
  --surface-container-highest: oklch(0.9203 0.05 323.91);
  --outline: oklch(0.5861 0.0475 322.42);
  --outline-variant: oklch(0.7684 0.0481 322.64);
}
`,
  CSS: `:root {
  color-scheme: light dark;
  --color-primary: light-dark(#893fa1, #cf7fe5);
  --color-on-primary: light-dark(#fff7fb, #3a004d);
  --color-primary-container: light-dark(#a155b8, #a155b8);
  --color-on-primary-container: light-dark(#ffffff, #ffffff);
  --color-primary-fixed: light-dark(#a155b8, #a155b8);
  --color-primary-fixed-dim: light-dark(#9348aa, #9348aa);
  --color-on-primary-fixed: light-dark(#ffffff, #ffffff);
  --color-on-primary-fixed-variant: light-dark(#fffbff, #fffbff);
  --color-primary-dim: light-dark(#893fa1, #cf7fe5);
  --color-secondary: light-dark(#74547b, #b691bd);
  --color-on-secondary: light-dark(#fff7fb, #301538);
  --color-secondary-container: light-dark(#f2caf9, #42254a);
  --color-on-secondary-container: light-dark(#5e4066, #caa4d0);
  --color-secondary-fixed: light-dark(#f2caf9, #f2caf9);
  --color-secondary-fixed-dim: light-dark(#e4bcea, #e4bcea);
  --color-on-secondary-fixed: light-dark(#4a2d52, #4a2d52);
  --color-on-secondary-fixed-variant: light-dark(#684970, #684970);
  --color-secondary-dim: light-dark(#74547b, #b691bd);
  --color-tertiary: light-dark(#7e4b8d, #c289d0);
  --color-on-tertiary: light-dark(#fff7fb, #380549);
  --color-tertiary-container: light-dark(#9660a4, #9660a4);
  --color-on-tertiary-container: light-dark(#ffffff, #ffffff);
}
`,
  shadcn: `:root {
  --background: oklch(0.9834 0.01 345.41);
  --foreground: oklch(0.3237 0.0465 318.79);
  --card: oklch(0.9534 0.0401 324.63);
  --card-foreground: oklch(0.3237 0.0465 318.79);
  --popover: oklch(0.9534 0.0401 324.63);
  --popover-foreground: oklch(0.3237 0.0465 318.79);
  --primary: oklch(0.5057 0.1635 317.07);
  --primary-foreground: oklch(0.9834 0.01 345.41);
  --secondary: oklch(0.8877 0.0764 321.28);
  --secondary-foreground: oklch(0.4204 0.0717 319.03);
  --muted: oklch(0.8929 0.0504 323.92);
  --muted-foreground: oklch(0.4904 0.0469 320.91);
  --accent: oklch(0.9203 0.05 323.91);
  --accent-foreground: oklch(0.3237 0.0465 318.79);
  --destructive: oklch(0.5036 0.1454 18.37);
  --border: oklch(0.5861 0.0475 322.42);
  --input: oklch(0.5861 0.0475 322.42);
  --ring: oklch(0.5057 0.1635 317.07);
  --sidebar: oklch(0.9687 0.0251 329.71);
  --sidebar-foreground: oklch(0.4904 0.0469 320.91);
  --sidebar-primary: oklch(0.5057 0.1635 317.07);
  --sidebar-primary-foreground: oklch(0.9834 0.01 345.41);
  --sidebar-accent: oklch(0.9346 0.0437 324.75);
  --sidebar-accent-foreground: oklch(0.3237 0.0465 318.79);
  --sidebar-border: oklch(0.5861 0.0475 322.42);
  --sidebar-ring: oklch(0.5861 0.0475 322.42);
  --brand: oklch(0.5795 0.164 317.85);
  --brand-foreground: oklch(1 0 0);
}`,
  JSON: `"schemes": {
  "light": {
    "primary": "#893FA1",
    "onPrimary": "#FFF7FB",
    "primaryContainer": "#A155B8",
    "onPrimaryContainer": "#FFFFFF",
    "secondary": "#74547B",
    "onSecondary": "#FFF7FB",
    "secondaryContainer": "#F2CAF9",
    "onSecondaryContainer": "#5E4066",
    "tertiary": "#7E4B8D",
    "onTertiary": "#FFF7FB",
    "tertiaryContainer": "#9660A4",
    "onTertiaryContainer": "#FFFFFF",
    "error": "#A73843",
    "onError": "#FFF7F6",
    "errorContainer": "#FB7780",
    "onErrorContainer": "#4E0010",
    "surface": "#FFF7FB",
    "onSurface": "#3E2C43",
    "onSurfaceVariant": "#6D5871",
    "surfaceDim": "#EDD1EF",
    "surfaceBright": "#FFF7FB",
    "surfaceContainerLowest": "#FFFFFF",
    "surfaceContainerLow": "#FFEFFD",
    "surfaceContainer": "#FEE7FF",
    "surfaceContainerHigh": "#F9E0FA",
    "surfaceContainerHighest": "#F6DAF8",
    "outline": "#8A738D",
    "outlineVariant": "#C3AAC6"
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
      primary: Color(0xff893fa1),
      surfaceTint: Color(0xff893fa1),
      onPrimary: Color(0xfffff7fb),
      primaryContainer: Color(0xffa155b8),
      onPrimaryContainer: Color(0xffffffff),
      secondary: Color(0xff74547b),
      onSecondary: Color(0xfffff7fb),
      secondaryContainer: Color(0xfff2caf9),
      onSecondaryContainer: Color(0xff5e4066),
      tertiary: Color(0xff7e4b8d),
      onTertiary: Color(0xfffff7fb),
      tertiaryContainer: Color(0xff9660a4),
      onTertiaryContainer: Color(0xffffffff),
      error: Color(0xffa73843),
      onError: Color(0xfffff7f6),
      errorContainer: Color(0xfffb7780),
      onErrorContainer: Color(0xff4e0010),
      surface: Color(0xfffff7fb),
      onSurface: Color(0xff3e2c43),
      onSurfaceVariant: Color(0xff6d5871),
      outline: Color(0xff8a738d),
      outlineVariant: Color(0xffc3aac6),
      shadow: Color(0xff000000),
      scrim: Color(0xff000000),
      inverseSurface: Color(0xff18081c),
      onInverseSurface: Color(0xffa798a7),
      inversePrimary: Color(0xffe694fd),
      primaryFixed: Color(0xffa155b8),
      onPrimaryFixed: Color(0xffffffff),
      primaryFixedDim: Color(0xff9348aa),
      onPrimaryFixedVariant: Color(0xfffffbff),
      secondaryFixed: Color(0xfff2caf9),
      onSecondaryFixed: Color(0xff4a2d52),
      secondaryFixedDim: Color(0xffe4bcea),
      onSecondaryFixedVariant: Color(0xff684970),
      tertiaryFixed: Color(0xff9660a4),
      onTertiaryFixed: Color(0xffffffff),
      tertiaryFixedDim: Color(0xff885497),
      onTertiaryFixedVariant: Color(0xfffffbff),
      surfaceDim: Color(0xffedd1ef),
      surfaceBright: Color(0xfffff7fb),
      surfaceContainerLowest: Color(0xffffffff),
      surfaceContainerLow: Color(0xffffeffd),
      surfaceContainer: Color(0xfffee7ff),
      surfaceContainerHigh: Color(0xfff9e0fa),
      surfaceContainerHighest: Color(0xfff6daf8),
    );
  }

  ThemeData light() {
    return theme(lightScheme());
  }

  static ColorScheme darkScheme() {
    return const ColorScheme(
      brightness: Brightness.dark,
      primary: Color(0xffcf7fe5),
      surfaceTint: Color(0xffcf7fe5),
      onPrimary: Color(0xff3a004d),
      primaryContainer: Color(0xffa155b8),
      onPrimaryContainer: Color(0xffffffff),
      secondary: Color(0xffb691bd),
      onSecondary: Color(0xff301538),
      secondaryContainer: Color(0xff42254a),
      onSecondaryContainer: Color(0xffcaa4d0),
      tertiary: Color(0xffc289d0),
      onTertiary: Color(0xff380549),
      tertiaryContainer: Color(0xff9660a4),
      onTertiaryContainer: Color(0xffffffff),
      error: Color(0xfffb7780),
      onError: Color(0xff4e0010),
      errorContainer: Color(0xff6d091d),
      onErrorContainer: Color(0xffff9a9e),
      surface: Color(0xff140b16),
      onSurface: Color(0xfff9ddfb),
      onSurfaceVariant: Color(0xffbca3bf),
      outline: Color(0xff856e88),
      outlineVariant: Color(0xff554159),
      shadow: Color(0xff000000),
      scrim: Color(0xff000000),
}
`,
  'DESIGN.md': `colors:
  primary: "#cf7fe5"
  on-primary: "#3a004d"
  primary-container: "#a155b8"
  on-primary-container: "#ffffff"
  secondary: "#b691bd"
  on-secondary: "#301538"
  secondary-container: "#42254a"
  on-secondary-container: "#caa4d0"
  tertiary: "#c289d0"
  on-tertiary: "#380549"
  tertiary-container: "#9660a4"
  on-tertiary-container: "#ffffff"
  error: "#fb7780"
  on-error: "#4e0010"
  error-container: "#6d091d"
  on-error-container: "#ff9a9e"
  surface: "#140b16"
  on-surface: "#f9ddfb"
  on-surface-variant: "#bca3bf"
  surface-dim: "#140b16"
  surface-bright: "#38263c"
  surface-container-lowest: "#000000"
  surface-container-low: "#1b0f1d"
  surface-container: "#221525"
  surface-container-high: "#291a2d"
  surface-container-highest: "#311f35"
  outline: "#856e88"
  outline-variant: "#554159"
`,
}
