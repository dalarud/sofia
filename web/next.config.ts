import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pg och pdf-lib ska köras som vanliga Node-paket på servern
  serverExternalPackages: ["pg", "pdf-lib", "@pdf-lib/fontkit", "iconv-lite"],
  // Kvitton laddas upp som bilder; de krymps i webbläsaren men får vara upp till 4 MB
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  outputFileTracingIncludes: { "/**": ["./assets/**", "./src/site/**"] },
};

export default nextConfig;
