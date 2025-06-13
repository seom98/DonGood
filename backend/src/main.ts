import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 전역 유효성 검사 파이프 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // CORS 활성화
  app.enableCors();
  
  // Swagger 문서 설정
  const config = new DocumentBuilder()
    .setTitle('DonGood API')
    .setDescription('DonGood API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // 서버 시작
  await app.listen(1234);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
