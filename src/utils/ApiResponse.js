class ApiResponse {
  constructor(statusCode, message = 'Success', data, success = true) {
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.success = success;
  }
}

export { ApiResponse };
