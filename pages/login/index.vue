<template>
<div class="layout">
    <Layout>
        <Header class="header">欢迎来到cwy的博客管理系统</Header>
        <Content>
            <div class="content" style="min-height:50em" :style="{backgroundImage:'url('+this.src+')'}">
                <row>
                    <Col span="6" offset="9" style="margin-top:10em">
                    <Card style="float:right;">
                        <label class="welcome">欢迎登录</label>
                        <Input v-model="username" type="text" placeholder="请输入用户名" name="username" icon="ios-contact" style="margin-top:1em"/> 
                        <Input v-model="password" type="password" password placeholder="请输入密码" name="password" style="margin-top:1em" @keyup.native.enter="login(username,password)"/>
                        <br>
                        <Button type="primary" long :loading="isloading" @click.native="login(username,password)" style="margin-top:1em">登录</Button>
                    </Card>
                    </Col>
                </row>
            </div>
        </Content>
    </Layout>
</div>
</template>
<script>
const {mapState,mapMutations, mapGetters} = require('vuex')
const {message} = require('../message')
let img =  require('~/assets/backgroud.jpg')
    export default {
        data () {
            return {
            username: '',
            password: '',
            src:img,
            isloading:false
            }
        },
        created () {
            if(this.is_login){
                this.$router.push('/home')
            }
        },
        methods: {
            // // 设置用户名vuex方法
            // ...mapMutations(['setUserName']),
            login (username, password) {
            let json = {username, password}
            this.isloading=true
            this.$axios.post('/api/login', json).then(res => {
                let result = res.data
                this.isloading=false
                if(result.success){
                    message.success(this,true,'登陆成功','')
                    this.setUserName(result.other.user.username)
                    this._login()
                    this.setToken(result.other.token)
                    $cookies.set('username',result.other.user.username)
                    $cookies.set('token',result.other.token)
                    message.success(this,true,'准备跳转','')
                    this.$router.push('home')
                }else{
                    message.error(this,true,'登陆失败',result.reason)
                }
            })
            },
            ...mapMutations('login',['_login','_exit','setUserName','setToken']),
        },
        computed: {
            ...mapState('login',{
                is_login:state=>state.is_login
            }),
            ...mapGetters('login',['getToken']),
        }
    }
</script>
<style lang="less">
    .layout{
        border: 1px solid #d7dde4;
        background: #f5f7f9;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
    }
    .welcome{
        font-size: 21px;
        font-weight: bold;
    }
    .content{
        background-size: 100% 100%
    }
    .header{
        height: 2em;
        color: rgb(255, 255, 255);
        font-size: 2em;
        text-align: center;
    }
</style>