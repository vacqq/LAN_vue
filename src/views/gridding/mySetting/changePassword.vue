<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <el-form :model="ruleForm" border status-icon :rules="rules" ref="ruleForm" label-width="150px"
        class="demo-ruleForm">
        <el-form-item label="用户id：" prop="username" style="text-align:left">
          {{this.ruleForm.username}}
        </el-form-item>
        <el-form-item label="用户姓名：" prop="chinese_names" style="text-align:left">
          {{this.ruleForm.chinese_names}}
        </el-form-item>
        <el-form-item label="原密码" prop="old_password" style="text-align:left">
          <el-input type="password" v-model="ruleForm.old_password" style="width:220px"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="password" style="text-align:left">
          <el-input type="password" v-model="ruleForm.password" style="width:220px"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="password_check" style="text-align:left">
          <el-input type="password" v-model="ruleForm.password_check" style="width:220px"></el-input>
        </el-form-item>
        <el-form-item style="text-align:left">
          <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
        </el-form-item>
      </el-form>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import Axios from '@/utils/request'

export default {
  name: 'changePassword',
  components: {
  },
  data () {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.ruleForm.password_check !== '') {
          this.$refs.ruleForm.validateField('password_check');
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.ruleForm.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      //禁用输入框
      disabled: false,
      // 查询参数
      queryParam: {},
      //参数设置,初始化
      password: '',//全局变量-纬度
      userInfo: this.$store.getters.userInfo,
      chinese_names: '',//全局变量-用户名称
      //展示message显示信息
      message_type_show: '',
      //更新id值
      update_id: 0,
      ruleForm: {
        //获取传入参数姓名值
        chinese_names: '',
        password: '',
        username: '',
      },
      rules: {
        old_password: { required: true, message: '请输入原密码' },
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
        password_check: [
          { validator: validatePass2, trigger: 'blur' }
        ],
      }
    }
  },

  mounted: function () {
    this.handleEdit();
  },
  methods: {
    //更新相关信息备用。通过id
    updatedata () {
      this.queryParam = {
        "password": this.ruleForm.password,
        "username": this.ruleForm.username,
        "modify_by": this.ruleForm.username
      }
      Axios.post('/api/UserUpdatePassword', this.queryParam).then(resp => {
        if (resp.result_data != 0) {
          this.message_type_show = 'success';
        }
        else {
          this.message_type_show = 'error';
        }
        this.$message({
          message: resp.result_msg,
          type: this.message_type_show
        });
      })

    },

    //表单操作,表单提交操作
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // alert('submit!');
          // 决定是添加还是编辑操作
          this.updatedata();
        } else {
          console.log('错误 submit!!');
          return false;
        }
      });
    },

    handleEdit () {
      console.log(this.userInfo)
      this.ruleForm.username = this.userInfo.username;
      this.ruleForm.chinese_names = this.userInfo.name;
    },

  }
}
</script>
