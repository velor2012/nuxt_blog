import { Module, CacheModule } from '@nestjs/common';
import { CacheService } from './cache.service';

@Module({
  imports: [CacheModule.register()],
  // @alt: imports: [forwardRef(() => CacheModule)],
  providers: [CacheService],
  exports: [CacheService],
})
export class MyCacheModule {}