export function toMilliSeconds(time: number, unit: "hr" | "min" | "ms" | "s") {
  switch (unit) {
    case "hr":
      return 1000 * 60 * 60 * time;
    case "min":
      return 1000 * 60 * time;
    case "s":
      return time * 1000;
    default:
      throw new Error("No time input unit specified");
  }
}
