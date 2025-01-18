import { createConsola } from "consola";
import type { ConsolaInstance } from "consola";

declare global {
  namespace NodeJS {
    interface Global {
      log: ConsolaInstance;
    }
  }
}

export default defineNitroPlugin(() => {
  Object.defineProperty(global, "log", {
    value: createConsola({
      level: +999,
      reporters: getLogReporters(),
    }),
    writable: false,
    enumerable: true,
    configurable: false,
  });
});
