<template>
  <page-header-wrapper>
    <div>
      <a-spin :spinning="spinning" size="large">
        <a-row :gutter="24">
          <a-col :md="24" :lg="17">
            刷新：
            <el-select v-model="brush_type" @change="SelectSiteType">
              <el-option v-for="item in brush_type_options" :key="item.brush_type" :label="item.label"
                :value="item.brush_type">
              </el-option>
            </el-select>

            <br />
            <br />
            <a-table :columns="Show_columns" :data-source="dataShow" rowKey="id">
              <a slot="name" slot-scope="text">{{ text }}</a>
            </a-table>
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
      intervalId: null,
      spinning: true,//加载中动画

      value: [],//层级选择器
      tree_options: [],//层级选择器数组
      father_show: '',//层级选择器显示父名

      //下拉搜索站点
      site_type_options: [
        {
          site_type: '3',
          label: '固定站'
        }, {
          site_type: '2',
          label: '移动站'
        }
        /* ,{
        site_type: '4',
        label: '国控站'
        } */
      ],

      //刷新时间间隔
      brush_type_options: [{
        brush_type: '1',
        label: '5s'
      }, {
        brush_type: '2',
        label: '10s'
      }, {
        brush_type: '3',
        label: '15s'
      }],

      brush_type: '1',

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
          }]
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
      air_type: 'm25',//全局变量-气体参数
      order_type: 'asc',//全局变量-倒序正序
      table_show_name: 'AQI',//全局变量-展示搜做哪个
      decimal_num: '0',//全局变量-展示搜做哪个

      //查询时间选择
      value_date_time: [(new Date().getTime() - 3600 * 1000 * 24), new Date()],
      start_time: '',//全局变量-搜索开始时间
      end_time: '',//全局变量-搜索结束时间
      time: 5000,//刷新数据间隔

      //排名表格表头
      Show_columns: [
        {
          title: '用户名称',
          dataIndex: 'user_name',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: '访问类型',
          dataIndex: 'type_name',
        },
        {
          title: '时间',
          dataIndex: 'record_time',
        },
        {
          title: '数据包大小',
          dataIndex: 'use_num',
        },
      ],

    }
  },
  created () {
  },
  mounted: function () {
    this.get_time();
    this.getOnlineDeviceData();
    this.dataRefreh();
  },
  methods: {
    dataRefreh () {
      if (this.intervalId != null) {
        return;
      }
      var times = 0;
      //在此内部刷新
      this.intervalId = setInterval(() => {
        console.log('1' + new Date())
        this.getOnlineDeviceData();
      }, this.time);
    },
    // 停止定时器
    clear () {
      clearInterval(this.intervalId); //清除计时器
      this.intervalId = null; //设置为null
    },

    //层级选择器下拉事件
    handleChange_tree (value) {
      for (var num in value) {
        //输出最后一个value信息
        this.place_id = value[num];
      }
      this.getOnlineDeviceData();
      console.log(this.place_id);
    },

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

    //时间初始化方法
    get_time (brushType) {
      let obj = {};
      var pre_hour = "";
      if (brushType === undefined) {
        brushType = 1;
        obj.brush_type = '1';
        obj.label = '1小时';
      } else {
        obj = this.brush_type_options.find((item) => {//这里的selectList就是上面遍历的数据源
          return item.brush_type === brushType;
        });
      }
      var date = new Date();
      var year = new Date().getFullYear();
      var month = new Date().getMonth() + 1;
      var pre_month = new Date().getMonth();//查询过去1个月时间
      var day = new Date().getDate();
      var pre_day = new Date().getDate() - 1;
      var hour = new Date().getHours();
      //根据下拉选项动态设置查询时间 同同时设置当小时数小于10时第一位补0
      if (obj.brush_type == 1) {
        pre_hour = new Date().getHours() - 1 < 10 ? '0' + new Date().getHours() - 1 : new Date().getHours() - 1;
      } else if (obj.brush_type == 2) {
        pre_hour = new Date().getHours() - 2 < 10 ? '0' + new Date().getHours() - 2 : new Date().getHours() - 2;
      } else if (obj.brush_type == 3) {
        pre_hour = new Date().getHours() - 3 < 10 ? '0' + new Date().getHours() - 3 : new Date().getHours() - 3;
      }
      //当分钟数小于10 时第一位补0
      var minute = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes();
      //当秒数小于10 时第一位补0
      var second = new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() : new Date().getSeconds();
      // now_time: '',//全局变量-当前时间
      // pre_now_hour: '',//全局变量-前一小时
      // pre_now_day: '',//全局变量-前一天aqi
      // pre_now_month: '',//全局变量-前一月
      var now_time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
      var pre_now_hour = year + '-' + month + '-' + day + ' ' + pre_hour + ':' + minute + ':' + second;
      var pre_now_day = year + '-' + month + '-' + pre_day + ' ' + hour + ':' + minute + ':' + second;
      var pre_now_month = year + '-' + pre_month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
      this.start_time = pre_now_hour;
      this.end_time = now_time;
    },

    //站点类型筛选
    SelectSiteType (brush_type) {
      this.get_time(brush_type)
      this.getOnlineDeviceData();
      if (this.brush_type == 1) {
        this.time = 5000;
        this.clear();
        this.dataRefreh();
      } else if (this.brush_type == 2) {
        this.time = 10000;
        this.clear();
        this.dataRefreh();
      } else if (this.brush_type == 3) {
        this.time = 15000;
        this.clear();
        this.dataRefreh();
      }
    },

    getOnlineDeviceData () {
      this.queryParam = {
        "type": this.air_type,
        "place_id": this.place_id,//全局变量-地区id,石家庄地区place_id为3
        "order_type": this.order_type,
        "site_type": this.site_type,
        "start_time": this.start_time,
        "end_time": this.end_time,
        "decimal_num": this.decimal_num
      }
      console.log("拿到了数据");
      Axios.post('/api/getOnlineDeviceDataValue', this.queryParam).then(Response => {
        console.log(Response);
        this.dataShow = Response;
        this.spinning = false;
      });
    },
  },
  created () {
    this.dataRefreh();
  },
  destroyed () {
    // 在页面销毁后，清除计时器
    this.clear();
  }
}
</script>

