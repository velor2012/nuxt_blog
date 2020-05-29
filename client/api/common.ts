import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { AxiosResponse, AxiosError } from "axios";
import _ from "lodash";
import { MyResponse, ICommonAPI } from ".";
import imgUploadParam from "~/types/uploadImg";
export function isRequestSucceed(res: AxiosResponse) {
	return _.get(res, "status") == 201 || _.get(res, "status") == 200;
}
export default class CommonAPI implements ICommonAPI {
	protected prefix: string;
	constructor(prefix: string) {
		this.prefix = prefix;
	}
	public async findAllAPI(
		axios: NuxtAxiosInstance,
		pageSize?: number,
		page?: number
	): Promise<MyResponse> {
		let error = false;
		let res = await axios
			.get(`${this.prefix}`, {
				params: {
					pageSize: pageSize,
					page: page,
				},
			})
		return generateResponse(res as AxiosResponse);
	}
	public async findOneAPI(
		axios: NuxtAxiosInstance,
		id: string
	): Promise<MyResponse> {
		let error = false;
		let res = await axios
			.get(`${this.prefix}/${id}`)
		return generateResponse(res as AxiosResponse);
	}

	public async createAPI(
		axios: NuxtAxiosInstance,
		formdata: object
	): Promise<MyResponse> {
		let error = false;
		let res = await axios
			.post(`${this.prefix}`, formdata)
		return generateResponse(res as AxiosResponse);
	}

	public async updateAPI(
		axios: NuxtAxiosInstance,
		id: string,
		formdata: object
	): Promise<MyResponse> {
		let error = false;
		let res = await axios
			.put(`${this.prefix}/${id}`, formdata)
		return generateResponse(res as AxiosResponse);
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
    
    public async uploadImg(url:string, axios: NuxtAxiosInstance, file: File,params:imgUploadParam): Promise<MyResponse> { 
        var formData = new FormData();
        formData.append("file", file);
        formData.append("type", params.type)
        formData.append("id",params.id)
        let res = await axios.post(url,formData)
        return generateResponse(res as AxiosResponse)
    } 
}
export function generateResponse(res: AxiosResponse): MyResponse {
    let myResponse = new MyResponse();
    myResponse.success = isRequestSucceed(res)
    myResponse.data = res.data;
    return myResponse;
}