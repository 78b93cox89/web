// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-11",
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      botUsername: process.env.NUXT_PUBLIC_BOT_USERNAME,
    },
    apiBase: process.env.API_BASE,
  },
  routeRules: {
    "/api/v1/artwork/random": {
      redirect: `${process.env.API_BASE}/artwork/random`,
    },
    "/setu": {
      redirect: `${process.env.API_BASE}/artwork/random/preview`,
    },
    "/sese": {
      redirect: `${process.env.API_BASE}/picture/random`,
    },
    "/atom.xml": {
      proxy: `${process.env.API_BASE}/atom`,
    },
  },
  app: {
    pageTransition: { name: "kawaii-bounce", mode: "out-in", appear: true },
  },
  modules: [
    "@varlet/nuxt",
    "@pinia/nuxt",
    "@nuxt/image",
    "@vueuse/nuxt",
    "nuxt-api-party",
    "nuxt-umami",
    "@nuxtjs/seo",
    "@nuxt/icon",
    "@nuxtjs/fontaine",
    "pinia-plugin-persistedstate/nuxt",
  ],
  piniaPluginPersistedstate: {
    storage: "localStorage",
  },

  apiParty: {
    endpoints: {
      acgapi: {
        url: process.env.API_BASE!,
        cookies: true,
      },
    },
    client:
      process.env.CLIENT_MODE === "always"
        ? "always"
        : process.env.CLIENT_MODE === "true",
  },

  site: {
    url:
      process.env.SITE_URL !== undefined && process.env.SITE_URL !== ""
        ? process.env.SITE_URL
        : "https://manyacg.top",
    name: "ManyACG",
  },

  robots: {
    allow: ["/"],
  },

  sitemap: {
    exclude: ["/register", "/profile"],
  },

  ogImage: {
    enabled: false,
  },

  seo: {
    enabled: true,
    redirectToCanonicalSiteUrl: true,
  },

  umami: {
    id: process.env.UMAMI_ID,
    host: process.env.UMAMI_HOST,
    domains: ["manyacg.top"],
    autoTrack: true,
  },

  icon: {
    serverBundle: "auto",
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
      sizeLimitKb: 256,
    },
  },
});
