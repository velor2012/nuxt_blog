const axios = require('@nuxtjs/axios')
const https = require('https')
var  httpsAgent=new https.Agent({  
    rejectUnauthorized: false
  })
axios.get('https://127.0.0.1:4001/api/article/total',{ httpsAgent: httpsAgent}).then(res=>console.log(res.data))