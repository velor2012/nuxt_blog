import { Injectable, Inject, Logger } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ReturnModelType } from "@typegoose/typegoose";
import User from "./user.model";
import { ImgUploadService } from '../lib/common/uploadImg.service';
import imgUploadParam, { imgType } from "src/lib/types/imgParam";
import { CacheService } from "src/lib/cache/cache.service";
import UserUpdateDTO from 'src/lib/dto/user.update.dto';
import * as _ from 'lodash';
import { JwtService } from "@nestjs/jwt";
import { DocumentType } from "@typegoose/typegoose";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

@Injectable()
export default class UserService {
    private findAllCacheItems: string[] = [];
    constructor(@InjectModel(User) private readonly UserModel: ReturnModelType<typeof User>,
        @Inject('ImgUploadService') private readonly ImgUploadService: ImgUploadService,
        private readonly CacheService: CacheService,
        private readonly JwtService: JwtService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    ) { }
    async getAllUsers(pageSize: number, page: number, sortBy: object,where:string) {
        //获取sortby的key
        let sortby_keys = []
        for (let sortby_key in sortBy) { 
            sortby_keys.push(sortby_key)
        }

        let option = `${pageSize}_${page}_${sortby_keys}_${where}`
        let key = `users_findall_${option}`
        let cache_users = await this.CacheService.get(key)

        if (cache_users) {
            return cache_users
        } else { 
            // 处理where
            let obj_where = where?JSON.parse(where):undefined
            if (_.isEmpty(obj_where)) { obj_where = {} }

            let res = await this.UserModel.find(obj_where)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
                .sort(sortBy);
            res && this.CacheService.set(key, res).then(res => { this.findAllCacheItems.push(key) })
            return res
        }
    }

    async getTotalNumber() { 
        let cache_total = await this.CacheService.get('user_total')
        if (cache_total) {
            return cache_total
        } else { 
            let res = await this.UserModel.countDocuments()
            res && this.CacheService.set('user_total', res)
            return res
        }
    }
    
    async create(user: User,currentUser:DocumentType<User>) { 
        let res = await this.UserModel.create(user)
        if (res) { 
            this.invalidateFindall()
            this.logger.log(`创建用户 操作者:id=${currentUser._id} realname=${currentUser.realname}, 所创建的用户 id=${res._id} realname=${res.realname}`)
        }
        return res
    }
    
    async upload(file: any, type: imgType,user:DocumentType<User>, id?: string) {
        let res = await this.ImgUploadService.upload(file, new imgUploadParam(type, id),'users');
        if (res.originName) { 
            this.logger.log(`上传图片 操作者:id=${user._id} realname=${user.realname}, 文件名:${res.originName}`)
        }
        return res
    }   

    async detail(id: string) { 
        let cache_user = await this.CacheService.get(`user_${id}`)
        if (cache_user) {
            return cache_user
        } else { 
            let user = await this.UserModel.findById(id)
            user && this.CacheService.set(`user_${id}`, user)
            return user
        }
    }

    async update(id: string, user: UserUpdateDTO,currentUser:DocumentType<User>) { 
        let res = await this.UserModel.updateOne({_id:id},user)
        if (res) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`user_${id}`)
            this.logger.log(`更新用户信息 操作者:id=${currentUser._id} realname=${currentUser.realname}, id=${id} realname=${user.realname}`)
        }
        return res
    }

    async _delete(id: string,user:DocumentType<User>) { 
        let res = await this.UserModel.findByIdAndDelete(id)
        if (res) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`user_${res._id}`)
            this.logger.log(`删除用户信息 操作者:id=${user._id} realname=${user.realname}, id=${id} realname=${res.realname}`)
        }
        return res
    }

    login(user: DocumentType<User>) { 
        this.logger.log(`用户登录 操作者:id=${user._id} realname=${user.realname}`)
        return { token: this.JwtService.sign({ id: String(user._id) }) };
    }

    logout(user: DocumentType<User>) { 
        this.logger.log(`用户退出 操作者:id=${user._id} realname=${user.realname}`)
        return 'ok'
    }

    invalidateFindall() { 
        this.CacheService.invalidate('user_total')
        for (let key of this.findAllCacheItems) { 
            this.CacheService.invalidate(key)
        }
    }
}