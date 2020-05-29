import { Injectable, Inject } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ReturnModelType } from "@typegoose/typegoose";
import Draft from "./draft.model";
import * as fs from 'fs'
import { v1 as uuidv1 } from 'uuid';
import { ImgUploadService } from '../lib/common/uploadImg.service';
import imgUploadParam, { imgType } from "src/lib/types/imgParam";
import { CacheService } from "src/lib/cache/cache.service";
import * as _ from 'lodash';

@Injectable()
export default class DraftService {
    private findAllCacheItems: string[] = [];
    constructor(@InjectModel(Draft) private readonly DraftModel: ReturnModelType<typeof Draft>,
        @Inject('ImgUploadService') private readonly ImgUploadService: ImgUploadService,
        private readonly CacheService: CacheService,
    ) { }
    async getAllDrafts(pageSize: number, page: number, sortBy: object, where: string) {
        //获取sortby的key
        let sortby_keys = []
        for (let sortby_key in sortBy) { 
            sortby_keys.push(sortby_key)
        }

        let option = `${pageSize}_${page}_${sortby_keys}_${where}`
        let key = `draft_findall_${option}`
        let cache_drafts = await this.CacheService.get(key)
        if (cache_drafts) {
            return cache_drafts
        } else { 

            // 处理where
            let obj_where = where?JSON.parse(where):undefined
            if (_.isEmpty(obj_where)) { obj_where = {} }

            let res = await this.DraftModel.find(obj_where)
            .populate('categories','name')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort(sortBy);
            res && this.CacheService.set(key, res).then(res => { this.findAllCacheItems.push(key) })
            return res
        }
    }

    async getTotalNumber() { 
        let cache_total = await this.CacheService.get('draft_total')
        if (cache_total) {
            return cache_total
        } else { 
            let res = await this.DraftModel.countDocuments()
            res && this.CacheService.set('draft_total', res)
            return res
        }
    }

    
    async create(draft: Draft) { 
        let res = await this.DraftModel.create(draft)
        if (res) { 
            this.invalidateFindall()
        }
        return res
    }

    async createOrUpdate(draft: Draft) {
        var draft_2 = await this.DraftModel.findOne({ title: draft.title })
        let res: any;
        if (draft_2) {
            res = await this.DraftModel.updateOne({ _id: draft_2.id }, draft,{new:true})
        } else { 
            res = await this.DraftModel.create(draft)
        }
        if (res) { 
            this.invalidateFindall()
            draft_2 && this.CacheService.invalidate(`draft_${draft_2._id}`)
        }
        return res
    }
    
    async upload(file: any, type: imgType, id?: string) {
        return this.ImgUploadService.upload(file,new imgUploadParam(type,id));
    }   

    async detail(id: string) { 
        let cache_draft = await this.CacheService.get(`draft_${id}`)
        if (cache_draft) {
            return cache_draft
        } else { 
            let draft = await this.DraftModel.findById(id)
            draft && this.CacheService.set(`draft_${id}`, draft)
            return draft
        }
    }

    async update(id: string, draft: Draft) { 
        let res = await this.DraftModel.updateOne({_id:id},draft)
        if (res) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`draft_${id}`)
        }
        return res
    }

    async _delete(id: string) { 
        let res = await this.DraftModel.findByIdAndDelete(id)
        if (res) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`draft_${res._id}`)
        }
        return res
    }

    invalidateFindall() { 
        this.CacheService.invalidate('draft_total')
        for (let key of this.findAllCacheItems) { 
            this.CacheService.invalidate(key)
        }
    }
}