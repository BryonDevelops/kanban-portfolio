import withPWA from "next-pwa";
import path from "path";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'placehold.co',
      },
    ],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Mark server-only packages to prevent client bundling
  serverExternalPackages: ['@notionhq/client'],
  // Enable compression
  compress: true,
  // Configure webpack to handle path aliases properly
  webpack: (config: import('webpack').Configuration, { isServer }: { isServer: boolean }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };

    // Mark server-only modules to prevent client bundling issues
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Prevent @notionhq/client from being bundled on the client
        '@notionhq/client': false,
      };
    }

    return config;
  },
};

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/manifest\.json$/],
  mode: 'production',
};

export default withPWA(pwaConfig)(nextConfig);
