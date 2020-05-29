<template>
    <el-pagination
    background
    layout="prev, pager, next"
    :total="totalData"
    :current-page.sync="currentPage"
    :page-size="pageSize"
    >
    </el-pagination>
</template>
<script lang="ts">
import {Component,Vue, Prop, Watch} from "nuxt-property-decorator"
import Bus from '~/assets/utils/utils';
@Component({
components: {
}
})
export default class MyPagePagination extends Vue {
    // TODO;把分页功能完成，后台需要返回总页数，前端需要用事件进行换页处理
    currentPage=1;
    @Prop({ type: Number, required: true,default:1 }) readonly totalData: Number | undefined;
    @Prop({ type: Number, required: true,default:1 }) readonly pageSize: Number | undefined;
    @Prop({ type: String, required: true,default:'' }) readonly pageName: String | undefined;
    @Watch('currentPage')
    changePage(){
        Bus.$emit(`pageChange_${this.pageName}`,Number(this.currentPage))
    }
}
</script>