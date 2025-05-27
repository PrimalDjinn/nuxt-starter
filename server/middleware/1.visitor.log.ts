export default defineEventHandler((context) => {
  if (!isVercel)
    console.info(`[${context.node.req.method}]   ${context.node.req.url}`);
});
