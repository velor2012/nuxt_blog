import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
    Inject,
    Logger,
} from "@nestjs/common";
import _ = require("lodash");
import { ServerResponse } from "http";
import { BaseExceptionFilter } from "@nestjs/core";
import { WINSTON_MODULE_PROVIDER, WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

const changeMessage = (status:number,exception:any)=>{ 
    // if (status == HttpStatus.UNAUTHORIZED) { 
    //     return "请先登录"
    // }
    if (status == HttpStatus.FORBIDDEN) {
        return "权限不足"
    } else if (_.get(exception, "response.message")) {
        return _.get(exception, "response.message")
    } else { 
        return _.get(exception, "message")
    }
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    constructor( @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger){super()}
    catch(exception: unknown, host: ArgumentsHost) {
        if (exception instanceof HttpException) {
            super.catch(exception, host);
        } else {
            const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();
		const status = HttpStatus.INTERNAL_SERVER_ERROR;

        //处理mongodb的异常
		let out = {
			name: _.get(exception, "name")||_.get(exception, "code"),
			message: _.get(exception, "message"),
        };
        let stack = (exception as any).stack
        if (out.name == undefined && out.message == undefined) {
			this.logger.error('出现错误: ',stack,'')
            } else {
			this.logger.error('轻微异常: ',stack,'')
		}

		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			name: _.get(exception, "name"),
			message: _.get(exception, "message"),
			path: request.url,
        });
        
        //end 处理mongodb的异常
        }
		
	}
}
