import CommonAPI, { generateResponse } from './common';
import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { MyResponse } from '.';
import { AxiosResponse } from 'axios'
import imgUploadParam, { extendImgType } from '~/types/uploadImg';
import { extendImgUploadParam } from '../types/uploadImg';
export class ImgAPI {
    protected prefix: string;
    public uploadUrl:string
    constructor() {
        this.prefix = '/imgs';
        this.uploadUrl = this.prefix
    }
    public async getAll(
        axios: NuxtAxiosInstance,
        type: extendImgType,
        pageSize?: number,
		page?: number
	): Promise<MyResponse> {
		let error = false;
		let res = await axios
            .get(`${this.prefix}`, {
                params: {
                    where: {
                        type:type
                    },
                    pageSize: pageSize,
					page: page,
                }
            })
		return generateResponse(res as AxiosResponse);
    }

    public async uploadAndCreateAPI(axios: NuxtAxiosInstance, file: File,params:extendImgUploadParam): Promise<MyResponse> { 
        var formData = new FormData();
        formData.append("file", file);
        formData.append("type", params.type)
        formData.append("id",params.id)
        let res = await axios.post(this.uploadUrl,formData)
        return generateResponse(res as AxiosResponse)
    } 
    public async deleteAPI(
		axios: NuxtAxiosInstance,
		id: string
	): Promise<MyResponse> {
		let error = false;
		let res = await axios
			.delete(`${this.prefix}/${id}`)
		return generateResponse(res as AxiosResponse);
    }
    public async getTotalNumberAPI(
		axios: NuxtAxiosInstance,
	): Promise<MyResponse> {
		let error = false;
		let res = await axios
			.get(`${this.prefix}/total`)
		return generateResponse(res as AxiosResponse);
    }
}
const MyImgAPI = new ImgAPI()
export default MyImgAPI