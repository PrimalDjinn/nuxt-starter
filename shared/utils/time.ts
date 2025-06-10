export function SECONDS(time: number, unit: "hr" | "min" | "ms") {
  switch (unit) {
    case "hr":
      return time * 60 * 60; // 1 hour = 3600 seconds
    case "min":
      return time * 60; // 1 minute = 60 seconds
    case "ms":
      return time / 1000; // 1 millisecond = 1/1000 seconds
    default:
      throw new Error("Invalid time unit specified");
  }
}
