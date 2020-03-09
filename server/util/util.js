const {User,ResMessage} = require('../models/models')

const jwt = require('jsonwebtoken')
const config = require('../config.json')
SECRET = config.SECRET

const auth = async(req,res,next)=>{
    const raw = String(req.headers.authorization).split(" ").pop()
    try {
        const {id} = jwt.verify(raw,SECRET)
        req.user = await User.findById(id)
        next()
    } catch (error) {
        resMessage = new ResMessage()
        resMessage.success = false,
        resMessage.reason = 'tooken校验出错'
        resMessage.other = error
        res.send(resMessage)
    }
}

const getMessageAndSend = function(success,reason,other,res){
    let resMessage = new ResMessage()
    resMessage.success = success,
    resMessage.reason = reason
    resMessage.other = other
    res.send(resMessage)
}


//读取文件夹下文件的名字
const fs = require('fs');

const path = require('path');

const getAllFiles = function(mypath='.'){
    const items = fs.readdirSync(mypath);
    let result = [];
    // 遍历当前目录中所有的文件和文件夹
    items.map(item => {
        let temp = path.join(mypath, item);
        // 若当前的为文件夹
        if( fs.statSync(temp).isDirectory() ){
            // result.push( item ); // 存储当前文件夹的名字
            // 进入下一级文件夹访问
            result = result.concat( getAllFiles( temp ) );
        }else{
            result = result.concat( temp);
        }
    });
    return result;
}

/**
 * @param { delPath：String } （需要删除文件的地址）
 * @param { direct：Boolean } （是否需要处理地址）
 */
const deleteFile= function(delPath, direct=true) {
    delPath = direct ? delPath : path.join(__dirname, delPath)
    let result = false
    try {
        /**
         * @des 判断文件或文件夹是否存在
         */
        if (fs.existsSync(delPath)) {
            fs.unlinkSync(delPath);
            result = true
        } else {
            console.log('inexistence path：', delPath);
        }
    } catch (error) {
        console.log('del error', error);
    } finally{
        return result
    }
}

module.exports = {auth,jwt,getMessageAndSend,getAllFiles,deleteFile}