import { prop, arrayProp, Ref } from '@typegoose/typegoose';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import Category from 'src/category/category.model';
import SubDoc from '../lib/types/SubDoc';
export default class Note extends TimeStamps {
    @ApiProperty({ description: '笔记名',required:true })
    @IsString({message:"笔记名必须是字符串"})
    @IsNotEmpty({message:"笔记名不能为空"})
    @prop({required:true,unique:true})
    public name: string;
    

    @IsString({ message: "笔记封面必须是字符串" })
    @ApiProperty({ required: true, description: '笔记封面', example: "http://xxx.xxx.com/xxx.jpg" })
    @IsNotEmpty({message:"笔记封面不能为空"})
    @prop({required: true})
    public cover: string

    @ApiProperty({ description: '笔记类别',required:true, example: ['xxxx(分类的id)'] })
    @IsArray({message:"笔记类别必须是数组"})
    @arrayProp({ ref: "Category",required:true })
    public categories: Ref<Category>[];
    
    @ApiProperty({ description: '笔记简介',required:true })
    @IsString({ message: "笔记简介必须是字符串" })
    @prop({required:true})
    public resume: String

    @ApiProperty({ description: '笔记访问量' })
    @IsOptional()
    @IsNumber({},{ message: "笔记访问量必须是数字" })
    @prop({required:true,default:0})
    public visits?: number

    @ApiProperty({ description: '笔记内容(子文档数组)',required:true })
    @IsArray({ message: "子文档必须是数组" })
    @arrayProp({required:true, items: SubDoc })
    public subDoc: SubDoc[]
  }