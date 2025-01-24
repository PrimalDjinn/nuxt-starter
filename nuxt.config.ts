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
    typescript: {
      tsConfig: {
        compilerOptions: {
          typeRoots: ["@types/node", join(cwd, "./server/utils/types.d.ts")],
        },
        include: [join(cwd, "./app/utils/types.d.ts")],
      },
    },
  },
  modules: ["@nuxtjs/tailwindcss"],
  typescript: {
    tsConfig: {
      compilerOptions: {
        typeRoots: [join(cwd, "./app/utils/types.d.ts")],
      },
      include: [join(cwd, "./app/utils/types.d.ts")],
    },
  },
});
