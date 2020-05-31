<template>
<div>
    未完成
</div>
</template>
<script lang="ts">
import {Component,Vue} from "nuxt-property-decorator"
import Bus from '~/assets/utils/utils';
@Component({
components: {
}
})
export default class extends Vue {
    //TODO:
    created(){
        Bus.$on('test',()=>{console.log('hello')})
    }
    removeBusEvent(){
        Bus.$off('test')
    }
    //在vue对象的beforeDestroy钩子中调用以上函数
    beforeDestroy() {
        this.removeBusEvent()
    }
}
</script>