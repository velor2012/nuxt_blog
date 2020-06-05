<template>
    <div>
        <el-tabs v-loading="loading" type="border-card">
            <el-tab-pane label="基本信息">
                <el-form
                    :model="formdata"
                    status-icon
                    :rules="rules"
                    :ref="formName"
                    label-width="150px"
                    class="demo-ruleForm"
                >
                    <el-form-item label="管理员账号" prop="username">
                        <el-input type="input" v-model="formdata.username" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="管理员姓名" prop="realname">
                        <el-input type="input" v-model="formdata.realname" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="角色">
                        <el-select v-model="formdata.role" placeholder="请选择角色">
                            <el-option
                                v-for="(item, i) in roles"
                                :key="i"
                                :label="item"
                                :value="item"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item
                        v-show="!showChangePasswordButton && type!=='create'"
                        @click.native="showChangePasswordButton = true"
                        label="管理员密码"
                        prop="password"
                    >
                        <el-button type="text">修改密码</el-button>
                    </el-form-item>
                    <el-form-item
                        v-show="showChangePasswordButton || type=='create'"
                        label="管理员密码"
                        prop="password"
                    >
                        <el-input type="password" v-model="formdata.password" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item
                        v-show="showChangePasswordButton || type=='create'"
                        label="再次确认密码"
                        prop="confimPasswordField"
                    >
                        <el-input
                            type="password"
                            v-model="formdata.confimPasswordField"
                            autocomplete="off"
                        ></el-input>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="信息介绍">
                <markdown-editor
                    :page="page"
                    :originContent.sync="originContent"
                    ref="markdown"
                    :showSaveButton="false"
                />
            </el-tab-pane>
        </el-tabs>
        <el-row type="flex" justify="center" class="mt-4">
            <el-button type="primary" @click="submitForm(formName)">
                {{
                type == "create" ? "创建" : "保存"
                }}
            </el-button>
        </el-row>
    </div>
</template>
<script lang="ts">
import {
    Component,
    Vue,
    Watch,
    Provide,
    ProvideReactive
} from "nuxt-property-decorator";
import _ from "lodash";
import { ElForm } from "element-ui/types/form";
import MyUserAPI from "~/api/user";
import User from "~/types/User";
import MyPagePath from "~/types/path";
import MarkdownEditor from "~/components/markdown.vue";
import imgUploadParam from "~/types/uploadImg";
import Bus from "~/assets/utils/utils";
@Component({
    components: {
        MarkdownEditor
    }
})
export default class MyUserPage extends Vue {
    page = "user";
    originContent = "";
    loading=false
    type: string = "create";
    avatarUploadUrl: string = MyUserAPI.imgUploadUrl;
    timing: any;
    showChangePasswordButton: boolean = false;
    id: string = "";
    formdata: User = new User();
    roles: string[] = ["admin", "user"];
    contentUploadParam: imgUploadParam = new imgUploadParam("contentImg");
    formName: string = "ruleForm";
    rules: any = {
        password: [{ required: false, trigger: "blur" }],
        username: [{ required: true, trigger: "blur" }],
        realname: [{ required: true, trigger: "blur" }],
        confimPasswordField: [
            {
                required: false,
                validator: this.validatePass2,
                trigger: "blur"
            }
        ]
    };
    validatePass2(rule: any, value: any, callback: any) {
        if (!this.showChangePasswordButton) {
            callback();
        }
        if (value === "") {
            callback(new Error("请再次输入密码"));
        } else if (value !== this.formdata.password) {
            callback(new Error("两次输入密码不一致!"));
        } else {
            callback();
        }
    }
    submitForm(formName: string) {
        this.flush();
        (this.$refs[formName] as ElForm).validate(valid => {
            if (valid) {
                this.type === "create"
                    ? this.handleCreate()
                    : this.handleEdit();
            } else {
                return false;
            }
        });
    }
    flush(){
        let editor = _.get(this,'$refs.markdown.contentEditor')
        if(!editor){
            return false
        }
        this.formdata.info = editor.getValue()
        return true
    }
    handleCreate() {
        MyUserAPI.createAPI(this.$axios, this.formdata).then(res => {
            if (res.success) {
                this.$message({
                    message: "创建成功",
                    type: "success"
                });
                this.$router.push(MyPagePath.userPages.list);
            }
        });
    }

    handleEdit() {
        MyUserAPI.updateAPI(this.$axios, this.id, this.formdata).then(res => {
            if (res.success) {
                this.$message({
                    message: "修改成功",
                    type: "success"
                });
                this.$router.push(MyPagePath.userPages.list);
            }
        });
    }
    resetForm(formName: string) {
        this.formdata = { ...this.formdata, ...new User() };
        this.originContent = "";
    }
    autoFlush() {
        let myref = this.$refs["markdown"];
        if (!myref) {
            return setTimeout(() => {
                this.autoFlush();
            }, 1000);
        }
        this.timing = setInterval(() => {
            this.formdata.info = (myref as any).contentEditor.getValue();
        }, 1000);
    }
    beforeRouteLeave(to, from, next) {
        clearInterval(this.timing);
        next();
    }
    mounted() {
        this.id = _.get(this, "$route.params.id");
        this.loading=true
        if (!_.isEmpty(this.id)) {
            this.showChangePasswordButton = false;
            this.type = "edit";
            MyUserAPI.findOneAPI(this.$axios, this.id).then(res => {
                this.loading=false
                if (res.success) {
                    this.formdata = res.data;
                    this.originContent = this.formdata.info;
                }
            });
        } else {
            this.showChangePasswordButton = true;
        }
        this.autoFlush();
    }
    @Watch("showChangePasswordButton")
    change(newValue: boolean) {
        this.rules.password.forEach(element => {
            element.required = newValue;
        });
        this.rules.confimPasswordField.forEach(element => {
            element.required = newValue;
        });
    }

    uploadImg(files: File[]) {
        let res = MyUserAPI.uploadImg(
            MyUserAPI.imgUploadUrl,
            this.$axios,
            files[0],
            this.contentUploadParam
        ).then(res => {
            if (res.success) {
                this.$message.success("上传成功");
                let editor = _.get(this, "$refs.markdown.contentEditor");
                if (!editor) {
                    this.$message.error("插入图片失败");
                } else {
                    editor.insertValue(
                        `![${res.data.filePath}](${res.data.filePath})`
                    );
                }
            } else this.$message.error("上传失败");
        });
    }
    //处理事件
    created() {
        this.addBusEvent();
    }
    addBusEvent() {
        Bus.$on(`uploadImg_${this.page}`, this.uploadImg);
    }
    removeBusEvent() {
        Bus.$off(`uploadImg_${this.page}`);
    }
    //在vue对象的beforeDestroy钩子中调用以上函数
    beforeDestroy() {
        this.removeBusEvent();
    }
}
</script>
<style>
</style>
