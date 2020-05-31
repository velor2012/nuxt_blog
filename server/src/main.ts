import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AllExceptionsFilter } from './lib/filter/excenption.filter';
const consola = require('consola');
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // 处理跨域
  app.enableCors();
  //设置路由前缀
  app.setGlobalPrefix('api');
  //设置静态资源位置
  app.useStaticAssets(join(__dirname, '..', 'static'));
  // 使用日志
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
 //设置异常处理
//  const { httpAdapter } = app.get(HttpAdapterHost);
//  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  //swagger
  const options = new DocumentBuilder()
    .setTitle('博客api')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('blog')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-doc', app, document);
  //end swagger

  await app.listen(`${process.env.PORT}`, `${process.env.HOST}`);
  consola.ready({
    message: `Server listening on http://${process.env.HOST}:${process.env.PORT}`,
    badge: true,
  });
}
bootstrap();
