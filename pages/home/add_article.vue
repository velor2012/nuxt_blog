<template>
  <div class="publish_body">
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
                <!-- <div class="mavonEditor"> -->
            <client-only><markdown v-model="article.content" :height="-1" :autoSave="auto_save" ref=md :toolbars="toolbars" @on-upload-image="imgAdd" @on-save="save"/></client-only>
                    <!-- <client-only><markdown ref=md :toolbars="markdownOption" v-model="article.content" @save="save" @imgAdd="$imgAdd" @imgDel="$imgDel" style="min-height:20em;z-index:0"/></client-only> -->
                <!-- </div> -->
            <Button type="primary" id='publish_button' @click.native="publish">发布</Button>
        </Col>
          <!-- 右侧 -->
          <Col span="4" offset="1" class="right">
                <TOC :toc="toc"/>
          </Col>
      </Row>
  </div>
</template>
<script>
const {message} = require('../message.js')
const {check_article,imgupload} = require('../tool.js')
import Types from '~/components/Types.vue'
import TOC from '~/components/TOC.vue'
import emoji from '~/components/emoji.vue'
export default {
    name:'add_article',
    data() {
        return {
            auto_save:true,
            article:{title:'',content:'',type:''},
            old_article:{title:'',content:'',type:''},
            toc:[],
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
        publish(){
            check_article(this.article,this,message).then(data=>{//data是Boolean,表示文章是否通过检查
                if(data){
                    this.$axios.post('api/article',this.article).then(res=>{
                        if(res.data.success){
                            message.success(this,true,'发布成功')
                            this.update_old_article()
                        }else{
                            message.success(this,true,'发布失败',res.data.reason)
                        }
                    })
                }else{return false}
            })
        },
            // 绑定@imgAdd event
        imgAdd(file){
            imgupload(file,this)
        },
        imgDel(pos, $file){
            
        },
        save(){
            if(!this.ischange()){return null}
            this.getTOC()
            check_article(this.article,this,message).then(data=>{
                if(data){
                    let draft = this.article
                    draft.ispublished=false
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
                            message.error(this,true,'查询草稿失败',res.data.reason)
                        }
                    }) 
                }
            })
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
    },
    created(){
    },
    computed:{
        types(){
            return this.$store.getters.getTypes
        }
    }
}
</script>
<style lang="less">
    .publish_body .ivu-input{
        margin: 1em 0em 1em 0em
    }
    .title {
        font-size: 21px;
        font-weight: bold;
    }
    .publish_body{
        padding: 2em 2em 2em 2em
    }
    #publish_button{
        margin-top:1em;
        float:right;
    }
    .publish_body .right{
        margin-top: 3em
    }
</style>