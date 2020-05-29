import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { AxiosResponse, AxiosError } from 'axios'
import CommonAPI, { generateResponse } from './common';
import { MyResponse } from './index';
export class UserAPI extends CommonAPI  {
    // protected prefix = '/categories'
    public userLogoutUrl: string
    public userLoginUrl: string
    public currentUserUrl: string
    public imgUploadUrl:string
    constructor() {
        super('/users');
        this.imgUploadUrl = this.prefix + '/img'
        this.userLogoutUrl = this.prefix + '/logout'
        this.currentUserUrl = this.prefix + '/currentUser'
        this.userLoginUrl = this.prefix + '/login'
    }
    public async loginAPI(
        axios: NuxtAxiosInstance,
        user:object
    ): Promise<MyResponse> { 
		let res = await axios
			.post(this.userLoginUrl, user)
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
const MyUserAPI = new UserAPI()
export default MyUserAPI