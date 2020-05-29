import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { CacheStore, CacheStoreSetOptions } from '@nestjs/common/cache/interfaces/cache-manager.interface';
@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cache: CacheStore) { }

    public get<T = any>(key: string): Promise<T> {
        const result = this.cache.get<T>(key);
        return Promise.resolve(result);
    }

    public set<T = any>(key: string, value: T, options?: CacheStoreSetOptions<T>): Promise<void> {
        options = {
            ttl: Number(process.env.CACHE_TTL),
            ...options,
        }
        const result = this.cache.set<T>(key, value, options);
        return Promise.resolve(result);
    }

    public invalidate(key: string): Promise<void> {
        const result = this.cache.del(key);
        return Promise.resolve(result);
    }
}