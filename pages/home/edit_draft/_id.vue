<template>
  <div class="draft_body">
    <Row>
      <!-- 左侧 -->
      <Col span="19">
        <Row>
          <Col span="12">
            <Col span="12">
              <label for="title" class="title">文章标题</label>
              <div>{{uploadProgress}}</div>
              <Input
                v-model="draft.title"
                placeholder="在此输入文章标题"
                name="draft_title"
              ></Input>
            </Col>
            <Col span="12" style="text-align:center">
              <emoji />
              <Types :types="types" :model="draft" style="margin-top:1em" />
            </Col>
            <Col span="24" style="margin-top:1em">
              <Modal
                v-model="showAddTag"
                @on-ok="addTag2"
                draggable
                scrollable
                title="添加标签"
              >
                <Input
                  @keyup.enter.native="addTag2"
                  v-model="tag_add"
                  placeholder="请输入标签名称"
                />
              </Modal>
              <Tag
                v-for="(item, i) in tags"
                :key="i"
                :name="item"
                :color="colors[i]"
                closable
                @on-close="deleteTag"
                >{{ item }}</Tag
              >
              <Button icon="ios-add" type="dashed" size="small" @click="addTag"
                >添加标签</Button
              >
            </Col>
            <Col span="24">
              <Input
                v-model="draft.resume"
                type="textarea"
                :autosize="{minRows: 5,maxRows: 10}"
                placeholder="请输入简介"
              />
            </Col>
          </Col>
          <Col span="12" style="text-align:center">
            <croppa
              v-model="croppa"
              :width="430"
              :height="240"
              :quality="3"
              placeholder="Choose an image"
              :placeholder-font-size="0"
              :disabled="false"
              :prevent-white-space="true"
              :show-remove-button="true"
              initial-size="contain"
            >
              <img crossOrigin="anonymous" :src="draft.cover" slot="initial" />
            </croppa>
            <div style="padding-bottom:0.5em" >
              <Button class="upload-cover" type="primary" @click="uploadCoverAndSet">上传已选择的封面</Button>
            </div>
          </Col>
        </Row>

        <!-- <div class="mavonEditor"> -->
        <client-only
          ><markdown
            :height="-1"
            class="markdown"
            :interval="60 * 1000"
            v-model="draft.content"
            ref="md"
            :autoSave="auto_save"
            :toolbars="toolbars"
            @on-upload-image="imgAdd"
            @on-save="save"
        /></client-only>
        <!-- </div> -->
        <Button type="primary" id="update_button" @click.native="update_publish"
          >发布/修改</Button
        >
      </Col>
      <!-- 右侧 -->
      <Col span="4" offset="1" class="right">
        <TOC :toc="toc" />
      </Col>
      <BackTop></BackTop>
    </Row>
  </div>
</template>
<script>
const {  mapMutations,mapGetters } = require("vuex");
const { check_draft, imgupload, uploadCroppedImage } = require("../../tool");
const { message } = require("../../message");
import Types from "~/components/Types.vue";
import TOC from "~/components/TOC.vue";
import emoji from "~/components/emoji.vue";
export default {
  name: "edit_draft",
  data() {
    return {
      baseurl: "api/draft/",
      subfield: false,
      auto_save: true,
      uploadProgress:0,
      draft: {
        title: "",
        content: "",
        type: "",
        resume: "",
        tag: "",
        cover: ""
      },
      old_draft: {
        title: "",
        content: "",
        type: "",
        resume: "",
        tag: "",
        cover: ""
      },
      toolbars: {
        save: true,
        clear: true,
        uploadImage: true,
        //有bug，不要打开
        fullscreen: false
      },
      id: "",
      toc: { "1": [""], "2": [""], "3": [""] },
      //下面几个是标签有关的变量
      tags: [],
      tag_add: "",
      showAddTag: false,
      //封面图片
      croppa: {},
    };
  },
  components: {
    Types,
    TOC,
    emoji
  },
  methods: {
    update_publish() {
      if (!check_draft(this.draft, this, message)) {
        return false;
      }
        if (this.draft.ispublished) {
          //获取已经发布的文章id
          this.$axios.get("api/article/title=" + this.draft.title).then(res => {
            if (res.data.success) {
              //存在该文章的草稿
              if (res.data.other.find) {
                let id = res.data.other.article._id;
                let url = "api/article/" + "id=" + id;
                this.$axios.put(url, this.draft).then(res => {
                  if (res.data.success) {
                    message.success(this, true, "修改成功");
                    //修改成功后删除原来的草稿
                    this.update_old_draft();
                    this.delete();
                    this.$router.push("/home/draft_table");
                  } else {
                    message.error(this, true, "修改失败", res.data.reason);
                  }
                });
              } else {
                message.error(this, true, "未找到该文章", res.data.reason);
              }
            } else {
              message.error(this, true, "发生错误", res.data.reason);
            }
          });
        } else {
          this.$axios.post("api/article", this.draft).then(res => {
            if (res.data.success) {
              message.success(this, true, "发布成功");
              //发布成功后删除原来的草稿
              this.update_old_draft();
              this.delete();
              this.$router.push("/home/draft_table");
            } else {
              message.error(this, true, "发布失败", res.data.reason);
            }
          });
        }
    },
    // 绑定@imgAdd event
    imgAdd(file) {
      imgupload(file, this);
    },
    $imgDel(pos, $file) {},
    save({ value, theme }) {
      if (!this.ischange()) {
        console.log('cancel')
        return null;
      }
      let draft = this.draft;
      this.getTOC();
      if (check_draft(draft, this, message, true,false)) {
        this.$axios.put("api/draft/id=" + draft._id, draft).then(res => {
          if (res.data.success) {
            message.success(this, true, "保存成功");
            this.update_old_draft();
          } else {
            message.error(this, false, "保存失败", res.data.reason);
          }
        });
      }
    },
    getTOC() {
      this.toc = [];
      let markdown_html = "";
      if (process.browser) {
        markdown_html = marked(this.draft.content);
      }
      let res = "";
      var patt = /<h(\d)?\s+id="(.*?)">/g;
      while ((res = patt.exec(markdown_html))) {
        this.toc.push({ layer: res[1], text: res[2] });
      }
    },
    delete() {
      let url = this.baseurl + "id=" + this.draft._id;
      this.$axios.delete(url).then(res => {
        if (res.data.success) {
          message.success(this, true, "删除成功");
        } else {
          message.error(this, true, "删除失败", res.data.reason);
        }
      });
    },
    update_old_draft() {
      this.old_draft.title = this.draft.title;
      this.old_draft.content = this.draft.content;
      this.old_draft.type = this.draft.type;
      this.old_draft.tag = this.draft.tag;
      this.old_draft.resume = this.draft.resume;
      this.old_draft.cover = this.draft.cover;
    },
    ischange() {

      let a = this.old_draft.title == this.draft.title;
      let b = this.old_draft.content == this.draft.content;
      let c = this.old_draft.title == this.draft.title;
      let d = this.old_draft.tag == this.draft.tag;
      let e = this.old_draft.cover == this.draft.cover;
      let f = this.old_draft.resume == this.draft.resume;
      return !(a && b && c && d && e && f);
    },
    async getDraftById(id) {
      var url = this.baseurl + "id=" + id;
      var result = "";
      await this.$axios.get(url).then(res => {
        if (res.data.success) {
          result = res.data.other.draft;
        } else {
          message.error(this, true, "找不到该草稿", res.data.reason);
        }
      });
      return result;
    },
    addTag() {
      this.showAddTag = true;
    },
    addTag2() {
      this.tags.push(this.tag_add);
      this.tag_add = "";
      this.showAddTag = false;
    },
    deleteTag(event, name) {
      const index = this.tags.findIndex(tags => tags == name);
      if (index > -1) {
        this.tags.splice(index, 1);
      }
    },
    async uploadCoverAndSet(){
        //urls包含原图url和缩略图url
        uploadCroppedImage(this, this.croppa, message)

    },
    ...mapMutations("login", ["_login", "_exit", "setUserName", "setToken"])
  },
  created() {
    if (this.$route.params.id) {
      this.id = this.$route.params.id;
      this.getDraftById(this.id).then(res => {
        this.draft = res;
        this.tags = this.draft.tag.split(",");
        this.cover = this.draft.cover
        this.update_old_draft();
        this.getTOC();
      });
    }
  },
  computed: {
    types() {
      return this.$store.getters.getTypes;
    },
    colors() {
      return this.$store.getters.getColors;
    },
    ...mapGetters("login", ["getToken"])
  },
  watch: {
    tags: {
      handler(newValue, oldValue) {
        //把tags组成一个逗号分隔的字符串
        this.draft.tag = "";
        newValue.map(item => {
          this.draft.tag += item + ",";
        });
        //去掉最后一个字符
        this.draft.tag = this.draft.tag.slice(0, this.draft.tag.length - 1);
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
.draft_body .ivu-input {
  margin: 1em 0em 1em 0em;
}
.title {
  font-size: 21px;
  font-weight: bold;
}
.draft_body {
  padding: 2em 0em 0em 2em;
}
#change_to_button,
#update_button {
  margin-top: 1em;
  float: right;
}
.draft_body .right {
  margin-top: 3em;
}
.markdown {
  max-height: 0%;
}
</style>
