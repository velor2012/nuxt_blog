import { prop, arrayProp } from '@typegoose/typegoose';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt'
export default class User {
    @ApiProperty({ description: '管理员名称', example: 'velor2012' })
    @IsString({message:"管理员名称必须是字符串"})
    @IsNotEmpty({message:"管理员名称不能为空"})
    @prop({required:true})
    public username: string;
    
    @ApiProperty({required: true, description: '管理员密码', example: "123456"})
    @IsString({message:"管理员密码必须是字符串"})
    @IsNotEmpty({message:"管理员密码不能为空"})
    @prop({
        required: true,
        set: (val:string):string =>  bcrypt.hashSync(val,10),
        get: (val: string): string => val,
        select: false
    })
    public password: string

    @IsString({ message: "管理员角色必须是字符串" })
    @ApiProperty({ required: true, description: '管理员的角色', example: "admin|user" })
    @IsNotEmpty({message:"管理员角色不能为空"})
    @prop({
        required: true,
        enum:['admin','user']
    })
    public role: string

    @ApiProperty({ description: '管理员真名',required:false, example: 'velor2012' })
    @IsOptional()
    @IsString({message:"管理员真名必须是字符串"})
    @prop({required:true})
    public realname: String 
   
    @ApiProperty({ description: '管理员头像',required:false, example: 'velor2012' })
    @IsOptional()
    @IsString({message:"管理员头像必须是字符串"})
    @prop({required:false})
    public avatar: String
    
    @ApiProperty({ description: '管理员信息',required:false, example: 'velor2012' })
    @IsOptional()
    @IsString({ message: "管理员信息必须是字符串" })
    @prop({required:false})
    public info:String
  }