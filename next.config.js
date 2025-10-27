// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.topcinema.cam", // Wildcard for all subdomains
      },
    ],
    // Disable optimization to bypass 403 errors
    unoptimized: true,
  },
};

module.exports = nextConfig;
