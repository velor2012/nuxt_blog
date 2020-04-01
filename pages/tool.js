const config = require("~/server/config.json")
let base_url =''
if(process.env.NODE_ENV !== 'production'){
    base_url = config.env_url
}else{
    base_url = config.prod_url
}
const randomColor = () => {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    // //在控制器中显示出随机生成的颜色(可以删除,无影响)
    // console.log("rgb("+r+","+g+","+b+")");
    //返回随机生成的颜色
    return "rgb(" + r + "," + g + "," + b + ")";
  };

const check_article = async function(article,app,message,need_check_titile=true,showMessage=true){
    if(article.type==null || article.type==""){ message.error(app,showMessage,'类型不能为空'); return false}
    if(article.content==null || article.content==""){ message.error(app,showMessage,'内容不能为空'); return false}
    if(article.tag==null || article.tag==""){ message.error(app,showMessage,'标签不能为空'); return false}
    if(article.resume==null || article.resume==""){ message.error(app,showMessage,'草稿不能为空'); return false}
    if(article.cover==null || article.cover==""){ message.error(app,showMessage,'封面不能为空'); return false}
    let result = true
    if(need_check_titile){
        await check_title(article.title,app,message,showMessage).then(data=>{
            result = data
        })
    }
    return result
}
const check_title = async function(title,app,message,showMessage=true){
    //检查标题是否重复或为空
    let result = false
    if(title==null || title==""){
        message.error(app,true,'标题不能为空')
        result = false
    }else{
        await app.$axios.get('api/article/title='+title).then(res=>{
            if(res.data.success){
                if(res.data.other.find){
                    message.error(app,showMessage,'文章标题重复',res.data.reason)
                    result = false
                }else{
                    result = true
                }
            }else{message.error(app,showMessage,'查询文章标题失败',res.data.reason); result = false}
        })
    }
    return result
}
const check_draft = function(article,app,message,showMessage=true){
    if(article.title==null || article.title==""){ message.error(app,showMessage,'标题不能为空'); return false}
    if(article.type==null || article.type==""){ message.error(app,showMessage,'类型不能为空'); return false}
    if(article.content==null || article.content==""){ message.error(app,showMessage,'内容不能为空'); return false}
    if(article.tag==null || article.tag==""){ message.error(app,showMessage,'标签不能为空'); return false}
    if(article.resume==null || article.resume==""){ message.error(app,showMessage,'草稿不能为空'); return false}
    if(article.cover==null || article.cover==""){ message.error(app,showMessage,'封面不能为空'); return false}
    return true
}
const imgupload = function($file,app){
    // 第一步.将图片上传到服务器.
    var formdata = new FormData();
    formdata.append('file', $file);
    app.$axios({
        url: 'api/upload/blog',
        method: 'post',
        data: formdata,
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => {
        // console.log(res.data)
        if(res.data.success){
            let path = res.data.other.path
            let url = base_url +path
            var name = path.split('/')
            name = name[name.length-1]
            let markdown_format_url = `![${name}](${url})`
            app.$refs.md.insertContent(markdown_format_url);
        }
    })
}
const uploadCroppedImage = async function(app,myCroppa,message) {
    let formdata = new FormData();
    let url = 'NaN'
    let error = false
    await myCroppa.promisedBlob('image/jpeg', 1) // 80% compressed jpeg file
    .then(blob=>{
        console.log(blob)
        if(!blob){
            message.error(app,true,'未选择图片','')
            error = true
        }
        formdata.append('file', blob);
    })
    console.log(error)
    if(error) return null
    await app.$axios({
        url: 'api/upload/blogCover',
        method: 'post',
        data: formdata,
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res=>{
        if(res.data.success){
            url = base_url + res.data.other.path
            return res.data.other.path
        }else{
            message.error(app,true,'封面上传失败',res.data.reason)
        }
    })
    return url
  }
export {check_article,check_draft,imgupload,base_url,randomColor,uploadCroppedImage}