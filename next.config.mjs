/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "",
  assetPrefix: "",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.gmcables.com",
        port: "", // HTTPS does not require a port
        pathname: "/uploads/**", // Update the pathname if needed
      },
    ],
  },
};

export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   basePath: "",
//   assetPrefix: "",
//   images: {
//     remotePatterns: [
//       {
//         protocol: "http",
//         hostname: "51.112.24.26",
//         port: "5003",
//         pathname: "/uploads/**",
//       },
//     ],
//   },
// };

// export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   basePath: "",
//   assetPrefix: "",
//   images: {
//     remotePatterns: [
//       {
//         protocol: "http",
//         hostname: "51.112.24.26",
//         port: "5003",
//         pathname: "/uploads/participant/**",
//       },
//       {
//         protocol: "http",
//         hostname: "51.112.24.26",
//         port: "5003",
//         pathname: "/uploads/event/**",
//       },
//     ],
//   },
// };

// export default nextConfig;
