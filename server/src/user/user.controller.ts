import { Controller, Injectable, UsePipes, ValidationPipe, Get, Query, Post, Body, UseInterceptors, UploadedFile, Param, Req, Put, Delete, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {DocumentType } from "@typegoose/typegoose";
import User from './user.model';
import QueryDTO from 'src/lib/dto/query.dto';
import UserService from './user.service';
import {User as CUser} from 'src/lib/decorator/user.decorator'
import Auth from 'src/lib/decorator/auth.decorator';
import LoginDto from 'src/lib/dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import imgUploadParam from '../lib/types/imgParam';
import UserUpdateDTO from '../lib/dto/user.update.dto';

@ApiTags("管理员")
@Injectable()
@UsePipes(new ValidationPipe({ transform: true }))
@Controller("users")
export default class UserController {
    constructor(
        private readonly UserService: UserService,
    ) {}
    @Get()
    @Auth("获取所有管理员",['admin'],"jwt")
    async index(@Query() query: QueryDTO) {
        let { page, pageSize, sortBy,where } = query;
        let sb = {};
        sb[sortBy] = -1;

        return await this.UserService.getAllUsers(pageSize,page,sb,where)
    }
        
    @Get('total')
    @Auth("获取管理员数量")
    async total() {
        return await this.UserService.getTotalNumber();
    }

    @Get("currentUser")
    @Auth("获取当前登录的用户",['admin','user'],"jwt")
    async getCurrentUser(@CUser() user:DocumentType<User>) {
        return user
    }

    @Post()
    @Auth("创建管理员",['admin'],"jwt")
    async create(@Body() body: User,@CUser() user:DocumentType<User>) {
        return await this.UserService.create(body,user);
    }

    @Post("img")
    @UseInterceptors(FileInterceptor("file"))
    @Auth("上传图片(包括头像)",['admin'],"jwt")
    async upload(@UploadedFile() file, @Body() body: imgUploadParam,@CUser() user:DocumentType<User>) {
        return await this.UserService.upload(file,body.type,user,body.id)
    }

    @Get("logout")
    @Auth("注销用户",['admin','user'],"jwt")
    async logout(@CUser() user:DocumentType<User>) {
        return this.UserService.logout(user)
    }

    @Get(":id")
    @Auth("获取管理员详情",['admin'],"jwt")
    async detail(@Param("id") id: string, @Req() req) {
        if (!req) return "";
        return await this.UserService.detail(id);
    }
    
    @Put(":id")
    @Auth("更新管理员",['admin'],"jwt")
    async update(@Param("id") id: string, @Body() body: UserUpdateDTO,@CUser() user:DocumentType<User>) {
        return await this.UserService.update(id, body,user);
    }

    @Delete(":id")
    @Auth("删除管理员",['admin'],"jwt")
    async _delete(@Param("id") id: string,@CUser() user:DocumentType<User>) {
        return await this.UserService._delete(id,user);
    }

    @Post("login")
    @Auth("登录",null,"local")
    async login(@Body() body: LoginDto, @CUser() user: DocumentType<User>) {
        //sign的参数必须使用对象，否则无法设置过期时间
        return this.UserService.login(user)
    }
}

