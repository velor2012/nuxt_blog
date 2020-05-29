import { Injectable } from '@nestjs/common';
import imgUploadParam from '../types/imgParam';
import { v1 as uuidv1 } from "uuid";
import * as fs from "fs";

@Injectable()
export abstract class ImgUploadService {
    public abstract upload(file: any, param: imgUploadParam); 
}

@Injectable()
export class githubUploader extends ImgUploadService {
    async upload(file:any,param:imgUploadParam) {
        // let uuid:string = uuidv1()
        // let extName:string = file.originalname.split('.').pop()
        // fs.writeFileSync(`static/${uuid}.${extName}`,file.buffer)
        // return {
        //     filePath:`static/${uuid}.${extName}`
        // }
        console.log('usegithub')
    }   
}

@Injectable()
export class localUploader extends ImgUploadService {
    async upload(file:any,param:imgUploadParam) {
        let uuid:string = uuidv1()
        let extName:string = file.originalname.split('.').pop()
        fs.writeFileSync(`static/${uuid}.${extName}`,file.buffer)
        return {
            filePath: `http://${process.env.HOST}:${process.env.PORT}/${uuid}.${extName}`
        }
    }   
}