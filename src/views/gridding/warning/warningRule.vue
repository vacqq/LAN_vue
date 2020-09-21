<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-operator">
        <!-- <a-button type="primary" icon="plus" @click="handleAdd">新建</a-button> -->
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

      <a-spin :spinning="spinning" size="large">
        <a-table :columns="columns" :data-source="table_data" rowKey="name">
          <span slot="serial" slot-scope="text, record, index">
            {{ index + 1 }}
          </span>
          <template slot="name" slot-scope="text, record">
            {{(record.name * 100 +'%')}}
          </template>
          <template slot="action" slot-scope="text, record">
            <el-button size="mini" type="primary" @click="handleEdit(record.id)">编辑</el-button>
          </template>
          <a slot="action" @click="() => openNotificationWithIcon('success')" slot-scope="">校准</a>
        </a-table>
      </a-spin>

      <el-dialog title="报警百分比配置" :visible="visible" center width="500px" @close="closeDialog">
        <el-form :model="ruleForm" border ref="ruleForm" label-width="150px" class="demo-ruleForm">
          <el-form-item label="超出范围值" prop="rule_id" style="text-align:left">
            <el-select v-model="ruleForm.rule_id" placeholder="请选择">
              <el-option v-for="item in options_rule_id" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
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
    title: '超出范围值',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'warningRule',
  components: {

  },
  data () {
    this.columns = columns
    return {
      spinning: true,//加载中动画

      // create model
      visible: false,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      //参数设置,初始化
      site_type: '3',//全局变量-站点类型,国控站为4,固定站为3
      lng: '',//全局变量-经度
      lat: '',//全局变量-纬度
      rule_id: '0.3',//全局变量-地区id
      site_name: '',//全局变量-站点名称

      options_rule_id: [{
        id: '0.3',
        name: '30%'
      }, {
        id: '0.6',
        name: '60%'
      }, {
        id: '0.9',
        name: '90%'
      }],//地区id显示
      ShowForm: 0,//显示表单0标识不展开,1标识添加,2标识编辑

      //数据数组
      table_data: [],//表格数组

      //表格编辑多选选择项
      selectedRowKeys: [],
      selectedRows: [],

      //展示message显示信息
      message_type_show: '',

      //更新id值
      update_id: 0,

      ruleForm: {
        //获取传入参数姓名值
        rule_id: '0.3',
        site_type: '3',
        site_name: '',
        lng: '',
        lat: '',
        position: '',
      },
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
    this.getSiteList();
  },
  methods: {

    //关闭对话框
    closeDialog () {
      this.visible = false
    },
    //插入相关信息备用。
    insertdata () {
      //初始化传递参数值
      this.queryParam = {
        "rule_id": this.ruleForm.rule_id,
        "site_type": this.ruleForm.site_type,
        "name": this.ruleForm.site_name,
        "lng": this.ruleForm.lng,
        "lat": this.ruleForm.lat,
        "position": this.ruleForm.position,
      }
      Axios.post('/api/InsertSiteData', this.queryParam).then(resp => {
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
        this.getSiteList();
      })
    },

    //更新相关信息备用。通过id
    updatedata (uid) {
      this.queryParam = {
        "rule_id": this.ruleForm.rule_id,
      }
      Axios.post('/api/UpdateRuleWord', this.queryParam).then(resp => {
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
        this.getSiteList();
      })

    },

    //表单操作,表单提交操作
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // alert('submit!');
          // 决定是添加还是编辑操作
          if (this.ruleForm.rule_id > 0) {
            if (this.ShowForm == 1) { this.insertdata(); }
            else if (this.ShowForm == 2) { this.updatedata(this.update_id); }
          } else {
            this.$message({
              message: "请选择超出范围值",
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
    getSiteList () {
      Axios.post('/api/SelectRuleTableList').then(Response => {
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
      this.update_id = uid
      this.queryParam = {
        "id": uid,
      }
      Axios.post('/api/SelectSiteDataById', this.queryParam).then(resp => {
        this.ruleForm.rule_id = resp.rule_id;
        this.ruleForm.site_type = resp.site_type;
        this.ruleForm.site_name = resp.only_name;
        this.ruleForm.lng = resp.lng;
        this.ruleForm.lat = resp.lat;
        this.ruleForm.position = resp.position;
      })
      this.visible = true;
      this.ShowForm = 2;
    },

    handleDelete () {
      var id_all = '0'
      for (var num in this.selectedRowKeys) {
        id_all = id_all + "," + this.selectedRowKeys[num]
      }
      Axios.post('/api/DeleteSiteData', { "id_all": id_all }).then(Response => {
        // Response;
        this.getSiteList();
      });
    },

    toggleAdvanced () {
      this.advanced = !this.advanced
    },

  }
}
</script>
