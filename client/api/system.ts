import CommonAPI, { generateResponse } from './common';
import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { MyResponse } from '.';
import { AxiosResponse } from 'axios'
export type logType = 'info' | 'error'
export class SystemAPI {
    protected prefix: string;
    constructor() {
        this.prefix = '/system';
    }
    public async getSystemInfo(
		axios: NuxtAxiosInstance,
	): Promise<MyResponse> {
		let error = false;
		let res = await axios
			.get(`${this.prefix}/info`)
		return generateResponse(res as AxiosResponse);
    }
    public async getLogs(
        axios: NuxtAxiosInstance,
        type: logType,
	): Promise<MyResponse> {
		let error = false;
		let res = await axios
            .get(`${this.prefix}/logs`, {
                params: {
                    type: type
                }
            })
		return generateResponse(res as AxiosResponse);
    }
    
    public async getLog(
        axios: NuxtAxiosInstance,
        type: logType,
        fileName:string
	): Promise<MyResponse> {
		let error = false;
		let res = await axios
            .get(`${this.prefix}/log`, {
                params: {
                    type: type,
                    fileName:fileName
                }
            })
		return generateResponse(res as AxiosResponse);
	}
}
const MySystemAPI = new SystemAPI()
export default MySystemAPI