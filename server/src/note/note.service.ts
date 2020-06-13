import { Injectable, Inject, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ReturnModelType } from "@typegoose/typegoose";
import Note from './note.model';
import { ImgUploadService } from '../lib/common/uploadImg.service';
import imgUploadParam, { imgType } from "src/lib/types/imgParam";
import { CacheService } from "src/lib/cache/cache.service";
import * as _ from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import User from "src/user/user.model";
import { DocumentType } from "@typegoose/typegoose";
import { ESService } from '../lib/es/es.service';

//TODO;子文档需要手动检查序号和标题唯一性
@Injectable()
export default class NoteService {
    private findAllCacheItems: string[] = [];
    constructor(@InjectModel(Note) private readonly NoteModel: ReturnModelType<typeof Note>,
        @Inject('ImgUploadService') private readonly ImgUploadService: ImgUploadService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
        private readonly CacheService: CacheService,
        private readonly ESService: ESService,
    ) { }
    async getAllNotes(pageSize: number, page: number, sortBy: object, where: string,needTotal:boolean) {
        //获取sortby的key
        let sortby_keys = []
        for (let sortby_key in sortBy) { 
            sortby_keys.push(sortby_key)
        }

        let option = `${pageSize}_${page}_${sortby_keys}_${where}_${needTotal}`.replace(':',"_")
        let key = `note_findall_${option}`
        let cache_notes = await this.CacheService.get(key)
        if (cache_notes) {
            return cache_notes
        } else { 

            // 处理where
            let obj_where = where?JSON.parse(where):undefined
            if (_.isEmpty(obj_where)) { obj_where = {} }

            let res:any = await this.NoteModel.find(obj_where,{subDoc:0})
            .populate('categories','name')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
                .sort(sortBy);
            //返回满足要求的文章总数
            let total = null
            if (needTotal) { 
                total = await this.NoteModel.find(obj_where, { _id: 1 }).countDocuments()
                res = {total:total,data:res}
            }
            res && this.CacheService.set(key, res).then(res => { this.findAllCacheItems.push(key) })
            return res
        }
    }
  
    //搜索
    async searchNote(keyword: string, pageSize: number, page: number) {
        let res = await this.ESService.searchNote(keyword, pageSize, page)
        if(!res) return "未找到相关笔记"
        let total = _.get(res, 'total.value')
        let result = _.get(res, "hits")
        let result2 = null
        if (result instanceof Array) {
             result2 = result.map(async (v) => { 
                let note = await this.NoteModel.findById(v._id,"-subDoc").populate('categories').lean()
                let hightlights = _.get(v, "highlight")
                for (let key in hightlights) {
                    note[key] = hightlights[key][0]
                }
                return {
                    note: note,
                    score:v._score
                }
             })
            result2 = await Promise.all(result2)
        }
        return {total:total,results:result2}
    }

    async searchSubDoc(keyword: string, pageSize: number, page: number) {
        let res = await this.ESService.searchSubDoc(keyword, pageSize, page)
        if(!res) return "未找到相关文章"
        let total = _.get(res, 'total.value')
        let result = _.get(res, "hits")
        let result2 = null
        if (result instanceof Array) {
             result2 = result.map((v) => { 
                 let subdoc0 = _.get(v, "inner_hits.subDoc.hits.hits")
                 let score = subdoc0[0]._score
                 let source = subdoc0[0]._source
                let hightlights = _.get(subdoc0, "highlight")
                 for (let key in hightlights) {
                        key = key.split('.').pop()
                        source[key] = hightlights[key][0]
                }
                 return {
                    noteId:subdoc0[0]._id,
                    subdoc:source,
                    score:v._score
                }
             })
        }
        return await result2
    }
    //end

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

    async group() { 
        let cache_group = await this.CacheService.get('note_group')
        if (cache_group) {
            return cache_group
        } else { 
            let res = await this.NoteModel.aggregate([
                {
                    "$lookup": {
                        "from": "categories",
                        "localField": "categories",
                        "foreignField": "_id",
                        "as": "categories"
                      }
                },
                {"$unwind":'$categories'},
                {
                    "$group":{
                        _id: "$categories",
                        count: { $sum: 1 }
                      }
                }
            ])
            res && this.CacheService.set('note_group', res)
            return res
        }
    }

    async create(note: Note, user: DocumentType<User>) {
        let res = await this.NoteModel.create(note)
        if(!res) return "创建失败"
        let res2 = await this.ESService.create(res.id,note,'note')
        if (res && res2) { 
            this.invalidateFindall()
            this.logger.log(`创建笔记 用户:id=${user._id} realname=${user.realname}, id=${res._id} name=${res.name}`)
        }
        return res
    }
    
    async upload(file: any, type: imgType, user:DocumentType<User>, id?: string) {
        let res = await this.ImgUploadService.upload(file, new imgUploadParam(type, id),'notes');
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
            let note = await this.NoteModel.findById(id).catch(error => { throw new HttpException("找不到笔记",HttpStatus.BAD_REQUEST)});
            note && this.CacheService.set(`note_${id}`, note)
            return note
        }
    }

    async visit(id: string) {
        let article = await this.NoteModel.findById(id,"visits")
        let res = this.NoteModel.updateOne({ _id: id }, { visits: article.visits + 1 })
        //因为访问量对于文章对象的重要性很低，所以不用更新缓存也不会影响体验
        return res
    }

    async update(id: string, note: Note,user:DocumentType<User>) { 
        let res = await this.NoteModel.findOneAndUpdate({ _id: id }, note,{new:true}).lean()
        if(!res) return "更新失败"
        let res2 = await this.ESService.update(id,res,'note')
        if (res && res2) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`note_${id}`)
            this.logger.log(`更新笔记 用户:id=${user._id} realname=${user.realname}, id=${id} name=${note.name}`)
        }
        return res
    }

    async _delete(id: string,user:DocumentType<User>) { 
        let res = await this.NoteModel.findByIdAndDelete(id)
        if(!res) return "删除失败"
        let res2 = await this.ESService.delete(res.id,'note')
        if (res && res2) { 
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