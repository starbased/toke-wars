const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  experimental: {
    modularizeImports: {
      lodash: {
        transform: "lodash/{{member}}",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/lp",
        destination: "/LP/0xAd5B1a6ABc1C9598C044cea295488433a3499eFc",
        permanent: false,
      },
    ];
  },
});
