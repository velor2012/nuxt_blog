const { User, ResMessage } = require("../models/models");
let git_config = require('../config.json').github
const jwt = require("jsonwebtoken");
const request = require("request")
const config = require("../config.json");
SECRET = config.SECRET;

const auth =  (req, res, next) => {
  const raw = String(req.headers.authorization)
    .split(" ")
    .pop();
  let result = jwt.verify(raw, SECRET,(err, decoded)=>{
    if(decoded){
      // console.log(data)
      next();
    }else{
    // console.log('err %O',err)
    resMessage = new ResMessage();
    resMessage.success = false;
    resMessage.reason = "tooken校验出错";
    resMessage.other = err;
    res.send(resMessage);
    }
  });
};

const getMessageAndSend = function(success, reason, other, res) {
  let resMessage = new ResMessage();
  resMessage.success = success;
  resMessage.reason = reason;
  resMessage.other = other;
  res.send(resMessage);
};

//读取文件夹下文件的名字
const fs = require("fs");

const path = require("path");

const getAllFiles = function(mypath = ".") {
  const items = fs.readdirSync(mypath);
  let result = [];
  // 遍历当前目录中所有的文件和文件夹
  items.map(item => {
    let temp = path.join(mypath, item);
    // 若当前的为文件夹
    if (fs.statSync(temp).isDirectory()) {
      // result.push( item ); // 存储当前文件夹的名字
      // 进入下一级文件夹访问
      result = result.concat(getAllFiles(temp));
    } else {
      result = result.concat(temp);
    }
  });
  return result;
};

/**
 * @param { delPath：String } （需要删除文件的地址）
 * @param { direct：Boolean } （是否需要处理地址）
 */
const deleteFile = function(delPath, direct = true) {
  delPath = direct ? delPath : path.join(__dirname, delPath);
  let result = false;
  try {
    /**
     * @des 判断文件或文件夹是否存在
     */
    if (fs.existsSync(delPath)) {
      fs.unlinkSync(delPath);
      result = true;
    } else {
      console.log("inexistence path：", delPath);
    }
  } catch (error) {
    console.log("del error", error);
  } finally {
    return result;
  }
};

//删除文章时递归删除所有图片
const deleteArticleAllImage = async function(id,url){
  let result1 = await octokit.repos.getContents({
    owner:git_config.user,
    repo:git_config.repo,
    path:`blog/${id}`,
  }).catch(err=>console.log(err))

  console.log(result1.data)
  // return 
  let promises = []
  for(let i = 0 ; i < result1.data.length ; i ++){
    if(result1.data[i].type!='file'){continue}
    promises.push(octokit.repos.deleteFile({
      owner:git_config.user,
      repo:git_config.repo,
      path:result1.data[i].path,
      sha:result1.data[i].sha,
      message:'test'
    }).catch(err=>console.log(err)))
    let result = await Promise.all(promises)
    result.map(res=>console.log(res.data))
  }
  return 'ok'
}

module.exports = { auth, jwt, getMessageAndSend, getAllFiles, deleteFile,deleteArticleAllImage };
