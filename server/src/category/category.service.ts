import { Injectable, Inject, Logger } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ReturnModelType } from "@typegoose/typegoose";
import Category from "./category.model";
import * as fs from 'fs'
import { v1 as uuidv1 } from 'uuid';
import { ImgUploadService } from '../lib/common/uploadImg.service';
import imgUploadParam, { imgType } from "src/lib/types/imgParam";
import { CacheService } from "src/lib/cache/cache.service";
import * as _ from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import User from "src/user/user.model";
import { DocumentType } from "@typegoose/typegoose";

@Injectable()
export default class CategoryService {
    private findAllCacheItems: string[] = [];
    constructor(@InjectModel(Category) private readonly CategoryModel: ReturnModelType<typeof Category>,
        @Inject('ImgUploadService') private readonly ImgUploadService: ImgUploadService,
        private readonly CacheService: CacheService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    ) { }
    async getAllCategories(pageSize: number, page: number, sortBy: object, where: string) {
        //获取sortby的key
        let sortby_keys = []
        for (let sortby_key in sortBy) { 
            sortby_keys.push(sortby_key)
        }

        let option = `${pageSize}_${page}_${sortby_keys}_${where}`
        let key = `category_findall_${option}`
        let cache_categories = await this.CacheService.get(key)


        if (cache_categories) {
            return cache_categories
        } else { 
            // 处理where
            let obj_where = where?JSON.parse(where):undefined
            if (_.isEmpty(obj_where)) { obj_where = {} }

            let res = await this.CategoryModel.find(obj_where)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
                .sort(sortBy);
            res && this.CacheService.set(key, res).then(res => { this.findAllCacheItems.push(key) })
            return res
        }
    }
  
    async getTotalNumber() { 
        let cache_total = await this.CacheService.get('category_total')
        if (cache_total) {
            return cache_total
        } else { 
            let res = await this.CategoryModel.countDocuments()
            res && this.CacheService.set('category_total', res)
            return res
        }
    }

    async create(category: Category,user:DocumentType<User>) { 
        let res = await this.CategoryModel.create(category)
        if (res) { 
            this.invalidateFindall()
        }
        this.logger.log(`创建分类 用户:id=${user._id} realname=${user.realname}, id=${res._id} name=${res.name}`)
        return res
    }
    
    async upload(file: any, type: imgType,user:DocumentType<User>, id?: string) {
        let res = await this.ImgUploadService.upload(file, new imgUploadParam(type, id));
        if (res.originName) { 
            this.logger.log(`上传图片 用户:id=${user._id} realname=${user.realname}, 文件名:${res.originName}`)
        }
        return res
    }   

    async detail(id: string) { 
        let cache_category = await this.CacheService.get(`category_${id}`)
        if (cache_category) {
            return cache_category
        } else { 
            let category = await this.CategoryModel.findById(id)
            category && this.CacheService.set(`category_${id}`, category)
            return category
        }
    }

    async update(id: string, category: Category,user:DocumentType<User>) { 
        let res = await this.CategoryModel.updateOne({_id:id},category)
        if (res) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`category_${res._id}`)
            this.logger.log(`更新分类 用户:id=${user._id} realname=${user.realname}, id=${id} name=${category.name}`)
        }
        return res
    }

    async _delete(id: string,user:DocumentType<User>) { 
        let res = await this.CategoryModel.findByIdAndDelete(id)
        if (res) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`category_${res._id}`)
            this.logger.log(`删除分类 用户:id=${user._id} realname=${user.realname}, id=${id} name=${res.name}`)
        }
        return res
    }

    invalidateFindall() { 
        this.CacheService.invalidate('category_total')
        for (let key of this.findAllCacheItems) { 
            this.CacheService.invalidate(key)
        }
    }
}