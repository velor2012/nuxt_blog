import { Injectable } from '@nestjs/common';
import * as os from 'os'
import * as fs from 'fs'

@Injectable()
export class SystemService {
    getSystemInfo() { 
        let {
            freemem,
            cpus,
            hostname,
            platform,
            release,
            totalmem,
            type,
            constants
          } = os;
          let total = Number(totalmem() / 1024 / 1024);
        let num = Number(Number(freemem() / 1024 / 1024).toFixed(0));
            // 内存占用率
          let percentage = Number(Number((1-(num / total)) * 100).toFixed(2));
          let info = {
            hostname: hostname(),
            platform: platform(),
              release: release(),
            percentage,
            type: type(),
            totalmem: `${total}MB`,
            freemem: `${num}MB`,
            cpu: cpus()
          };
        return info
    }

    getAllLogName(type: string) { 
        let mypath =''
        if (type == 'info') {
            mypath = process.env.INFO_DIR || 'log/info'
        } else { 
            mypath = process.env.ERROR_DIR || 'log/error'
        }

        let items = fs.readdirSync(mypath);
        let results = []
        // 遍历当前目录中所有的文件
        items.map(item => {
            if (!/^(.*)?.log$/.test(item)) return;
            results.push({fileName:item })
        });
        return results;
    }

    getlog(type: string,fileName:string) { 
        let mypath =''
        if (type == 'info') {
            mypath = process.env.INFO_DIR || 'log/info'
        } else { 
            mypath =  process.env.ERROR_DIR || 'log/error'
        }
        if (!fs.existsSync(`${mypath}/${fileName}`)) return { notFound: '没有找到日志文件' }
        return fs.readFileSync(`${mypath}/${fileName}`, 'utf-8')
    }
}
