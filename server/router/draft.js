
const {User,Draft} = require('../models/models')

const express = require('express')

const router = express.Router()

const {auth,jwt,getMessageAndSend} = require('../util/util')


router.get('/draft/pageSize=:pageSize&page=:page',async(req,res)=>{
    let pageSize = Number(req.params.pageSize)
    let page = Number(req.params.page)
    // page从1开始，所以需要减1
    const draft = await Draft.find({},{'content':0}).limit(pageSize).skip(pageSize*(page-1))
    getMessageAndSend(true,'',{draft:draft},res)
})
router.get('/draft/total',async(req,res)=>{
    const total = await Draft.find({},{'content':0}).countDocuments()
    getMessageAndSend(true,'',{total:total},res) 
})
router.get('/draft',async(req,res)=>{
    const draft = await Draft.find()
    getMessageAndSend(true,'',{draft:draft},res) 
})
router.get('/draft/id=:id',async(req,res)=>{
    const draft = await Draft.findById(req.params.id)
    getMessageAndSend(true,'',{draft:draft},res)
})
router.get('/draft/title=:title',async(req,res)=>{
    const draft = await Draft.findOne({title:req.params.title})
    if(draft!=null){
        getMessageAndSend(true,'',{find:true,draft:draft},res)
    }else{
        getMessageAndSend(true,'未找到该文章',{find:false,draft:null},res)      
    }
})
router.delete('/draft/id=:id',auth,async(req,res)=>{
    const draft = await Draft.findByIdAndDelete(req.params.id)
    getMessageAndSend(true,'',{draft:draft},res)
})
router.put('/draft/id=:id',auth,async(req,res)=>{
    const draft = await Draft.findByIdAndUpdate(req.params.id,{
        'title':req.body.title,
        'content':req.body.content,
        'type':req.body.type,
        'updateTime':Date.now(),
    },{new:true})//返回新的数据
    getMessageAndSend(true,'',{draft:draft},res)
})
router.post('/draft',auth,async(req,res)=>{
    const a = await Draft.findOne({title:req.body.title})
    if(a!=null){
        getMessageAndSend(false,'draft duplicate',{draft:a},res)
    }else{
        const draft = await Draft.create({
            title:req.body.title,
            content:req.body.content,
            type:req.body.type,
            ispublished:req.body.ispublished,
            createTime:Date.now(),
            updateTime:Date.now()
        })
        getMessageAndSend(true,'',{draft:draft},res)
    }
})
module.exports=router