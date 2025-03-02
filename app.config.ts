export default defineAppConfig({})

declare module '@nuxt/schema' {
  interface AppConfigInput {
    auth?: {
      base: string
    }
  }
}
