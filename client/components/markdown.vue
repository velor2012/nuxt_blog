<template>
<div id="vditor">

</div>
</template>
<script lang="ts">
import "vditor/src/assets/scss/index.scss" // Or use dark
import {Component,Vue, Prop, Watch, PropSync, InjectReactive, Inject} from "nuxt-property-decorator"
import Vditor from 'vditor';
import Bus from '~/assets/utils/utils';
@Component({
components: {
}
})
export default class MarkdownEditor extends Vue {
    @PropSync('originContent',{ type: String, required: true }) readonly syncOriginContent: string ;
    @Prop({ type: String, required: true,default:'' }) readonly page: String;
    @Prop({ type: Boolean, required: false,default:true }) readonly showSaveButton: boolean;
    contentEditor:Vditor;
    originToolbar =['emoji' , 
    'headings' , 'bold' , 'italic' , 'strike' , '|' , 'line' , 'quote' , 'list' , 'ordered-list' , 'check' ,'outdent' ,'indent' ,
    'code' , 'inline-code' , 'insert-after' , 'insert-before' ,'undo' , 'redo' , 'upload' , 'link' , 'table' , 'record' , 'edit-mode' ,
     'both' , 'preview' , 'format' , 'fullscreen' , 'outline' , 'code-theme' , 'content-theme', 'export', 'devtools' , 'info' , 'help' , 'br'
    ]
    fullscreenSVG='<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1590562393008" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4046" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M895.872 96.512c0 0.256 0.128 0.448 0.128 0.64l0 253.696C896 369.216 881.6 384.192 864 384c-17.6 0.064-32.064-14.72-32.064-33.216L831.936 173.312 631.232 374.016c-12.928 12.992-33.664 13.44-46.08 0.832C572.672 362.368 572.992 341.76 585.984 328.704L786.752 128 609.152 128C590.848 128 575.872 113.6 576 96 576 78.4 590.72 64 609.28 64l253.632 0c0.192 0 0.384 0.064 0.576 0.128C863.616 64.064 863.744 64 863.936 64c7.232 0 13.632 2.944 19.008 7.168 1.216 0.896 2.56 1.472 3.584 2.496 0.32 0.32 0.448 0.704 0.768 1.024C892.544 80.384 896 87.744 896 95.936 896 96.128 895.872 96.32 895.872 96.512zM173.248 128l177.6 0C369.152 128 384.128 113.6 384 96 384 78.4 369.28 64 350.72 64L97.152 64C96.96 64 96.768 64.064 96.576 64.128 96.384 64.064 96.256 64 96.064 64 88.832 64 82.432 66.944 77.056 71.168c-1.152 0.896-2.56 1.472-3.584 2.496C73.216 73.984 73.088 74.432 72.768 74.688 67.456 80.384 64 87.744 64 95.936c0 0.192 0.128 0.384 0.128 0.576C64.128 96.768 64 96.96 64 97.216l0 253.696C64 369.216 78.4 384.192 96 384c17.6 0.064 32.064-14.72 32.064-33.216L128.064 173.312l200.704 200.704c12.928 12.992 33.664 13.44 46.08 0.832 12.48-12.416 12.16-33.088-0.832-46.144L173.248 128zM896 609.152C896 590.784 881.6 575.808 864 576c-17.6-0.064-32.064 14.72-32.064 33.216l0 177.472L631.232 585.984c-12.928-12.992-33.664-13.44-46.08-0.832C572.672 597.632 572.992 618.24 585.984 631.296L786.752 832 609.152 832C590.848 832 575.872 846.4 576 864 576 881.6 590.72 896 609.28 896l253.632 0c0.192 0 0.384-0.128 0.576-0.128S863.744 896 863.936 896c7.232 0 13.568-2.944 18.944-7.168 1.216-0.896 2.624-1.408 3.648-2.496 0.32-0.32 0.448-0.704 0.768-1.024C892.544 879.616 896 872.32 896 864.064c0-0.192-0.128-0.384-0.128-0.64 0-0.192 0.128-0.384 0.128-0.64L896 609.152zM350.848 832 173.248 832l200.768-200.704C387.008 618.24 387.328 597.632 374.784 585.216c-12.352-12.608-33.152-12.16-46.08 0.832l-200.704 200.704L128 609.216C128.064 590.72 113.6 575.936 96 576 78.4 575.808 64 590.784 64 609.152l0 253.696c0 0.256 0.128 0.448 0.128 0.64 0 0.256-0.128 0.448-0.128 0.64 0 8.256 3.456 15.552 8.768 21.248 0.256 0.32 0.384 0.704 0.704 1.024 1.024 1.088 2.432 1.6 3.584 2.496C82.496 893.056 88.832 896 96.064 896c0.192 0 0.32-0.128 0.512-0.128S96.96 896 97.152 896L350.72 896C369.28 896 384 881.6 384 864 384.128 846.4 369.152 832 350.848 832z" p-id="4047"></path></svg>'
    saveSVG='<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1590563847924" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1949" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M931.882 259.882l-167.764-167.764A96 96 0 0 0 696.236 64H160C106.98 64 64 106.98 64 160v704c0 53.02 42.98 96 96 96h704c53.02 0 96-42.98 96-96V327.764a96 96 0 0 0-28.118-67.882zM512 832c-70.692 0-128-57.308-128-128 0-70.692 57.308-128 128-128s128 57.308 128 128c0 70.692-57.308 128-128 128z m192-609.04V424c0 13.254-10.746 24-24 24H216c-13.254 0-24-10.746-24-24V216c0-13.254 10.746-24 24-24h457.04c6.366 0 12.47 2.528 16.97 7.03l6.96 6.96A23.992 23.992 0 0 1 704 222.96z" fill="" p-id="1950"></path></svg>'
    hideMenu=false;
    doneInit=false;
    timing = null;
    mounted () {
        let _this = this;
        this.$nextTick(()=>{
            let extToolbar = [...this.originToolbar,{hotkey: '⌘-⇧-H',  name:'sponsor',tipPosition: 's',tip: '隐藏顶部和右侧菜单',className: 'right',
                icon: this.fullscreenSVG, click:this.onHideMenuClick}]
            let Vditor = require('vditor')
            _this.contentEditor = new Vditor('vditor', {
                toolbarConfig: {
                pin: true,
                },
                cache: {
                    enable: false
                },
                counter:{
                    enable:true
                },
                upload:{
                    handler:this.uploadImg
                },
                toolbar:
                this.showSaveButton?[...extToolbar,{hotkey: '⌘-⇧-S',  name:'save',tipPosition: 's',tip: '保存到草稿箱',className: 'right',
                icon: this.saveSVG, click:this.save}]:extToolbar,
                outline:true,
                minHeight: 500,
            })
            this.contentEditor.setTheme('classic','light','xcode')
            this.flushOriginContent()
            this.doneInit=true
        })
    }
    @Watch('syncOriginContent')
    flushOriginContent(){
        this.timing && clearInterval(this.timing)
        try {
            this.contentEditor.setValue(this.syncOriginContent || '')
        } catch (error) {
            let _this = this;
            this.timing = setInterval(()=>{
                _this.flushOriginContent()
            },100)
        }
    }
    onHideMenuClick(){
        this.hideMenu = !this.hideMenu
        if(this.hideMenu){
            this.hidenHeaderAndSide()
        }else{
            this.showHeaderAndSide()
        }
    }
    showHeaderAndSide(){
        Bus.$emit('showHeader')
        Bus.$emit('showSide')
    }
    hidenHeaderAndSide(){
        Bus.$emit('hideHeader')
        Bus.$emit('hideSide')
    }
    save(){
        Bus.$emit(`save_${this.page}`)
    }
    beforeRouteLeave(to, from, next) {
        if(this.hideMenu){
            this.showHeaderAndSide()
        }
        next();
    }
    uploadImg(files: File[]){
        Bus.$emit(`uploadImg_${this.page}`,files);

        //加上这句代码就可以多次上传同一个文件
        (document.querySelector('div[data-type] input') as HTMLInputElement).value=''
    }
}
</script>
<style lang="scss">
[v-cloak] {
    display: none;
}
    .el-tabs__content{
        overflow: visible;
    }
    .el-tabs__nav{
        z-index: 1;
    }
</style>