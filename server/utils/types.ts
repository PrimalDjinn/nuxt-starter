import type { ConsolaInstance } from "consola";

declare global {
  namespace NodeJS {
    interface Global {
      log: ConsolaInstance;
    }
  }
}