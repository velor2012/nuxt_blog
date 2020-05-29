import { Controller, Injectable, UsePipes, ValidationPipe, Get, Query, Post, Body, UseInterceptors, UploadedFile, Param, Req, Put, Delete, Res, CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {DocumentType } from "@typegoose/typegoose";
import Article from './article.model';
import QueryDTO from 'src/lib/dto/query.dto';
import { JwtService } from '@nestjs/jwt';
import ArticleService from './article.service';
import Auth from 'src/lib/decorator/auth.decorator';
import LoginDto from 'src/lib/dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import imgUploadParam from '../lib/types/imgParam';

@ApiTags("文章")
@Injectable()
    @UsePipes(new ValidationPipe({ transform: true }))
@Controller("articles")
export default class ArticleController {
    constructor(
        private readonly ArticleService: ArticleService,
    ) {}
    @Get()
    @Auth("获取所有文章")
    async index(@Query() query: QueryDTO) {
        let { page, pageSize, sortBy,where } = query;
        let sb = {};
        sb[sortBy] = -1;
        return await this.ArticleService.getAllArticles(pageSize,page,sb,where)
    }

    @Get('total')
    @Auth("获取文章数量")
    async total() {
        return await this.ArticleService.getTotalNumber();
    }

    @Post()
    @Auth("创建文章",['admin'],"jwt")
    async create(@Body() body: Article) {
        return await this.ArticleService.create(body);
    }

    @Post("img")
    @UseInterceptors(FileInterceptor("file"))
    @Auth("上传图片",['admin'],"jwt")
    async uploadContentImg(@UploadedFile() file, @Body() body: imgUploadParam) {
        return await this.ArticleService.upload(file,body.type,body.id)
    }

    @Get(":id")
    @Auth("获取一篇文章")
    async detail(@Param("id") id: string, @Req() req) {
        if (!req) return "";
        return await this.ArticleService.detail(id);
    }
    
    @Put(":id")
    @Auth("更新文章",['admin'],"jwt")
    async update(@Param("id") id: string, @Body() body: Article) {
        return await this.ArticleService.update(id, body);
    }

    @Delete(":id")
    @Auth("删除文章",['admin'],"jwt")
    async _delete(@Param("id") id: string) {
        return await this.ArticleService._delete(id);
    }
}

