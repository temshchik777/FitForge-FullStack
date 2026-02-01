import '@testing-library/jest-dom';

// Polyfills для jsdom
Object.assign(global, {
  TextEncoder: require('util').TextEncoder,
  TextDecoder: require('util').TextDecoder,
});

