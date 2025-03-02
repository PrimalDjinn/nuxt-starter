import { joinURL } from "ufo";
const config = useAppConfig();

export default defineEventHandler((event) => {
  const base = (config.auth.base ??=
    getRequestHeader(event, "origin") ||
    getRequestHeader(event, "X-Forwarded-For"));
    const path = event.path.replace(/^\_/, "");
  return proxyRequest(event, joinURL(base, path));
});
