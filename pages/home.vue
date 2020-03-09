<template>
    <div class="layout">
        <Layout>
            <Header id="header">
                <Menu class="menu" mode="horizontal" theme="dark" active-name="1">
                    <Row type="flex" justify="center">
                    <Col span="24">
                        <div class="nav-left">
                            <div class="layout-logo">
                                CWY 的博客管理系统
                            </div>
                        </div>
                        <div class="nav-right">
                        <MenuItem name="1">
                                <Icon type="ios-navigate"></Icon>
                                Item 1
                            </MenuItem>
                            <MenuItem name="2">
                                <Icon type="ios-keypad"></Icon>
                                Item 2
                            </MenuItem>
                            <MenuItem name="3">
                                <Icon type="ios-analytics"></Icon>
                                Item 3
                            </MenuItem>
                            <MenuItem name="4" @click.native="logout()" >
                                <Icon type="ios-exit" color='#EE224C'></Icon>
                                logout
                        </MenuItem>
                        </div>
                    </Col>
                    </Row>
                </Menu>
            </Header>
            <Layout>
                <Sider hide-trigger :style="{background: '#fff',zIndex:0}">
                    <Menu class="menu" :active-name="activate_name" @on-select="this.change" theme="light" width="auto" :open-names="['1']">
                        <Submenu name="1">
                            <template slot="title">
                                <Icon type="ios-book"/>
                                文章管理
                            </template>
                            <MenuItem name="1-1" ><Icon type="ios-list-box"></Icon>文章列表</MenuItem>
                            <MenuItem name="1-2"><Icon type="ios-add-circle"></Icon>发布文章</MenuItem>
                            <MenuItem name="1-3"><Icon type="ios-cafe-outline"></Icon>草稿</MenuItem>
                        </Submenu>
                        <Submenu name="2">
                            <template slot="title">
                                <Icon type="ios-keypad"></Icon>
                                信息管理
                            </template>
                            <MenuItem name="2-1"><Icon type="ios-information-circle"></Icon>系统信息</MenuItem>
                            <MenuItem name="2-2"><Icon type="ios-person"></Icon>个人信息</MenuItem>
                        </Submenu>
                        <Submenu name="3">
                            <template slot="title">
                                <Icon type="ios-analytics"></Icon>
                                其他
                            </template>
                            <MenuItem name="3-1">表情管理</MenuItem>
                            <MenuItem name="3-2">Option 2</MenuItem>
                        </Submenu>
                    </Menu>
                </Sider>
                <Layout :style="{padding: '1em'}">
                    <Content :style="{padding: '1em', background: '#fff'}">
                        <!-- <article_table/> -->
                        <!-- <nuxt-child keep-alive :keep-alive-props="{ exclude: ['edit_draft','edit_article','add_article'] }" /> -->
                        <nuxt-child keep-alive :keep-alive-props="{ exclude: ['edit_draft','edit_article'] }" />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    </div>
</template>
<script>
const {mapState,mapMutations} =require('vuex')
    export default {
        data(){
            return{
                activate_name:'1-1'
            }
        },
        mounted(){
        },
        methods:{
            logout(){
                this._exit()
                $cookies.remove('token')
                $cookies.remove('username')
                this.$router.push('/login')
            },
            goto(path){
                this.$router.push(path)
            },
            change(val){
                let paths={'1-1':'/home/article_table','1-2':'/home/add_article','1-3':'/home/draft_table',
                '2-1':'/home/system','2-2':'/home/user_infor','3-1':'/home/emoji_manage'}
                if(paths[val]==null){
                    this.goto('/home')
                }
                this.goto(paths[val])
            },
            ...mapMutations('login',['_login','_exit','setUserName']),
        },
        computed:{
            ...mapState('login',{
                is_login:state=>state.is_login
            }),
        },
    }
</script>
<style lang="less">
    .layout-logo {
        font-size:25px;
        font-weight:bold;
        float:left;
        color:#41b883;
        padding-left: 1em
    }
    .nav-right {
        float:right;
        line-height:58px;
    }
    .ivu-layout-header{
        padding: 0
    }
    .menu{
        padding: 0;
        font-weight:bold
    }
    .layout{
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: visible;
}
</style>
