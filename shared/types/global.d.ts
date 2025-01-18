import { type ConsolaInstance } from "consola";

declare global {
  var log: ConsolaInstance;
}

declare namespace NodeJS {
  interface Global {
    log: ConsolaInstance;
  }
}
