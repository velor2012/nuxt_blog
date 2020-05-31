import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { CacheStore, CacheStoreSetOptions } from '@nestjs/common/cache/interfaces/cache-manager.interface';
import { CacheService } from 'src/lib/cache/cache.service';
@Injectable()
export class MemeryCacheService extends CacheService {
    constructor(@Inject(CACHE_MANAGER) private cache: CacheStore) { super() }

    public get<T = any>(key: string): Promise<T> {
        const result = this.cache.get<T>(key);
        return Promise.resolve(result);
    }

    public set<T = any>(key: string, value: T): Promise<void> {
        let options = {
            ttl: Number(process.env.CACHE_TTL)
        }
        const result = this.cache.set<T>(key, value, options);
        return Promise.resolve(result);
    }

    public invalidate(key: string): Promise<void> {
        const result = this.cache.del(key);
        return Promise.resolve(result);
    }
}