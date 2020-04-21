<template>
    <Poptip placement="bottom">
        <Button shape="circle" style="fontWeight:bold">分类目录</Button>
        <div slot="content">
            <RadioGroup v-model="model.type" vertical>
                <Radio 
                v-for="(item, i) in types"
                :key="i"
                :label="item"
                border
                class="radio"
                >
                    <span class="list_menu">{{item}}</span>
                </Radio>
            </RadioGroup>
        </div>
    </Poptip>
</template>
<script>
export default {
    props:['types','model'],
    name:'Types'
}
</script>
<style lang="less">
    .radio{
        margin-bottom: 0.3em !important
    }
</style>