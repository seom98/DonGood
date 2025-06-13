import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const expressApp = express();
let cachedServer;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    
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
    
    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}

// 서버리스 환경을 위한 핸들러
export default async function handler(req, res) {
  const server = await bootstrap();
  return server(req, res);
}

// 개발 환경에서 직접 실행할 때
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(() => {
    const port = parseInt(process.env.PORT || '3000', 10);
    expressApp.listen(port, '0.0.0.0', () => {
      console.log(`Application is running on port ${port}`);
    });
  });
}
