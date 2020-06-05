import {AxiosResponse} from 'axios'
import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { generateResponse } from './common';
import imgUploadParam from '~/types/uploadImg';
export class MyResponse<T = any> { 
    success: boolean = true
    data: T
    constructor() { 
        this.success = true
    }
}
export interface ICommonAPI { 
    findAllAPI(axios: NuxtAxiosInstance, pageSize: number, page: number): Promise<MyResponse>
    createAPI(axios:NuxtAxiosInstance ,formdata:object): Promise<MyResponse>
    findOneAPI(axios:NuxtAxiosInstance,id:string): Promise<MyResponse>
    deleteAPI(axios:NuxtAxiosInstance,id:string): Promise<MyResponse>
    updateAPI(axios:NuxtAxiosInstance,id:string,formdata:object):Promise<MyResponse>
}
