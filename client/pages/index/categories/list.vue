<template>
    <div>
        <el-table
        v-loading="loading"
         :data="tableData" style="width: 100%">
            <el-table-column prop="_id" label="分类id" />
            <el-table-column prop="name" label="分类名称" />
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button size="mini" @click="handleEdit(scope.$index, scope.row._id)">编辑</el-button>
                    <el-button
                        size="mini"
                        type="danger"
                        @click="handleDelete(scope.$index, scope.row._id)"
                    >删除</el-button>
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
import MyPagePath from "~/types/path";
import Category from "~/types/Category";
import MyCategoryAPI from "~/api/category";
import MyPagePagination from "~/components/pagination.vue";
import Bus from "~/assets/utils/utils";
@Component({
    components: {
        MyPagePagination
    }
})
export default class CategoryListPage extends Vue {
    pageName = "category_list";
    totalData = 1;
    pageSize = 1;
    loading=false
    tableData: Category[] = [];
    handleEdit(idx, id) {
        this.$router.push(MyPagePath.categoryPages.getEditPath(id));
    }
    handleDelete(index,id) {
        this.$confirm("此操作将永久删除该分类, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(async () => {
                let res = await MyCategoryAPI.deleteAPI(this.$axios, id);
                res.success && this.getData(1)
            })
            .catch(() => {});
    }
    created() {
        Bus.$on(`pageChange_${this.pageName}`, this.getData);
    }
    mounted() {
        this.getData(1);
    }
    getData(page: number) {
        this.loading=true
        MyCategoryAPI.getTotalNumberAPI(this.$axios).then(res => {
            if (res.success) {
                this.totalData = res.data;
            }
        });
        MyCategoryAPI.findAllAPI(this.$axios, this.pageSize, page).then(res => {
            this.loading=false
            if (res.success) {
                this.tableData = res.data;
            }
        });
    }
}
</script>