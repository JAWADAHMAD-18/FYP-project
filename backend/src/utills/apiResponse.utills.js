class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }


  static success(res, data, message = "Success", statusCode = 200) {
    const payload = new ApiResponse(statusCode, data, message);
    return res.status(statusCode).json(payload);
  }
}

export { ApiResponse };
