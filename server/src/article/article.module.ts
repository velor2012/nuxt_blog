import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import Article from './article.model';
import ArticleController from './article.controller';
import ArticleService from './article.service';

@Module({
    imports: [TypegooseModule.forFeature([Article])],
    controllers: [ArticleController],
    providers: [ArticleService],
    exports:[ArticleService]
})
export class ArticleModule {}
