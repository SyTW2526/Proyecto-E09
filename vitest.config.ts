import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/index.spec.ts'], 
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
    },
  },
});