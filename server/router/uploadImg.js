const express = require('express')
const router = express.Router()
const {auth,jwt,getMessageAndSend,deleteFile,octokit} = require('../util/util')
const sharp = require('sharp')
const request = require('request')
var FormData = require('form-data');
let config = require('../config.json').github
var proxy = config.proxy
let Base64 = require('js-base64').Base64;
var multer = require('multer');//引入multer
//uuid工具可以生成唯一标示 需要安装
var UUID = require('uuid')
//上传到表情包文件夹

//设置保存规则
let storage_emoji = multer.memoryStorage()

let upload_blog_emoji = multer({storage: storage_emoji}).single('file');

router.post('/upload/emoji',auth, (req, res)=>{

    upload_blog_emoji(req,res,async (err)=>{
        if (err) {//上传时发生错误
            getMessageAndSend(false, 'err', { error: err }, res)
        } else {
            var t = req.file.originalname.split('.')
            let extName = t[t.length-1]
            let file = req.file;
            //以文章的id新建子目录
            let filename = `emoji-${UUID.v1()}.${extName}`

            // // //上传原图
            let encode_file = Base64.encode(file.buffer)
            var url = `https://api.github.com/repos/${config.user}/${config.repo}/contents/emoji/${filename}`
            let promise2 = new Promise((resolve, reject) => request({
                url: url,
                method: 'PUT',
                proxy: proxy,
                headers: {//设置请求头
                    "content-type": "application/json",
                    'Authorization': `token ${config.token}`,
                    "User-Agent": "cwy"
                },
                json: true,
                body: {
                    message: 'test',
                    content: encode_file
                }
            }, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            })).catch(err => { console.log(err) })

            let results2 = await promise2

            file_path = results2.content.path

            getMessageAndSend(true,'',{path:`https://cdn.jsdelivr.net/gh/${config.user}/${config.repo}/${file_path}`},res)
        }
    })

})

//上传博客封面图片

//处理生成缩略图
let storage = multer.memoryStorage()
let upload_blog = multer({storage: storage}).single('file');

router.post("/upload", auth, async (req, res) => {
  upload_blog(req,res,async (err)=>{
    let extName = req.body.extName;
    let file = req.file;
    let type = req.body.type;
    //以文章的id新建子目录
    let id = req.body.id
    let filename = NaN
    filename = `${type}-${UUID.v1()}.${extName}`
    let thumbName = `thumb-${filename}`
    if(id){
        filename = `${id}/${filename}`
        thumbName = `${id}/${thumbName}`
    }else{
        filename = `other/${filename}`
        thumbName = `other/${thumbName}`
    }


    //产生缩略图
    let buffer = await sharp(file.buffer)
    .resize(200)
    .toBuffer().catch(err=>console.log(err))
    let encode_thumb_file = Base64.encode(buffer)

    var url = `https://api.github.com/repos/${config.user}/${config.repo}/contents/blog/${thumbName}`
    let promise1 = new Promise((resolve, reject) => request({
        url:url,
        method: 'PUT',
        proxy: proxy,
        headers: {//设置请求头
            "content-type": "application/json",
            'Authorization':`token ${config.token}`,
            "User-Agent":"velor2012"
        },
        json:true,
        body:{
            message:'test',
            content:encode_thumb_file
        }
    },(err, response, body) => {
        if (err) {
            reject(err);
        } else {
            resolve(body);
        }
    }))

    let results1 = await promise1
    // console.log(results1)
    // // //上传原图
    let encode_file = Base64.encode(file.buffer)
    var url = `https://api.github.com/repos/${config.user}/${config.repo}/contents/blog/${filename}`
    let promise2 = new Promise((resolve, reject) => request({
        url:url,
        method: 'PUT',
        proxy: proxy,
        headers: {//设置请求头
            "content-type": "application/json",
            'Authorization':`token ${config.token}`,
            "User-Agent":"cwy"
        },
        json:true,
        body:{
            message:'test',
            content:encode_file
        }
    },(err, response, body) => {
        if (err) {
            reject(err);
        } else {
            resolve(body);
        }
    }))
    let results2 = await promise2

    thumb_path = results1.content.path
    file_path = results2.content.path

    getMessageAndSend(true,'',{url:`https://cdn.jsdelivr.net/gh/${config.user}/${config.repo}/${file_path}`},res)
  })
});
module.exports=router