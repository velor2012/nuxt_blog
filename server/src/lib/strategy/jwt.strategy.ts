import { Strategy, StrategyOptions, ExtractJwt } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import {
    Injectable,
} from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ReturnModelType } from "@typegoose/typegoose";
import User from "src/user/user.model";

//登录的策略
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectModel(User)
        private readonly UserModel: ReturnModelType<typeof User>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.SECRET,
        } as StrategyOptions);
    }

    async validate(id: any): Promise<any> {
        let user = await this.UserModel.findById(id.id);
        //前面的构造函数已经拦截了异常，不需要在处理
        // if (!user) {
        //     throw new HttpException("token校验失败", HttpStatus.UNAUTHORIZED);
        // }
        return user;
    }
}
