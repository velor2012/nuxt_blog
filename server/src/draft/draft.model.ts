import { prop, arrayProp, Ref } from '@typegoose/typegoose';
import { IsString, IsNotEmpty, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import Category from 'src/category/category.model';
export default class Draft extends TimeStamps {
    @ApiProperty({ description: '草稿标题',required:true })
    @IsString({message:"草稿标题必须是字符串"})
    @IsNotEmpty({message:"草稿标题不能为空"})
    @prop({required:true})
    public title: string;
    
    @ApiProperty({required: true, description: '草稿内容'})
    @IsString({message:"草稿内容必须是字符串"})
    @IsNotEmpty({message:"草稿内容不能为空"})
    @prop({required: true,})
    public content: string

    @IsString({ message: "草稿封面必须是字符串" })
    @ApiProperty({ required: true, description: '草稿封面', example: "http://xxx.xxx.com/xxx.jpg" })
    @IsNotEmpty({message:"草稿封面不能为空"})
    @prop({required: true})
    public cover: string
   
    @ApiProperty({ description: '草稿类别',required:true, example: "['黑苹果']" })
    @IsArray({message:"草稿类别必须是数组"})
    @arrayProp({ ref: "Category",required:true })
    public categories: Ref<Category>[];
    
    @ApiProperty({ description: '草稿简介',required:true })
    @IsString({ message: "草稿简介必须是字符串" })
    @prop({required:true})
    public resume: String
    
    @ApiProperty({ description: '草稿是否对应某篇已经发布的文章',required:true })
    @IsString({ message: "articleId必须是字符串" })
    @prop({ ref: "Category",required:true })
    public articleId: Category
  }