import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((env) =>
  mergeConfig(viteConfig(env), {
    test: {
      projects: [
        { test: { name: 'node', include: ['src/**/*.test.ts'], environment: 'node' } },
        { test: { name: 'dom', include: ['src/**/*.test.tsx'], environment: 'happy-dom' } },
      ],
    },
  }),
);
