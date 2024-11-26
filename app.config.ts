import type { ConsolaReporter } from "consola"

export default defineAppConfig({})

declare module '@nuxt/schema' {
  interface AppConfigInput {
    log?: {
      reporters?: ConsolaReporter['log'][]
    }
  }
}
