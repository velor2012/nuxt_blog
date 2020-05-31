import { Controller, Injectable, UsePipes, ValidationPipe, Get, Query, Post, Body, UseInterceptors, UploadedFile, Param, Req, Put, Delete, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {DocumentType } from "@typegoose/typegoose";
import Draft from './draft.model';
import QueryDTO from 'src/lib/dto/query.dto';
import { JwtService } from '@nestjs/jwt';
import DraftService from './draft.service';
import Auth from 'src/lib/decorator/auth.decorator';
import LoginDto from 'src/lib/dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import imgUploadParam from 'src/lib/types/imgParam';
import { User as CUser } from 'src/lib/decorator/user.decorator'
import User from 'src/user/user.model';

@ApiTags("草稿")
@Injectable()
@UsePipes(new ValidationPipe({ transform: true }))
@Controller("drafts")
export default class DraftController {
    constructor(
        private readonly DraftService: DraftService,
    ) {}
    @Get()
    @Auth("获取所有草稿")
    async index(@Query() query: QueryDTO) {
        let { page, pageSize, sortBy,where } = query;
        let sb = {};
        sb[sortBy] = -1;

        return await this.DraftService.getAllDrafts(pageSize,page,sb, where)
    }

    @Get('total')
    @Auth("获取草稿数量")
    async total() {
        return await this.DraftService.getTotalNumber();
    }


    @Post()
    @Auth("创建草稿",['admin'],"jwt")
    async create(@Body() body: Draft,@CUser() user:DocumentType<User>) {
        return await this.DraftService.create(body,user);
    }
    @Post("createOrUpdate")
    @Auth("创建或更新草稿",['admin'],"jwt")
    async createOrUpdate(@Body() body: Draft,@CUser() user:DocumentType<User>) {
        return await this.DraftService.createOrUpdate(body,user);
    }

    @Post("img")
    @UseInterceptors(FileInterceptor("file"))
    @Auth("上传图片",['admin'],"jwt")
    async uploadContentImg(@UploadedFile() file, @Body() body: imgUploadParam,@CUser() user:DocumentType<User>) {
        return await this.DraftService.upload(file,body.type,user,body.id)
    }

    @Get(":id")
    @Auth("获取一篇草稿")
    async detail(@Param("id") id: string, @Req() req) {
        if (!req) return "";
        return await this.DraftService.detail(id);
    }
    
    @Put(":id")
    @Auth("更新草稿",['admin'],"jwt")
    async update(@Param("id") id: string, @Body() body: Draft,@CUser() user:DocumentType<User>) {
        return await this.DraftService.update(id, body,user);
    }

    @Delete(":id")
    @Auth("删除草稿",['admin'],"jwt")
    async _delete(@Param("id") id: string,@CUser() user:DocumentType<User>) {
        return await this.DraftService._delete(id,user);
    }
}

