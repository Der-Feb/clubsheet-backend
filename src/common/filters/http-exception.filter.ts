import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResourceNotFoundException } from '../exceptions/resource-not-found';

@Catch() // Catching all exceptions
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message;

    const resource =
      exception instanceof ResourceNotFoundException
        ? exception.resource
        : undefined;

    if (res.headersSent) return;

    this.logger.error(exception.message, exception.stack);

    res.status(status).json({
      success: false,
      ...(resource && { resource: resource }),
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
