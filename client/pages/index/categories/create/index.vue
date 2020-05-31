<template>
<div>
<h1>{{ type == "create" ? "创建分类" : "编辑分类" }}</h1>
  <el-form
    :model="formdata"
    status-icon
    :rules="rules"
    :ref="formName"
    label-width="100px"
    class="demo-ruleForm"
    label-position="left" 
  >
    <el-form-item label="分类名称" prop="name">
      <el-input type="input" v-model="formdata.name" autocomplete="off"></el-input>
    </el-form-item>
        <el-form-item>
      <el-button type="primary" @click="submitForm(formName)">
        {{
        type == "create" ? "创建" : "保存"
        }}
      </el-button>
      <el-button @click="resetForm(`${formName}`)">重置</el-button>
    </el-form-item>
  </el-form>

  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, NextTick } from "nuxt-property-decorator";
import _ from "lodash";
import MyCategoryAPI from "~/api/category";
import { ElForm } from "element-ui/types/form";
import Category from '~/types/Category';
const config = require("~/config.json");
import MyPagePath from '~/types/path';
@Component({
  components: {
  }
})
export default class MyCategoryPage extends Vue {
type:string="create";
typeOptions = config.types
  id: string = "";
  formdata: Category = new Category();
    formName: string = "category_form";
  rules: any = 
    {
      name: [{ required: true, trigger: "blur" }]
    }
  ;
  mounted() {
    this.id = _.get(this, "$route.params.id");
    if (!_.isEmpty(this.id)) {
        this.type = 'edit';
        this.getOneCategory()
    }
  }

  getOneCategory(){
    MyCategoryAPI.findOneAPI(this.$axios, this.id).then(res => {
        if (res.success) {
          this.formdata = res.data;
        }
      });
  }

  submitForm(formName: string) {
    (this.$refs[formName] as ElForm).validate(valid => {
      if (valid) {
        this.type === "create" ? this.handleCreate() : this.handleEdit();
      } else {
        // console.log('error submit!!');
        return false;
      }
    });
  }
  handleCreate() {
     MyCategoryAPI.createAPI(this.$axios, this.formdata).then(res=>{
         if(res.success){
                this.$message({
                message: '创建成功',
                type: 'success'
                });
                this.$router.push(MyPagePath.categoryPages.list)
         }
     });
  }

  handleEdit() {
     MyCategoryAPI.updateAPI(this.$axios, this.id,this.formdata).then(res=>{
         if(res.success){
                this.$message({
                message: '修改成功',
                type: 'success'
                });
                this.$router.push(MyPagePath.categoryPages.list)
         }
     });
  }

  resetForm(formName: string) {
    this.formdata = {...this.formdata, ...new Category()}
  }

}
</script>