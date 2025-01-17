import { type H3Event } from "h3";

const config = useRuntimeConfig();
export function readAuthToken(event: H3Event) {
  let auth = event.headers.get("Authorization") || null;
  if (!auth) auth = getCookie(event, "auth") || null;
  if (!auth) return null;

  let [bearer, token] = auth.split(" ");
  if (bearer !== "Bearer") return null;

  token = Boolish(token);
  if (!token) return null;

  if (token.includes(":")) {
    return decrypt(token, config.secretKey).data;
  } else {
    return token;
  }
}

export function clearAuthToken(event: H3Event) {
  event.headers.delete("Authorization");
  deleteCookie(event, "auth");
}

export function setAuthToken(event: H3Event, token: string) {
  const { data, error } = encrypt(token, config.secretKey);
  if (!data || error) throw error || new Error("Failed to encrypt token");
  setCookie(event, "auth", data);
  return data;
}
