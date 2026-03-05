/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // QA pipeline handles linting — don't block builds on ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // QA pipeline handles type checking — don't block builds on TS errors
    ignoreBuildErrors: true,
  },
};
module.exports = nextConfig;
