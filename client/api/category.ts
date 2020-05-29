import CommonAPI, { generateResponse } from './common';
import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { MyResponse } from '.';
import {AxiosResponse} from 'axios'
export class CategoryAPI extends CommonAPI  {
    // protected prefix = '/categories'
    constructor() {
        super('/categories');
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
const MyCategoryAPI = new CategoryAPI()
export default MyCategoryAPI