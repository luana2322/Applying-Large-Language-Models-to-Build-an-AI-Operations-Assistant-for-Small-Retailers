// lighthouserc.cjs
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173/', 'http://localhost:5173/dashboard'],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      numberOfRuns: 3,
    },
    assert: {
      // Performance targets per spec
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['warn', { minScore: 0.90 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['warn', { minScore: 0.80 }],

        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],   // LCP < 2.5s
        'total-blocking-time': ['error', { maxNumericValue: 100 }],          // TBT (proxy for FID) < 100ms
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],     // CLS < 0.1
        'interactive': ['warn', { maxNumericValue: 3800 }],                  // TTI < 3.8s
        'speed-index': ['warn', { maxNumericValue: 3400 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
