import { Injectable, Inject, Logger } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ReturnModelType } from "@typegoose/typegoose";
import Note from "./note.model";
import { ImgUploadService } from '../lib/common/uploadImg.service';
import imgUploadParam, { imgType } from "src/lib/types/imgParam";
import { CacheService } from "src/lib/cache/cache.service";
import * as _ from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import User from "src/user/user.model";
import { DocumentType } from "@typegoose/typegoose";

@Injectable()
export default class NoteService {
    private findAllCacheItems: string[] = [];
    constructor(@InjectModel(Note) private readonly NoteModel: ReturnModelType<typeof Note>,
        @Inject('ImgUploadService') private readonly ImgUploadService: ImgUploadService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
        private readonly CacheService: CacheService,
    ) { }
    async getAllNotes(pageSize: number, page: number, sortBy: object, where: string) {
        //获取sortby的key
        let sortby_keys = []
        for (let sortby_key in sortBy) { 
            sortby_keys.push(sortby_key)
        }

        let option = `${pageSize}_${page}_${sortby_keys}_${where}`
        let key = `note_findall_${option}`
        let cache_notes = await this.CacheService.get(key)
        if (cache_notes) {
            return cache_notes
        } else { 

            // 处理where
            let obj_where = where?JSON.parse(where):undefined
            if (_.isEmpty(obj_where)) { obj_where = {} }

            let res = await this.NoteModel.find(obj_where)
            .populate('categories','name')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort(sortBy);
            res && this.CacheService.set(key, res).then(res => { this.findAllCacheItems.push(key) })
            return res
        }
    }
  
    async getTotalNumber() { 
        let cache_total = await this.CacheService.get('note_total')
        if (cache_total) {
            return cache_total
        } else { 
            let res = await this.NoteModel.countDocuments()
            res && this.CacheService.set('note_total', res)
            return res
        }
    }

    async create(note: Note,user:DocumentType<User>) { 
        let res = await this.NoteModel.create(note)
        if (res) { 
            this.invalidateFindall()
            this.logger.log(`创建笔记 用户:id=${user._id} realname=${user.realname}, id=${res._id} name=${res.name}`)
        }
        return res
    }
    
    async upload(file: any, type: imgType, user:DocumentType<User>, id?: string) {
        let res = await this.ImgUploadService.upload(file, new imgUploadParam(type, id));
        if (res.originName) { 
            this.logger.log(`上传图片 用户:id=${user._id} realname=${user.realname}, 文件名:${res.originName}`)
        }
        return res
    }   

    async detail(id: string) { 
        let cache_note = await this.CacheService.get(`note_${id}`)
        if (cache_note) {
            return cache_note
        } else { 
            let note = await this.NoteModel.findById(id)
            note && this.CacheService.set(`note_${id}`, note)
            return note
        }
    }

    async update(id: string, note: Note,user:DocumentType<User>) { 
        let res = await this.NoteModel.updateOne({_id:id},note)
        if (res) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`note_${id}`)
            this.logger.log(`更新笔记 用户:id=${user._id} realname=${user.realname}, id=${id} name=${note.name}`)
        }
        return res
    }

    async _delete(id: string,user:DocumentType<User>) { 
        let res = await this.NoteModel.findByIdAndDelete(id)
        if (res) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`note_${res._id}`)
            this.logger.log(`删除笔记 用户:id=${user._id} realname=${user.realname}, id=${res._id} name=${res.name}`)
        }
        return res
    }

    invalidateFindall() { 
        this.CacheService.invalidate('note_total')
        for (let key of this.findAllCacheItems) { 
            this.CacheService.invalidate(key)
        }
    }
}