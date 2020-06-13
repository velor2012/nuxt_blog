<template>
    <div class="error-page">
        <div class="main-container">
            <div class="img-container container-item">
                <img :src="imgSrc" />
            </div>
            <div class="text-container container-item">
                <div class="code">404</div>
                <div class="msg">你查看的页面貌似丢失了呢...</div>
                <div class="action" @click="$router.push('/')">返回首页,查看更多内容.</div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
@Component({
    components: {}
})
export default class extends Vue {
    imgSrc =
        "https://cdn.jsdelivr.net/gh/velor2012/imageHosting/nestblog/articles/5eda5b28d4b63375aed17054/6e5e3270-a9a0-11ea-9b3e-ef3956768d99.svg";
}
</script>
<style lang="scss">
@import "assets/404.css";
</style>