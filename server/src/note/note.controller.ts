import { Controller, Injectable, UsePipes, ValidationPipe, Get, Query, Post, Body, UseInterceptors, UploadedFile, Param, Req, Put, Delete, Res, CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {DocumentType } from "@typegoose/typegoose";
import Note from './note.model';
import QueryDTO from 'src/lib/dto/query.dto';
import { JwtService } from '@nestjs/jwt';
import Auth from 'src/lib/decorator/auth.decorator';
import LoginDto from 'src/lib/dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import imgUploadParam from '../lib/types/imgParam';
import { User as CUser } from 'src/lib/decorator/user.decorator'
import User from 'src/user/user.model';
import NoteService from './note.service';
import SearchDTO from 'src/lib/dto/search.dto';
import { str2bool } from 'src/lib/common/util';

@ApiTags("笔记")
@Injectable()
@UsePipes(new ValidationPipe({ transform: true }))
@Controller("notes")
export default class NoteController {
    constructor(
        private readonly NoteService: NoteService,
    ) {}
    @Get()
    @Auth("获取所有笔记")
    async index(@Query() query: QueryDTO) {
        let { page, pageSize, sortBy, where, needTotal } = query;
        let _needTotal = str2bool(needTotal)
        let sb = {};
        sb['oder'] = 1;
        return await this.NoteService.getAllNotes(pageSize,page,sb,where,_needTotal)
    }

    @Get('searchSubDoc/:keyword')
    @Auth("查询子文档")
    async searchSubDoc(@Query() query: SearchDTO) {
        let { keyword, pageSize, page } = query 
        return await this.NoteService.searchSubDoc(keyword, pageSize, page);
    }

    @Get('searchNote')
    @Auth("查询笔记")
    async searchNote(@Query() query: SearchDTO) {
        let { keyword, pageSize, page } = query 
        return await this.NoteService.searchNote(keyword, pageSize, page);
    }

    @Get('total')
    @Auth("获取笔记数量")
    async total() {
        return await this.NoteService.getTotalNumber();
    }
        
    @Get('group')
    @Auth("获取每种笔记数目")
    async group() {
        return await this.NoteService.group();
    }

    @Post()
    @Auth("创建笔记",['admin'],"jwt")
    async create(@Body() body: Note,@CUser() user:DocumentType<User>) {
        return await this.NoteService.create(body,user);
    }

    @Get('visits/:id')
    async visit(@Param("id") id: string) {
        return await this.NoteService.visit(id);
    }

    @Post("img")
    @UseInterceptors(FileInterceptor("file"))
    @Auth("上传图片",['admin'],"jwt")
    async uploadContentImg(@UploadedFile() file, @Body() body: imgUploadParam,@CUser() user:DocumentType<User>) {
        return await this.NoteService.upload(file,body.type,user,body.id)
    }

    @Get(":id")
    @Auth("获取一篇笔记")
    async detail(@Param("id") id: string, @Req() req) {
        if (!req) return "";
        return await this.NoteService.detail(id);
    }
    
    @Put(":id")
    @Auth("更新笔记",['admin'],"jwt")
    async update(@Param("id") id: string, @Body() body: Note,@CUser() user:DocumentType<User>) {
        return await this.NoteService.update(id, body,user);
    }

    @Delete(":id")
    @Auth("删除笔记",['admin'],"jwt")
    async _delete(@Param("id") id: string,@CUser() user:DocumentType<User>) {
        return await this.NoteService._delete(id,user);
    }
}

