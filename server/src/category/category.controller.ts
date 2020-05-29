import { Controller, Injectable, Get, UsePipes, Body, Param, Put, Delete, Post, Query, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import Category from './category.model';
import Auth from 'src/lib/decorator/auth.decorator';
import CategoryService from './category.service';
import QueryDTO from 'src/lib/dto/query.dto';


@ApiTags('分类')
@Injectable()
@UsePipes(new ValidationPipe({transform:true}))
@Controller('categories')
export default class CategoryController {
    constructor(
    private readonly CategoryService: CategoryService
    ) { }
        @Get()
        @Auth("获取所有分类") 
        async index(@Query() query: QueryDTO) {
            let { page, pageSize, sortBy,where} = query;
            let sb = {};
            sb[sortBy] = -1;
    
            return await this.CategoryService.getAllCategories(pageSize,page,sb,where)
        }

        @Post()
        @Auth("创建分类",['admin'],"jwt") 
        async create(@Body() body:Category) { 
            return await this.CategoryService.create(body)
        }
    
        @Get('total')
        @Auth("获取文章数量")
        async total() {
            return await this.CategoryService.getTotalNumber();
        }
    
        @Get(':id')
        @Auth("获取分类详情") 
        async deatil(@Param('id') id: string) { 
            return await this.CategoryService.detail(id)
        }
    
        @Put(':id')
        @Auth("更新分类",['admin'],"jwt")
        async update(@Param('id') id: string,@Body() body:Category) { 
            return await this.CategoryService.update(id,body)
        }
        @Delete(':id')
        @Auth("删除分类",['admin'],"jwt")
        async _delete(@Param('id') id: string) { 
            return await this.CategoryService._delete(id)
        }
    }
