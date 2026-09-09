import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { ResourceNotFoundException } from '../exceptions/resource-not-found';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const contextType = host.getType<string>();

    // 1. Handle GraphQL Context
    if (contextType === 'graphql') {
      const gqlHost = GqlArgumentsHost.create(host);
      // Log the error
      this.logger.error(exception.message, exception.stack);

      // In GraphQL, we let NestJS handle formatting by re-throwing 
      // standard HttpExceptions or wrapping unknown errors in a clean format.
      if (exception instanceof HttpException) {
        return exception;
      }

      // For unhandled non-HTTP errors in GraphQL, wrap them or let them propagate
      return new HttpException(
        exception.message || 'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 2. Handle REST Context (HTTP)
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

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
      ...(resource && { resource }),
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}