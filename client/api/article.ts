import CommonAPI, { generateResponse } from './common';
import { NuxtAxiosInstance } from '@nuxtjs/axios';
import {AxiosResponse} from 'axios'
import { MyResponse } from '.';
export class ArticleAPI extends CommonAPI  {
    // protected prefix = '/categories'
    imgUploadURL: string;
    constructor() {
        super('/articles');
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
    public async checkTitleDuplicate(
        axios: NuxtAxiosInstance,
        title:string
	): Promise<MyResponse> {
		let error = false;
		let res = await axios
            .get(`${this.prefix}/unique`, {
                params: {
                    title:title
                }
            })
		return generateResponse(res as AxiosResponse);
	}
}
const MyArticleAPI = new ArticleAPI()
export default MyArticleAPI