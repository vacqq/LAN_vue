<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="站点名称">
                <a-input v-model="site_name" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="经度查询">
                <a-input v-model="lng" placeholder="" />
              </a-form-item>
            </a-col>
            <template v-if="advanced">
              <a-col :md="8" :sm="24">
                <a-form-item label="纬度查询">
                  <a-input v-model="lat" placeholder="" />
                </a-form-item>
              </a-col>
            </template>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons"
                :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="getSiteList">查询</a-button>
                <a @click="toggleAdvanced" style="margin-left: 8px">
                  {{ advanced ? '收起' : '展开' }}
                  <a-icon :type="advanced ? 'up' : 'down'" />
                </a>
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
          <template slot="action1" slot-scope="text, record">
            <el-button size="mini" type="primary" @click="() => openNotificationWithIcon(record.id, record.place_id)">校准
            </el-button>
          </template>
        </a-table>
      </a-spin>
      <el-dialog title="校准设备" :visible="visible_check" center width="500px" @close="closeDialog">
        <el-form :model="ruleForm_check" border ref="ruleForm_check" label-width="150px" class="demo-ruleForm">
          <el-form-item label="方式" prop="check_id" style="text-align:left">
            <el-select v-model="ruleForm_check.check_id" placeholder="请选择校检方式">
              <el-option v-for="item in check_options_id" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="ruleForm_check.check_id==1" label="站点" prop="place_id" style="text-align:left">
            <el-select v-model="ruleForm_check.check_site_id" placeholder="请选择站点">
              <el-option v-for="item in options_check_site_id" :key="item.id" :label="item.site_name" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="ruleForm_check.check_id==2" label="经度" prop="lng" style="text-align:left">
            <el-input v-model="ruleForm_check.lng" style="width:220px"></el-input>
          </el-form-item>
          <el-form-item v-if="ruleForm_check.check_id==2" label="纬度" prop="lat" style="text-align:left">
            <el-input v-model="ruleForm_check.lat" style="width:220px"></el-input>
          </el-form-item>
          <el-form-item v-if="ruleForm_check.check_id==3" label="上传文件" prop="position" style="text-align:left">
            <el-upload class="upload-demo" :http-request="fileUpload" action :on-preview="handlePreview"
              :on-remove="handleRemove" :before-remove="beforeRemove" :on-exceed="handleExceed" :file-list="fileList">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传xls/xlsx文件，且不超过500kb</div>
            </el-upload>
          </el-form-item>
          <el-form-item style="text-align:left">
            <el-button type="primary" @click="submitForm_check('ruleForm_check')">提交</el-button>
            <el-button @click="resetForm_check('ruleForm_check')">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <el-dialog title="站点信息" :visible="visible" center width="500px" @close="closeDialog">
        <el-form :model="ruleForm" border ref="ruleForm" label-width="150px" class="demo-ruleForm">
          <el-form-item label="地区" prop="place_id" style="text-align:left">
            <el-cascader v-model="value" :placeholder="father_show" :options="tree_options" @change="handleChange_tree">
            </el-cascader>
          </el-form-item>
          <el-form-item label="站点名称" prop="site_name" style="text-align:left"
            :rules="[{ required: true, message: '请输入站点名称'}]">
            <el-input v-model="ruleForm.site_name" style="width:220px"></el-input>
          </el-form-item>
          <el-form-item label="经度" prop="lng" style="text-align:left" :rules="[{ required: true, message: '请输入经度信息'}]">
            <el-input v-model="ruleForm.lng" style="width:220px"></el-input>
          </el-form-item>
          <el-form-item label="纬度" prop="lat" style="text-align:left" :rules="[{ required: true, message: '请输入纬度信息'}]">
            <el-input v-model="ruleForm.lat" style="width:220px"></el-input>
          </el-form-item>
          <el-form-item label="地址" prop="position" style="text-align:left"
            :rules="[{ required: true, message: '请输入地址信息'}]">
            <el-input v-model="ruleForm.position" style="width:220px"></el-input>
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
import { getRoleList, getServiceList } from '@/api/manage'
import request from '@/utils/request'
import Axios from '@/utils/request'
import upfile from '@/utils/request'

const columns = [
  {
    title: '序号',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '地区',
    dataIndex: 'place_id_name',
    scopedSlots: { customRender: 'name' },
  },
  {
    title: '站点名称',
    dataIndex: 'name'
  },
  {
    title: '站点类型',
    dataIndex: 'site_type_name'
  },
  {
    title: '经度',
    dataIndex: 'lng',
    sorter: true
  },
  {
    title: '纬度',
    dataIndex: 'lat',
    sorter: true
  },
  {
    title: '地址',
    dataIndex: 'position'
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  },
  {
    title: '校准',
    dataIndex: 'action1',
    width: '150px',
    scopedSlots: { customRender: 'action1' }
  }
]

export default {
  name: 'SiteManage',
  components: {

  },
  data () {
    this.columns = columns
    return {
      spinning: true,//加载中动画
      //上传文件列表
      fileList: [],

      // create model
      visible: false,
      visible_check: false,
      //展示校准方式显示
      show_check: '',
      //校检方式检查
      check_options_id: [{
        id: '1',
        name: '根据省控站点'
      }, {
        id: '2',
        name: '根据经纬度'
      }, {
        id: '3',
        name: '根据上传文件'
      }],
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      //参数设置,初始化
      site_type: '3',//全局变量-站点类型,国控站为4,固定站为3
      lng: '',//全局变量-经度
      lat: '',//全局变量-纬度
      place_id: '',//全局变量-地区id
      site_name: '',//全局变量-站点名称

      options_place_id: [],//地区id显示
      options_check_site_id: [],
      ShowForm: 0,//显示表单0标识不展开,1标识添加,2标识编辑
      file_name: '',

      //数据数组
      table_data: [],//表格数组
      tree_options: [],//层级选择器数组
      father_show: '',//层级选择器显示父名
      value: [],//层级选择器

      //表格编辑多选选择项
      selectedRowKeys: [],
      selectedRows: [],

      //展示message显示信息
      message_type_show: '',

      //更新id值
      update_id: 0,

      ruleForm: {
        //获取传入参数姓名值
        place_id: '',
        site_type: '3',
        site_name: '',
        lng: '',
        lat: '',
        position: '',
      },
      ruleForm_check: {
        check_site_id: '',
        lng: '',
        lat: '',
        check_id: '',
      },
    }
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
          this.spinning = false;
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

    // 一定要添加file默认参数
    fileUpload (file) {
      console.log(file)
      const data = new FormData()
      data.append('file', file.file)
      this.file_name = file.file.name;
      upfile.post('/etService/toInstructionIssuance1', data, { "content-type": "multipart/form-data" }).then(resp => {
      })
    },

    handleRemove (file, fileList) {
      console.log(file, fileList);
    },
    handlePreview (file) {
      console.log(file);
    },
    handleExceed (files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove (file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },

    //关闭对话框
    closeDialog () {
      this.visible = false
      this.visible_check = false
    },

    //插入相关信息备用。
    insertdata () {
      //初始化传递参数值
      this.queryParam = {
        "place_id": this.ruleForm.place_id,
        "site_type": this.ruleForm.site_type,
        "name": this.ruleForm.site_name,
        "only_name": this.ruleForm.site_name,
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
        "id": this.update_id,
        "place_id": this.ruleForm.place_id,
        "site_type": this.ruleForm.site_type,
        "name": this.ruleForm.site_name,
        "lng": this.ruleForm.lng,
        "lat": this.ruleForm.lat,
        "position": this.ruleForm.position,
        "modify_by": 'lcz'
      }
      Axios.post('/api/UpdateSiteData', this.queryParam).then(resp => {
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
          if (this.ruleForm.place_id.toString().length > 0) {
            // alert('submit!');
            // 决定是添加还是编辑操作
            console.log(this.ShowForm)
            if (this.ShowForm == 1) { this.insertdata(); }
            else if (this.ShowForm == 2) { this.updatedata(this.update_id); }
            //使用完后关闭表单
            this.ShowForm = 0;
            this.visible = false;
          } else {
            this.$message({
              message: "请选择地区",
              type: 'error'
            });
          }
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

    //校准提交
    submitForm_check (formName) {
      this.$refs[formName].validate((valid) => {
        if (this.ruleForm_check.check_id.toString().length > 0) {
          if (valid) {
            // alert('submit!');
            // 决定是添加还是编辑操作
            console.log();
            //使用完后关闭表单
            if (this.ruleForm_check.check_id == 1) {
              if (this.ruleForm_check.check_site_id.toString().length > 0) {
                this.visible_check = false;
                this.queryParam = {
                  "flag": this.ruleForm_check.check_id,
                  "deviceId": this.ruleForm_check.check_site_id,
                  "site_id": this.update_id,
                  "lng": '',
                  "lat": '',
                  'file': ''
                }
                request({
                  method: 'post',
                  url: '/etService/toInstructionIssuance',//后台请求地址
                  params: this.queryParam,
                }).then(resp => {
                  this.$notification['success']({
                    message: '校检信息发送成功',
                    description:
                      '设备开始自动校检',
                  });
                })
              } else {
                this.$message({
                  message: "请选择站点",
                  type: 'error'
                });
              }

            }
            else if (this.ruleForm_check.check_id == 2) {
              this.visible_check = false;
              this.queryParam = {
                "flag": this.ruleForm_check.check_id,
                "lng": this.ruleForm_check.lng,
                "lat": this.ruleForm_check.lat,
                "site_id": this.update_id,
                "deviceId": this.ruleForm_check.check_site_id,
                'file': ''
              }
              request({
                method: 'post',
                url: '/etService/toInstructionIssuance',//后台请求地址
                params: this.queryParam,
              }).then(resp => {
                this.$notification['success']({
                  message: '校检信息发送成功',
                  description:
                    '设备开始自动校检',
                });
              })
            }
            else if (this.ruleForm_check.check_id == 3) {
              this.visible_check = false;
              this.queryParam = {
                "flag": 3,
                "site_id": this.site_id,
                "deviceId": '',
                "file": this.file_name,
                "lng": '',
                "lat": '',
              }
              Axios.post('/api/SelectSiteIdNameBySiteTypeId', this.queryParam).then(resp => {
                this.$notification['success']({
                  message: '校检信息发送成功',
                  description:
                    '设备开始自动校检',
                });
              })
            }
            else {
              this.visible_check = false;
            }
          } else {
            console.log('错误 submit!!');
            return false;
          }
        } else {
          this.$message({
            message: "请选择校准方式",
            type: 'error'
          });
        }
      });
    },

    //取消按钮操作
    resetForm_check (formName) {
      this.visible_check = false;
    },

    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    openNotificationWithIcon (uid, place_id) {
      this.update_id = uid;
      this.visible_check = true;
      this.queryParam = {
        "site_type": '4',
        "place_id": place_id,
      }
      Axios.post('/api/SelectSiteIdNameBySiteTypeId', this.queryParam).then(resp => {
        this.options_check_site_id = resp
      })
    },

    //主程序刷新
    getSiteList () {
      this.queryParam = {
        "site_type": this.site_type,
        "lng": this.lng,
        "lat": this.lat,
        "place_id": this.place_id,
        "site_name": this.site_name
      }
      Axios.post('/api/SelectSiteList', this.queryParam).then(Response => {
        this.table_data = Response;

      });
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
        this.ruleForm.place_id = resp.place_id;
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
