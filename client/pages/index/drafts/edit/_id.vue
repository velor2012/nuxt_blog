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
                <markdown-editor :page="page" :originContent="originContent" ref="markdown" />
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
import { Component, Vue, Watch, NextTick } from "nuxt-property-decorator";
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
    id: string = "";
    formdata: Draft = new Draft();
    formName: string = "ruleForm";
    rules: any = {
        categories: [
            { required: true, trigger: "blur" },
            { validator: this.validateCategories, trigger: "blur" }
        ],
        title: [{ required: true, trigger: "blur" }],
        resume: [{ required: true, trigger: "blur" }],
        cover: [{ required: true, trigger: "blur" }]
    };
    created(){
        Bus.$on(`save_${this.page}`,this.save)
        Bus.$on(`uploadImg_${this.page}`,this.uploadImg)
    }
    mounted() {
        this.id = _.get(this, "$route.params.id");
        this.getAllCategories();
        this.autoFlush();
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
    submitForm(formName: string) {
        (this.$refs[formName] as ElForm).validate(valid => {
            if (valid) {
                this.handleEdit();
            } else {
                // console.log('error submit!!');
                return false;
            }
        });
    }
    handleEdit() {
        MyDraftAPI.updateAPI(this.$axios, this.id, this.formdata).then(
            res => {
                if (res.success) {
                    this.$message({
                        message: "修改成功",
                        type: "success"
                    });
                    this.$router.push(MyPagePath.draftPages.list);
                }
            }
        );
    }

    resetForm(formName: string) {
        this.formdata = { ...this.formdata, ...new Draft() };
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

    autoFlush() {
        let myref = this.$refs["markdown"];
        if (!myref) {
            return setTimeout(() => {
                this.autoFlush();
            }, 1000);
        }
        this.timing = setInterval(() => {
            this.formdata.content = (myref as any).contentEditor.getValue();
        }, 1000);
    }
    beforeRouteLeave(to, from, next) {
        clearInterval(this.timing);
        next();
    }
    uploadImg(files: File[]){
        if(this.id){
            this.contentUploadParam.id = this.id
        }
        let res =  MyDraftAPI.uploadImg(MyDraftAPI.imgUploadURL,this.$axios,files[0],this.contentUploadParam).then(res=>{
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
    save(){
        (this.$refs[this.formName] as ElForm).validate(valid => {
            if (valid) {
            let editor = _.get(this,'$refs.markdown.contentEditor')
                    if(!editor){
                        this.$message.error('保存失败')
                    }
                    this.formdata.content = editor.getValue()

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
}
</script>