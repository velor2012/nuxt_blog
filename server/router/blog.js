
const {User,Article} = require('../models/models')

const express = require('express')

const router = express.Router()

const {auth,jwt,getMessageAndSend} = require('../util/util')
const toc = require('markdown-toc');
const moment = require('moment');

router.get('/article/pageSize=:pageSize&page=:page',async(req,res)=>{
    let pageSize = Number(req.params.pageSize)
    let page = Number(req.params.page)
    // page从1开始，所以需要减1
    const article = await Article.find({},{'content':0}).limit(pageSize).skip(pageSize*(page-1))
    getMessageAndSend(true,'',{article:article},res)
})
router.get('/article/total',async(req,res)=>{
    const total = await Article.find({},{'content':0}).countDocuments()
    getMessageAndSend(true,'',{total:total},res)
})
router.get('/article',async(req,res)=>{
    const article = await Article.find()
    getMessageAndSend(true,'',{article:article},res)
})
router.get('/article/title=:title',async(req,res)=>{

    const article = await Article.findOne({title:req.params.title})
    if(article!=null){
        getMessageAndSend(true,'',{find:true,article:article},res)
    }else{
        getMessageAndSend(true,'',{find:false,article:null},res)   
    }
})
router.get('/article/id=:id',async(req,res)=>{
    const article = await Article.findById(req.params.id)
    getMessageAndSend(true,'',{article:article},res)
})
router.get('/article/html/id=:id',async(req,res)=>{
    const article = await Article.findById(req.params.id)
    let con = toc(article.content).content;
    getMessageAndSend(true,'',{article:article,con:con},res)
})
router.get('/article/toc',async(req,res)=>{
    console.log(req.query)
    let con = toc('req.query.article.content').content;
    getMessageAndSend(true,'',{con:con},res)
})
router.get('/article/all_type',async(req,res)=>{
    const agg = await Article.aggregate([{$group:{
        _id:"$type",
        count:{ $sum : 1}
    }}])
    getMessageAndSend(true,'',{agg:agg},res)
})
let count =  0
router.get('/article/complex',async(req,res)=>{
    let query_date = {}
    let query_type = {}
    let pageSize = 1
    let page = 1
    //是否需要返回符合条件的文章数
    let need_total = false
    let total = 0
    if(req.query.date){
        let date = new Date(new moment(new Date(req.query.date)))
        let date2 = new Date(new moment(new Date(req.query.date)).add(1, 'M'))
        query_date = {createTime: {$gte: date,$lt: date2}}
    }
    if(req.query.type && req.query.type != 'total'){
        query_type = {type:req.query.type}
    }
    if(req.query.page && req.query.pageSize){
        page = Number(req.query.page)
        pageSize = Number(req.query.pageSize)
    }
    if(req.query.need_total){
        need_total = true
    }
    let query = {...query_date,...query_type}
    try{
        // console.log('query %O',query)
        // console.log('pageSize %O',pageSize)
        const article = await Article.find(query,{'content':0}).limit(pageSize).skip(pageSize*(page-1))
        result = {article:article}
        if(need_total){
            total = await Article.find(query,{'content':0}).countDocuments()
            result = {...result,total:total}
        }
        getMessageAndSend(true,'',result,res)
    }catch(e){
        getMessageAndSend(false,e,{article:null},res)
    }
})

router.delete('/article/id=:id',auth,async(req,res)=>{
    const article = await Article.findByIdAndDelete(req.params.id)
    getMessageAndSend(true,'',{article:article},res)
})
router.put('/article/id=:id',auth,async(req,res)=>{
    const article = await Article.findByIdAndUpdate(req.params.id,{
        'title':req.body.title,
        'content':req.body.content,
        'type':req.body.type,
        'updateTime':Date.now(),
    },{new:true})//返回新的数据
    getMessageAndSend(true,'',{article:article},res) 
})
router.post('/article',auth,async(req,res)=>{
    const a = await Article.findOne({title:req.body.title})
    if(a!=null){
        getMessageAndSend(false,'article duplicate',{article:article},res)
    }else{        
        const article = await Article.create({
            title:req.body.title,
            content:req.body.content,
            type:req.body.type,
            createTime:Date.now(),
            updateTime:Date.now()
        })
        getMessageAndSend(true,'',{article:article},res)
    }
})
module.exports=router