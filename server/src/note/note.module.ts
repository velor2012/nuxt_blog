import { Module } from '@nestjs/common';
import Note from './note.model';
import NoteController from './note.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import NoteService from './note.sevice';

@Module({
    imports: [TypegooseModule.forFeature([Note])],
    controllers: [NoteController],
    providers: [NoteService],
    exports:[NoteService]
})
export class NoteModule {}
