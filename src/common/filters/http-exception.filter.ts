import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResourceNotFoundException } from '../exceptions/resource-not-found';

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
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

    const resource = exception instanceof ResourceNotFoundException
      ? exception.resource
      : undefined;

    if (res.headersSent) return;

    res.send(status).json({
      success: false,
      ...(resource && { resource: resource }),
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
    })
  }
}
