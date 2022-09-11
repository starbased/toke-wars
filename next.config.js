const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  reactStrictMode: true,
  staticPageGenerationTimeout: 150,
  async redirects() {
    return [
      {
        source: "/reactors",
        destination: "/reactors/0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84",
        permanent: false,
      },
      {
        source: "/dao",
        destination: "/dao/APWine",
        permanent: false,
      },
    ];
  },
  experimental: {
    modularizeImports: {
      lodash: {
        transform: "lodash/{{member}}",
      },
    },
  },
});
