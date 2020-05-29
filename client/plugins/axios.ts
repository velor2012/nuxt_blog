import config from "~/config.json"
import { AxiosError, AxiosResponse } from 'axios';
import { Vue } from "nuxt-property-decorator";
import _ from "lodash";
export default function ({ $axios, redirect }) {
  if (process.env.NODE_ENV !== 'production') {
        $axios.setBaseURL(process.env.DEV_URL)
    }else{
        $axios.setBaseURL(process.env.PROD_URL)
  }
    $axios.onError((error: AxiosError) => {
        Vue.prototype.$message({
            type: 'error',
            message: _.get(error,'response.data.message')
        })
      return error.response;
    })
}
  