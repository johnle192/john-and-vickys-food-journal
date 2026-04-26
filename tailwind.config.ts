import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{html,js,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        primary:                'var(--md-sys-color-primary)',
        'on-primary':           'var(--md-sys-color-on-primary)',
        'primary-container':    'var(--md-sys-color-primary-container)',
        'on-primary-container': 'var(--md-sys-color-on-primary-container)',
        surface:                'var(--md-sys-color-surface)',
        'on-surface':           'var(--md-sys-color-on-surface)',
        'surface-variant':      'var(--md-sys-color-surface-variant)',
        'on-surface-variant':   'var(--md-sys-color-on-surface-variant)',
        outline:                'var(--md-sys-color-outline)',
        'outline-variant':      'var(--md-sys-color-outline-variant)',
        background:             'var(--md-sys-color-background)',
        'on-background':        'var(--md-sys-color-on-background)',
        'inverse-surface':      'var(--md-sys-color-inverse-surface)',
        'inverse-on-surface':   'var(--md-sys-color-inverse-on-surface)',
        'inverse-primary':      'var(--md-sys-color-inverse-primary)',
      }
    }
  },
  plugins: []
} satisfies Config;
