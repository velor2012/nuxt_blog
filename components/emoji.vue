<template>
    <Affix :offset-top="50">
        <span class="demo-affix"> 
            <Poptip placement="bottom"  width="600">
                <Button shape="circle" type="warning" size="large" style="fontWeight:bold">插入表情</Button>
                <div slot="content">
                    <Row>
                        <Col span="24">
                            <Row type="flex" justify="start">
                                <Col
                                v-for="(emoji, i) in current_page_emojis"
                                :key="i"
                                :span="24/max_rol"
                                > 
                                    <Card :padding="0" class="emoji_card" @click.native="copyLink(emoji)">
                                        <div style="text-align:center">
                                            <img v-lazy="emoji" class="emoji_img">
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                            <Page :total="emojis.length" :page-size="pageSize" @on-change="getCurrentPageEmoji" show-elevator style="margin-top:1.3em"/>
                        </Col>
                    </Row>
                </div>
            </Poptip>
        </span>
    </Affix>
</template>
<script>
import Vue from 'vue'
import VueLazyload from 'vue-lazyload'
import Clipboard from 'clipboard'
Vue.use(VueLazyload)
const {base_url} = require('~/pages/tool')
const {message} =require('~/pages/message')
export default {
    name:'emoji',
    data(){
        return{
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
        // height:8em;
    }
</style>