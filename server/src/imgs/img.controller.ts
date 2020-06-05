import { Controller, Injectable, Get, UsePipes, Body, Param, Put, Delete, Post, Query, ValidationPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import Img from './img.model';
import Auth from 'src/lib/decorator/auth.decorator';
import ImgService from './img.service';
import QueryDTO from 'src/lib/dto/query.dto';
import { User as CUser } from 'src/lib/decorator/user.decorator'
import User from 'src/user/user.model';
import { DocumentType } from "@typegoose/typegoose";
import { FileInterceptor } from '@nestjs/platform-express';
import imgUploadParam, { extenImgUploadParam } from 'src/lib/types/imgParam';

@ApiTags('图片')
@Injectable()
@UsePipes(new ValidationPipe({transform:true}))
@Controller('imgs')
export default class ImgController {
    constructor(
    private readonly ImgService: ImgService
    ) { }
        @Get()
        @Auth("获取所有图片,一般按类型") 
        async index(@Query() query: QueryDTO) {
            let { page, pageSize, sortBy,where} = query;
            let sb = {};
            sb[sortBy] = -1;
    
            return await this.ImgService.getAllImgs(pageSize,page,sb,where)
        }

        @Post()
        @UseInterceptors(FileInterceptor("file"))
        @Auth("上传图片",['admin'],"jwt")
        async uploadContentImg(@UploadedFile() file, @Body() body: extenImgUploadParam,@CUser() user:DocumentType<User>) {
            return await this.ImgService.upload(file,body.type,user,body.id)
        }
    
        @Get('total')
        @Auth("获取图片数量")
        async total() {
            return await this.ImgService.getTotalNumber();
        }
    
        @Delete(':id')
        @Auth("删除图片",['admin'],"jwt")
        async _delete(@Param('id') id: string,@CUser() user:DocumentType<User>) { 
            return await this.ImgService._delete(id,user)
        }
    
    }
