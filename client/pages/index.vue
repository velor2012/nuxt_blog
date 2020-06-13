<template>
    <el-container style="height: 100vh;">
        <el-aside width="200px" style="background-color: rgb(238, 241, 246)" v-show="showSide">
            <el-menu
                router
                unique-opened
                :default-openeds="open_list"
                :default-active="path.articlePages.list"
            >
                <el-submenu index="1">
                    <template slot="title">
                        <i class="el-icon-message"></i>内容管理
                    </template>
                    <el-menu-item-group>
                        <template slot="title">文章</template>
                        <el-menu-item :index="path.articlePages.create">新建文章</el-menu-item>
                        <el-menu-item :index="path.articlePages.list">文章列表</el-menu-item>
                    </el-menu-item-group>
                    <el-menu-item-group>
                        <template slot="title">草稿</template>
                        <el-menu-item :index="path.draftPages.list">草稿列表</el-menu-item>
                    </el-menu-item-group>
                    <el-menu-item-group>
                        <template slot="title">分类</template>
                        <el-menu-item :index="path.categoryPages.create">新建分类</el-menu-item>
                        <el-menu-item :index="path.categoryPages.list">分类列表</el-menu-item>
                    </el-menu-item-group>
                </el-submenu>

                <el-submenu index="2">
                    <template slot="title">
                        <i class="el-icon-s-tools"></i>系统管理
                    </template>
                    <el-menu-item-group>
                        <template slot="title">系统</template>
                        <el-menu-item :index="path.systemPage">系统状况</el-menu-item>
                    </el-menu-item-group>
                    <el-menu-item-group>
                        <template slot="title">日志</template>
                        <el-menu-item :index="path.logPage">日志</el-menu-item>
                    </el-menu-item-group>
                </el-submenu>

                <el-submenu index="3">
                    <template slot="title">
                        <i class="el-icon-user-solid"></i>用户管理
                    </template>
                    <el-menu-item-group>
                        <template slot="title">用户</template>
                        <el-menu-item :index="path.userPages.create">新建用户</el-menu-item>
                        <el-menu-item :index="path.userPages.list">用户列表</el-menu-item>
                    </el-menu-item-group>
                </el-submenu>

                <el-submenu index="4">
                    <template slot="title">
                        <i class="el-icon-s-grid"></i>拓展
                    </template>
                    <el-menu-item-group>
                        <template slot="title">图片</template>
                        <el-menu-item :index="path.extendPages.emoji">表情包管理</el-menu-item>
                        <el-menu-item :index="path.extendPages.gallery">相册管理</el-menu-item>
                    </el-menu-item-group>

                    <el-menu-item-group>
                        <template slot="title">
                            <i class="el-icon-s-management"></i>笔记
                        </template>
                        <el-menu-item :index="path.extendPages.note.create">新建笔记</el-menu-item>
                        <el-menu-item :index="path.extendPages.note.list">笔记列表</el-menu-item>
                    </el-menu-item-group>
                </el-submenu>
            </el-menu>
        </el-aside>

        <el-container>
            <el-header style="text-align: right; font-size: 12px" v-show="showHeader">
                <el-button @click="logout" type="info" size="small" style="marginRight:1rem">登出</el-button>
                <span>{{user.realname}}</span>
            </el-header>

            <el-main class="page-component__scroll">
                <nuxt-child :key="$route.path" />
            </el-main>
            <el-backtop :visibility-height="1" target=".page-component__scroll"></el-backtop>
        </el-container>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, NextTick } from "nuxt-property-decorator";
import MyPagePath, { PagePath } from "../types/path";
import Bus from "~/assets/utils/utils";
@Component({
    components: {}
})
export default class extends Vue {
    open_list: string[] = ["1"];
    showHeader = true;
    showSide = true;
    FullPath: String = "";
    path: PagePath = MyPagePath;
    //处理事件
    created(){
        this.addBusEvent()
    }
    addBusEvent(){
        Bus.$on("hideHeader", () => {
            this.showHeader = false;
        });
        Bus.$on("showHeader", () => {
            this.showHeader = true;
        });
        Bus.$on("hideSide", () => {
            this.showSide = false;
        });
        Bus.$on("showSide", () => {
            this.showSide = true;
        });
    }
    removeBusEvent(){
        Bus.$off("hideHeader");
        Bus.$off("showHeader");
        Bus.$off("hideSide");
        Bus.$off("showSide");
    }
    //在vue对象的beforeDestroy钩子中调用以上函数
    beforeDestroy() {
        this.removeBusEvent()
    }
    async logout() {
        let res = await this.$auth.logout();
        this.$router.push(MyPagePath.loginPath);
    }
    get user() {
        return this.$store.state.auth.user;
    }
}
</script>
<style>
.el-header {
    background-color: #b3c0d1;
    color: #333;
    line-height: 60px;
}

.el-aside {
    color: #333;
}
</style>
