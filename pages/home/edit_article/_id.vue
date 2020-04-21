<template>
  <div class="edit_body">
      <Row>
          <!-- 左侧 -->
        <Col span="19">
        <Row>
            <Col span="12">
                <Col span="12">
                <label for="title" class="title">文章标题</label>
                <Input
                    v-model="article.title"
                    placeholder="在此输入文章标题"
                    name="article_title"
                ></Input>
                </Col>
                <Col span="12" style="text-align:center">
                <emoji />
                <Types :types="types" :model="article" style="margin-top:1em" />
                </Col>
                <Col span="24" style="margin-top:1em">
                <Modal
                    v-model="showAddTag"
                    @on-ok="addTag2"
                    draggable
                    scrollable
                    title="添加标签"
                >
                    <Input
                    @keyup.enter.native="addTag2"
                    v-model="tag_add"
                    placeholder="请输入标签名称"
                    />
                </Modal>
                <Tag
                    v-for="(item, i) in tags"
                    :key="i"
                    :name="item"
                    :color="colors[i]"
                    closable
                    @on-close="deleteTag"
                    >{{ item }}</Tag>
                <Button
                    icon="ios-add"
                    type="dashed"
                    size="small"
                    @click="addTag"
                    >添加标签</Button>
                </Col>
                <Col span="24">
                <Input
                    v-model="article.resume"
                    type="textarea"
                    placeholder="请输入简介"
                    :autosize="{minRows: 5,maxRows: 10}"
                />
                </Col>
            </Col>
            <Col span="12" style="text-align:center">
                <croppa
                v-model="croppa"
                :width="430"
                :height="240"
                :quality="3"
                placeholder="Choose an image"
                :placeholder-font-size="0"
                :disabled="false"
                :prevent-white-space="true"
                :show-remove-button="true"
                initial-size="contain"
                >
                <img
                    crossOrigin="anonymous"
                    :src="article.cover"
                    slot="initial"
                />
                </croppa>
                <div style="padding-bottom:0.5em" >
                    <Button class="upload-cover" type="primary" @click="uploadCoverAndSet">上传已选择的封面</Button>
                </div>
            </Col>
            </Row>
        <client-only
          ><markdown
            v-model="article.content"
            :height="-1"
            :autoSave="auto_save"
            ref="md"
            :toolbars="toolbars"
            @on-upload-image="imgAdd"
            @on-save="save"
        /></client-only>
        <!-- <client-only><markdown ref=md :toolbars="markdownOption" v-model="article.content" @save="save" @imgAdd="$imgAdd" @imgDel="$imgDel" style="min-height:20em;z-index:0"/></client-only> -->
        <!-- </div> -->
        <Button type="primary" id="update_button" @click.native="update"
          >修改</Button
        >
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
const {  mapMutations,mapGetters } = require("vuex");
const {check_article,imgupload,uploadCroppedImage} =require('../../tool')
const {message} = require('../../message')
import TOC from '~/components/TOC.vue'
import Types from '~/components/Types.vue'
import emoji from '~/components/emoji.vue'
import { check_draft } from '../../tool'
export default {
    name:'edit_article',
  data() {
    return {
        baseurl : 'api/article/',
        subfield:false,
        auto_save:true,
        toc:[],
        article:{title:'',content:'',type:'',resume: "",tag: "",cover: ""},//不能设置为null，比较奇怪
        old_article:{title:'',content:'',type:'',resume: "",tag: "",cover: ""},
        toolbars:{
            save:true,
            clear:true,
            uploadImage:true,
            //有bug，不要打开
            fullscreen:false,
        },
      //下面几个是标签有关的变量
      tags: [],
      tag_add: "",
      showAddTag: false,
      //封面图片
      croppa: {},
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
            if (check_draft(draft, this, message, false)) {
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
            }
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
        update_old_article() {
            this.old_article.title = this.article.title;
            this.old_article.content = this.article.content;
            this.old_article.type = this.article.type;
            this.old_article.tag = this.article.tag;
            this.old_article.resume = this.article.resume;
            this.old_article.cover = this.article.cover;
        },
        ischange() {
            let a = this.old_article.title == this.article.title;
            let b = this.old_article.content == this.article.content;
            let c = this.old_article.title == this.article.title;
            let d = this.old_article.tag == this.article.tag;
            let e = this.old_article.cover == this.article.cover;
            let f = this.old_article.resume == this.article.resume;
            return !(a && b && c && d && e && f);
        },
        async getArticleById(id){
            var url = this.baseurl + 'id='+id
            let result = ''
            await this.$axios.get(url).then(res => {
                if(res.data.success){        
                    result = res.data.other.article
                }else{
                    message.error(this,true,'找不到该文章',res.data.reason)
                }
            })
            return result
        },
        addTag() {
            this.showAddTag = true;
        },
        addTag2() {
            this.tags.push(this.tag_add);
            this.tag_add = "";
            this.showAddTag = false;
        },
        deleteTag(event, name) {
            const index = this.tags.findIndex(tags => tags == name);
        if (index > -1) {
            this.tags.splice(index, 1);
        }
        },
        uploadCoverAndSet(){
            //urls包含原图url和缩略图url
            uploadCroppedImage(this, this.croppa, message)
        },
        ...mapMutations("login", ["_login", "_exit", "setUserName", "setToken"])
     },
    created(){
        if(this.$route.params.id){ 
            this.id = this.$route.params.id
            this.getArticleById(this.id).then(res=>{
                this.article = res
                this.tags = this.article.tag.split(',')
                this.update_old_article()
                this.getTOC()
            })
        }
    },
    computed:{
        types(){
            return this.$store.getters.getTypes
        },
        colors(){
            return this.$store.getters.getColors
        },
        ...mapGetters("login", ["getToken"])
    },
    watch:{
        tags: {
    　　　　handler(newValue, oldValue) {
            //把tags组成一个逗号分隔的字符串
            this.article.tag = ''
            newValue.map(item=>{
            this.article.tag += item+','
            })
            //去掉最后一个字符
            this.article.tag = this.article.tag.slice(0,this.article.tag.length-1)
    　　　　},
    　　　　deep: true
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