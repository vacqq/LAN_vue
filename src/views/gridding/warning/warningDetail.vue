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
              <el-date-picker v-model="value_date_time" type="datetimerange" format="yyyy-MM-dd HH:mm:ss"
                @change="SelectTimeChoose()" :picker-options="pickerOptions" range-separator="至"
                start-placeholder="开始日期" end-placeholder="结束日期" align="right">
              </el-date-picker>
            </a-col>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons"
                :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="getWarningList">查询</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
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
        <a-table :columns="columns" :data-source="table_data" rowKey="warning_id">
        </a-table>
      </a-spin>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import Axios from '@/utils/request'

const columns = [

  {
    title: '地区',
    dataIndex: 'position'
  },
  {
    title: '站点名称',
    dataIndex: 'site_name'
  },
  {
    title: '报警时间',
    dataIndex: 'warning_time'
  },
  {
    title: '数据类型',
    dataIndex: 'data_type'
  },
  {
    title: '数值',
    dataIndex: 'air_data'
  },
  {
    title: '备注',
    dataIndex: 'remarks'
  }
]

export default {
  name: 'waringDetail',
  components: {
  },
  data () {
    this.columns = columns
    return {

      spinning: true,//全局加载中动画

      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      //参数设置,初始化
      start_time: '',//其实时间
      end_time: '',//结束时间
      data_type: '',//数据类型
      site_name: '',//站点名称
      site_type: '3',//站点类型
      //时间选择器
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一小时',
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近一天',
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近一周',
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近一个月',
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近三个月',
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
      },
      //查询时间选择
      value_date_time: [(new Date().getTime() - 3600 * 1000 * 24), new Date()],
      start_time: '',//全局变量-搜索开始时间
      end_time: '',//全局变量-搜索结束时间

      //数据数组
      table_data: [],//表格数组

      selectedRowKeys: [],
      selectedRows: []
    }
  },

  created () {
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  mounted: function () {
    this.get_time();
    this.getWarningList();

  },
  methods: {

    //时间初始化方法
    get_time () {
      // now_time: '',//全局变量-当前时间
      // pre_now_hour: '',//全局变量-前一小时
      // pre_now_day: '',//全局变量-前一天aqi
      // pre_now_month: '',//全局变量-前一月
      var date = new Date();
      var day1 = new Date();
      day1.setTime(day1.getTime() - 24 * 60 * 60 * 1000);//减去一天的时间
      var pre_now_day = this.setTime(day1);
      var now_time = this.setTime(date);
      this.start_time = pre_now_day;
      this.end_time = now_time;
    },

    setTime (date) {
      var back_date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      return back_date
    },

    //时间自定义选择
    SelectTimeChoose () {
      this.start_time = moment(this.value_date_time[0]).format('YYYY-MM-DD HH:mm:ss');
      this.end_time = moment(this.value_date_time[1]).format('YYYY-MM-DD HH:mm:ss');
      this.getWarningList();
    },
    getWarningList () {
      this.spinning = true;
      this.queryParam = {
        "start_time": this.start_time,
        "end_time": this.end_time,
        "data_type": this.data_type,
        "site_name": this.site_name,
        "site_type": this.site_type
      }
      Axios.post('/api/getWarningData', this.queryParam).then(Response => {
        console.log(Response);
        this.spinning = false;
        this.table_data = Response;
      });
    },


    handleAdd () {
      this.mdl = null
      this.visible = true
    },

    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    }

  }
}
</script>
