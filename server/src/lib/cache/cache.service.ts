import { Injectable } from "@nestjs/common";

@Injectable()
export abstract class CacheService {
    public abstract get<T = any>(key: string): Promise<T>;

    public abstract set<T = any>(key: string, value: T): Promise<void>;

    public abstract invalidate(key: string): Promise<any>;
}
