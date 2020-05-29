import { Module, CacheInterceptor } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './lib/common.module';
import { DraftModule } from './draft/draft.module';
import { ArticleModule } from './article/article.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MyCacheModule } from './lib/cache/cache.module';

@Module({
    imports: [
        MyCacheModule,
        CommonModule,
        DraftModule,
        ArticleModule,
        UserModule,
        CategoryModule
  ],
  controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
