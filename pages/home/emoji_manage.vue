<template>
    <Card style="text-align:center">
        <p slot="title" style="fontWeight:bold">
            表情管理
        </p>
        <a href="#" slot="extra" @click.prevent="refresh">
            <Icon type="md-refresh" color="black" size=30></Icon>
        </a>
        <Row>
            <Col span="19">
                <Row type="flex" justify="start">
                    <Col
                    v-for="(emoji, i) in current_page_emojis"
                    :key="i"
                    :span="24/max_rol"
                    > 
                        <Tooltip placement="top-end" >
                            <div slot="content"><Icon type="md-trash" color="red" size=20 class="delete" @click="delete_emoji(emoji)"></Icon></div>
                            <Card :padding="0" class="emoji_card" @click.native="copyLink(emoji)">
                                <div style="text-align:center">
                                    <img v-lazy="emoji" class="emoji_img">
                                </div>
                            </Card>
                        </Tooltip>
                    </Col>
                </Row>
                <Page :total="emojis.length" :page-size="pageSize" @on-change="getCurrentPageEmoji" show-elevator style="margin-top:1.3em"/>
            </Col>
                <Col span="4" offset="1"> 
                    <Card :padding="0" class="emoji_card">
                        <div style="text-align:center">
                            <Upload
                                type="drag"
                                :action="base+'/'+upload_url"
                                :headers="{'Authorization':'token '+getToken}"
                                :show-upload-list="true"
                                :on-success="upload_success"
                                ref='upload'
                                >
                                <div style="padding: 20px 0">
                                    <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                                    <p>Click or drag files here to upload</p>
                                </div>
                            </Upload>
                        </div>
                    </Card>
                </Col>
        </Row>
    </Card>
</template>
<script>
import Vue from 'vue'
import VueLazyload from 'vue-lazyload'
import Clipboard from 'clipboard' 
const {mapGetters} = require('vuex')
Vue.use(VueLazyload)
const {base_url} = require('../tool')
const {message} =require('../message')
    export default {
        data(){
            return {
                emoji_url:'api/image/emoji',
                upload_url:'api/upload/emoji',
                max_row:5,
                max_rol:6,
                //保存表情的url
                emojis:[],
                current_page_emojis:[],
                base:base_url
            }
        },
        methods:{
            getCurrentPageEmoji(index){
                if(index*this.pageSize<this.emojis.length)
                    this.current_page_emojis=this.emojis.slice((index-1)*this.pageSize,index*this.pageSize)
                else{this.current_page_emojis=this.emojis.slice((index-1)*this.pageSize)}
            },
            delete_emoji(emoji){
                let splits = emoji.split('/')
                let name = splits[splits.length-1]
                this.$axios.delete(this.emoji_url,{data:{name:name}}).then((res)=>{
                    if(res.data.success){
                        this.refresh()
                        message.success(this,true,'删除成功')
                    }else{
                        message.error(this,true,'删除表情失败',res.data.reason) 
                    }
                })
            },
            refresh(){
                this.$axios.get(this.emoji_url).then((res)=>{
                    this.emojis=[]
                    this.current_page_emojis=[]
                    if(res.data.success){
                        let raw_path = res.data.other.result
                        raw_path.map(p=>{
                            this.emojis.push(base_url+p)
                        })
                        this.getCurrentPageEmoji(1)
                    }else{
                        message.error(this,true,'获取表情失败',res.data.reason) 
                    }
                })
            },
            upload_success(response, file, fileList){
                if(response.success){
                    message.success(this,true,'上传成功') 
                    this.$refs.upload.clearFiles()
                }else{
                    message.error(this,true,'上传失败',response.reason) 
                }
            },
            copyLink(emoji){
                let clipboard = new Clipboard(".emoji_card",{
                    text: function () {
                    let splits = emoji.split('/')
                    let name = splits[splits.length-1]
                    return `![${name}](${emoji})`
                    }
                });
                clipboard.on('success', ()=> {
                    message.success(this,true,'复制成功') 
                    clipboard.destroy();
                });
                clipboard.on('error', ()=> {
                    message.error(this,true,'复制失败') 
                    clipboard.destroy();
                });
            }
        },
        created(){
            this.refresh()
        },
        computed:{
            pageSize(){
                return this.max_row*this.max_rol
            },
            ...mapGetters('login',['getToken']),
        }
    }
</script>
<style lang="less">
    .emoji_img{
        width: 100%;
    }
    .emoji_img:hover{
        cursor: pointer;
    }
    .delete:hover{
        cursor: pointer;
    }
    .emoji_card{
        width:100%;
        height:8em;
    }
</style>