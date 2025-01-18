import {
  createConsola,
  consola,
  type LogObject,
  type ConsolaOptions,
} from "consola";

function logger() {
  const { nuxt: nuxtConfig } = useAppConfig();
  const nuxtReporters = ((nuxtConfig as Record<string, any>)["log"]
    ?.reporters || []) as Array<
    (logObj: LogObject, ctx: { options: ConsolaOptions }) => void
  >;

  const reporters = nuxtReporters.map((func) => ({ log: func }));
  if (!reporters.length) {
    reporters.push({
      log: (logObj: LogObject) => {
        consola[logObj.type](...(logObj.args as [any]));
      },
    });
  }
  return createConsola({
    level: +999,
    reporters: reporters,
  });
}

export default defineNitroPlugin(() => {
  Object.defineProperty(global, "log", {
    value: logger(),
    writable: false,
    enumerable: true,
    configurable: false,
  });
});
