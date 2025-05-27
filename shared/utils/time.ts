export function SECONDS(time: number, unit: "hr" | "min" | "ms") {
  switch (unit) {
    case "hr":
      return 60 * 60 * time;
    case "min":
      return 60 * time;
    case "ms":
      return time / 60;
    default:
      throw new Error("No time input unit specified");
  }
}
