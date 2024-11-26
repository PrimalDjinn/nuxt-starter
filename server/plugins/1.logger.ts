import { createConsola, consola, type LogObject } from "consola"
const { nuxt: nuxtConfig, ...appConfig } = useAppConfig()


function logger() {
    //@ts-expect-error
    const appReporters = appConfig?.log?.reporters || []
    // @ts-expect-error
    const nuxtReporters = nuxtConfig?.log?.reporters || []
    const reporters = [...appReporters, ...nuxtReporters].map(func => ({ log: func }))
    if (!reporters.length) reporters.push({
        log: (logObj: LogObject) => {
            consola[logObj.type](...logObj.args as [any])
        }
    })
    return createConsola({
        level: +999,
        reporters: reporters
    })
}

export default defineNitroPlugin(() => {
    Object.defineProperty(global, 'log', {
        value: logger(),
        writable: false,
        enumerable: true,
        configurable: false
    })
})