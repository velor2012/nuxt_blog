import { Injectable } from "@nestjs/common"
import { RedisService } from "nestjs-redis"
import * as Redis from 'ioredis';
import { CacheService } from "./cache.service";

@Injectable()
export class RedisCacheService extends CacheService {
    public client:Redis.Redis;
    constructor(private redisService: RedisService) {
        super()
        this.getClient();
    }
    async getClient() {
        this.client = await this.redisService.getClient()
    }
    //设置值的方法
    async set<T = any>(key: string, value: T): Promise<void> {
        let seconds: number = parseInt(process.env.CACHE_TTL)
        let jvalue = JSON.stringify(value);
        let res = null;
        if(!this.client){
            await this.getClient();
        }
        if (!seconds) {
            res = await this.client.set(key, jvalue);
        } else {
            res = await this.client.set(key, jvalue, 'EX', seconds);
        }

        return Promise.resolve(res)
    }

    //获取值的方法
    async get<T = any>(key:string):Promise<T>{
        if(!this.client){
            await this.getClient();
        }
        var data = await this.client.get(key);           
        if (!data) return;
        return Promise.resolve(JSON.parse(data));
    }

    //删除
    async invalidate(key: string):Promise<Number> {
        if(!this.client){
            await this.getClient();
        }
        var data = await this.client.get(key);  
        let res = this.client.del(key)
        return  Promise.resolve(res)
    }
}