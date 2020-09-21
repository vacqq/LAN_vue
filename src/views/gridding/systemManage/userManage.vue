<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="用户名称">
                <a-input v-model="chinese_names" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons"
                :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="getUserList">查询</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>

      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">新建</a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay" @click="handleDelete">
            <a-menu-item key="1">
              <a-icon type="delete" />删除</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            批量操作
            <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <a-spin :spinning="spinning" size="small">
        <a-table :columns="columns" :data-source="table_data" rowKey="id" :row-selection="rowSelection">
          <span slot="serial" slot-scope="text, record, index">
            {{ index + 1 }}
          </span>
          <template slot="action" slot-scope="text, record">
            <el-button size="mini" type="primary" @click="handleEdit(record.id)">编辑</el-button>
          </template>
          <a slot="action" @click="() => openNotificationWithIcon('success')" slot-scope="">校准</a>
        </a-table>
      </a-spin>

      <el-dialog title="用户信息" :visible="visible" center width="500px" @close="closeDialog">
        <el-form :model="ruleForm" status-icon border :rules="rules" ref="ruleForm" label-width="150px"
          class="demo-ruleForm">
          <el-form-item label="地区管理" prop="place_id" style="text-align:left">
            <el-cascader v-model="value" :placeholder="father_show" :options="tree_options" @change="handleChange_tree">
            </el-cascader>
          </el-form-item>
          <el-form-item label="用户id" prop="username" style="text-align:left">
            <el-input v-model="ruleForm.username" style="width:220px"></el-input>
          </el-form-item>
          <el-form-item label="用户姓名" prop="chinese_names" style="text-align:left">
            <el-input v-model="ruleForm.chinese_names" style="width:220px"></el-input>
          </el-form-item>
          <el-form-item v-if="this.ShowForm == 1" label="密码" prop="password" style="text-align:left">
            <el-input type="password" v-model="ruleForm.password" style="width:220px"></el-input>
          </el-form-item>
          <el-form-item v-if="this.ShowForm == 1" label="确认密码" prop="password_check" style="text-align:left">
            <el-input type="password" v-model="ruleForm.password_check" style="width:220px"></el-input>
          </el-form-item>

          <el-form-item style="text-align:left">
            <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
            <el-button @click="resetForm('ruleForm')">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'

import Axios from '@/utils/request'

const columns = [
  {
    title: '序号',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '用户id',
    dataIndex: 'username'
  },
  {
    title: '用户姓名',
    dataIndex: 'chinese_names'
  },
  {
    title: '地区',
    dataIndex: 'position'
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'userManage',
  components: {

  },
  data () {
    this.columns = columns;
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
      spinning: true,//加载中动画

      // create model
      visible: false,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      //参数设置,初始化
      site_type: '3',//全局变量-用户类型,国控站为4,固定站为3
      lng: '',//全局变量-经度
      password: '',//全局变量-纬度
      place_id: '',//全局变量-地区id
      chinese_names: '',//全局变量-用户名称

      options_place_id: [],//地区id显示
      ShowForm: 0,//显示表单0标识不展开,1标识添加,2标识编辑
      tree_options: [],//层级选择器数组
      father_show: '',//层级选择器显示父名
      value: [],//层级选择器


      //数据数组
      table_data: [],//表格数组

      //表格编辑多选选择项
      selectedRowKeys: [],
      selectedRows: [],

      //展示message显示信息
      message_type_show: '',

      //更新id值
      update_id: 0,
      dialogCode: true,

      ruleForm: {
        //获取传入参数姓名值
        place_id: '',
        site_type: '3',
        chinese_names: '',
        lng: '',
        password: '',
        username: '',
        password_check: '',
      },
      rules: {
        username: { required: true, message: '请输入用户id，且用户id唯一' },
        chinese_names: { required: true, message: '请输入用户姓名' },
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
        password_check: [
          { validator: validatePass2, trigger: 'blur' }
        ],

      }
    }
  },

  created () {
  },
  computed: {
    //多选选择
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    },
  },

  mounted: function () {
    this.getUserList();
    this.place_ready(2);

  },
  methods: {

    //地区表树形结构规划
    place_ready (place_id) {
      Axios.post('/api/PlaceTreeList', { "place_id": place_id }).then(Response => {
        this.tree_options = Response["place_detail"];
        this.father_show = Response["place_father_show"];
        console.log(Response);
        if (this.father_show != '') {
        }
      });
    },

    //层级选择器下拉事件
    handleChange_tree (value) {
      for (var num in value) {
        //输出最后一个value信息
        this.ruleForm.place_id = value[num];
      }
      console.log(this.ruleForm.place_id);
    },

    //关闭对话框
    closeDialog () {
      this.visible = false
    },
    //获取地区下拉项
    getPlaceIdByType () {
      this.queryParam = {
        "type": '县区',
      }
      Axios.post('/api/SelectPlaceIdByType', this.queryParam).then(resp => {
        this.options_place_id = resp
        this.spinning = false;
      })
    },

    //插入相关信息备用。
    insertdata () {
      //初始化传递参数值
      this.queryParam = {
        "place_id": this.ruleForm.place_id,
        "chinese_names": this.ruleForm.chinese_names,
        "password": this.ruleForm.password,
        "username": this.ruleForm.username,
      }
      Axios.post('/api/InsertUserDetail', this.queryParam).then(resp => {
        console.log(resp)
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
        this.getUserList();
      })
    },

    //更新相关信息备用。通过id
    updatedata (uid) {
      this.queryParam = {
        "id": this.update_id,
        "place_id": this.ruleForm.place_id,
        "site_type": this.ruleForm.site_type,
        "chinese_names": this.ruleForm.chinese_names,
        "lng": this.ruleForm.lng,
        "password": this.ruleForm.password,
        "username": this.ruleForm.username,
        "modify_by": 'lcz'
      }
      Axios.post('/api/UpdateUserDetail', this.queryParam).then(resp => {
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
        this.getUserList();
      })

    },

    //表单操作,表单提交操作
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // alert('submit!');
          // 决定是添加还是编辑操作
          if (this.ruleForm.place_id.toString().length > 0) {
            console.log(this.ShowForm)
            if (this.ShowForm == 1) { this.insertdata(); }
            else if (this.ShowForm == 2) { this.updatedata(this.update_id); }
          } else {
            this.$message({
              message: "请选择地区",
              type: 'error'
            });
          }
          //使用完后关闭表单
          this.ShowForm = 0;
          this.visible = false;
        } else {
          console.log('错误 submit!!');
          return false;
        }
      });
    },

    //取消按钮操作
    resetForm (formName) {
      this.ShowForm = 0;
      this.visible = false;
    },

    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    openNotificationWithIcon (type) {
      this.$notification[type]({
        message: '校检发送成功',
        description:
          '设备开始自动校检',
      });
    },

    //主程序刷新
    getUserList () {
      this.queryParam = {
        "site_type": this.site_type,
        "place_id": this.place_id,
        "username": this.username,
        "chinese_names": this.chinese_names
      }
      Axios.post('/api/SelectUserDetailList', this.queryParam).then(Response => {
        console.log(Response);
        this.table_data = Response;
        this.spinning = false;
      });
    },

    handleAdd () {
      this.ShowForm = 1;
      this.visible = true;
    },

    handleEdit (uid) {
      console.log(uid)
      this.update_id = uid
      this.queryParam = {
        "id": uid,
      }
      Axios.post('/api/UserDetailByLoginId', this.queryParam).then(resp => {
        this.ruleForm.place_id = resp.place_id;
        this.ruleForm.chinese_names = resp.chinese_names;
        this.ruleForm.password = '';
        this.ruleForm.username = resp.username;
      })
      this.visible = true;
      this.ShowForm = 2;
    },

    handleDelete () {
      var id_all = '0'
      for (var num in this.selectedRowKeys) {
        id_all = id_all + "," + this.selectedRowKeys[num]
      }
      console.log(id_all)
      Axios.post('/api/DeleteUserDetail', { "id_all": id_all }).then(Response => {
        if (Response.result_data != 0) {
          this.message_type_show = 'success';
        }
        else {
          this.message_type_show = 'error';
        }
        this.$message({
          message: Response.result_msg,
          type: this.message_type_show
        });
        this.getUserList();
      });
    },

    toggleAdvanced () {
      this.advanced = !this.advanced
    },

  }
}
</script>
