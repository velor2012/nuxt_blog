<template>
    <div>
        <el-tabs type="border-card">
            <el-tab-pane label="基本信息">
                <el-form
                    :model="formdata"
                    status-icon
                    :rules="rules"
                    :ref="formName"
                    label-width="100px"
                    class="demo-ruleForm"
                >
                    <el-form-item label="文章标题" prop="title">
                        <el-input type="input" v-model="formdata.title" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="文章分类" prop="categories">
                        <el-select
                            v-model="formdata.categories"
                            multiple
                            filterable
                            placeholder="请选择文章标签"
                        >
                            <el-option
                                v-for="(item, i) in categoryOptons"
                                :key="i"
                                :label="item.name"
                                :value="item._id"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="封面" prop="cover">
                        <el-upload
                            class="cover-uploader"
                            :action="baseUrl+imgUploadURL"
                            :data="coverUploadParam"
                            :show-file-list="false"
                            :on-success="handleCoverSuccess"
                            :on-progress="onProgress"
                            :on-error="onError"
                            :headers="{
                                        Authorization:localStorage
                                    }"
                        >
                            <img v-if="formdata.cover!=''" :src="formdata.cover" class="cover" />
                            <i v-else class="el-icon-plus cover-uploader-icon"></i>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="简介" prop="resume">
                        <el-input
                            type="textarea"
                            :rows="2"
                            v-model="formdata.resume"
                            autocomplete="off"
                        ></el-input>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="文章内容">
                <markdown-editor :page="page" :originContent.sync="originContent" ref="markdown" />
            </el-tab-pane>
        </el-tabs>

        <el-row type="flex" justify="center" class="mt-4">
            <el-button type="primary" @click="submitForm(formName)">
                发布/更新
            </el-button>
            <el-button @click="resetForm(`${formName}`)">重置</el-button>
        </el-row>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, NextTick, ProvideReactive, Provide } from "nuxt-property-decorator";
import MyDraftAPI from "~/api/draft";
import { ElForm } from "element-ui/types/form";
import Draft from "~/types/Draft";
import MyPagePath from "~/types/path";
import MyCategoryAPI from "~/api/category";
import { getToken, baseUrl } from "~/assets/utils/utils";
import imgUploadParam from "~/types/uploadImg";
import _ from "lodash";
import MarkdownEditor from "~/components/markdown.vue";
import Bus from '~/assets/utils/utils';
import MyArticleAPI from "../../../../api/article";
import { Message } from "element-ui";
@Component({
    components: {
        MarkdownEditor
    }
})
export default class MyDraftPage extends Vue {
    page='draft'
    type: string = "edit";
    categoryOptons: string[] = [];
    timing: any;
    originContent: string = "";
    coverUploadParam: imgUploadParam = new imgUploadParam("cover");
    contentUploadParam: imgUploadParam = new imgUploadParam("contentImg");
    localStorage: string = "";
    baseUrl: string = baseUrl;
    imgUploadURL = MyDraftAPI.imgUploadURL;
    imgUploading = false
    id: string = "";
    formdata: Draft = new Draft();
    formName: string = "daft_form";
    rules: any = {
        categories: [
            { required: true, trigger: "blur" },
            { validator: this.validateCategories, trigger: "blur" }
        ],
        title: [{ required: true, trigger: "blur" }],
        resume: [{ required: true, trigger: "blur" }],
        cover: [{ required: true, trigger: "blur" }]
    };
    mounted() {
        this.id = _.get(this, "$route.params.id");
        this.getAllCategories();
        if (!_.isEmpty(this.id)) {
            this.type = "edit";
            this.coverUploadParam.id = this.id;
            this.getOneDraft();
        }

        let _this = this;
        this.$nextTick(() => {
            _this.localStorage = getToken();
        });
    }

    getOneDraft() {
        MyDraftAPI.findOneAPI(this.$axios, this.id).then(res => {
            if (res.success) {
                this.formdata = res.data;
                this.originContent = this.formdata.content || '';
            }
        });
    }
    validateCategories(rule: any, value: any, callback: any) {
        if (value instanceof Array && value.length == 0) {
            callback(new Error("请选择至少一个分类"));
        } else {
            callback();
        }
    }
    submitForm(formName: string) {
        (this.$refs[formName] as ElForm).validate(valid => {
            if (valid) {
                if(!this.flush()){
                    this.$message.error('提交失败,无法获取文章内容')
                }
                this.handleEdit();
            } else {
                // console.log('error submit!!');
                return false;
            }
        });
    }
    async handleEdit() {
        let res = null
        if(this.formdata.articleId){
            let {_id,articleId, ...other} = this.formdata
            res = await MyArticleAPI.updateAPI(this.$axios,this.formdata.articleId,other)
        }else{
            let {_id, ...other} = this.formdata
            res = await MyArticleAPI.createAPI(this.$axios,other)
        }
        if (res.success) {
            let res2 = await MyDraftAPI.deleteAPI(this.$axios,this.formdata._id)
            res2.success && this.$message({
                message: "发布/更新成功",
                type: "success"
            });
            this.$router.push(MyPagePath.draftPages.list);
        }
    }

    resetForm(formName: string) {
        this.formdata = { ...this.formdata, ...new Draft() };
    }
    async getAllCategories() {
        let res = await MyCategoryAPI.findAllAPI(this.$axios);
        this.categoryOptons = res.data;
    }
    
    //文件上传
    @Watch('imgUploading')
    onImgUploadingChange(value){
        value && this.$message({message:'正在上传',duration:0,iconClass:"el-icon-loading"});
        !value && (Message as any).closeAll()
    }
    onProgress(event:Event,file: File, fileList: File[]) {
        this.imgUploading=true
    }
    handleCoverSuccess(res: any) {
        this.imgUploading=false
        this.$set(this.formdata, "cover", res.filePath);
    }
    onError(err: Error, file: File, fileList: File[]) {
        this.imgUploading=false
        this.$message.error("上传失败");
    }
    //end 文件上传

    flush(){
        let editor = _.get(this,'$refs.markdown.contentEditor')
        if(!editor){
            return false
        }
        this.formdata.content = editor.getValue()
        return true
    }

    //markdon编辑器相关
    uploadImg(files: File[]){
        let uploadURL = MyDraftAPI.imgUploadURL
        if(this.formdata.articleId){
            this.contentUploadParam.id = this.formdata.articleId
            uploadURL = MyArticleAPI.imgUploadURL
        }
        this.imgUploading = true
        let res =  MyDraftAPI.uploadImg(uploadURL,this.$axios,files[0],this.contentUploadParam).then(res=>{
            this.imgUploading = false
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
     //end markdon编辑器相关

    beforeRouteLeave(to, from, next) {
        clearInterval(this.timing);
        next();
    }
    save(){
        (this.$refs[this.formName] as ElForm).validate(valid => {
            if (valid) {
                if(!this.flush()){
                    this.$message.error('提交失败,无法获取草稿内容')
                }

                    let draft = this.formdata
                    MyDraftAPI.updateAPI(this.$axios,draft._id,draft).then(res=>{
                        if(res.success) this.$message.success('保存成功')
                        else  this.$message.error('保存失败')
                    })
            } else {
                this.$message.warning('文章信息未完善')
                return false;
            }
        });
    }

    //处理事件
    created(){
        this.addBusEvent()
    }
    addBusEvent(){
        Bus.$on(`save_${this.page}`,this.save)
        Bus.$on(`uploadImg_${this.page}`,this.uploadImg)
    }
    removeBusEvent(){
        Bus.$off(`save_${this.page}`)
        Bus.$off(`uploadImg_${this.page}`)
    }
    //在vue对象的beforeDestroy钩子中调用以上函数
    beforeDestroy() {
        this.removeBusEvent()
    }
}
</script>