function checkVercel() {
  try {
    return !!(process?.env?.VERCEL || process?.env?.NOW_REGION);
  } catch (e) {
    console.error(e);
    return false;
  }
}

function checkDevelopment() {
  try {
    let env = import.meta.dev || process?.env?.ENV || process?.env?.NODE_ENV;
    if (typeof env === "boolean") return env;

    env = env?.toLowerCase().trim();
    return env === "development" || env === "dev";
  } catch (e) {
    console.error(e);
    return false;
  }
}

/** Detect whether the app is running on Vercel */
export const isVercel = checkVercel();

/** Detect whether the app is running in development mode */
export const isDevelopment = checkDevelopment();

/** Detect whether the app is running in production mode */
export const isProduction = !isDevelopment;
