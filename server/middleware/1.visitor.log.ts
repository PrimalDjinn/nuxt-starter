import { consola } from "consola";

export default defineEventHandler((context) => {
  if (!isVercel)
    consola.info(`[${context.node.req.method}]   ${context.node.req.url}`);
});
