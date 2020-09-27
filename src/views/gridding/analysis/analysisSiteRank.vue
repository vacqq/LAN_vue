<template>
  <page-header-wrapper>
    <div>
      <a-spin :spinning="spinning" size="large">
        <a-row :gutter="24">
          <a-col :md="24" :lg="17">
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
            <br /><br />
            <!--//echart图表输出在div中-->
            <div id="myChart" style="height: 600px; vertical-align: center"></div>
          </a-col>
          <a-col :md="24" :lg="7">
            <a-table :columns="rank_columns" :data-source="dataRank" rowKey="ip_name">
              <span slot="serial" slot-scope="text, record, index">
                {{ index + 1 }}
              </span>
              <a slot="name" slot-scope="text">{{ text }}</a>
            </a-table>
            <el-dialog title="提醒" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
              <p>{{ this.message }}</p>
              <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
              </span>
            </el-dialog>
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
    STable,
  },
  data() {
    return {
      spinning: false, //加载中动画

      value: [], //层级选择器
      tree_options: [], //层级选择器数组
      father_show: '', //层级选择器显示父名

      //下拉搜索站点
      site_type_options: [
        {
          site_type: '4',
          label: '国控站',
        },
        {
          site_type: '3',
          label: '固定站',
        },
      ],

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
      // 查询参数
      queryParam: {},

      //dialog显示问题
      dialogVisible: false,
      message: '',

      //echarts图表显示数组
      chart_option: {},
      dataRank: [], //表格数组
      datasname: [], //表格名称
      datasvalue: [], //表格数据数值
      datascolor: [], //表格条形颜色

      //参数设置,初始化
      place_id: '1号机', //全局变量-地区id,石家庄地区place_id为3
      site_type: '3', //全局变量-站点类型,国控站为4,固定站为3
      air_type: 'pm25', //全局变量-气体参数
      order_type: 'asc', //全局变量-倒序正序
      table_show_name: 'PM2.5', //全局变量-展示搜做哪个
      decimal_num: '0', //全局变量-展示搜做哪个

      //查询时间选择
      value_date_time: [new Date().getTime() - 3600 * 1000 * 24, new Date()],
      start_time: '', //全局变量-搜索开始时间
      end_time: '', //全局变量-搜索结束时间

      //排名表格表头
      rank_columns: [
        {
          title: '排名',
          dataIndex: 'rank_num',
          scopedSlots: { customRender: 'serial' },
        },
        {
          title: '名称',
          dataIndex: 'ip_name',
        },
        {
          title: '时长(分)',
          dataIndex: 'minute',
        },
      ],
    }
  },
  created() {},
  mounted: function () {
    this.get_time()
    this.getAnalysisSiteRank()
  },
  methods: {
    //对话框处理
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then((_) => {
          done()
        })
        .catch((_) => {})
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
      this.getAnalysisSiteRank()
    },

    //站点类型筛选
    SelectSiteType() {
      this.getAnalysisSiteRank()
    },

    getAnalysisSiteRank() {
      this.queryParam = {
        start_time: this.start_time,
        end_time: this.end_time,
      }
      console.log(this.start_time)
      console.log(this.end_time)
      Axios.post('/api/AnalysisSiteRank', this.queryParam).then((Response) => {
        console.log(Response)
        this.dataRank = Response
        this.init_echart(Response)
      })
    },

    init_echart(list_data) {
      var data_name = new Array()
      var data_value = new Array()
      var data_color = new Array()
      // console.log(list); //输出信息显示
      for (var num in list_data) {
        //显示柱状图信息
        data_name.push(list_data[num]['ip_name'])
        data_value.push(list_data[num]['minute'])
        data_color.push('green')
        if (list_data[num]['minute'] > 60) {
          this.dialogVisible = true
          this.message += list_data[num]['ip_name'] + '已超过使用1小时。\n\n\n'
        }
      }

      var myChart = this.$echarts.init(document.getElementById('myChart'))
      // 指定图表的配置项和数据
      var option = {
        //标题
        title: {
          text: '用户使用时长统计(分)',
          textStyle: {
            fontSize: 18,
            fontWeight: 400,
          },
          subtextStyle: {
            fontSize: 12,
            color: 'rgb(24,89,233)',
            align: 'right',
            fontWeight: 400,
          },
        },
        //布局
        grid: {
          left: '5%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        //鼠标悬浮事件
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        //x轴信息
        xAxis: {
          type: 'category',
          data: data_name,
          axisLabel: {
            interval: 0, //横轴信息全部显示
            rotate: 45, //-15度角倾斜显示
          },
        },
        yAxis: {
          type: 'value',
        },
        //series,数据内容信息填充
        series: [
          {
            data: data_value,
            type: 'bar',
            //条状宽度
            barWidth: 26,
            itemStyle: {
              normal: {
                // 定制显示（按顺序）
                color: function (params) {
                  var colorList = data_color
                  return colorList[params.dataIndex]
                },
              },
            },
            //系统默认的数据颜色,存在缺陷
            // color: data_color,
            label: {
              normal: {
                position: 'top',
                color: 'rgb(51,51,51)',
                fontWeight: 'normal',
                show: true,
              },
            },
            //背景色
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(220, 220, 220, 0.8)',
            },
          },
        ],
      }
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option)
    },
  },
}
</script>

