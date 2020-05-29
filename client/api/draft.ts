import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { AxiosResponse, AxiosError } from 'axios'
import CommonAPI, { generateResponse } from './common';
import { MyResponse } from './index';
export class DraftAPI extends CommonAPI  {
    // protected prefix = '/categories'
    imgUploadURL: string;
    constructor() {
        super('/drafts');
        this.imgUploadURL = `${this.prefix}/img`
    }
    public async getTotalNumberAPI(
		axios: NuxtAxiosInstance,
	): Promise<MyResponse> {
		let error = false;
		let res = await axios
			.get(`${this.prefix}/total`)
		return generateResponse(res as AxiosResponse);
	}
    async findOneUpdateOrCreated(axios: NuxtAxiosInstance,formdata: object): Promise<MyResponse> { 
        let res = await axios.post(`${this.prefix}/createOrUpdate`, formdata)
        return generateResponse(res as AxiosResponse)
    } 
}
const MyDraftAPI = new DraftAPI()
export default MyDraftAPI