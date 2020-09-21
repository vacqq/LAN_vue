<template>
  <page-header-wrapper>
    <div>
      <a-spin :spinning="spinning" size="large">
        <a-row :gutter="24">
          <a-col :md="24" :lg="17">
            <el-cascader v-model="value" :placeholder="father_show" :options="tree_options" @change="handleChange_tree">
            </el-cascader>
            <!-- <el-select v-model="place_id" placeholder="请选择" @change="SelectSiteType()">
            <el-option v-for="item in place_id_options" :key="item.place_id" :label="item.label" :value="item.place_id">
            </el-option>
          </el-select> -->
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <el-date-picker v-model="value_date_time" type="datetimerange" format="yyyy-MM-dd HH:mm:ss"
              @change="SelectTimeChoose()" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" align="right">
            </el-date-picker>
            <br />
            <el-select v-model="site_type" placeholder="请选择" @change="SelectSiteType()">
              <el-option v-for="item in site_type_options" :key="item.site_type" :label="item.label"
                :value="item.site_type">
              </el-option>
            </el-select>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <el-button size="small" @click="changeDataTypeShort('aqi','AQI','0')">AQI</el-button>
            <el-button size="small" @click="changeDataTypeShort('pm25','PM2.5','0')">PM2.5</el-button>
            <el-button size="small" @click="changeDataTypeShort('pm10','PM10','0')">PM10</el-button>
            <el-button size="small" @click="changeDataTypeShort('so2','SO2','0')">SO2</el-button>
            <el-button size="small" @click="changeDataTypeShort('no2','NO2','0')">NO2</el-button>
            <el-button size="small" @click="changeDataTypeShort('co','CO','2')">CO</el-button>
            <el-button size="small" @click="changeDataTypeShort('o3','O3','0')">O3</el-button>

            <el-button size="small" @click="SelectOrderTypeChange('asc')">正序</el-button>
            <el-button size="small" @click="SelectOrderTypeChange('desc')">倒序</el-button>
            <br />
            <!--//echart图表输出在div中-->
            <div id="myChart" style="height:600px;vertical-align:center"></div>
            <div>
              <p>说明：</p>
              <p>*对指定机构区域内的所有国控站点的空气质量指标数据进行排名统计</p>
              <p>*柱状图和表状图都是对该机构进行站点某指标排名</p>
            </div>
          </a-col>
          <a-col :md="24" :lg="7">
            <a-table :columns="rank_columns" :data-source="dataRank" rowKey="rank_num">
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
      spinning: true,//加载中动画

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
      }],

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
      // 查询参数
      queryParam: {},

      //echarts图表显示数组
      chart_option: {},
      dataRank: [],//表格数组
      datasname: [],//表格名称
      datasvalue: [],//表格数据数值
      datascolor: [],//表格条形颜色

      //参数设置,初始化
      place_id: '21',//全局变量-地区id,石家庄地区place_id为3
      site_type: '3',//全局变量-站点类型,国控站为4,固定站为3
      air_type: 'pm25',//全局变量-气体参数
      order_type: 'asc',//全局变量-倒序正序
      table_show_name: 'PM2.5',//全局变量-展示搜做哪个
      decimal_num: '0',//全局变量-展示搜做哪个

      //查询时间选择
      value_date_time: [(new Date().getTime() - 3600 * 1000 * 24), new Date()],
      start_time: '',//全局变量-搜索开始时间
      end_time: '',//全局变量-搜索结束时间

      //排名表格表头
      rank_columns: [
        {
          title: '排名',
          dataIndex: 'rank_num',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: '名称',
          dataIndex: 'site_name',
        },
        {
          title: '浓度',
          dataIndex: 'type_value',
        }
      ],

    }
  },
  created () {
  },
  mounted: function () {
    this.place_ready('2');//展示河北省数据
    this.get_time();
    this.getAnalysisSiteRank();
  },
  methods: {

    //层级选择器下拉事件
    handleChange_tree (value) {
      for (var num in value) {
        //输出最后一个value信息
        this.place_id = value[num];
      }
      this.getAnalysisSiteRank();
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

    //时间自定义选择
    SelectTimeChoose () {
      this.start_time = moment(this.value_date_time[0]).format('YYYY-MM-DD HH:mm:ss');
      this.end_time = moment(this.value_date_time[1]).format('YYYY-MM-DD HH:mm:ss');
      this.getAnalysisSiteRank();
    },

    //切换气体数据类型
    changeDataTypeShort (select_air_type, select_air_name, select_decimal_num) {
      this.air_type = select_air_type;
      this.table_show_name = select_air_name;
      this.decimal_num = select_decimal_num;
      this.getAnalysisSiteRank();
    },

    //正序倒序选择
    SelectOrderTypeChange (select_order_type) {
      this.order_type = select_order_type;
      this.getAnalysisSiteRank();
    },

    //站点类型筛选
    SelectSiteType () {
      this.getAnalysisSiteRank();
    },

    getAnalysisSiteRank () {
      this.queryParam = {
        "type": this.air_type,
        "place_id": this.place_id,//全局变量-地区id,石家庄地区place_id为3
        "order_type": this.order_type,
        "site_type": this.site_type,
        "start_time": this.start_time,
        "end_time": this.end_time,
        "decimal_num": this.decimal_num
      }
      console.log(this.start_time);
      console.log(this.end_time);
      Axios.post('/api/AnalysisSiteRank', this.queryParam).then(Response => {
        console.log(Response);
        this.dataRank = Response;
        this.init_echart(Response);

      });
    },

    init_echart (list_data) {
      var data_name = new Array();
      var data_value = new Array();
      var data_color = new Array();
      // console.log(list); //输出信息显示
      for (var num in list_data) {
        //显示柱状图信息
        data_name.push(list_data[num]["site_name"])
        data_value.push(list_data[num]['type_value'])
        data_color.push(list_data[num]["color"])
      }

      var myChart = this.$echarts.init(document.getElementById('myChart'));
      // 指定图表的配置项和数据
      var option = {
        //标题
        title: {
          text: '站点' + this.table_show_name + '排名',
          textStyle: {
            fontSize: 18,
            fontWeight: 400
          },
          subtextStyle: {
            fontSize: 12,
            color: 'rgb(24,89,233)',
            align: 'right',
            fontWeight: 400
          }
        },
        //布局
        grid: {
          left: '5%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        //鼠标悬浮事件
        tooltip: {
          trigger: 'axis',
          axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        //x轴信息
        xAxis: {
          type: 'category',
          data: data_name,
          axisLabel: {
            interval: 0,//横轴信息全部显示
            rotate: 45,//-15度角倾斜显示
          },
        },
        yAxis: {
          type: 'value'
        },
        //series,数据内容信息填充
        series: [{
          data: data_value,
          type: 'bar',
          //条状宽度
          barWidth: 26,
          itemStyle: {
            normal: {
              // 定制显示（按顺序）
              color: function (params) {
                var colorList = data_color;
                return colorList[params.dataIndex]
              }
            },
          },
          //系统默认的数据颜色,存在缺陷
          // color: data_color,
          label: {
            normal: {
              position: 'top',
              color: 'rgb(51,51,51)',
              fontWeight: 'normal',
              show: true
            }
          },
          //背景色
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(220, 220, 220, 0.8)'
          }
        }]
      };
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    },


  }
}
</script>

