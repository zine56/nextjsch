/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['http2.mlstatic.com'], // Agrega el dominio aquí
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'placehold.co',
            port: '',
            pathname: '/**',
          },
        ],
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      },
};

export default nextConfig;
