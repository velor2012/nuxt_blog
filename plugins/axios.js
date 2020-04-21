const config = require("~/server/config.json")
const https = require("https")
export default function ({store, redirect ,$axios })  {
    // 数据访问前缀
    if(process.env.NODE_ENV !== 'production'){
        $axios.defaults.baseURL = config.env_url
    }else{
        $axios.defaults.baseURL = config.prod_url
    }
    $axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });
	// request拦截器，我这里设置了一个token，当然你可以不要
    // http request 拦截器
    $axios.interceptors.request.use(
    config => {
        let token = store.state.login.token
        if (token) {  // 判断是否存在token，如果存在的话，则每个http header都加上token
            config.headers.Authorization = `token ${token}`;
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    });
	$axios.onError(error => {
		
	})
	// response拦截器，数据返回后，你可以先在这里进行一个简单的判断
    $axios.interceptors.response.use(response => {
		return response
    })
}