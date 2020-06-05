<template>
    <div>
        <h1>管理员列表</h1>
        <el-table v-loading="loading" :data="tableData">
            <el-table-column prop="_id" label="id" width="240" />
            <el-table-column prop="username" label="管理员名称" />
            <el-table-column prop="role" label="角色" />
            <el-table-column fixed="right" label="操作" width="180">
                <template slot-scope="scope">
                    <el-button @click="clickEdit(scope.row)" type="primary" size="small">编辑</el-button>
                    <el-button @click="clickRemove(scope.$index,scope.row._id)" type="danger" size="small">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-row type="flex" justify="center" class="mt-4">
            <MyPagePagination :pageSize="pageSize" :totalData="totalData" :pageName="pageName" />
        </el-row>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { AxiosResponse, AxiosError } from "axios";
import _ from "lodash";
import { NuxtAxiosInstance } from "@nuxtjs/axios";
import MyUserAPI from '~/api/user';
import MyPagePath from '~/types/path';
import User from '~/types/User';
import Bus from '~/assets/utils/utils';
import MyPagePagination from "~/components/pagination.vue";
@Component({
    components: {
        MyPagePagination
    }
})
export default class extends Vue {
    pageName = "user_list";
    totalData = 1;
    pageSize = 1;
    tableData: User[] = [];
    loading = true;

    mounted() {
        this.getData(1);
    }
    created() {
        Bus.$on(`pageChange_${this.pageName}`, this.getData);
    }
    clickEdit(data: User) {
        this.$router.push(MyPagePath.userPages.getEditPath(data._id as string));
    }
    clickRemove(index,id: string) {
        this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(async () => {
                let res = await MyUserAPI.deleteAPI(this.$axios, id);
                res.success && this.getData(1)
            })
            .catch(() => {});
    }
    getData(page: number) {
        MyUserAPI.getTotalNumberAPI(this.$axios).then(res => {
            if (res.success) {
                this.totalData = res.data;
                this.loading = false;
            }
        });
        MyUserAPI.findAllAPI(this.$axios, this.pageSize, page).then(res => {
            if (res.success) {
                this.tableData = res.data;
            }
            this.loading = false;
        });
    }
}
</script>
