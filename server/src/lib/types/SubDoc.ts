import { prop, arrayProp, Ref } from '@typegoose/typegoose';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import Category from 'src/category/category.model';
export default class SubDoc extends TimeStamps {

    @IsNumber({},{ message: "子文档序号必须是数字" })
    @ApiProperty({ required: true, description: '子文档的序号,类似于章节的序号，必须唯一'})
    @IsNotEmpty({message:"子文档的序号不能为空"})
    @prop({required: true,unique:true})
    public order: Number

    @IsString({ message: "子文档标题必须是字符串" })
    @ApiProperty({ required: true, description: '子文档标题'})
    @IsNotEmpty({message:"子文档标题不能为空"})
    @prop({required: true,unique:true})//子文档中的unique不起作用，需要在update的时候手动检查
    public title: string

    @IsString({ message: "子文档内容必须是字符串" })
    @ApiProperty({ required: true, description: '子文档内容'})
    @IsNotEmpty({message:"子文档内容不能为空"})
    @prop({required: true})
    public content: string
    
  }