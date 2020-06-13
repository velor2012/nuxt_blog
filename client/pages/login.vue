<template>
<div class="login-page d-flex jc-center ai-center">
    <el-card header="登录" class = " login-card">
        <el-form 
        :model="user"
        @submit.native.prevent="login"
        ref="loginForm"
        >
            <el-form-item label="用户名" prop="username">
                <el-input v-model="user.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input type="password" v-model="user.password"></el-input>
            </el-form-item>
            <el-form-item style="textAlign:center">
                <el-row type="flex" justify="center">
                    <el-button native-type="submit" plain type="info">登录</el-button>
                </el-row>
            </el-form-item>
        </el-form>
    </el-card>
</div>
</template>
<script lang="ts">
import {Component,Vue} from "nuxt-property-decorator"
import MyUserApi from '../api/user';
import { ElForm } from "element-ui/types/form";
import _ from 'lodash'
@Component({
    // @ts-ignore
auth: false,
components: {
}
})
export default class extends Vue {
    user:any = {}
    rules: any = {
        username: [{ required: true, trigger: "blur" },],
        password: [{ required: true, trigger: "blur" }]
    };
    login(){
        (this.$refs.loginForm as ElForm).validate(async valid => {
            if (valid) { 
                try {
                    let res = await this.$auth.loginWith('local', { data: this.user })
                    if(!_.isEmpty(res.data.token)){
                        this.$router.push('/')
                    }
                } catch (err) {
                    console.log(err)
                }
            } else {
                return false;
            }
        });
    }
}
</script>
<style lang="scss">
@import "assets/scss/_variable.scss";
.login-card{
    width: 25vw;
    color: white;
    font-weight: bold;
    background-color:rgba($color: #000, $alpha: 0.5);
    border-color: rgba($color: #000, $alpha: 0.5);
    .el-form-item__label{
        color:white
    }
}
.login-page{
    height: 100vh;
    background: #000000 url($background) top left no-repeat;
    background-size: cover;
}
</style>