class ApiError extends Error {
  constructor(statusCode, message, data = null, stack = null, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
