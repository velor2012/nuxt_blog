<template>
  <div class="draft_body">
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
                            <Types :types="types" :model="draft"/>
                        </Col>
                    </Row>
                    <Input v-model="draft.title" placeholder="在此输入文章标题" name="article_title"></Input>
                </Col>
                <Col span="12" style="text-align:center">
                    <emoji />
                </Col>
            </Row>
                 
                 <!-- <div class="mavonEditor"> -->
                        <client-only><markdown :height="-1" class="markdown" :interval=60*1000 v-model="draft.content" ref=md :autoSave="auto_save" :toolbars="toolbars" @on-upload-image="imgAdd" @on-save="save"/></client-only>
                 <!-- </div> -->
                <Button type="primary" id='update_button' @click.native="update_publish">发布/修改</Button>
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
const {check_draft,imgupload,selection} =require('../../tool')
const {message} =require('../../message')
import Types from '~/components/Types.vue'
import TOC from '~/components/TOC.vue'
import emoji from '~/components/emoji.vue'
export default {
    name:'edit_draft',
  data() {
    return {
        baseurl : 'api/draft/',
        subfield:false,
        auto_save:true,
        draft:{title:'',content:'',type:''},
        old_draft:{title:'',content:'',type:''},
        toolbars:{
            save:true,
            clear:true,
            uploadImage:true,
            //有bug，不要打开
            fullscreen:false,
        },
        id:'',
        toc:{'1':[''],'2':[''],'3':['']},
        selection:selection,
    }
  },
  components:{
      Types,
      TOC,
      emoji
  },
  methods:{
      update_publish(){
        if(!check_draft(this.draft,this,message)){return false}
        if(this.draft.ispublished){
            //获取已经发布的文章id
            this.$axios.get('api/article/title='+this.draft.title).then(res=>{
                if(res.data.success){
                    //存在该文章的草稿
                    if(res.data.other.find){
                        let id = res.data.other.article._id
                        let url = 'api/article/'+'id='+id
                        this.$axios.put(url,this.draft).then(res=>{
                            if(res.data.success){
                                message.success(this,true,'修改成功')
                                //修改成功后删除原来的草稿
                                this.update_old_draft()
                                this.delete()
                                this.$router.push('/home/draft_table')
                            }else{
                                message.error(this,true,'修改失败',res.data.reason)
                            }
                        })
                    }else{
                        message.error(this,true,'未找到该文章',res.data.reason)
                    }
                }else{message.error(this,true,'发生错误',res.data.reason)}
            })
        }else{
            this.$axios.post('api/article',this.draft).then(res=>{
                if(res.data.success){
                    message.success(this,true,'发布成功')
                    //发布成功后删除原来的草稿
                    this.update_old_draft()
                    this.delete()
                    this.$router.push('/home/draft_table')
                }else{
                    message.error(this,true,'发布失败',res.data.reason)
                }
            })
        }
      },
            // 绑定@imgAdd event
        imgAdd(file){
            imgupload(file,this)
        },
        $imgDel(pos, $file){
            
        },
        save({value, theme}){
            if(!this.ischange()){return null}
            let draft = this.draft
            this.getTOC()
            this.$axios.put('api/draft/id='+draft._id,draft).then(res=>{
                if(res.data.success){
                    message.success(this,true,'保存成功')
                    this.update_old_draft()
                }else{
                    message.error(this,false,'保存失败',res.data.reason)
                }
            })
        },
        getTOC(){
            this.toc=[]
            let markdown_html=''
            if (process.browser){
                markdown_html = marked(this.draft.content)
            }
            let res = ''
            var patt = /<h(\d)?\s+id="(.*?)">/g;;
            while (res = patt.exec(markdown_html)) {
                this.toc.push({layer:res[1],text:res[2]});
            }
        },
        delete(){
            let url = this.baseurl + 'id='+this.draft._id
            this.$axios.delete(url).then(res => {
                if(res.data.success){
                    message.success(this,true,'删除成功')
                }else{
                    message.error(this,true,'删除失败',res.data.reason)
                }
            })
        },
        update_old_draft(){
            this.old_draft.title = this.draft.title
            this.old_draft.content = this.draft.content
            this.old_draft.type = this.draft.type
        },
        ischange(){
            let a = this.old_draft.title==this.draft.title
            let b = this.old_draft.content==this.draft.content
            let c = this.old_draft.title==this.draft.title
            return !(a && b && c)   
        },
        async getDraftById(id){
            var url = this.baseurl + 'id='+id
            await this.$axios.get(url).then(res => {
                if(res.data.success){        
                    this.draft = res.data.other.draft
                }else{
                    message.error(this,true,'找不到该草稿',res.data.reason)
                }
            })
        },
    },
    created(){
        if(this.$route.params.id){ 
            this.id = this.$route.params.id
            this.getDraftById(this.id).then(res=>{
                this.update_old_draft()
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
    .draft_body .ivu-input{
        margin: 1em 0em 1em 0em
    }
    .title {
        font-size: 21px;
        font-weight: bold;
    }
    .draft_body{
        padding: 2em 0em 0em 2em
    }
    #change_to_button,#update_button{
        margin-top:1em;
        float:right;
    }
    .draft_body .right{
        margin-top: 3em
    }
    .markdown{
        max-height: 0%;
    }
</style>