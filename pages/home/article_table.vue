<template>
<Card style="text-align:center">
    <p slot="title" style="fontWeight:bold">
        文章列表
    </p>
    <a href="#" slot="extra" @click.prevent="refresh">
        <Icon type="md-refresh" color="black" size=30></Icon>
    </a>
    <div v-show="!isloading">
        <Table border :columns="columns" :data="datas"></Table>
        <Page :total="total" :page-size="pageSize" @on-change="getCurrentPageArticles" show-elevator style="margin-top:1.3em"/>
    </div>
    <loading v-bind:isloading="isloading"/>
</Card>
</template>
<script>
import loading from '~/components/loading.vue'
const {message} =require('../message')
    export default {
        data () {
            return {
                isloading:false,
                pageSize:5,
                baseurl : '/api/article/',
                total:NaN,
                columns: [
                    {
                        title: '标题',
                        key: 'title',
                        sortable: true,
                        render: (h, params) =>{
                             return h('strong',params.row.title)
                        }
                    },
                    {
                        title: '类型',
                        key: 'type',
                        sortable: true,
                    },
                    {
                        title: '创建时间',
                        key: 'createTime',
                        sortable: true,
                         render: (h, params) =>{
                             return h('span',this.getLocalTime(params.row.createTime))
                         }
                    },
                    {
                        title: '修改时间',
                        key: 'updateTime',
                        sortable: true,
                         render: (h, params) =>{
                             return h('span',this.getLocalTime(params.row.updateTime))
                         }
                    },
                    {
                        title: 'Action',
                        key: 'action',
                        width: 150,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.show(params.index)
                                        }
                                    }
                                }, '浏览'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.remove_confirm(params.index)
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ],
                datas: []
            }
        },
        components:{
            loading
        },
        methods: {
            show (index) {
                let id = this.datas[index]._id
                // 似乎只能通过name来传参数，用path不行，子组件名字默认是 父组件-子组件
                this.$router.push({path:`/home/edit_article/${id}`})
            },
            remove_confirm(index){
                message.confirm(this,'确认删除?','',()=>{this.remove(index)})
            },
            remove (index) {
                // 从数据库删除文章
                let id = this.datas[index]._id
                var url = this.baseurl + 'id='+id
                this.$axios.delete(url).then(res => {
                    if(res.data.success){
                        message.success(this,true,'删除成功')
                    }else{
                        message.error(this,true,'删除失败',res.data.reason)
                    }
                })
                // 从列表中删除文章
                this.datas.splice(index, 1);
            },
            getLocalTime(nS) {  
                return new Date(nS).toLocaleString()
            },
            getCurrentPageArticles(pageIndex){
                // console.log(pageIndex)
                var url = this.baseurl + 'pageSize='+this.pageSize +'&' + 'page='+ pageIndex
                this.$axios.get(url).then(res => {
                    if(res.data.success){
                        let articles = res.data.other.article
                        this.datas = articles
                    }
                })
            },
            async getArticleById(id){
                var url = this.baseurl + 'id='+id
                let viewed_article = ''
                await this.$axios.get(url).then(res => {
                    if(res.data.success){        
                        let article = res.data.other.article
                        viewed_article = article
                    }else{
                        viewed_article = res.data
                    }
                })
                return viewed_article
            },
            refresh(){
                this.isloading = true
                var url = this.baseurl + 'total'
                this.$axios.get(url).then(res => {
                    if(res.data.success){
                        this.total = Number(res.data.other.total)
                    }
                })
                var url = this.baseurl + 'pageSize='+this.pageSize +'&' + 'page=1'
                this.$axios.get(url).then(res => {
                    if(res.data.success){
                        let articles = res.data.other.article
                        this.datas = articles
                        this.isloading = false
                    }
                })
            },
        },
        created(){
            this.refresh()
        },
        computed:{
        }
    }
</script>
