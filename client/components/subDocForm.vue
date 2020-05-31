<template>
    <div>
        <el-row type="flex" class="mb-3">
            <!-- TODO;序号需要唯一 -->
            <el-col :span="3" class="text-bold text-center d-flex ai-center">
            已有序号: 
            </el-col>
            <el-col :span="2" 
            v-for="(item,idx) in exitOrders"
            :key="idx"
            >
                <el-tag>{{item}}</el-tag>
            </el-col>

        </el-row>
        <el-form
            :model="formdata"
            status-icon
            :rules="rules"
            :ref="formName"
            label-width="100px"
            class="demo-ruleForm"
            label-position="left"
        >
            <el-form-item label="子文档名" prop="title">
                <el-input type="input" v-model="formdata.title" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="序号" prop="order">
                <el-input type="input" v-model.number="formdata.order" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <el-row type="flex" justify="center">
            <markdown-editor :page="page" :originContent.sync="originContent" ref="markdown" />
        </el-row>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, PropSync } from "nuxt-property-decorator";
import { SubDoc, Note } from '../types/Note';
import MarkdownEditor from "~/components/markdown.vue";
import { ElForm } from "element-ui/types/form";
import _ from 'lodash';
import MyNoteAPI from "../api/note";
import imgUploadParam from "../types/uploadImg";
import Bus from '~/assets/utils/utils';
@Component({
    components: {
        MarkdownEditor
    }
})
export default class SubDocPage extends Vue {
    page="subDocPage"
    originContent: string = "";
    @Prop({ type: Object, required: true }) readonly note: Note;
    @PropSync('idx',{ type: Number, required: false }) readonly syncidx?: number;
    formdata: SubDoc = new SubDoc();
    formName: string = "subdoc_form";
    contentUploadParam: imgUploadParam = new imgUploadParam("contentImg");
    exitOrders: Number[] = [];
    originEditedItemOrder:Number
    rules: any = {
        title: [{ required: true, trigger: "blur" },
            // { validator: this.validateTitle, trigger: "blur" }
        ],
        order: [{ required: true, trigger: "blur" },
            // { validator: this.validateOrder, trigger: "blur" }
        ]
    };
    _validate():boolean{
        let res = null;
        (this.$refs[this.formName] as ElForm).validate(valid => {
            if (valid) {
                res = true;
                return true;
            } else {
                res = false;
                return false;
            }
        });
        return res
    }
    validateOrder(rule: any, value: any, callback: any) {
        //当前编辑的子文档序号可以和自己原先的一样 
        let regPos = /^[1-9]\d*$/
        if (regPos.test(value)) {
            let isExits = this.exitOrders.find((v,index)=>{
                if(index == this.syncidx) return false
                return v==Number(value);
            });
            isExits && callback(new Error("序号已存在"));
            callback();
        } else {
            callback(new Error("请输入正整数"));
        }
    }
    validateTitle(rule: any, value: any, callback: any) {
        //当前编辑的子文档序号可以和自己原先的一样 
        let res = this.note.subDoc.find((v,index)=>{
            if(index == this.syncidx) return false
            return v.title == this.note.subDoc[this.syncidx].title
        })
        Boolean(res)?callback(new Error("子文档名重复")):callback()
    }
    flush(){
        let editor = _.get(this,'$refs.markdown.contentEditor')
        if(!editor){
            return false
        }
        this.formdata.content = editor.getValue()
        return true
    }
    _clear(){
        this.formdata = new SubDoc();
        this.originEditedItemOrder = undefined
        this.originContent = ""
        this.$refs[this.formName] && (this.$refs[this.formName] as ElForm).resetFields()
    }
    @Watch('syncidx')
    onNoteChage(syncidx:number){
        this.exitOrders = this.note.subDoc.map(v=>v.order)
    }
    @Watch('syncidx')
    onIdxChange(syncidx:number){
        if(syncidx!=null&&Number(syncidx)>-1 && Number(syncidx)<this.note.subDoc.length){
            this.formdata = {...this.note.subDoc[syncidx]}
            this.originContent = this.formdata.content
            this.originEditedItemOrder = this.formdata.order
        }
    }
    mounted(){
        if(this.syncidx!=null && Number(this.syncidx)>-1 && Number(this.syncidx)<this.note.subDoc.length){
            this.formdata = {...this.note.subDoc[this.syncidx]}
            this.originContent = this.formdata.content
            this.originEditedItemOrder = this.formdata.order
        }
        // if(this.note){
        //     this.onNoteChage(this.note)
        // }
    }
    uploadImg(files: File[]){
        if(this.note._id){
            this.contentUploadParam.id = this.note._id
        }
        let res =  MyNoteAPI.uploadImg(MyNoteAPI.imgUploadURL,this.$axios,files[0],this.contentUploadParam).then(res=>{
            if(res.success){
                this.$message.success('上传成功')
                let editor = _.get(this,'$refs.markdown.contentEditor')
                    if(!editor){
                        this.$message.error('插入图片失败')
                    }else{
                        editor.insertValue(`![${res.data.filePath}](${res.data.filePath})`)
                    }
            }else this.$message.error('上传失败')
        })
    }
    addBusEvent(){
        Bus.$on(`uploadImg_${this.page}`,this.uploadImg)
    }
    removeBusEvent(){
        Bus.$off(`uploadImg_${this.page}`)
    }
    //在vue对象的beforeDestroy钩子中调用以上函数
    beforeDestroy() {
        this.removeBusEvent()
    }
}
</script>