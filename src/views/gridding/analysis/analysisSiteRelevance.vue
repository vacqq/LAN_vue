<template>
  <page-header-wrapper>
    <div>
      <a-spin :spinning="spinning" size="large">
        <a-row :gutter="24">
          <a-col :md="24" :lg="18">
            <el-cascader v-model="value" :placeholder="father_show" :options="tree_options" @change="handleChange_tree">
            </el-cascader>
            <!-- <el-select v-model="place_id" placeholder="请选择" @change="SelectChange()">
              <el-option v-for="item in place_id_options" :key="item.place_id" :label="item.label"
                :value="item.place_id">
              </el-option>
            </el-select> -->
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <el-date-picker v-model="value_date_time" type="datetimerange" format="yyyy-MM-dd HH:mm:ss"
              @change="SelectTimeChoose()" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" align="right">
            </el-date-picker>
            <br />
            <el-select v-model="site_id" placeholder="请选择站点" @change="SelectSiteType()">
              <el-option v-for="item in site_type_options" :key="item.id" :label="item.site_name" :value="item.id">
              </el-option>
            </el-select>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <el-button size="small" @click="changeDataTypeShort('pm25','PM2.5','3')">PM2.5</el-button>
            <el-button size="small" @click="changeDataTypeShort('pm10','PM10','3')">PM10</el-button>
            <el-button size="small" @click="changeDataTypeShort('so2','SO2','3')">SO2</el-button>
            <el-button size="small" @click="changeDataTypeShort('no2','NO2','3')">NO2</el-button>
            <el-button size="small" @click="changeDataTypeShort('co','CO','3')">CO</el-button>
            <el-button size="small" @click="changeDataTypeShort('o3','O3','3')">O3</el-button>
            <br />
            <!--//echart图表输出在div中-->
            <div id="myChart" style="height:600px;vertical-align:center"></div>
            <div>
              <p>说明：</p>
              <p>*对指定机构区域内的两台设备（站点）数据进行相关性分析，数据变化趋势相同表现为正相关，否则表现了负相关</p>
              <p>*该图表现形式为直方图，比较设备之间的指数相关性，使用相关系数矩形算法</p>
              <p>*该算法使用皮尔逊相关系数矩形算法，算法如下图：X,Y：输入的数列值</p>
              <img src="~@/assets/img/station-relation-analysis.png">
            </div>
          </a-col>
          <a-col :md="24" :lg="6">
            <el-card class="box-card">
              <el-collapse v-model="activeNames" @change="handleChange">
                <el-collapse-item title="国控站" name="1">
                  <el-checkbox-group v-model="checkedCities" style="width:30px;" @change="handleCheckedCitiesChange"
                    :max="3">
                    <el-checkbox v-for="city in cities" :label="city['id']" :key="city['id']">{{city['site_name']}}
                    </el-checkbox>
                  </el-checkbox-group>
                </el-collapse-item>
                <el-collapse-item title="移动设备" name="2">
                </el-collapse-item>
                <el-collapse-item title="固定设备" name="3">
                  <el-checkbox-group v-model="checkedCities_fixed" style="width:30px;"
                    @change="handleCheckedCitiesChange_fixed" :max="3">
                    <el-checkbox v-for="city_fixed in cities_fixed" :label="city_fixed['id']" :key="city_fixed['id']">
                      {{city_fixed['site_name']}}
                    </el-checkbox>
                  </el-checkbox-group>
                </el-collapse-item>
                <el-collapse-item title="无人机" name="4">
                </el-collapse-item>
              </el-collapse>
            </el-card>

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
  name: 'analysisSiteRelevance',
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
      site_type_options: [],

      //多选框
      checkedCities: [],//checkedCities: [1]默认选择1站点勾选
      checkedCities_fixed: [],
      cities: [],
      cities_fixed: [],
      isIndeterminate: true,

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
          }]
      },

      //手风琴
      activeNames: ['3'],//默认展示'1'数据
      // 查询参数
      queryParam: {},

      //echarts图表显示数组
      chart_option: {},
      dataRank: [],//表格数组
      datasname: [],//表格名称
      datasvalue: [],//表格数据数值
      datascolor: [],//表格条形颜色
      site_id_country: '0',//国控站点id列
      site_id_fixed: '0',//固定站点id列

      //参数设置,初始化
      place_id: '21',//全局变量-地区id,石家庄地区place_id为3
      air_type: 'pm25',//全局变量-气体参数
      site_id: '',//全局变量-站点id,为空值时为默认什么也不选择
      site_id_range: '0',//全局变量-站点id范围
      site_type: '3',//全局变量-站点类型,国控站为4,固定站为3
      table_show_name: 'PM2.5',//全局变量-展示搜做哪个
      decimal_num: '3',//全局变量-展示搜做哪个
      stand_value: '0',//全局变量-基准值

      //查询时间选择
      value_date_time: [(new Date().getTime() - 3600 * 1000 * 24), new Date()],
      start_time: '',//全局变量-搜索开始时间
      end_time: '',//全局变量-搜索结束时间

    }
  },
  created () {
  },
  mounted: function () {
    this.place_ready('2');//展示河北省数据
    this.get_time();
    this.SelectChange();
  },
  methods: {

    //层级选择器下拉事件
    handleChange_tree (value) {
      for (var num in value) {
        //输出最后一个value信息
        this.place_id = value[num];
      }
      this.SelectChange();
    },

    //地区表树形结构规划
    place_ready (place_id) {
      Axios.post('/api/PlaceTreeList', { "place_id": place_id }).then(Response => {
        this.tree_options = Response["place_detail"];
        this.father_show = Response["place_father_show"];
        if (this.father_show != '') {
          this.spinning = false;
        }
      });
    },

    //下拉变化事件
    SelectChange () {
      this.site_ready();
      this.site_ready(4);
      this.site_ready(3);
    },

    //多选框站点初始化
    site_ready (site_type_show) {
      Axios.post('/api/SelectSiteIdNameBySiteTypeId', { "site_type": site_type_show, "place_id": this.place_id }).then(Response => {
        switch (site_type_show) {
          case 3:
            this.cities_fixed = Response
            break;
          case 4:
            this.cities = Response
            break;
          default:
            this.site_type_options = Response
            break;
        }
      });
    },

    //手风琴事件,显示信息
    handleChange (val) {
      // console.log(val);
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
      this.start_time = this.value_date_time[0];
      this.end_time = this.value_date_time[1];
      this.getAnalysisSiteRelevance();
    },

    //切换气体数据类型
    changeDataTypeShort (select_air_type, select_air_name, select_decimal_num) {
      this.air_type = select_air_type;
      this.table_show_name = select_air_name;
      this.decimal_num = select_decimal_num;
      this.getAnalysisSiteRelevance();
    },

    //平均选择先选择
    DataValueAvelineOnclick () {
      this.getAnalysisSiteRelevance();
    },

    //正序倒序选择
    SelectOrderTypeChange (select_order_type) {
      this.order_type = select_order_type;
      this.getAnalysisSiteRelevance();
    },

    //站点类型筛选
    SelectSiteType () {
      this.getAnalysisSiteRelevance();
    },

    //多选框事件
    handleCheckedCitiesChange (value) {
      // let checkedCount = value.length;
      // this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length;
      this.site_id_country = '0';
      //遍历数组,获取选择的站点字符串
      for (var data_num in value) {
        this.site_id_country = this.site_id_country + "," + value[data_num];
      }
      console.log(this.site_id_country);
      this.getAnalysisSiteRelevance();
    },
    handleCheckedCitiesChange_fixed (value) {
      this.site_id_fixed = '0';
      //遍历数组,获取选择的站点字符串
      for (var data_num in value) {
        this.site_id_fixed = this.site_id_fixed + "," + value[data_num];
      }
      console.log(this.site_id_fixed);
      this.getAnalysisSiteRelevance();
    },

    //搜索页面显示
    getAnalysisSiteRelevance () {
      this.queryParam = {
        "type": this.air_type,
        "site_type": this.site_type,
        "site_id": this.site_id,
        "site_id_range": this.site_id_fixed + ',' + this.site_id_country,
        "start_time": this.start_time,
        "end_time": this.end_time,
        "decimal_num": this.decimal_num
      }
      Axios.post('/api/AnalysisSiteRelevance', this.queryParam).then(Response => {
        console.log(Response);
        this.init_echart(Response);
      });
    },

    init_echart (list_data) {
      var data_name = new Array();
      var data_record_time = new Array();
      //遍历返回的json信息,获取map中的时间信息做x轴

      for (var data_num in list_data) {
        //显示柱状图信息
        data_record_time.push(list_data[data_num]["date_time"])
        if (list_data[data_num]["standard_data"].length != 0) {
          //给标准值赋值
          this.stand_value = list_data[data_num]["standard_data"][0]["type_value"]
        }
      }
      //遍历返回的json信息,做层层分析,获取站点名称,做主信息
      for (var data_time_num in list_data[0]["select_data"]) {
        data_name.push(list_data[0]["select_data"][data_time_num]["site_name"])
      }

      var myChart = this.$echarts.init(document.getElementById('myChart'));
      myChart.clear();//清楚图表数据,不然有缓存,无法刷新新图,多选框勾选也去不掉
      // 指定图表的配置项和数据
      var option = {
        title: {
          text: '站点' + this.table_show_name + '数据',
          textStyle: {
            fontSize: 14,
            fontWeight: 400
          },
          subtextStyle: {
            fontSize: 12,
            color: 'rgb(24,89,233)',
            align: 'right',
            fontWeight: 400
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          //站点名称,注释列
          data: data_name,
        },

        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          // boundaryGap: false, //表示坐标从0开始
          //时间轴,x轴
          data: data_record_time,
          axisPointer: {
            type: 'shadow'
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          //做动态加载,每个y轴数据
        ],
        toolbox: { //工具栏
          right: '60px',
          show: true,
          feature: {
            dataView: {
              show: true,
              readOnly: false
            },
            saveAsImage: {
              show: true,
              excludeComponents: ['toolbox'],
              pixelRatio: 2
            },
            restore: {
              show: true,
            },
            dataZoom: {
              show: true,
            }
          }
        },
      };

      //在此处做动态加载,每个y轴数据
      //data_num 为1,2,3 常数
      for (var data_num in list_data) {

        for (var data_num_small in list_data[data_num]["select_data"]) {
          var data_value = new Array();
          data_value.length = 0;
          data_value.push((Math.round(parseFloat(list_data[data_num]["select_data"][data_num_small]["type_value"]) / parseFloat(this.stand_value) * 100) / 100));
          option.series.push({
            name: list_data[data_num]["select_data"][data_num_small]["site_name"],
            type: 'bar',
            barMaxWidth: '35',
            // stack: '总量', //带着这个同一个名字,柱状图会变成堆叠
            data: data_value,
            itemStyle: {        //上方显示数值
              normal: {
                label: {
                  show: true, //开启显示
                  position: 'insideTop'
                }
              }
            }
          })
        }

      }
      ;
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    },


  }
}
</script>

