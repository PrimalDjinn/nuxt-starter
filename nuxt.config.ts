// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const cwd = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  devtools: { enabled: true },

  imports: {
    dirs: [join(cwd, "../shared/types"), join(cwd, "../shared/utils")],
  },

  future: {
    compatibilityVersion: 4,
  },

  nitro: {
    experimental: {
      websocket: true,
    },
    imports: {
      dirs: [join(cwd, "./shared/utils"), join(cwd, "./shared/types")],
    },
  },

  runtimeConfig: {
    secretKey: "",
  },

  experimental: {},
  modules: ["@nuxtjs/tailwindcss"]
});