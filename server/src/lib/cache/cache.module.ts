import { Module, CacheModule } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisModule} from 'nestjs-redis'
import { MemeryCacheService } from './memery.service';
import { RedisCacheService } from './redis.service';
import * as dotenv from 'dotenv'
let cacheModule = null
dotenv.config()
if (process.env.CACHE == '2') {
    console.log('use redis')
    cacheModule = RedisModule.forRootAsync({
        useFactory: () => { 
            return {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT),
                db:parseInt(process.env.REDIS_DB),
                password: process.env.REDIS_PASSWORD
            }
        }
    })
} else {
    console.log('use memory cache')
    cacheModule = CacheModule.register()
}

//判断使用过何种缓存方法
const configServiceProvider = {
    provide: CacheService,
    useClass:
        process.env.CACHE == '2'
        ? RedisCacheService
        : MemeryCacheService,
  };

@Module({
  imports: [cacheModule],
  // @alt: imports: [forwardRef(() => CacheModule)],
  providers: [configServiceProvider],
  exports: [configServiceProvider],
})
export class MyCacheModule {}