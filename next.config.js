/** @type {import('next').NextConfig} */
module.exports = {
  devIndicators: false,
  output: 'standalone',
  experimental: {
    preloadEntriesOnStart: false,
  },
};
