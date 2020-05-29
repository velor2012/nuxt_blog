import { prop, arrayProp } from '@typegoose/typegoose';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt'
export default class LoginDto {
    @ApiProperty({ description: '管理员名称', example: 'velor2012' })
    @IsString({message:"管理员名称必须是字符串"})
    @IsNotEmpty({message:"管理员名称不能为空"})
    @prop({required:true})
    public username: string;
    
    @ApiProperty({
        required: true, description: '管理员密码', example: "123456"
        
    })
    @IsString({message:"管理员名称必须是字符串"})
    @IsNotEmpty({message:"管理员密码不能为空"})
    @prop({
        required: true,
        set: (val:string):string =>  bcrypt.hashSync(val,10),
        get: (val: string): string => val,
        select: false
    })
    public password: string
  }