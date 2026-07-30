import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : "Internal Server Error";

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message;

    res.send(status).json({
      success: false,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
    })
  }
}
