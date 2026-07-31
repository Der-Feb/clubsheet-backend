import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import morgan from "morgan";
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  const appLogger = new Logger("App");
  
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips out properties that do not have any decorators
      forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are passed
      transform: true, // Automatically transforms payloads to match DTO types
    }),
  );

  app.use(morgan("combined", { stream: { write: (message: string) => appLogger.log(message.trim()) } }));

  await app.listen(port);
  appLogger.log("Server started on http://localhost:" + port);
}
bootstrap();
