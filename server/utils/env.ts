function checkVercel() {
    return !!(process.env.VERCEL || process.env.NOW_REGION);
}

function checkDevelopment() {
    let env = process.env.ENV || process.env.NODE_ENV;
    if (!env) return false;

    env = env.toLowerCase().trim();
    return env === "development" || env === "dev";
}

/** Detect whether the app is running on Vercel */
export const isVercel = checkVercel();

/** Detect whether the app is running in development mode */
export const isDevelopment = checkDevelopment();

/** Detect whether the app is running in production mode */
export const isProduction = !isDevelopment;