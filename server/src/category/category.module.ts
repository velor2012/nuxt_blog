import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import Category from './category.model';
import CategoryController from './category.controller';
import CategoryService from './category.service';

@Module({
    imports: [TypegooseModule.forFeature([Category])],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports:[CategoryService]
})
export class CategoryModule {}
