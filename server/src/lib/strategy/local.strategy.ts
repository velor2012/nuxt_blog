import { Strategy, IStrategyOptions } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import {
    Injectable,
    HttpException,
    HttpStatus,
    HttpService,
} from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ReturnModelType } from "@typegoose/typegoose";
import * as bcrypt from "bcrypt";
import _ = require("lodash");
import User from "src/user/user.model";

//登录的策略
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectModel(User)
        private readonly UserModel: ReturnModelType<typeof User>,
    ) {
        super({
            usernameField: "username",
            passwordField: "password",
        } as IStrategyOptions);
    }

    async validate(username: string, password: string): Promise<any> {
        let user = await this.UserModel.findOne({
                username: username,
            }).select("+password")
            if (!user) {
                throw new HttpException(
                    "没有此用户",
                    HttpStatus.UNPROCESSABLE_ENTITY
                );
            } else if (!bcrypt.compareSync(password, user.password)) {
                throw new HttpException("密码错误", HttpStatus.UNAUTHORIZED);
            }
        return user;
    }
}
