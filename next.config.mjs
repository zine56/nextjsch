/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['http2.mlstatic.com', 'placehold.co', 'firebasestorage.googleapis.com'],
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      },
};

export default nextConfig;
