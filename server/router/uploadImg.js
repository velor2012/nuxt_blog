const express = require('express')

const router = express.Router()
const {auth,jwt} = require('../util/util')

var multer = require('multer');//引入multer
var path = require('path')
//uuid工具可以生成唯一标示 需要安装
var UUID = require('uuid')
const {getMessageAndSend} = require('../util/util')
//设置保存规则
var storage_blog = multer.diskStorage({
    //destination：字段设置上传路径，可以为函数
    // destination: path.resolve(__dirname, '/'),
    destination:'static/blogimg',
    //filename：设置文件保存的文件名
    filename: function(req, file, cb) {
        let extName = file.originalname.slice(file.originalname.lastIndexOf('.'))
        let fileName = UUID.v1()
        cb(null, fileName + extName)
    }
})

var upload_blog = multer({storage: storage_blog,dest: '.'}).single('file');

router.post('/upload/blog',auth, (req, res)=>{

    upload_blog(req,res,(err)=>{
        if(err){//上传时发生错误
            getMessageAndSend(false,'err',{error:err},res)
        }else{
            getMessageAndSend(true,'',{path:req.file.path.replace('static','').replace(/\\/g,'/')},res)
        }
    })

})

//上传到表情包文件夹

//设置保存规则
var storage_blog = multer.diskStorage({
    //destination：字段设置上传路径，可以为函数
    // destination: path.resolve(__dirname, '/'),
    destination:'static/emoji',
    //filename：设置文件保存的文件名
    filename: function(req, file, cb) {
        let extName = file.originalname.slice(file.originalname.lastIndexOf('.'))
        let fileName = `emoji-${UUID.v1()}`
        cb(null, fileName + extName)
    }
})

var upload_blog = multer({storage: storage_blog,dest: '.'}).single('file');

router.post('/upload/emoji',auth, (req, res)=>{

    upload_blog(req,res,(err)=>{
        if(err){//上传时发生错误
            getMessageAndSend(false,'err',{error:err},res)
        }else{
            getMessageAndSend(true,'',{path:req.file.path.replace('static','').replace(/\\/g,'/')},res)
        }
    })

})
module.exports=router