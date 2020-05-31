import { Controller, Get, Injectable, Query, UsePipes, ValidationPipe, HttpStatus, HttpException } from '@nestjs/common';
import { SystemService } from './system.service';
import { ApiTags } from '@nestjs/swagger';
import Auth from 'src/lib/decorator/auth.decorator';

type logtype = 'info' | 'error'

@ApiTags('系统')
    @Injectable()
    @UsePipes(new ValidationPipe())
@Controller('system')
export default class SystemController {
    constructor(
        private readonly SystemService: SystemService
    ) { }
    @Get('info')
    @Auth("获取系统信息") 
    getSystemInfo() { 
        return this.SystemService.getSystemInfo()
    }

    @Get('logs')
    @Auth("获取指定类型的日志") 
    getLogs(@Query("type") type: logtype) {
        if (type != 'error' && type != 'info') {
            throw new HttpException(
                "type必须是erro或者info",
                HttpStatus.UNPROCESSABLE_ENTITY
            ); 
        }
        return this.SystemService.getAllLogName(type)
    }

    @Get('log')
    @Auth("获取指定类型的日志") 
    getlog(@Query("type") type: string, @Query("fileName") fileName: string) { 
        if (type != 'error' && type != 'info') {
            throw new HttpException(
                "type必须是erro或者info",
                HttpStatus.UNPROCESSABLE_ENTITY
            ); 
        }
        if (!fileName) {
            throw new HttpException(
                "未正确填入fileName",
                HttpStatus.UNPROCESSABLE_ENTITY
            ); 
        }
        return this.SystemService.getlog(type,fileName)
    }
}
