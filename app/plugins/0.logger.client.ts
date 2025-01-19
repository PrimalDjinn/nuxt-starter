import { createConsola, type ConsolaInstance } from "consola";

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;
  if (!window?.log) {
    Object.defineProperty(window, "log", {
      value: createConsola({
        level: +999,
        reporters: getLogReporters(),
      }),
      writable: false,
      enumerable: true,
      configurable: false,
    });
  }
});
