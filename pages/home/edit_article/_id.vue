<template>
  <div class="edit_body">
      <Row>
          <!-- 左侧 -->
          <Col span="19">
            <Row>
                <Col span="12">
                    <Row>
                        <Col span="12">
                            <label for="title" class="title">文章标题</label>
                        </Col>
                        <Col span="12">
                            <Types :types="types" :model="article"/>
                        </Col>
                    </Row>
                    <Input v-model="article.title" placeholder="在此输入文章标题" name="article_title"></Input>
                </Col>
                <Col span="12" style="text-align:center">
                    <emoji />
                </Col>
            </Row>
                    <client-only><markdown :height="-1" v-model="article.content" :interval=60*1000 ref=md :autoSave="auto_save" :toolbars="toolbars" @on-upload-image="imgAdd" @on-save="save"/></client-only></client-only>
                <Button type="primary" id='update_button' @click.native="update">修改</Button>
          </Col>
          <!-- 右侧 -->
          <Col span="4" offset="1" class="right">
                <TOC :toc="toc"/>
          </Col>
          <BackTop></BackTop>
      </Row>
  </div>
</template>
<script>
const {check_article,imgupload} =require('../../tool')
const {message} = require('../../message')
import TOC from '~/components/TOC.vue'
import Types from '~/components/Types.vue'
import emoji from '~/components/emoji.vue'
export default {
    name:'edit_article',
  data() {
    return {
        baseurl : 'api/article/',
        subfield:false,
        auto_save:true,
        toc:[],
        article:{title:'',content:'',type:''},//不能设置为null，比较奇怪
        old_article:{title:'',content:'',type:''},
        toolbars:{
            save:true,
            clear:true,
            uploadImage:true,
            //有bug，不要打开
            fullscreen:false,
        },
      handbook:"#### 这是手册",
    }
  },
  components:{
      Types,
      TOC,
      emoji
  },
    methods:{
        update(){
            check_article(this.article,this,message,false).then(data=>{
                if(data){
                    let url = this.baseurl+'id='+this.article._id
                    this.$axios.put(url,this.article).then(res=>{
                        if(res.data.success){
                            message.success(this,true,'修改成功')
                            this.update_old_article()
                            this.$router.push('/home/article_table')
                        }else{
                            message.error(this,true,'修改失败',res.data.reason)
                        }
                    })
                }
            })
        },
        imgAdd(file){
            imgupload(file,this)
        },
        imgDel(pos, $file){
            console.log('file %s',file)
        },
        save(){
            if(!this.ischange()){return null}
            this.getTOC()
            let draft = this.article
            draft.ispublished=true
            this.$axios.get('api/draft/title='+draft.title).then(res=>{
                if(res.data.success){
                    //存在该文章的草稿
                    if(res.data.other.find){
                        let id = res.data.other.draft._id
                        this.$axios.put('api/draft/id='+id,draft).then(res=>{
                                if(res.data.success){
                                    message.success(this,true,'保存成功')
                                    this.update_old_article()
                                }else{
                                    message.error(this,true,'保存失败',res.data.reason)
                                }
                            })
                    }else{
                        this.$axios.post('api/draft',draft).then(res=>{
                            if(res.data.success){
                                message.success(this,true,'保存成功')
                                this.update_old_article()
                            }else{
                                message.error(this,true,'保存失败',res.data.reason)
                            }
                        })
                    }
                }else{
                    message.error(this,true,'失败',res.data.reason)
                }
            }) 

        },
        getTOC(){
            this.toc=[]
            let markdown_html=''
            if (process.browser){
                markdown_html = marked(this.article.content)
            }
            let res = ''
            var patt = /<h(\d)?\s+id="(.*?)">/g;;
            while (res = patt.exec(markdown_html)) {
                this.toc.push({layer:res[1],text:res[2]});
            }
        },
        update_old_article(){
            this.old_article.title = this.article.title
            this.old_article.content = this.article.content
            this.old_article.type = this.article.type
        },
        ischange(){
            let a = this.old_article.title==this.article.title
            let b = this.old_article.content==this.article.content
            let c = this.old_article.title==this.article.title
            return !(a && b && c)   
        },
        async getDraftById(id){
            var url = this.baseurl + 'id='+id
            await this.$axios.get(url).then(res => {
                if(res.data.success){        
                    this.article = res.data.other.article
                }else{
                    message.error(this,true,'找不到该文章',res.data.reason)
                }
            })
        },
    },
    created(){
        if(this.$route.params.id){ 
            this.id = this.$route.params.id
            this.getDraftById(this.id).then(res=>{
                this.update_old_article()
                this.getTOC()
            })
        }
    },
    computed:{
        types(){
            return this.$store.getters.getTypes
        }
    }
}
</script>
<style lang="less">
    .edit_body .ivu-input{
        margin: 1em 0em 1em 0em
    }
    .title {
        font-size: 21px;
        font-weight: bold;
    }
    .edit_body{
        padding: 2em 0em 0em 2em
    }
    #change_to_button,#update_button{
        margin-top:1em;
        float:right;
    }
    .edit_body .right{
        margin-top: 3em
    }
    .mavonEditor{
        max-height: 20em
    }
</style>