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
                {{
                type == "create" ? "创建" : "保存"
                }}
            </el-button>
            <el-button @click="resetForm(`${formName}`)">重置</el-button>
        </el-row>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, NextTick, Inject, Provide, ProvideReactive } from "nuxt-property-decorator";
import MyArticleAPI from "~/api/article";
import { ElForm } from "element-ui/types/form";
import Article from "~/types/Article";
import MyPagePath from "~/types/path";
import MyCategoryAPI from "~/api/category";
import { getToken, baseUrl } from "~/assets/utils/utils";
import imgUploadParam from "~/types/uploadImg";
import _ from "lodash";
import MarkdownEditor from "~/components/markdown.vue";
import Bus from '~/assets/utils/utils';
import MyDraftAPI from "../../../../api/draft";
import Draft from "../../../../types/Draft";
@Component({
    components: {
        MarkdownEditor
    }
})
export default class MyArticlePage extends Vue {
    page="article"
    type: string = "create";
    categoryOptons: string[] = [];
    timing: any;
    originContent="";
    coverUploadParam: imgUploadParam = new imgUploadParam("cover");
    contentUploadParam: imgUploadParam = new imgUploadParam("contentImg");
    localStorage: string = "";
    baseUrl: string = baseUrl;
    imgUploadURL = MyArticleAPI.imgUploadURL;
    id: string = "";
    formdata: Article = new Article();
    formName: string = "article_form";
    saving = false
    rules: any = {
        categories: [
            { required: true, trigger: "blur" },
            { validator: this.validateCategories, trigger: "blur" }
        ],
        title: [{ required: true, trigger: "blur" },
            { validator: this.validateTitleDuplicate, trigger: "blur" }
        ],
        resume: [{ required: true, trigger: "blur" }],
        cover: [{ required: true, trigger: "blur" }]
    };
    mounted() {
        this.id = _.get(this, "$route.params.id");
        this.getAllCategories();
        // this.autoFlush();
        if (!_.isEmpty(this.id)) {
            this.type = "edit";
            this.coverUploadParam.id = this.id;
            this.getOneArticle();
        }

        let _this = this;
        this.$nextTick(() => {
            _this.localStorage = getToken();
        });
    }
    created(){
        this.addBusEvent()
    }
    getOneArticle() {
        MyArticleAPI.findOneAPI(this.$axios, this.id).then(res => {
            if (res.success) {
                this.formdata = res.data;
                this.originContent = this.formdata.content;
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
    async validateTitleDuplicate(rule: any, value: any, callback: any){
        //保存草稿以及编辑的时候不需要检测
        if(this.type == 'edit' || this.saving){
            callback()
            return
        }
       let res = await MyArticleAPI.checkTitleDuplicate(this.$axios,value)
       if(res.success){
           res.data && callback(new Error("标题重复"));
       }else{
           callback()
       }
    }
    submitForm(formName: string) {
        Bus.$emit('test')
        if(!this.$refs[formName]){
            console.log(formName)
        }
        (this.$refs[formName] as ElForm).validate(valid => {
            if (valid) {
                if(!this.flush()){
                    this.$message.error('提交失败,无法获取文章内容')
                }
                this.type === "create"
                    ? this.handleCreate()
                    : this.handleEdit();
            } else {
                // console.log('error submit!!');
                return false;
            }
        });
    }
    handleCreate() {
        MyArticleAPI.createAPI(this.$axios, this.formdata).then(res => {
            if (res.success) {
                this.$message({
                    message: "创建成功",
                    type: "success"
                });
                this.$router.push(MyPagePath.articlePages.list);
            }
        });
    }

    handleEdit() {
        MyArticleAPI.updateAPI(this.$axios, this.id, this.formdata).then(
            res => {
                if (res.success) {
                    this.$message({
                        message: "修改成功",
                        type: "success"
                    });
                    this.$router.push(MyPagePath.articlePages.list);
                }
            }
        );
    }

    resetForm(formName: string) {
        this.formdata = { ...this.formdata, ...new Article() };
    }
    uploadImg(files: File[]){
        if(this.id){
            this.contentUploadParam.id = this.id
        }
        let res =  MyArticleAPI.uploadImg(MyArticleAPI.imgUploadURL,this.$axios,files[0],this.contentUploadParam).then(res=>{
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
    async getAllCategories() {
        let res = await MyCategoryAPI.findAllAPI(this.$axios);
        this.categoryOptons = res.data;
    }
    handleCoverSuccess(res: any) {
        this.$set(this.formdata, "cover", res.filePath);
    }
    onError(err: Error, file: File, fileList: File[]) {
        this.$message.error("上传失败");
    }
    flush(){
        let editor = _.get(this,'$refs.markdown.contentEditor')
        if(!editor){
            return false
        }
        this.formdata.content = editor.getValue()
        return true
    }
    save(){
        this.saving = true;
        (this.$refs[this.formName] as ElForm).validate(valid => {
            if (valid) {
                    if(!this.flush()){
                        this.$message.error('保存失败,无法获取文章内容')
                    }
                    let article = this.formdata
                    let draft = new Draft()
                    draft.title = article.title
                    draft.content = article.content
                    draft.cover = article. cover
                    draft.categories = article.categories
                    draft.resume = article.resume
                    //有id就是已经发布的文章
                    if(this.formdata._id){
                        draft.articleId = article._id
                    }
                    MyDraftAPI.findOneUpdateOrCreated(this.$axios,draft).then(res=>{
                        this.saving = false;
                        if(res.success) this.$message.success('保存成功')
                        else this.$message.error('保存失败')
                    })
            } else {
                this.$message.warning('文章信息未完善')
                this.saving = false;
                return false;
            }
        });
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