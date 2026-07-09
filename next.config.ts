import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Remplacer par votre ref Supabase : <ref>.supabase.co
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
