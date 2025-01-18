import { createConsola } from "consola";

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
  log.info
});
