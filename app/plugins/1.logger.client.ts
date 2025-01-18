import {
  createConsola,
  type ConsolaInstance,
  type LogObject,
  type ConsolaOptions,
  consola,
} from "consola";

declare global {
  var log: ConsolaInstance;
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;
  if (!window?.log) {
    const config = useAppConfig();
    const appReporters = ((config as Record<string, any>)["log"]?.reporters ||
      []) as Array<
      (logObj: LogObject, ctx: { options: ConsolaOptions }) => void
    >;

    const reporters = appReporters.map((func) => ({ log: func }));
    if (!reporters.length) {
      reporters.push({
        log: (logObj: LogObject) => {
          consola[logObj.type](...(logObj.args as [any]));
        },
      });
    }

    Object.defineProperty(window, "log", {
      value: createConsola({
        level: +999,
        reporters: reporters,
      }),
      writable: false,
      enumerable: true,
      configurable: false,
    });
  }
});
