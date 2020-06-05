<template>
    <div class="list">
        <el-input v-model="keyword" placeholder="请输入内容" @input="onKeywordChage" 
        suffix-icon="el-icon-search" :width="10" class=" my-2"></el-input>
        <el-table
        v-loading="loading"
         :data="tableData" style="width: 100%">
            <el-table-column prop="name" label="标题" >
            <template slot-scope="scope">
                <div v-html="scope.row.name"/>
            </template>
            </el-table-column>
            <el-table-column prop="visits" label="阅读量" />
            <el-table-column label="类型">
                <template slot-scope="scope">
                    <div>{{scope.row.categories.map(v=>v.name).join('/')}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="resume" show-overflow-tooltip label="简介" >
            <template slot-scope="scope">
                <div v-html="scope.row.resume"/>
            </template>
                      </el-table-column>
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
import {Note} from "~/types/Note";
import MyNoteAPI from "~/api/note";
import MyPagePagination from "~/components/pagination.vue";
import Bus from "~/assets/utils/utils";
import _ from 'lodash';
import { NoteForSearch } from "~/types/Search";
@Component({
    components: {
        MyPagePagination
    }
})
export default class NoteListPage extends Vue {
    pageName = "note_list";
    totalData = 1;
    pageSize = 10;
    keyword =''
    loading=false
    tableData: Note[]|NoteForSearch[] = [];
    handleEdit(idx, id) {
        this.$router.push(MyPagePath.extendPages.note.getEditPath(id));
    }
    handleDelete(index,id) {
        this.$confirm("此操作将永久删除该笔记, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(async () => {
                let res = await MyNoteAPI.deleteAPI(this.$axios, id);
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
    getTotalNumber(){
        MyNoteAPI.getTotalNumberAPI(this.$axios).then(res => {
        if (res.success) {
            this.totalData = res.data;
        }
    })
    }
    getData(page: number) {
        this.loading = true
         if(_.isEmpty(this.keyword)){
            this.getTotalNumber()
            MyNoteAPI.findAllAPI(this.$axios, this.pageSize, page).then(res => {
            this.loading = false
                if (res.success) {
                    this.tableData = res.data;
                }
            });
         }else{
            MyNoteAPI.searchNoteAPI(this.$axios,this.keyword,this.pageSize,page).then(res=>{
                this.loading = false
                if(res.success){
                    this.tableData = res.data.results.map(v=>{
                        return v.note
                    })
                }
            })
         }
    }
    onKeywordChage = _.debounce((value)=>{
        this.getData(1)
    },500)
}
</script>