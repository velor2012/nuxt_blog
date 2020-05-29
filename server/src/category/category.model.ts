import { prop, Ref, arrayProp } from '@typegoose/typegoose';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import Article from 'src/article/article.model';
@ApiExtraModels()
export default class Category {
    @ApiProperty({required:true, description: '类别名称', example: '类别名称' })
    @IsString({ message: "类别名称必须是字符串" })
    @IsNotEmpty({ message: "类别名称不能为空" })
    @prop({required:true})
    public name: string;
}