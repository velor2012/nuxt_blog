import { ApiProperty } from "@nestjs/swagger";
import {
    IsNumber,
    IsString,
    IsObject,
    IsNotEmpty,
    IsJSON,
    IsOptional,
    IsBoolean,
    IsBooleanString,
} from "class-validator";
import { Type } from "class-transformer";
import { isBoolean } from "util";

export default class QueryDTO {
    @ApiProperty({
        required: false,
        description: "分页大小，设置为小于等于0或者不提供该参数时返回所有数据",
        example: 5,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    pageSize?: number = 0;

    @ApiProperty({
        required: false,
        description: "页数，设置为小于等于0或者不提供该参数时返回所有数据",
        example: 1,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 0;

    @ApiProperty({
        required: false,
        description: "排序方法",
        example: "updatedAt",
    })
    @IsString()
    sortBy: string = "updatedAt";

    @ApiProperty({
        required: false,
        description: "查询条件",
        example: '{"id":"xxxx"}',
    })
    @IsOptional()
    @IsJSON()
    where: string = "{}";

    @ApiProperty({
        required: false,
        description: "是否返回总数",
        example: 'false',
    })
    @IsBooleanString()
    needTotal:string='false'
}
