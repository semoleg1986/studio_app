import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  ssr: true,
  srcDir: "src/",
  css: ["~/app/styles/main.css"],
  devtools: { enabled: false },
  nitro: {
    preset: "node-server",
    publicAssets: [
      {
        dir: fileURLToPath(new URL("./public", import.meta.url))
      }
    ]
  },
  runtimeConfig: {
    authServiceBaseUrl: "http://localhost:8000",
    commercialCatalogServiceBaseUrl: "http://localhost:8007",
    commercialCatalogServiceToken: "dev-service-token",
    courseServiceBaseUrl: "http://localhost:8001",
    public: {
      apiBaseUrl: "/api",
      appName: "Curs Studio",
      siteUrl: "http://localhost:3002"
    }
  }
});
