// This file provides compatibility fixes for module federation errors
// It's used to mock missing federation modules

// Mock for mf-va_remoteEntry.js
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (input && typeof input === 'string' && input.includes('mf-va_remoteEntry.js')) {
      // Return a mock module federation response
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('window.mf = {};'),
        json: () => Promise.resolve({}),
      } as Response);
    }
    return originalFetch(input, init);
  };
}

export default {};