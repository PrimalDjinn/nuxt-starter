import { TYPE } from "./constants";

function hasRawData(data: any): data is { rawData: number[]; type: string } {
  return data?.rawData !== undefined;
}
type SocketData = {
  data: SocketTemplate;
  type: "json" | "null";
};
type SocketRaw = {
  data: {
    rawData: number[];
    type: string;
  };
  type: "raw";
};

export function isRealtimeData(data: any): data is SocketData | SocketRaw {
  if (!data) return false;
  if (typeof data !== "object") return false;
  return (
    (hasOwnProperties(data, ["data", "type"]) && isSocketTemplate(data.data)) ||
    data.type === "raw"
  );
}

export function parseSocketData(data: any): SocketData | SocketRaw {
  if (isRealtimeData(data)) {
    return data;
  }

  if (typeof data === "string") {
    try {
      return parseSocketData(JSON.parse(data));
    } catch (_) {
      return {
        data: {
          statusCode: 200,
          type: TYPE.MESSAGE,
          value: data,
        },
        type: "json",
      };
    }
  }

  if (hasRawData(data)) {
    const decoder = new TextDecoder();
    try {
      return parseSocketData(
        JSON.parse(decoder.decode(new Uint8Array(data.rawData)))
      );
    } catch (_) {
      return {
        data: data,
        type: "raw",
      };
    }
  }

  if (isSocketTemplate(data)) {
    return {
      data: data,
      type: "json",
    };
  }

  if (!data) {
    return {
      data: data,
      type: "null",
    };
  }

  return {
    data: {
      type: TYPE.MESSAGE,
      value: data,
      statusCode: 200,
    },
    type: "json",
  };
}
