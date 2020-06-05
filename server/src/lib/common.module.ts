import { Module, Global } from "@nestjs/common";
import { TypegooseModule } from "nestjs-typegoose";
import { ConfigModule } from "@nestjs/config";
import { DbModule } from "./db/db.module";
import { LocalStrategy } from "./strategy/local.strategy";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { JwtModule } from '@nestjs/jwt';
import User from "src/user/user.model";
import { ImgUploadService, githubUploader, localUploader } from './common/uploadImg.service';
import * as dotenv from 'dotenv'
import { MyCacheModule } from "./cache/cache.module";
import { ESModule } from './es/es.module';

dotenv.config()
//判断使用过何种图片上传方法
const configServiceProvider = {
    provide: ImgUploadService,
    useClass:
      process.env.USEGITHUB == "1"
        ? githubUploader
        : localUploader,
};
  

@Global()
@Module({
    imports: [
        DbModule,
        JwtModule.registerAsync({
            useFactory:()=>{
                return {
                    secret: process.env.SECRET,
                    signOptions: {expiresIn:'1d'}
                }
            }
        }),
        TypegooseModule.forFeature([User]),
        MyCacheModule,
        ESModule
    ],
    providers: [
        LocalStrategy,JwtStrategy,configServiceProvider
    ],
    exports: [ LocalStrategy,JwtStrategy,JwtModule,configServiceProvider,MyCacheModule,ESModule],
})
export class CommonModule {}
