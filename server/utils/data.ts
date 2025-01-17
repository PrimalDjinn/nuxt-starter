import { createDecipheriv, createCipheriv, randomBytes } from "node:crypto";

function getKey(key: string) {
  return Buffer.from(key.padEnd(32, " ").slice(0, 32), "utf-8");
}

export function encrypt(data: string, key: string) {
  try {
    const iv = randomBytes(16); // Generate a 16-byte IV for AES-256-CBC
    const cipher = createCipheriv("aes-256-cbc", getKey(key), iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    // Return encrypted data and IV
    return { data: encrypted + ":" + iv.toString("hex"), error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export function decrypt(data: string, key: string) {
  try {
    const [encryptedData, ivHex] = data.split(":");
    if (!ivHex) {
      return {
        data: null,
        error: "Unable to get ivHex",
      };
    }
    if (!encryptedData) {
      return {
        data: null,
        error: "Unable to get encrypted data",
      };
    }

    const iv = Buffer.from(ivHex, "hex"); // Extract the IV
    const decipher = createDecipheriv("aes-256-cbc", getKey(key), iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return { data: decrypted, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
