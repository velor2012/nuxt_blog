<template>
    <div>
        <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="title" label="标题" />
            <el-table-column label="类型">
                <template slot-scope="scope">
                    <div>{{scope.row.categories.map(v=>v.name).join('/')}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="resume" label="简介" />
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
import Article from "~/types/Article";
import MyArticleAPI from "~/api/article";
import MyPagePagination from "~/components/pagination.vue";
import Bus from "~/assets/utils/utils";
@Component({
    components: {
        MyPagePagination
    }
})
export default class ArticleListPage extends Vue {
    pageName = "article_list";
    totalData = 1;
    pageSize = 1;
    tableData: Article[] = [];
    handleEdit(idx, id) {
        this.$router.push(MyPagePath.articlePages.getEditPath(id));
    }
    handleDelete(idx, id) {
        MyArticleAPI.deleteAPI(this.$axios, id);
    }
    created() {
        Bus.$on(`pageChange_${this.pageName}`, this.getData);
    }
    mounted() {
        this.getData(1);
    }
    getData(page: number) {
        MyArticleAPI.getTotalNumberAPI(this.$axios).then(res => {
            if (res.success) {
                this.totalData = res.data;
            }
        });
        MyArticleAPI.findAllAPI(this.$axios, this.pageSize, page).then(res => {
            if (res.success) {
                this.tableData = res.data;
            }
        });
    }
}
</script>