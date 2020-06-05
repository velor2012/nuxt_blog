import { Module } from '@nestjs/common';
import MyImg from 'src/imgs/img.model';
import { TypegooseModule } from 'nestjs-typegoose';
import ImgController from './img.controller';
import ImgService from './img.service';

@Module({
    imports: [TypegooseModule.forFeature([MyImg])],
    controllers: [ImgController],
    providers: [ImgService],
    exports:[ImgService]
})
export class ImgModule {}
