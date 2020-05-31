import { Injectable, Inject, Logger } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ReturnModelType } from "@typegoose/typegoose";
import Article from "./article.model";
import { ImgUploadService } from '../lib/common/uploadImg.service';
import imgUploadParam, { imgType } from "src/lib/types/imgParam";
import { CacheService } from "src/lib/cache/cache.service";
import * as _ from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import User from "src/user/user.model";
import { DocumentType } from "@typegoose/typegoose";

@Injectable()
export default class ArticleService {
    private findAllCacheItems: string[] = [];
    constructor(@InjectModel(Article) private readonly ArticleModel: ReturnModelType<typeof Article>,
        @Inject('ImgUploadService') private readonly ImgUploadService: ImgUploadService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
        private readonly CacheService: CacheService,
    ) { }
    async getAllArticles(pageSize: number, page: number, sortBy: object, where: string) {
        //获取sortby的key
        let sortby_keys = []
        for (let sortby_key in sortBy) { 
            sortby_keys.push(sortby_key)
        }

        let option = `${pageSize}_${page}_${sortby_keys}_${where}`
        let key = `article_findall_${option}`
        let cache_articles = await this.CacheService.get(key)
        if (cache_articles) {
            return cache_articles
        } else { 

            // 处理where
            let obj_where = where?JSON.parse(where):undefined
            if (_.isEmpty(obj_where)) { obj_where = {} }

            let res = await this.ArticleModel.find(obj_where)
            .populate('categories','name')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort(sortBy);
            res && this.CacheService.set(key, res).then(res => { this.findAllCacheItems.push(key) })
            return res
        }
    }
  
    async getTotalNumber() { 
        let cache_total = await this.CacheService.get('article_total')
        if (cache_total) {
            return cache_total
        } else { 
            let res = await this.ArticleModel.countDocuments()
            res && this.CacheService.set('article_total', res)
            return res
        }
    }

    async create(article: Article,user:DocumentType<User>) { 
        let res = await this.ArticleModel.create(article)
        if (res) { 
            this.invalidateFindall()
            this.logger.log(`创建文章 用户:id=${user._id} realname=${user.realname}, id=${res._id} title=${res.title}`)
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
        let cache_article = await this.CacheService.get(`article_${id}`)
        if (cache_article) {
            return cache_article
        } else { 
            let article = await this.ArticleModel.findById(id)
            article && this.CacheService.set(`article_${id}`, article)
            return article
        }
    }

    async update(id: string, article: Article,user:DocumentType<User>) { 
        let res = await this.ArticleModel.updateOne({_id:id},article)
        if (res) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`article_${id}`)
            this.logger.log(`更新文章 用户:id=${user._id} realname=${user.realname}, id=${id} title=${article.title}`)
        }
        return res
    }

    async _delete(id: string,user:DocumentType<User>) { 
        let res = await this.ArticleModel.findByIdAndDelete(id)
        if (res) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`article_${res._id}`)
            this.logger.log(`删除文章 用户:id=${user._id} realname=${user.realname}, id=${res._id} title=${res.title}`)
        }
        return res
    }

    invalidateFindall() { 
        this.CacheService.invalidate('article_total')
        for (let key of this.findAllCacheItems) { 
            this.CacheService.invalidate(key)
        }
    }

    async isArticleUnique(title: string) { 
        let cache_article = await this.CacheService.get(`article_exist_${title}`)
        if (cache_article) return true
        else { 
            let article = await this.ArticleModel.findOne({ title: title }, 'id')
            this.CacheService.set(`article_exist_${title}`, Boolean(article))
            return Boolean(article)
        }
    }
}