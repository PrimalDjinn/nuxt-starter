function isClientValidationError(data: any): data is ValidationError {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return false;
    }
  }
  return (
    data && typeof data === "object" && "message" in data && "path" in data
  );
}

export interface ValidationError {
  validation?: string;
  code: string;
  message: string;
  path: string[];
  minimum?: number;
  type?: string;
  inclusive?: boolean;
  exact?: boolean;
}

function formatValidationErrorArray(errorArray: ValidationError[]): string[] {
  return errorArray.map((error) => {
    const field = error.path.join(".");
    const message = error.message;

    return `Error in "${field}": ${message}`;
  });
}

function formatErrors(data: any[]) {
  const validationErrors = [] as ValidationError[];
  const rest = [] as any[];
  data.forEach((datum) => {
    if (isClientValidationError(datum)) {
      validationErrors.push(datum);
    } else {
      rest.push(datum);
    }
  });
  const join = formatValidationErrorArray(validationErrors).join("/n");
  return `${join}/n${rest.join("/")}`;
}

function formatErrorMessage(message: any) {
  if (typeof message === "string") {
    try {
      var data = JSON.parse(message);
    } catch {
      return String(message);
    }
  }
  if (Array.isArray(data)) {
    return formatErrors(data);
  } else if (isClientValidationError(data)) {
    const field = data.path.join(".");
    const message = data.message;

    return `Error in "${field}": ${message}`;
  }

  return JSON.stringify(data);
}

export function unWrapFetchError(
  response: (Response & { _data: any }) | any,
  html?: true | "none"
) {
  let message = "Unknown error occurred";
  if (!response) return message;
  if (response.response) {
    return unWrapFetchError(response.response);
  }
  if (response?._data) {
    if (response._data?.message || response?._data?.body) {
      message = formatErrorMessage(
        response._data?.message ||
          response._data?.body ||
          response?._data.statusText ||
          response.statusText
      );
    } else if (response._data.detail) {
      message = formatErrorMessage(response._data.detail);
    }
  } else if (response?.message) {
    message = formatErrorMessage(response.message || response.statusMessage);
  } else {
    try {
      var data = response?._data
        ? JSON.parse(response._data)
        : JSON.parse(response);
    } catch {
      if (response?._data) {
        return String(response._data);
      }
      return String(message);
    }

    message = formatErrorMessage(data);
  }

  if (html) {
    if (html === "none") return message.replace("/n", " ");
    return message.replace("/n", "<br>");
  }

  return message;
}
