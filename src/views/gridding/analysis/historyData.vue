<template>
  <page-header-wrapper>
    <div>
      <a-spin :spinning="spinning" size="large">
        <a-row :gutter="24">
          <a-col :md="24" :lg="17">
            <el-cascader v-model="value" :placeholder="father_show" :options="tree_options" @change="handleChange_tree">
            </el-cascader>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <el-select v-model="site_type" placeholder="请选择" @change="SelectSiteType()">
              <el-option v-for="item in site_type_options" :key="item.site_type" :label="item.label"
                :value="item.site_type">
              </el-option>
            </el-select>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <el-select v-model="site_id" placeholder="请选择" @change="SelectSiteId()">
              <el-option v-for="item in site_id_options" :key="item.site_id" :label="item.site_name"
                :value="item.site_id">
              </el-option>
            </el-select>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <el-date-picker v-model="value_date_time" type="datetimerange" format="yyyy-MM-dd HH:mm:ss"
              @change="SelectTimeChoose()" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" align="right">
            </el-date-picker>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <el-button type="primary" @click="openNotificationWithIcon">导出</el-button>
            <br /><br />
            <a-spin :spinning="spinning_table" size="small">
              <a-table :columns="Show_columns" :data-source="dataShow" rowKey="id">
                <a slot="name" slot-scope="text">{{ text }}</a>
              </a-table>
            </a-spin>
          </a-col>
        </a-row>
      </a-spin>
    </div>

  </page-header-wrapper>

</template>

<script>
import moment from 'moment'
import { STable } from '@/components'
import { getRoleList, getServiceList } from '@/api/manage'
import Axios from '@/utils/request'

export default {
  name: 'analysisSiteRank',
  components: {
    STable
  },
  data () {
    return {
      spinning: true,//全局加载中动画
      spinning_table: true,//表格加载中动画

      value: [],//层级选择器
      tree_options: [],//层级选择器数组
      father_show: '',//层级选择器显示父名

      //下拉搜索站点
      site_type_options: [{
        site_type: '4',
        label: '国控站'
      }, {
        site_type: '3',
        label: '固定站'
      }, {
        site_type: '5',
        label: '移动站'
      }],

      //下拉搜索站点
      site_id_options: [],

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
          },
          {
            text: '最近一年',
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
              picker.$emit('pick', [start, end]);
            }
          }
        ]
      },
      // 查询参数
      queryParam: {},

      //echarts图表显示数组
      chart_option: {},
      dataShow: [],//表格数组
      datasname: [],//表格名称
      datasvalue: [],//表格数据数值
      datascolor: [],//表格条形颜色

      //参数设置,初始化
      place_id: '21',//全局变量-地区id,石家庄地区place_id为3
      site_type: '3',//全局变量-站点类型,国控站为4,固定站为3
      site_id: '',//全局变量-站点id
      air_type: 'pm25',//全局变量-气体参数
      order_type: 'asc',//全局变量-倒序正序
      table_show_name: 'PM2.5',//全局变量-展示搜做哪个
      decimal_num: '0',//全局变量-展示搜做哪个

      //查询时间选择
      value_date_time: [(new Date().getTime() - 3600 * 1000 * 24), new Date()],
      start_time: '',//全局变量-搜索开始时间
      end_time: '',//全局变量-搜索结束时间

      //排名表格表头
      Show_columns: [
        {
          title: '站点名称',
          dataIndex: 'site_name',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: '站点类型',
          dataIndex: 'site_type',
        },
        {
          title: '时间',
          dataIndex: 'record_time',
        },
        {
          title: 'PM2.5',
          dataIndex: 'pm25',
        },
        {
          title: 'PM10',
          dataIndex: 'pm10',
        },
        {
          title: 'SO2',
          dataIndex: 'so2',
        },
        {
          title: 'NO2',
          dataIndex: 'no2',
        },
        {
          title: 'CO',
          dataIndex: 'co',
        }
        ,
        {
          title: 'O3',
          dataIndex: 'o3',
        }
      ],

    }
  },
  created () {
  },
  mounted: function () {
    this.place_ready('2');//展示河北省数据
    this.get_time();
    this.getHistoryData();
    this.SelectSiteDataByPlaceId();
  },
  methods: {

    //查询此地区具体站点下拉
    SelectSiteDataByPlaceId () {
      Axios.post('/api/GetSiteDataByPlaceId', { "site_type": this.site_type, "place_id": this.place_id }).then(Response => {
        this.site_id_options = Response;
        console.log(Response);
      });
    },

    //时间自定义选择
    SelectTimeChoose () {
      this.start_time = moment(this.value_date_time[0]).format('YYYY-MM-DD HH:mm:ss');
      this.end_time = moment(this.value_date_time[1]).format('YYYY-MM-DD HH:mm:ss');
      this.getHistoryData();
    },

    //层级选择器下拉事件
    handleChange_tree (value) {
      for (var num in value) {
        //输出最后一个value信息
        this.place_id = value[num];
      }
      this.getHistoryData();
      this.SelectSiteDataByPlaceId();
      console.log(this.place_id);
    },

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

    //站点类型筛选
    SelectSiteType () {
      this.SelectSiteDataByPlaceId();
      this.getHistoryData();
    },

    //站点id筛选
    SelectSiteId () {
      this.getHistoryData();
    },

    getHistoryData () {
      this.spinning_table = true;
      this.queryParam = {
        "type": this.air_type,
        "place_id": this.place_id,//全局变量-地区id,石家庄地区place_id为3
        "order_type": this.order_type,
        "site_type": this.site_type,
        "start_time": this.start_time,
        "end_time": this.end_time,
        "decimal_num": this.decimal_num,
        "site_id": this.site_id
      }
      Axios.post('/api/getHistoryDataValue', this.queryParam).then(Response => {
        console.log(Response);
        this.dataShow = Response;
        this.spinning_table = false;
        // this.init_echart(Response);

      });
    },

    openNotificationWithIcon () {
      Axios({
        method: 'post',
        url: '/api/exportExcel',//后台请求地址
        data: this.dataShow,
        responseType: 'blob',
      }).then(Response => {
        console.log(Response);
        const content = Response
        const blob = new Blob([content])
        const fileName = '历史数据导出.xls'
        if ('download' in document.createElement('a')) { // 非IE下载
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href) // 释放URL 对象
          document.body.removeChild(elink)
        } else { // IE10+下载
          navigator.msSaveBlob(blob, fileName)
        }
      });
    },
  }
}
</script>

