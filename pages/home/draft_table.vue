<template>
  <Card style="text-align:center">
    <p slot="title" style="fontWeight:bold">
      草稿列表
    </p>
    <a href="#" slot="extra" @click.prevent="refresh">
      <Icon type="md-refresh" color="black" size="30"></Icon>
    </a>
    <div v-show="!isloading">
      <Table border :columns="columns" :data="datas"></Table>
      <Page
        :total="total"
        :page-size="pageSize"
        @on-change="getCurrentPageDrafts"
        show-elevator
        style="margin-top:1.3em"
      />
    </div>
    <loading v-bind:isloading="isloading" />
  </Card>
</template>
<script>
const { message } = require("../message");
import loading from "~/components/loading.vue";
export default {
  data() {
    return {
      isloading: false,
      pageSize: 5,
      baseurl: "/api/draft/",
      total: NaN,
      columns: [
        {
          title: "标题",
          key: "title",
          sortable: true,
          render: (h, params) => {
            return h("strong", params.row.title);
          }
        },
        {
          title: "类型",
          key: "type",
          sortable: true
        },
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          render: (h, params) => {
            return h("span", this.getLocalTime(params.row.createTime));
          }
        },
        {
          title: "修改时间",
          key: "updateTime",
          sortable: true,
          render: (h, params) => {
            return h("span", this.getLocalTime(params.row.updateTime));
          }
        },
        {
          title: "是否已发布",
          key: "ispublished",
          sortable: true
        },
        {
          title: "Action",
          key: "action",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.show(params.index);
                    }
                  }
                },
                "浏览"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.remove_confirm(params.index);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      datas: []
    };
  },
  components: {
    loading
  },
  methods: {
    show(index) {
      let id = this.datas[index]._id;
      this.$router.push({ path: `/home/edit_draft/${id}` });
    },
    remove_confirm(index) {
      message.confirm(this, "确认删除?", "", () => {
        this.remove(index);
      });
    },
    remove(index) {
      // 从数据库删除文章
      let id = this.datas[index]._id;
      var url = this.baseurl + "id=" + id;
      this.$axios.delete(url).then(res => {
        if (res.data.success) {
          message.success(this, true, "删除成功");
        } else {
          message.error(this, true, "删除失败", res.data.reason);
        }
      });
      // 从列表中删除文章
      this.datas.splice(index, 1);
    },
    //把时间戳转为本地时间
    getLocalTime(nS) {
      return new Date(nS).toLocaleString();
    },
    getCurrentPageDrafts(pageIndex) {
      // console.log(pageIndex)
      var url =
        this.baseurl + "pageSize=" + this.pageSize + "&" + "page=" + pageIndex;
      this.$axios.get(url).then(res => {
        if (res.data.success) {
          let drafts = res.data.other.draft;
          this.datas = drafts;
        }
      });
    },
    async getDraftById(id) {
      var url = this.baseurl + "id=" + id;
      let viewed_draft = "";
      await this.$axios.get(url).then(res => {
        if (res.data.success) {
          let draft = res.data.other.draft;
          viewed_draft = draft;
        } else {
          viewed_draft = res.data;
        }
      });
      return viewed_draft;
    },
    refresh() {
      this.isloading = true;
      var url = this.baseurl + "total";
      this.$axios.get(url).then(res => {
        if (res.data.success) {
          this.total = Number(res.data.other.total);
        }
      });
      var url = this.baseurl + "pageSize=" + this.pageSize + "&" + "page=1";
      this.$axios.get(url).then(res => {
        if (res.data.success) {
          let drafts = res.data.other.draft;
          this.datas = drafts;
          this.isloading = false;
        }
      });
    }
  },
  created() {
    this.refresh();
  },
  computed: {}
};
</script>
