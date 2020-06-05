<template>
    <div class="system-info" v-if="systemInfo">
        <el-row type="flex" justify="space-around">
            <el-col :span="7">
                <el-card>
                    <div slot="header" class="clearfix">
                        <span class="card-header">服务器状态</span>
                    </div>
                    <div class="server_status">
                        <span>运行状态：</span>
                        <el-tag
                            :type="isRunning?'success':'error'"
                            class="fs-md"
                        >{{isRunning?"正在运行":"不在运行"}}</el-tag>
                    </div>
                    <div class="server_status">
                        <span>服务器发行版本：</span>
                        <el-tag type="success" class="fs-md">{{systemInfo.release}}</el-tag>
                    </div>
                    <div class="server_status">
                        <span>Node.js编译运行系统平台：</span>
                        <el-tag color="#495060" class="text-white fs-md">{{systemInfo.platform}}</el-tag>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card>
                    <div slot="header" class="clearfix">
                        <span class="card-header">服务器信息</span>
                    </div>
                    <el-row type="flex" justify="space-around">
                        <el-col :span="10">
                            <div>
                                <span>服务器主机名:</span>
                                <el-tag type="success" class="fs-md">{{systemInfo.hostname}}</el-tag>
                            </div>
                            <div>
                                <span>操作系统:</span>
                                <el-tag type="success" class="fs-md">{{systemInfo.type}}</el-tag>
                            </div>
                            <div>
                                <span>服务器总内存数:</span>
                                <el-tag
                                    color="#495060"
                                    class="text-white fs-md"
                                >{{systemInfo.totalmem}}</el-tag>
                            </div>
                            <div>
                                <span>服务器可用内存数:</span>
                                <el-tag
                                    color="#495060"
                                    class="text-white fs-md"
                                >{{systemInfo.freemem}}</el-tag>
                            </div>
                        </el-col>
                        <el-col :span="10" class="d-flex jc-center ai-center text-center">
                            <el-progress
                                class="progeress"
                                :width="150"
                                type="circle"
                                :percentage="systemInfo.percentage"
                            ></el-progress>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
        </el-row>
        <el-row class=" mt-4">
            <el-card>
                <div slot="header" class="clearfix">
                    <span class="card-header">cpu信息</span>
                </div>
                <el-table :data="systemInfo.cpu">
                    <el-table-column prop="model" label="CPU内核模型"></el-table-column>
                    <el-table-column prop="speed" label="CPU频率(GHz)"></el-table-column>
                    <el-table-column label="CPU执行模式[毫秒]( user:用户 | nice:良好 | sys:系统 | idle:空闲 | irq:中断 )">
                        <template slot-scope="scope">
                            <span>{{ scope.row.times }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </el-row>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import SystemInfo from "../../../types/SystemInfo";
import MySystemAPI from "../../../api/system";
@Component({
    components: {}
})
export default class extends Vue {
    systemInfo: SystemInfo = null;
    isRunning = false;
    async mounted() {
        let res = await MySystemAPI.getSystemInfo(this.$axios);
        if (res.success) {
            this.$set(this, "systemInfo", res.data);
            this.isRunning = Boolean(this.systemInfo.hostname);
        }
    }
}
</script>
<style lang="scss">
.card-header {
    // font-size: 1.5rem;
    font-weight: bold;
}
</style>