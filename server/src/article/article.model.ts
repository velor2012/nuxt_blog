import { prop, arrayProp, Ref } from '@typegoose/typegoose';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import Category from 'src/category/category.model';
export default class Article extends TimeStamps {
    @ApiProperty({ description: '文章标题',required:true })
    @IsString({message:"文章标题必须是字符串"})
    @IsNotEmpty({message:"文章标题不能为空"})
    @prop({required:true})
    public title: string;
    
    @ApiProperty({required: true, description: '文章内容'})
    @IsString({message:"文章内容必须是字符串"})
    @IsNotEmpty({message:"文章内容不能为空"})
    @prop({required: true,})
    public content: string

    @IsString({ message: "文章封面必须是字符串" })
    @ApiProperty({ required: true, description: '文章封面', example: "http://xxx.xxx.com/xxx.jpg" })
    @IsNotEmpty({message:"文章封面不能为空"})
    @prop({required: true})
    public cover: string

    @ApiProperty({ description: '文章类别',required:true, example: "['黑苹果']" })
    @IsArray({message:"文章类别必须是数组"})
    @arrayProp({ ref: "Category",required:true })
    public categories: Ref<Category>[];
    
    @ApiProperty({ description: '文章简介',required:true })
    @IsString({ message: "文章简介必须是字符串" })
    @prop({required:true})
    public resume: String
    
  }