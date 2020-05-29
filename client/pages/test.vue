<template>
    <div id="vditor"></div>
</template>
<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import "vditor/src/assets/scss/index.scss"; // Or use dark
@Component({
    components: {}
})
export default class extends Vue {
    contentEditor: any;
    mounted() {
        let _this = this;
        this.$nextTick(() => {
            let Vditor = require("vditor");
            _this.contentEditor = new Vditor("vditor", {
                toolbarConfig: {
                    pin: true
                },
                cache: {
                    enable: false
                },
                minHeight: 500,
                after: () => {},
                upload: {
                    handler: (Files: File[]) => {
                        Files = null;
                        console.log("upload");
                        return "ssss";
                    }
                }
            });
        });
    }
}
</script>