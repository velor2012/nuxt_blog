<template>
    <el-row type="flex" justify="space-around">
        <el-col :span="18">
            <el-row type="flex">
                <el-col class="m-2" v-for="(emoji,index) in emojis" :key="index" :span="4">
                    <el-tooltip placement="top-end">
                        <div slot="content">
                            <i @click="_delete(emoji)" class="text-red iconfont icon-trash"></i>
                        </div>
                        <el-image :preview-src-list="srcList" class="emoji" :src="emoji.path" fit="contain" />
                    </el-tooltip>
                </el-col>
            </el-row>
            <el-row type="flex" justify="center" class="mt-4">
                <MyPagePagination :pageSize="pageSize" :totalData="totalData" :pageName="pageName" />
            </el-row>
        </el-col>
        <el-col :span="4">
            <el-upload
                drag
                :action="baseUrl+imgUploadURL"
                :data="UploadParam"
                :on-success="handleCoverSuccess"
                :on-error="onError"
                :on-progress="onProgress"
                :headers="{
            Authorization:localStorage
        }"
            >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">
                    将文件拖到此处，或
                    <em>点击上传</em>
                </div>
            </el-upload>
        </el-col>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "nuxt-property-decorator";
import Bus, { getToken } from "~/assets/utils/utils";
import { Message } from "element-ui";
import MyImgAPI from '~/api/Img';
import { baseUrl } from "~/assets/utils/utils";
import MyPagePagination from "~/components/pagination.vue";
import { extendImgUploadParam } from "~/types/uploadImg";
import { MyImg } from '~/types/Img';
@Component({
    components: {
        MyPagePagination
    }
})
export default class EmojiPage extends Vue {
    emojis: MyImg[] = [];
    srcList:string[] = []
    imgUploading = false;
    pageName = "emoji";
    totalData = 1;
    pageSize = 18;
    baseUrl = baseUrl;
    imgUploadURL = MyImgAPI.uploadUrl;
    UploadParam = new extendImgUploadParam("emoji");
    localStorage = null;

    //文件上传
    @Watch("imgUploading")
    onImgUploadingChange(value) {
        value &&
            this.$message({
                message: "正在上传",
                duration: 0,
                iconClass: "el-icon-loading"
            });
        !value && (Message as any).closeAll();
    }
    handleCoverSuccess(res: any) {
        this.imgUploading = false;
        this.getData(1)
        this.totalData += 1;
    }
    onProgress(event: Event, file: File, fileList: File[]) {
        this.imgUploading = true;
    }
    onError(err: Error, file: File, fileList: File[]) {
        this.imgUploading = false;
        this.$message.error("上传失败");
    }
    //end 文件上传

    mounted() {
        this.getTotalNumber();
        this.getData(1);

        let _this = this;
        this.$nextTick(() => {
            _this.localStorage = getToken();
        });
    }
    getTotalNumber() {
        MyImgAPI.getTotalNumberAPI(this.$axios).then(res => {
            if (res.success) {
                this.totalData = res.data;
            }
        });
    }
    async getData(index: number) {
        let res = await MyImgAPI.getAll(
            this.$axios,
            "emoji",
            this.pageSize,
            index
        );
        if (res.success && res.data instanceof Array) {
            this.emojis = res.data
            this.srcList = this.emojis.map(v=>v.path)
        }
    }
    async _delete(emoji:MyImg){
        let res = await MyImgAPI.deleteAPI(this.$axios,emoji._id)
        if(res.success){
            this.getTotalNumber()
            this.getData(1)
        }
    }
}
</script>
<style lang="scss">
@import url('assets/iconfont/iconfont.css');
.el-upload-dragger {
    max-width: 100%;
}
.el-upload {
   max-width: 100%;
}
.icon-trash,.emoji:hover{
    cursor: pointer;
}
</style>