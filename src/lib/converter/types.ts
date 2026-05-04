export type Script = 'Cyrillic' | 'Arabic' | 'Latin';

export const SCRIPTS = ['Cyrillic', 'Arabic', 'Latin'] as const;

export interface ConvertOptions {
  collapseIyy?: boolean;
  collapseHh?: boolean;
  loanwordPolicy?: 'transliterate' | 'drop';
}

export const DEFAULT_OPTIONS: Required<ConvertOptions> = {
  collapseIyy: true,
  collapseHh: true,
  loanwordPolicy: 'transliterate',
};
