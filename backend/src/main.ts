import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('OTTO System API')
    .setDescription('Enterprise Cybersecurity Governance Platform — Inspired by unity. Driven by security.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`\n🛡️  OTTO System API v1.0`);
  console.log(`    Inspired by unity. Driven by security.`);
  console.log(`    ➜  http://localhost:${port}`);
  console.log(`    ➜  Swagger: http://localhost:${port}/api/docs\n`);
}
bootstrap();
