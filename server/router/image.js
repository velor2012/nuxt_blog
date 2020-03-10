const express = require('express')
const os = require('os')
const router = express.Router()
const {auth,jwt,getMessageAndSend,getAllFiles,deleteFile} = require('../util/util')

router.get('/image/emoji', (req, res)=>{
    result = getAllFiles('static/emoji')
    result_slim=[]
    //去掉路径前面的static,并把\\改成/
    result.map(item=>{
        item_processed = item.replace('static','').replace(/\\/g,'/')
        result_slim.push(item_processed)
    })
    getMessageAndSend(true,'',{result:result_slim},res)
})
router.delete('/image/emoji',auth, (req, res)=>{
    let name = req.body.name
    let path = `static/emoji/${name}`
    let result = deleteFile(path)
    getMessageAndSend(result,'',{},res)
})
module.exports=router