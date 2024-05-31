import { BundledThemeInfo, DynamicImportThemeRegistration } from '@shikijs/core';

declare const bundledThemesInfo: BundledThemeInfo[];
type BundledTheme = 'andromeeda' | 'aurora-x' | 'ayu-dark' | 'catppuccin-frappe' | 'catppuccin-latte' | 'catppuccin-macchiato' | 'catppuccin-mocha' | 'dark-plus' | 'dracula' | 'dracula-soft' | 'github-dark' | 'github-dark-default' | 'github-dark-dimmed' | 'github-light' | 'github-light-default' | 'houston' | 'light-plus' | 'material-theme' | 'material-theme-darker' | 'material-theme-lighter' | 'material-theme-ocean' | 'material-theme-palenight' | 'min-dark' | 'min-light' | 'monokai' | 'night-owl' | 'nord' | 'one-dark-pro' | 'one-light' | 'poimandres' | 'red' | 'rose-pine' | 'rose-pine-dawn' | 'rose-pine-moon' | 'slack-dark' | 'slack-ochin' | 'snazzy-light' | 'solarized-dark' | 'solarized-light' | 'synthwave-84' | 'tokyo-night' | 'vesper' | 'vitesse-black' | 'vitesse-dark' | 'vitesse-light';
declare const bundledThemes: Record<BundledTheme, DynamicImportThemeRegistration>;

export { type BundledTheme, bundledThemes, bundledThemesInfo };
