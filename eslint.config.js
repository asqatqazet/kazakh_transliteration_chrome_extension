import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.output/**',
      '.wxt/**',
      'node_modules/**',
      'coverage/**',
      'dist/**',
      // Legacy files awaiting removal in phase 4
      'contentScript.js',
      'background.js',
      'manifest.json',
      'scripts/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        chrome: 'readonly',
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLDialogElement: 'readonly',
        Node: 'readonly',
        NodeFilter: 'readonly',
        Element: 'readonly',
        Text: 'readonly',
        CSSStyleSheet: 'readonly',
        ShadowRoot: 'readonly',
        DocumentFragment: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  }
);
