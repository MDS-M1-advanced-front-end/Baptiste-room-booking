import type { StorybookConfig } from 'storybook-framework-qwik';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const config = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: 'storybook-framework-qwik',
  },
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    plugins: [...(viteConfig.plugins ?? []), tsconfigPaths({ root: '.' }), tailwindcss()],
  }),
} satisfies StorybookConfig;

export default config;
