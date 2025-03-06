import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['cdn.prod.website-files.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // serverComponentsExternalPackages: ['your-packages'],
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['*']
    },
  },
  // Logging configuration at the root level
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Add TypeScript configuration for better debugging
  typescript: {
    // Set to true temporarily to bypass TypeScript errors and see if there are other issues
    ignoreBuildErrors: true, 
    tsconfigPath: './tsconfig.json',
  },
  // Enable more detailed error output
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 4,
  },
};

export default nextConfig;
