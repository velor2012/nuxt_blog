import { Module } from '@nestjs/common';
import DraftController from './draft.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import Draft from './draft.model';
import DraftService from './draft.service';

@Module({
    imports: [TypegooseModule.forFeature([Draft])],
    controllers: [DraftController],
    providers: [DraftService],
    exports:[DraftService]
})
export class DraftModule {}
