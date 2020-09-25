<template>
  <page-header-wrapper>
    <div>
      <a-spin :spinning="spinning" size="large">
        <a-row :gutter="24">
          <a-col :md="24" :lg="24">
            <el-select v-model="site_id" placeholder="请选择" @change="SelectSiteId()">
              <el-option v-for="item in site_id_options" :key="item.site_id" :label="item.name" :value="item.value">
              </el-option>
            </el-select>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <el-date-picker
              v-model="value_date_time"
              type="datetimerange"
              format="yyyy-MM-dd HH:mm:ss"
              @change="SelectTimeChoose()"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
            >
            </el-date-picker>
            <br />
            <br />
            <!--//echart图表输出在div中-->
            <div id="myChart" style="height: 600px; vertical-align: center"></div>
          </a-col>
        </a-row>
      </a-spin>
    </div>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { STable } from '@/components'
import Axios from '@/utils/request'

export default {
  name: 'analysisAllTrend',
  components: {
    STable,
  },
  data() {
    return {
      spinning: false, //加载中动画
      value: [], //层级选择器
      tree_options: [], //层级选择器数组
      father_show: '', //层级选择器显示父名

      //多选框
      checkedCities: [], //checkedCities: [1]默认选择1站点勾选
      checkedCities_fixed: [],
      cities: [],
      cities_fixed: [],

      //时间选择器
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一小时',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近一天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
        ],
      },

      //下拉搜索站点
      site_id_options: [],

      //手风琴
      activeNames: ['3'], //默认展示'1'数据
      // 查询参数
      queryParam: {},

      //echarts图表显示数组
      chart_option: {},
      dataRank: [], //表格数组
      datasname: [], //表格名称
      datasvalue: [], //表格数据数值
      datascolor: [], //表格条形颜色
      site_id_country: '0', //国控站点id列
      site_id_fixed: '0', //固定站点id列

      //参数设置,初始化
      place_id: '21', //全局变量-地区id,石家庄地区place_id为3
      air_type: 'pm25', //全局变量-气体参数
      weather_type: 'voc', //全局变量-天气参数,先默认voc因为里面数据为空的
      site_id: '一号机', //全局变量-站点id范围
      site_type: '3', //全局变量-站点类型,国控站为4,固定站为3
      table_show_name: 'PM2.5', //全局变量-展示搜做哪个
      decimal_num: '0', //全局变量-展示搜做哪个

      //查询时间选择
      value_date_time: [new Date().getTime() - 3600 * 1000 * 24, new Date()],
      start_time: '', //全局变量-搜索开始时间
      end_time: '', //全局变量-搜索结束时间
    }
  },
  created() {},
  mounted: function () {
    this.get_time()
    this.SelectSiteDataByPlaceId()
    this.getAnalysisAllTrend()
  },
  methods: {
    //查询此地区具体站点下拉
    SelectSiteDataByPlaceId() {
      Axios.post('/api/SelectDictionariesByType', { type: 'ip' }).then((Response) => {
        this.site_id_options = Response
      })
    },

    //站点id筛选
    SelectSiteId() {
      this.getAnalysisAllTrend()
    },

    //时间初始化方法
    get_time() {
      // now_time: '',//全局变量-当前时间
      // pre_now_hour: '',//全局变量-前一小时
      // pre_now_day: '',//全局变量-前一天aqi
      // pre_now_month: '',//全局变量-前一月
      var date = new Date()
      var day1 = new Date()
      day1.setTime(day1.getTime() - 24 * 60 * 60 * 1000) //减去一天的时间
      var pre_now_day = this.setTime(day1)
      var now_time = this.setTime(date)
      this.start_time = pre_now_day
      this.end_time = now_time
    },

    setTime(date) {
      var back_date =
        date.getFullYear() +
        '-' +
        (date.getMonth() + 1) +
        '-' +
        date.getDate() +
        ' ' +
        date.getHours() +
        ':' +
        date.getMinutes() +
        ':' +
        date.getSeconds()
      return back_date
    },

    //时间自定义选择
    SelectTimeChoose() {
      this.start_time = moment(this.value_date_time[0]).format('YYYY-MM-DD HH:mm:ss')
      this.end_time = moment(this.value_date_time[1]).format('YYYY-MM-DD HH:mm:ss')
      this.getAnalysisAllTrend()
    },

    //搜索页面显示
    getAnalysisAllTrend() {
      //初始化做菜单下拉选择
      this.queryParam = {
        start_time: this.start_time,
        end_time: this.end_time,
      }
      Axios.post('/api/AnalysisAllTrend', this.queryParam).then((Response) => {
        this.init_echart(Response)
      })
    },

    init_echart(list_data) {
      //遍历返回的json信息,做层层分析,获取站点名称,做主信息

      var data_name = new Array()
      //遍历返回的json信息,做层层分析,获取站点名称,做主信息
      for (var data_num in list_data) {
        //显示柱状图信息
        data_name.push(list_data[data_num]['name'])
      }
      console.log(list_data)
      console.log(data_name)
      var myChart = this.$echarts.init(document.getElementById('myChart'))
      myChart.clear() //清楚图表数据,不然有缓存,无法刷新新图,多选框勾选也去不掉
      // 指定图表的配置项和数据
      var option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: data_name,
        },
        series: [
          {
            name: '流量占比(兆)',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: list_data,
          },
        ],
      }

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option)
    },
  },
}
</script>

