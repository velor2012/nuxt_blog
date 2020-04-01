const mongoose = require("mongoose")
const config = require('../config.json')
const {user,password,address,host,db} = config.mogoose_config

mongoose.connect(`mongodb://${user}:${password}@${address}:${host}/${db}`
,{useNewUrlParser:true,useCreateIndex:true,useUnifiedTopology:true})
mongoose.set('useFindAndModify', false);

const User = mongoose.model('User',new mongoose.Schema({
    username : {type:String,unique:true,required:true},
    realname : {type:String},
    password : {
        type:String,
        set(val){
            return require('bcrypt').hashSync(val,10)
        }
    },
    // 保存头像路径
    avatar: {type:String},
    info:{type:String}
    // sex:{type:String,        validate:(words)=>{return words=="male" || words=="female"}},
    // occupation:{type:String},
    // email:{type:String},
    // other:{type:String}
}))

const Article = mongoose.model('Article',new mongoose.Schema({
    title : {type:String,unique:true,required:true},
    content : {type:String,required:true},
    cover:{type:String,required:true},
    tag:{type:String,required:true},
    resume:{type:String,required:true},
    createTime:{type:Date},
    updateTime:{type:Date},
    type:{type:String,required:true}
}))

const Draft = mongoose.model('Draft',new mongoose.Schema({
    title : {type:String,unique:true,required:true},
    content : {type:String,required:true},
    type:{type:String,required:true},
    cover:{type:String,required:true},
    tag:{type:String,required:true},
    resume:{type:String,required:true},
    createTime:{type:Date},
    updateTime:{type:Date},
    ispublished:{type:Boolean}
}))

class ResMessage{
    constructor(success,reason){
        this.success=true;
        this.reason='';
        this.other=''
    }
}

module.exports = {User,Article,Draft,ResMessage}