<template>
<Card>
    <p slot="title" style="fontWeight:bold">
        目录
    </p> 
    <div>
    <Anchor show-ink >
        <AnchorLink            
        href="#header"
        title="返回顶部"
        />
        <AnchorLink            
        v-for="(item, i) in toc"
        :key="item.layer+item+i"
        :href="`#${item.text}`"
        :title="getText(item.layer,item.text)"
        />
    </Anchor>
    </div>

</Card>
</template>
<script>
    export default {
        props:['toc'],
        methods:{
            getText(layer,text){
                let result = ''
                let arr = []
                for(var i=0;i<(Number(layer));i++){
                    arr.push(i+1);
                }        
                arr.map((item,index)=>{
                    result = result +'- '
                })
                return result + text
            }
        }
    }
</script>