const express = require('express')
const os = require('os')
const router = express.Router()
const {auth,jwt,getMessageAndSend} = require('../util/util')
const {User,ResMessage} = require('../models/models')

//关掉接口
// router.get('/user',async(req,res)=>{
//     const users = await User.find()
//     getMessageAndSend(true,'',{users:users},res)
// })
router.get('/user/id=:id',auth,async(req,res)=>{
    const users = await User.findById(req.params.id)
    getMessageAndSend(true,'',{users:users},res)
})
router.get('/user/username=:username',auth,async(req,res)=>{
    const users = await User.findOne({username:req.params.username})
    getMessageAndSend(true,'',{users:users},res)
})
router.delete('/user/id=:id',auth,async(req,res)=>{
    const users = await User.findByIdAndDelete(req.params.id)
    getMessageAndSend(true,'',{users:users},res)
})
router.put('/user/id=:id',auth,async(req,res)=>{
    const user = await User.findByIdAndUpdate(req.params.id,{
        'username':req.body.username,
        'password':req.body.password,
        'avatar':req.body.avatar,
        'info':req.body.info,
    },{new:true})//返回新的数据
    getMessageAndSend(true,'',{users:user},res)
})
router.put('/user/base_info/id=:id',auth,async(req,res)=>{
    const user = await User.findByIdAndUpdate(req.params.id,{
        // 'username':req.body.username,
        // 'password':req.body.password,
        'avatar':req.body.avatar,
        'info':req.body.info,
    },{new:true})//返回新的数据
    getMessageAndSend(true,'',{users:user},res)
})
router.get('/user/base_info/id=:id',async(req,res)=>{
    const user = await User.findById(req.params.id)
    getMessageAndSend(true,'',{users:user},res)
})
router.post('/user',auth,async(req,res)=>{
    const a = await User.findOne({username:req.body.username})
    resMessage = new ResMessage()
    if(a!=null){
        getMessageAndSend(false,'user duplicate',{users:users},res)
    }else{
        const user = await User.create({
            username:req.body.username,
            password:req.body.password,
            avatar:req.body.avatar,
            info:req.body.info,
        })
        getMessageAndSend(true,'',{users:user},res)
    }
})
module.exports=router