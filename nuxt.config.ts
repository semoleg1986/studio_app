export default defineNuxtConfig({
  ssr: true,
  srcDir: "src/",
  css: ["~/app/styles/main.css"],
  devtools: { enabled: false },
  nitro: {
    preset: "node-server"
  },
  runtimeConfig: {
    authServiceBaseUrl: "http://localhost:8000",
    public: {
      apiBaseUrl: "/api",
      appName: "Curs Studio",
      siteUrl: "http://localhost:3002"
    }
  }
});
