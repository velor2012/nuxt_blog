import { Module, CacheInterceptor } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './lib/common.module';
import { DraftModule } from './draft/draft.module';
import { ArticleModule } from './article/article.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { MyCacheModule } from './lib/cache/cache.module';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { SystemModule } from './system/system.module';
import { level } from 'winston';
import { NoteModule } from './note/note.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './lib/filter/excenption.filter';
import { ImgModule } from 'src/imgs/img.module';
var winston = require('winston');
require('winston-daily-rotate-file');
const rotate_info_transport = new (winston.transports.DailyRotateFile)({
    filename: `${process.env.INFO_DIR}/%DATE%.log` || 'log/info/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '14d',
    level:'info'
});
const rotate_error_transport = new (winston.transports.DailyRotateFile)({
    filename: `${process.env.ERROR_DIR}/%DATE%.log` || 'log/error/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '14d',
    level:'error'
  });
  rotate_info_transport.on('rotate', function(oldFilename, newFilename) {
    // do something fun
  });
  rotate_error_transport.on('rotate', function(oldFilename, newFilename) {
    // do something fun
  });

const logModule = WinstonModule.forRootAsync({
    useFactory: () => ({
        // options
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp(),
                    nestWinstonModuleUtilities.format.nestLike(),
                ),
            }),
            rotate_error_transport,
            rotate_info_transport
            // other transports...
        ],
        // other options
    })
})

//异常处理
let exceptionFilterProvider = {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  }

@Module({
    imports: [
        MyCacheModule,
        CommonModule,
        logModule,
        DraftModule,
        ArticleModule,
        UserModule,
        CategoryModule,
        SystemModule,
        NoteModule,
        ImgModule
  ],
  controllers: [AppController],
    providers: [AppService,exceptionFilterProvider]
})
export class AppModule {}
