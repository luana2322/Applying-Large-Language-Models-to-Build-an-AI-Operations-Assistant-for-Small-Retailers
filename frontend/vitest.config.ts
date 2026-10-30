/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Environment: jsdom simulates browser DOM
    environment: 'jsdom',

    // Auto-import setup file (jest-dom matchers, MSW setup)
    setupFiles: ['./src/test/setup.ts'],

    // Include test files pattern
    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    // Exclude E2E and Storybook
    exclude: ['node_modules', 'dist', 'e2e/**', '**/*.stories.*'],

    // Coverage config (v8 provider — fast, no babel needed)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',

      // Target: 70% coverage
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },

      // What to include in coverage report
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.stories.*',
        'src/**/*.d.ts',
        'src/main.tsx',       // entry point — not meaningful to test
        'src/vite-env.d.ts',
        'src/router/index.tsx', // routing config — tested via E2E
      ],
    },

    // Globals: allows using describe/it/expect without import
    globals: true,

    // Reporter
    reporters: ['verbose'],

    // Snapshot format
    snapshotFormat: {
      printBasicPrototype: false,
    },
  },
})
