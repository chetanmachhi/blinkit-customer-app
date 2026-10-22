export class ApiError extends Error {
  statusCode: number;
  showMessage: boolean;
  errorData?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    showMessage: boolean = true,
    errorData?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.showMessage = showMessage;
    this.errorData = errorData;
  }
}

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes("Network Error") ||
      error.message.includes("timeout") ||
      error.message.includes("ECONNABORTED")
    );
  }
  return false;
};
