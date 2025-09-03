import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(
    message: string,
    error: string | number | object | any[],
    status: HttpStatus = HttpStatus.BAD_REQUEST, // ✨ agar berilmasa 400
  ) {
    super(
      {
        success: false,
        message,
        data: null,
        error,
      },
      status,
    );
  }
}
