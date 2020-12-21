if (process.env.NODE_ENV == 'production') {
  const withPWA = require('next-pwa');
  const runtimeCaching = require('next-pwa/cache');

  module.exports = withPWA({
    pwa: {
      dest: 'public',
      runtimeCaching,
    },
  });
} else module.exports = {};
