// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import tailwindcss from "@tailwindcss/vite";

const cwd = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  imports: {
    dirs: [join(cwd, "../shared/types"), join(cwd, "../shared/utils")],
  },

  nitro: {
    experimental: {
      websocket: true,
    },
    imports: {
      dirs: [join(cwd, "./shared/utils"), join(cwd, "./shared/types")],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
