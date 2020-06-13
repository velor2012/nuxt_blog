import { Injectable, Inject, Logger } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ReturnModelType } from "@typegoose/typegoose";
import Img from "./img.model";
import * as fs from 'fs'
import { v1 as uuidv1 } from 'uuid';
import { ImgUploadService } from '../lib/common/uploadImg.service';
import imgUploadParam, { imgType } from "src/lib/types/imgParam";
import { CacheService } from "src/lib/cache/cache.service";
import * as _ from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import User from "src/user/user.model";
import { DocumentType } from "@typegoose/typegoose";
import { extendImgType } from '../lib/types/imgParam';

@Injectable()
export default class ImgService {
    private findAllCacheItems: string[] = [];
    constructor(@InjectModel(Img) private readonly ImgModel: ReturnModelType<typeof Img>,
        @Inject('ImgUploadService') private readonly ImgUploadService: ImgUploadService,
        private readonly CacheService: CacheService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    ) { }
    async getAllImgs(pageSize: number, page: number, sortBy: object, where: string) {
        //获取sortby的key
        let sortby_keys = []
        for (let sortby_key in sortBy) { 
            sortby_keys.push(sortby_key)
        }

        let option = `${pageSize}_${page}_${sortby_keys}_${where}`
        let key = `img_findall_${option}`
        let cache_imgs = await this.CacheService.get(key)


        if (cache_imgs) {
            return cache_imgs
        } else { 
            // 处理where
            let obj_where = where?JSON.parse(where):undefined
            if (_.isEmpty(obj_where)) { obj_where = {} }

            let res = await this.ImgModel.find(obj_where)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
                .sort(sortBy);
            res && this.CacheService.set(key, res).then(res => { this.findAllCacheItems.push(key) })
            return res
        }
    }
  
    async getTotalNumber() { 
        let cache_total = await this.CacheService.get('img_total')
        if (cache_total) {
            return cache_total
        } else { 
            let res = await this.ImgModel.countDocuments()
            res && this.CacheService.set('img_total', res)
            return res
        }
    }

    async create(img: Img,user:DocumentType<User>) { 
        let res = await this.ImgModel.create(img)
        if (res) { 
            this.invalidateFindall()
            this.logger.log(`创建图片 用户:id=${user._id} realname=${user.realname}, id=${res._id}`)
        }
        return res
    }
    
    async upload(file: any, type: extendImgType, user:DocumentType<User>, id?: string) {
        let res = await this.ImgUploadService.upload(file, new imgUploadParam(type, id),type);
        if (res.originName) { 
            this.invalidateFindall()
            this.logger.log(`上传图片 用户:id=${user._id} realname=${user.realname}, 文件名:${res.originName}`)
        }
        let res2 = await this.create(new Img(res.filePath,type),user)
        return res
    }   

    async _delete(id: string,user:DocumentType<User>) { 
        let res = await this.ImgModel.findByIdAndDelete(id)
        if (res) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`img_${id}`)
            this.logger.log(`删除图片 用户:id=${user._id} realname=${user.realname}, id=${id}`)
        }
        return res
    }

    invalidateFindall() { 
        this.CacheService.invalidate('img_total')
        for (let key of this.findAllCacheItems) { 
            this.CacheService.invalidate(key)
        }
    }
}