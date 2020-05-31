import * as os from 'os'
export default class SystemInfo { 
    hostname: string
    platform: NodeJS.Platform
    release: string
    // 内存占用率
    percentage:number
    type: string
    totalmem: string
    freemem: string
    cpu: os.CpuInfo[]
}