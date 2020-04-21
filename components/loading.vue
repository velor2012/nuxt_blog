<template>
    <div v-show="isloading" class="demo-spin-col">
        <Spin fix>
            <Icon type="ios-loading" size=50 class="demo-spin-icon-load"></Icon>
            <div>Loading</div>
        </Spin>
    </div>
</template>
<script>
    export default {
        props: {
            isloading: {
            type: Boolean,
            default: false
            }
        }
    }
</script>
<style lang="less">
    .demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
    .demo-spin-col{
        height: 10em;
        position: relative;
    }
</style>