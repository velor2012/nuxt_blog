import { prop, Ref, arrayProp } from '@typegoose/typegoose';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { extendImgType } from '../lib/types/imgParam';

export default class MyImg {
  @ApiProperty({ required: true, description: '图片路径', example: '类别名称' })
  @IsString({ message: '图片路径必须是字符串' })
  @IsNotEmpty({ message: '图片路径不能为空' })
  @prop({ required: true })
  public path: string;

  @ApiProperty({ required: true, description: '图片类型' })
  @IsString({ message: '图片类型必须是字符串' })
  @IsNotEmpty({ message: '图片类型不能为空' })
  @prop({ required: true })
  public type: extendImgType;

  constructor(path: string, type: extendImgType) {
    this.path = path;
    this.type = type;
  }
}
