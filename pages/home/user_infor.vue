<template>
  <div>
    <Row type="flex" justify="space-around" class="user_info">
      <Col span="24">
        <Card>
          <p slot="title">
            个人信息
          </p>
          <a href="#" slot="extra" @click.prevent="refresh">
            <Icon type="md-refresh" color="black" size="30"></Icon>
          </a>
          <div v-if="!isloading">
            <Row>
              <Col>
                <div style="text-align:center" class="info">
                  <Avatar
                    icon="ios-person"
                    shape="square"
                    size="150"
                    :src="user.avatar"
                    @click.native="changeAvatar"
                  />
                </div>
                <Divider />
                <client-only
                  ><markdown
                    :height="-1"
                    class="markdown"
                    v-model="user.info"
                    ref="md"
                    :interval="60 * 1000"
                    :autoSave="auto_save"
                    :toolbars="toolbars"
                    @on-upload-image="imgAdd"
                    @on-save="save"
                /></client-only>
              </Col>
            </Row>
          </div>
          <loading v-bind:isloading="isloading" />
        </Card>
      </Col>
    </Row>
    <Modal
      v-model="isshow"
      title="Common Modal dialog box title"
      @on-ok="confirm"
    >
      <croppa
        v-model="croppa"
        :width="350"
        :height="267"
        placeholder="Choose an image"
        :placeholder-font-size="0"
        :disabled="false"
        :prevent-white-space="true"
        :show-remove-button="true"
        initial-size="contain"
      >
        <img crossOrigin="anonymous" :src="user.avatar" slot="initial" />
      </croppa>
    </Modal>
  </div>
</template>
<script>
const { mapGetters } = require("vuex");
const { message } = require("../message");
const { imgupload, uploadCroppedImage} = require("../tool");
import loading from "~/components/loading.vue";
export default {
  data() {
    return {
      user: { info: "", avatar: "" },
      isloading: false,
      issaving: false,
      isshow: false,
      auto_save: true,
      header: {},
      api_url: "api/user/",
      croppa: {},
      toolbars: {
        save: true,
        clear: true,
        uploadImage: true,
        //有bug，不要打开
        fullscreen: false
      }
    };
  },
  components: {
    loading
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    changeAvatar() {
      this.isshow = true;
    },
    async confirm() {
      //urls包含原图url和缩略图url
      let url =await uploadCroppedImage(this, this.croppa, message,'avatar')
      console.log('url %O',url)
      this.user.avatar = url
    },
    change() {
      this.editable = true;
    },
    save() {
      this.issaving = true;
      this.$axios
        .put(this.api_url + "base_info/id=" + this.user._id, this.user)
        .then(res => {
          if (res.data.success) {
            message.success(this, true, "保存成功");
          } else {
            message.error(this, true, "保存失败", res.data.reason);
          }
        });
    },
    getUserInfo(thenfun = false) {
      this.isloading = true;
      let username = this.getUserName;
      if (username == null || username == "") {
        message.error(this, true, "错误", "无法获取用户名，请检查是否已登陆");
      } else {
        this.$axios.get(this.api_url + "username=" + username).then(res => {
          if (res.data.success && res.data.other.users != null) {
            this.user = res.data.other.users;
          } else {
            message.error(this, true, "无法获取用户", res.data.reason);
          }
          if (thenfun != null && typeof thenfun == "function") {
            thenfun();
          }
          this.isloading = false;
        });
      }
    },
    refresh() {
      this.getUserInfo();
    },
    imgAdd(file) {
      imgupload(file, this);
    }
  },
  computed: {
    ...mapGetters("login", ["getUserName", "getToken"])
  }
};
</script>
<style lang="less">
.user_info label {
  font-size: 21px;
  font-weight: bold;
}
.info {
  margin-bottom: 1em;
}
.user_info input {
  padding: 0;
}
#edit_button,
#save_button {
  margin-top: 9em;
  float: right;
}
</style>
