import { Injectable, Inject, Logger, HttpException, HttpStatus } from '@nestjs/common';
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
import { ESService } from '../lib/es/es.service';
import { async } from 'rxjs/internal/scheduler/async';

@Injectable()
export default class ArticleService {
    private findAllCacheItems: string[] = [];
    constructor(@InjectModel(Article) private readonly ArticleModel: ReturnModelType<typeof Article>,
        @Inject('ImgUploadService') private readonly ImgUploadService: ImgUploadService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
        private readonly CacheService: CacheService,
        private readonly ESService: ESService,
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

            let res = await this.ArticleModel.find(obj_where,{ content: 0 })
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
        if(!res) return "创建失败"
        let res2 = await this.ESService.create(res.id,article,'article')
        if (res && res2) { 
            this.invalidateFindall()
            this.logger.log(`创建文章 用户:id=${user._id} realname=${user.realname}, id=${res._id} title=${res.title}`)
        }
        return res
    }
    
    async upload(file: any, type: imgType, user:DocumentType<User>, id?: string) {
        let res = await this.ImgUploadService.upload(file, new imgUploadParam(type, id),'articles');
        if (res.originName) { 
            this.logger.log(`上传图片 用户:id=${user._id} realname=${user.realname}, 文件名:${res.originName}`)
        }
        return res
    }   

    async visit(id: string) {
        let article = await this.ArticleModel.findById(id,"visits")
        let res = this.ArticleModel.updateOne({ _id: id }, { visits: article.visits + 1 })
        //因为访问量对于文章对象的重要性很低，所以不用更新缓存也不会影响体验
        return res
    }

    async search(keyword: string, pageSize: number, page: number) {
        let res = await this.ESService.searchArticle(keyword,pageSize,page)
        if(!res) return "未找到相关文章"
        let total = _.get(res, 'total.value')
        let result = _.get(res, "hits")
        let result2 = null
        if (result instanceof Array) {
             result2 = result.map(async (v) => { 
                let article = await this.ArticleModel.findById(v._id,"-content").populate('categories').lean()
                let hightlights = _.get(v, "highlight")
                for (let key in hightlights) {
                        article[key] = hightlights[key][0]
                }
                return {
                    article: article,
                    score:v._score
                }
             })
            result2 = await Promise.all(result2)
        }
        return {total:total,results:result2}
    }

    async detail(id: string) { 
        let cache_article = await this.CacheService.get(`article_${id}`)
        if (cache_article) {
            return cache_article
        } else { 
            let err = null
            let article = await this.ArticleModel.findById(id).catch(error => { throw new HttpException("找不到文章",HttpStatus.BAD_REQUEST)});
            article && this.CacheService.set(`article_${id}`, article)
            return article
        }
    }

    async update(id: string, article: Article,user:DocumentType<User>) { 
        let res = await this.ArticleModel.findOneAndUpdate({ _id: id }, article,{new:true}).lean()
        if(!res) return "更新失败"
        let res2 = await this.ESService.update(id,res,'article')
        if (res && res2) { 
            this.invalidateFindall()
            this.CacheService.invalidate(`article_${id}`)
            this.logger.log(`更新文章 用户:id=${user._id} realname=${user.realname}, id=${id} title=${article.title}`)
        }
        return res
    }

    async _delete(id: string,user:DocumentType<User>) { 
        let res = await this.ArticleModel.findByIdAndDelete(id)
        if(!res) return "删除失败"
        let res2 = await this.ESService.delete(res.id,'article')
        if (res && res2) { 
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