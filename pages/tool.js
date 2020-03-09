const config = require("~/server/config.json")
let base_url =''
if(process.env.NODE_ENV !== 'production'){
    base_url = config.env_url
}else{
    base_url = config.prod_url
}

const check_article = async function(article,app,message,need_check_titile=true){
    if(article.type==null || article.type==""){ message.error(app,true,'类型不能为空'); return false}
    if(article.content==null || article.content==""){ message.error(app,true,'内容不能为空'); return false}
    let result = true
    if(need_check_titile){
        await check_title(article.title,app,message).then(data=>{
            result = data
        })
    }
    return result
}
const check_title = async function(title,app,message){
    //检查标题是否重复或为空
    let result = false
    if(title==null || title==""){
        message.error(app,true,'标题不能为空')
        result = false
    }else{
        await app.$axios.get('api/article/title='+title).then(res=>{
            if(res.data.success){
                if(res.data.other.find){
                    message.error(app,true,'文章标题重复',res.data.reason)
                    result = false
                }else{
                    result = true
                }
            }else{message.error(app,true,'查询文章标题失败',res.data.reason); result = false}
        })
    }
    return result
}
const check_draft = function(article,app,message){
    if(article.title==null || article.title==""){ message.error(app,true,'标题不能为空'); return false}
    if(article.type==null || article.type==""){ message.error(app,true,'类型不能为空'); return false}
    if(article.content==null || article.content==""){ message.error(app,true,'内容不能为空'); return false}
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
const selection = []
export {check_article,check_draft,imgupload,base_url,selection}