<template>
    <div>
        <el-tabs
        v-loading="loading"
         type="border-card">
            <el-tab-pane label="基本信息">
                <el-form
                    :model="formdata"
                    status-icon
                    :rules="rules"
                    :ref="formName"
                    label-width="100px"
                    class="demo-ruleForm"
                    label-position="left"
                >
                    <el-form-item label="笔记名" prop="name">
                        <el-input type="input" v-model="formdata.name" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="笔记分类" prop="categories">
                        <el-select
                            v-model="formdata.categories"
                            multiple
                            filterable
                            placeholder="请选择笔记分类"
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
                            :on-progress="onProgress"
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
            <el-tab-pane label="笔记内容">
                <el-row type="flex" justify="end">
                    <el-button type="primary" @click="onClickAdd" icon="el-icon-plus" circle></el-button>
                </el-row>
                <el-table :data="formdata.subDoc">
                    <el-table-column sortable prop="order" label="次序"/>
                    <el-table-column prop="title" label="标题"/>
                    <el-table-column prop="content" label="内容" show-overflow-tooltip/>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button size="mini" @click="onClickEdit(scope.$index, scope.row)">编辑</el-button>
                            <el-button
                                size="mini"
                                type="danger"
                                @click="onClickDelete(scope.$index, scope.row._id)"
                            >删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
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

        <el-dialog 
        :close-on-click-modal="false"
        :before-close="onClickCancel"
        :title="subDocType=='create'?'创建':'更新'" :visible.sync="dialogFormVisible">
            <SubDocForm ref="subDoc" :idx.sync="currentSubDocIdx" :note="formdata"/>
            <div slot="footer" class="dialog-footer mt-3">
                <el-button @click="onClickCancel">取 消</el-button>
                <el-button type="primary" @click="onDialogClickOK">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, NextTick } from "nuxt-property-decorator";
import _ from "lodash";
import MyNoteAPI from "~/api/note";
import { ElForm } from "element-ui/types/form";
import { Note, SubDoc } from "~/types/Note";
const config = require("~/config.json");
import MyPagePath from "~/types/path";
import MyCategoryAPI from "~/api/category";
import { baseUrl, getToken } from "~/assets/utils/utils";
import imgUploadParam from "~/types/uploadImg";
import SubDocForm from "~/components/subDocForm.vue";
import Bus from '~/assets/utils/utils';
import { Message } from "element-ui";
@Component({
    components: {
        SubDocForm
    }
})
export default class MyNotePage extends Vue {
    type: string = "create";
    subDocType:string = "create";
    page="note"
    categoryOptons: string[] = [];
    id: string = "";
    loading=false
    formdata: Note = new Note();
    formName: string = "ruleForm";
    baseUrl: string = baseUrl;
    imgUploadURL = MyNoteAPI.imgUploadURL;
    imgUploading=false
    coverUploadParam: imgUploadParam = new imgUploadParam("cover");
    localStorage: string = "";
    subDocEditing = false;
    currentSubDocIdx = null;
    rules: any = {
        categories: [
            { required: true, trigger: "blur" },
            { validator: this.validateCategories, trigger: "blur" }
        ],
        name: [{ required: true, trigger: "blur" }],//笔记名要唯一     //TODO;
        resume: [{ required: true, trigger: "blur" }],
        cover: [{ required: true, trigger: "blur" }]
    };
    dialogFormVisible=false;
    onDialogClickOK(){
        let subDocComponent = _.get(this,'$refs.subDoc')
        if(!subDocComponent._validate()){
            return
        }
        this.dialogFormVisible = false;
        if(!subDocComponent.flush()){
             this.$message.error('出错,无法获取子文档编辑器内容')
        }
        if(this.subDocEditing == true){
            this.$set(this.formdata.subDoc,this.currentSubDocIdx , {...subDocComponent.formdata})
            this.subDocEditing = false
            this.currentSubDocIdx = null;
            subDocComponent._clear()
            return
        }
       this.formdata.subDoc.push({...subDocComponent.formdata})
       subDocComponent._clear()
       subDocComponent.initExitOrders()
    }
    created(){
        this.addBusEvent()
    }
    save(){
        this.$message.warning('保存草稿功能未实现')
    }
    mounted() {
        this.id = _.get(this, "$route.params.id");
        this.getAllCategories();
        // this.autoFlush();
        if (!_.isEmpty(this.id)) {
            this.type = "edit";
            this.coverUploadParam.id = this.id;
            this.getOneNote();
        }

        let _this = this;
        this.$nextTick(() => {
            _this.localStorage = getToken();
        });
    }

    getOneNote() {
        this.loading = true
        MyNoteAPI.findOneAPI(this.$axios, this.id).then(res => {
            this.loading = false
            if (res.success) {
                this.formdata = res.data;
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
        MyNoteAPI.createAPI(this.$axios, this.formdata).then(res => {
            if (res.success) {
                this.$message({
                    message: "创建成功",
                    type: "success"
                });
                this.$router.push(MyPagePath.extendPages.note.list);
            }
        });
    }

    handleEdit() {
        MyNoteAPI.updateAPI(this.$axios, this.id, this.formdata).then(res => {
            if (res.success) {
                this.$message({
                    message: "修改成功",
                    type: "success"
                });
                this.$router.push(MyPagePath.extendPages.note.list);
            }
        });
    }

    resetForm(formName: string) {
        this.formdata = { ...this.formdata, ...new Note() };
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

    //子文档相关
    onClickEdit(idx, subDoc){
        let subDocComponent = _.get(this,'$refs.subDoc')
        subDocComponent && subDocComponent._clear()
        this.dialogFormVisible = true;
        this.subDocEditing = true;
        this.currentSubDocIdx = idx
    }
    onClickAdd(){
        this.subDocType = 'create'
        this.dialogFormVisible = true
        let subDocComponent = _.get(this,'$refs.subDoc')
        subDocComponent && subDocComponent._clear()
    }
    onClickCancel(){
        this.subDocEditing = false;
        this.dialogFormVisible = false
        this.currentSubDocIdx = null
    }
    onClickDelete(idx,id){
        this.formdata.subDoc.splice(idx,1)
    }
   //end 子文档相关

    addBusEvent(){
        Bus.$on(`save_${this.page}`,this.save)
    }
    removeBusEvent(){
        Bus.$off(`save_${this.page}`)
    }
    //在vue对象的beforeDestroy钩子中调用以上函数
    beforeDestroy() {
        this.removeBusEvent()
    }
} 
</script>