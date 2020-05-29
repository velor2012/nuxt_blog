import { AxiosResponse } from "axios";
import _ from "lodash";


export var baseUrl: string =
    process.env.NODE_ENV == "production"
        ? (baseUrl = process.env.PROD_URL)
        : (baseUrl = process.env.DEV_URL);

export function getToken() {
    let localStorage = _.get(window, "localStorage");
    if (localStorage) {
        return localStorage.getItem("auth._token.local");
    } else {
        return null;
    }
}

import Vue from 'vue'
export default new Vue();