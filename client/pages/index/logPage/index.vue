<template>
    <el-row type="flex" justify="space-around">
        <el-col :span="14">
            <el-card>
                <div slot="header" class="clearfix d-flex jc-between">
                    <span class="card-header">日志内容</span>
                    <span class="card-header mx-2">当前日志类型: {{selectlLogType}}</span>
                </div>
                <el-input
                type="textarea"
                disabled
                placeholder="请输入内容"
                :autosize="{ minRows: 2, maxRows: 50}"
                v-model="log">
                </el-input>
            </el-card>
        </el-col>
        <el-col :span="7">
            <el-card>
                <div slot="header" class="clearfix">
                    <el-button @click="switchSelcetType" class="card-header">切换选择方式</el-button>
                    <el-button @click="switchSelectlLogType" class="card-header">切换日志类型</el-button>
                </div>
                <el-table
                v-loading="loading"
                :data="tableData" v-show="selectType == 'table'">
                    <el-table-column prop="fileName" label="文件名"></el-table-column>
                    <el-table-column fixed="right" label="操作">
                        <template slot-scope="scope">
                            <el-button
                                @click="getLog(scope.row.fileName)"
                                type="primary"
                                size="small"
                            >查看</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-date-picker
                    v-model="selectDate"
                    v-show="selectType == 'datePicker'"
                    type="date"
                    value-format="yyyy-MM-dd"
                    @change="getLog"
                    placeholder="选择日期"
                ></el-date-picker>
            </el-card>
        </el-col>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import MySystemAPI, { logType } from "../../../api/system";
type selectComponentType = "table" | "datePicker";
@Component({
    components: {}
})
export default class LogPage extends Vue {
    tableData: string[] = [];
    selectDate: string = null;
    selectType: selectComponentType = "table";
    selectlLogType: logType = "info";
    log: string = "";
    loading=false
    async mounted() {
        this.loading=true
        let res = await MySystemAPI.getLogs(this.$axios, "info");
        this.loading=false
        if (res.success) {
            this.tableData = res.data;
        }
    }
    switchSelcetType() {
        if (this.selectType == "table") {
            this.selectType = "datePicker";
        } else {
            this.selectType = "table";
        }
    }
    switchSelectlLogType() {
        if (this.selectlLogType == "info") {
            this.selectlLogType = "error";
        } else {
            this.selectlLogType = "info";
        }
        this.$message.warning('切换类型后需要重新选择日志文件')
    }
    async getLog(value: string) {
        let res = null;
        if (value.indexOf(".log") < 0) {
            res = await MySystemAPI.getLog(
                this.$axios,
                this.selectlLogType,
                `${value}.log`
            );
        } else {
            res = await MySystemAPI.getLog(
                this.$axios,
                this.selectlLogType,
                value
            );
        }
        if (res && res.success) {
            if (res.data.notFound) {
                this.$message.warning(res.data.notFound);
            } else this.log = res.data;
        }
    }
}
</script>
<style lang="scss">
.card-header {
    font-weight: bold;
}
</style>