import { createConsola } from "consola";

export default defineNuxtPlugin(() => {
    if (!import.meta.client) return
    if (!window?.log) {
        Object.defineProperty(window, 'log', {
            value: createConsola(),
            writable: false,
            enumerable: true,
            configurable: false
        })
    }
})