<template>
  <page-header-wrapper>
    <a-spin :spinning="spinning" size="small">
      <div class="tabxfc1">
        <el-cascader v-model="value" :placeholder="father_show" :options="tree_options" @change="handleChange_tree">
        </el-cascader>
        <el-date-picker v-model="now_time" type="datetime" @change="SelectPlaceId()" placeholder="选择日期时间" align="right"
          :picker-options="pickerOptions">
        </el-date-picker>
      </div>
      <div id="map-container" :style="select" :center="{lng: 116.404, lat: 39.915}">
      </div>
      <div class="tab-xfc">
        <div class="tab-block-title tab-block">指标</div>
        <!-- <div class="tab-index-item" id="compIndex" @click="addDatas('compIndex',$event)"
        style="cursor: pointer;color: #ffffff">综指</div> -->
        <!-- <div class="tab-index-item" id="aqi" @click="addDatas('aqi',$event)" style="cursor: pointer;color: #ffffff">AQI
      </div> -->
        <div class="tab-index-item tabactive" @click="addDatas('pm25',$event)" id="pm25"
          style="cursor: pointer;color: #ffffff">
          PM <sub>2.5</sub>
        </div>
        <div class="tab-index-item" @click="addDatas('pm10',$event)" id="pm10" style="cursor: pointer;color: #ffffff">
          PM <sub>10</sub>
        </div>
        <div class="tab-index-item" @click="addDatas('so2',$event)" id="so2" style="cursor: pointer;color: #ffffff">
          SO <sub>2</sub>
        </div>
        <div class="tab-index-item" @click="addDatas('no2',$event)" id="no2" style="cursor: pointer;color: #ffffff">
          NO <sub>2</sub>
        </div>
        <div class="tab-index-item" @click="addDatas('co',$event)" id="co" style="cursor: pointer;color: #ffffff">CO
        </div>
        <div class="tab-index-item" @click="addDatas('o3',$event)" id="o3" style="cursor: pointer;color: #ffffff">
          O <sub>3</sub>
        </div>
        <div class="tab-index-item1 tabactive1" @click="addStyleType('3',$event)" id="3"
          style="cursor: pointer;color: #ffffff">固定站
        </div>
        <div class="tab-index-item1 tabactive1" @click="addStyleType('4',$event)" id="4"
          style="cursor: pointer;color: #ffffff">省控站
        </div>
        <!-- <div class="tab-index-item" @click="addDatas('voc',$event)" id="voc" style="cursor: pointer;color: #ffffff">VOC
      </div> -->
      </div>
      <div class="bottom-bar">
        <div class="color-bar-box">
          <div class="color-bar">
            <div class="color-item c-green"></div>
            <div class="color-item c-yellow"></div>
            <div class="color-item c-orange"></div>
            <div class="color-item c-red"></div>
            <div class="color-item c-purple"></div>
            <div class="color-item c-brown"></div>
          </div>
          <div class="color-name-box">
            <div class="color-name">优</div>
            <div class="color-name">良</div>
            <div class="color-name">轻度</div>
            <div class="color-name">中度</div>
            <div class="color-name">重度</div>
            <div class="color-name">严重</div>
          </div>
        </div>
      </div>
      <div hidden>
        <a-card :bordered="false">
          <div id="site_detail" style="text-align:center;">
            <br />
            <a-spin :spinning="spinning_table" size="small">
              <!--//echart图表输出在div中  -->
              <a-row :gutter="40">
                <a-col :md="6" :lg="3">
                  <el-button size="mini" @click="changeDataTypeShort('aqi','AQI','0')">AQI</el-button>
                  <p :style="aqi_type"
                    style="width: 40px;height: 35px;margin-left: 5px;border-radius: 6px;line-height: 35px;">
                    {{aqi_value}}
                  </p>
                </a-col>
                <a-col :md="6" :lg="3">
                  <el-button size="mini" @click="changeDataTypeShort('pm25','PM2.5','0')">PM2.5</el-button>
                  <p :style="pm25_type"
                    style="width: 40px;height: 35px;margin-left: 5px;border-radius: 6px;line-height: 35px;">
                    {{pm25_value}}</p>
                </a-col>
                <a-col :md="6" :lg="3">
                  <el-button size="mini" @click="changeDataTypeShort('pm10','PM10','0')">PM10</el-button>
                  <p :style="pm10_type"
                    style="width: 40px;height: 35px;margin-left: 5px;border-radius: 6px;line-height: 35px;">
                    {{pm10_value}}</p>
                </a-col>
                <a-col :md="6" :lg="3">
                  <el-button size="mini" @click="changeDataTypeShort('so2','SO2','0')">SO2</el-button>
                  <p :style="so2_type"
                    style="width: 40px;height: 35px;margin-left: 5px;border-radius: 6px;line-height: 35px;">
                    {{so2_value}}
                  </p>
                </a-col>
                <a-col :md="6" :lg="3">
                  <el-button size="mini" @click="changeDataTypeShort('no2','NO2','0')">NO2</el-button>
                  <p :style="no2_type"
                    style="width: 40px;height: 35px;margin-left: 5px;border-radius: 6px;line-height: 35px;">
                    {{no2_value}}
                  </p>
                </a-col>
                <a-col :md="6" :lg="3">
                  <el-button size="mini" @click="changeDataTypeShort('co','CO','2')">CO</el-button>
                  <p :style="co_type"
                    style="width: 40px;height: 35px;margin-left: 5px;border-radius: 6px;line-height: 35px;">{{co_value}}
                  </p>
                </a-col>
                <a-col :md="6" :lg="3">
                  <el-button size="mini" @click="changeDataTypeShort('o3','O3','0')">O3</el-button>
                  <p :style="o3_type"
                    style="width: 40px;height: 35px;margin-left: 5px;border-radius: 6px;line-height: 35px;">{{o3_value}}
                  </p>
                </a-col>
              </a-row>
              <br />
              过去24小时<span style='color:red'>{{table_show_name}}</span>变化曲线
              <div id="myChart" style="height:350px;width:450px;vertical-align:center;"></div>
            </a-spin>
          </div>
        </a-card>
      </div>
    </a-spin>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import styleJson from './mapStyle'
import Axios from '@/utils/request'
import { MP } from '../../../map'

export default {
  components: {},
  data () {
    return {
      intervalId: null,
      spinning: true, //加载中动画
      spinning_table: true,

      value: [], //层级选择器
      tree_options: [], //层级选择器数组
      father_show: '河北省', //层级选择器显示父名.
      form: {
        address: '', //详细地址
        addrPoint: { //详细地址经纬度
          lng: 0,
          lat: 0
        }
      },
      map: '', //地图实例
      mk: '', //Marker实例

      //下拉搜索站点
      place_id_options: [{
        place_id: '16',
        label: '桥西区'
      }, {
        place_id: '17',
        label: '裕华区'
      }],

      //下拉搜索气体类型
      air_type_options: [{
        air_type: 'aqi',
        label: 'AQI'
      }, {
        air_type: 'pm25',
        label: 'PM2.5'
      }, {
        air_type: 'pm10',
        label: 'PM10'
      }, {
        air_type: 'so2',
        label: 'SO2'
      }, {
        air_type: 'no2',
        label: 'NO2'
      }, {
        air_type: 'co',
        label: 'CO'
      }, {
        air_type: 'o3',
        label: 'O3'
      }],

      //下拉搜索站点类型
      site_type_options: [{
        site_type: '4',
        label: '省控站'
      }, {
        site_type: '3',
        label: '固定站'
      }],

      //时间选择器
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick (picker) {
            picker.$emit('pick', new Date());
          }
        }, {
          text: '一小时前',
          onClick (picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000);
            picker.$emit('pick', date);
          }
        }, {
          text: '昨天',
          onClick (picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', date);
          }
        }, {
          text: '一周前',
          onClick (picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', date);
          }
        }]
      },

      //参数设置,初始化
      site_id: '49', //全局变量-站点id,为空值时为默认什么也不选择
      place_id: this.$store.getters.userInfo.place_id, //全局变量-站点类型,国控站为4,固定站为3
      site_type: '', //全局变量-站点类型,国控站为4,固定站为3
      air_type: 'pm25', //全局变量-气体参数
      data_type: 'pm25', //全局变量-气体局部参数
      order_type: 'asc', //全局变量-倒序正序
      table_show_name: 'AQI', //全局变量-展示搜做哪个
      decimal_num: '0', //全局变量-展示搜做哪个
      styleType: '0',
      styleType1: '0',

      //查询时间选择
      value_date_time: [(new Date().getTime() - 3600 * 1000 * 24), new Date()],
      ShowSiteDeatail: '',
      pre_now_hour: '', //全局变量-前一小时
      start_time: '', //全局变量-搜索开始时间
      end_time: '', //全局变量-搜索结束时间
      now_time: '', //全局变量-当前时间

      //echarts图表显示数组
      chart_option: {},
      datas_time: [], //表格时间轴值
      datasvalue: [], //表格数据数值
      datascolor: [], //表格条形颜色

      //六参数数据
      table_show_name: 'AQI', //表格显示名字
      aqi_value: '0',
      pm25_value: '0',
      pm10_value: '0',
      so2_value: '0',
      no2_value: '0',
      co_value: '0',
      o3_value: '0',
      //按钮类型 有
      //六参数数据success,warning,danger三种
      aqi_type: 'background:green;color:#ffffff',
      pm25_type: 'background:green;color:#ffffff',
      pm10_type: 'background:green;color:#ffffff',
      so2_type: 'background:green;color:#ffffff',
      no2_type: 'background:green;color:#ffffff',
      co_type: 'background:green;color:#ffffff',
      o3_type: 'background:green;color:#ffffff',

      centerPoint: '',
      select: {
        'overflow-x': 'hidden',
        'overflow-y': 'hidden',
        width: '100%',
        height: '800px'
      }
    }
  },

  mounted () {
    this.place_ready('2'); //展示河北省数据
    this.get_time();

    this.heightFunction();
    this.initMap();
    // this.site_ready();
  },

  methods: {
    heightFunction () {
    },
    //定时刷新数据
    /* dataRefreh() {
       if (this.intervalId != null) {
         return;
       }
       this.intervalId = setInterval(() => {
         this.site_ready();
       }, 60000);
     },
     // 停止定时器
     clear() {
       clearInterval(this.intervalId); //清除计时器
       this.intervalId = null; //设置为null
     }, */
    addStyleType (value, event) {
      if (value == 3 && this.styleType != '1') {
        this.site_type = '4';
        this.styleType = '1';
        var elList = document.querySelectorAll(".tab-index-item1")
        // console.log(elList.length) 
        for (var i = 0; i < elList.length; i++) {
          if (elList[i].id == value) {
            // console.log("进.........")
            elList[i].className = 'tab-index-item1'
            break;
          }
        }
      } else if (value == 3 && this.styleType != '0') {
        this.site_type = '';
        this.styleType = '0';
        var elList = document.querySelectorAll(".tab-index-item1")
        for (var i = 0; i < elList.length; i++) {
          if (elList[i].id == value) {
            elList[i].className = 'tab-index-item1 tabactive1'
            break;
          }
        }
      } else if (value == 4 && this.styleType1 != '1') {
        this.site_type = '3';
        this.styleType1 = '1';
        var elList = document.querySelectorAll(".tab-index-item1")
        for (var i = 0; i < elList.length; i++) {
          if (elList[i].id == value) {
            elList[i].className = 'tab-index-item1'
            break;
          }
        }
      } else if (value == 4 && this.styleType1 != '0') {
        this.site_type = '';
        this.styleType1 = '0';
        var elList = document.querySelectorAll(".tab-index-item1")
        for (var i = 0; i < elList.length; i++) {
          if (elList[i].id == value) {
            elList[i].className = 'tab-index-item1 tabactive1'
            break;
          }
        }
      }
      this.site_ready()
    },
    addDatas (value, event) {
      this.air_type = value;
      var elList = document.querySelectorAll(".tab-index-item")
      for (var i = 0; i < elList.length; i++) {
        if (elList[i].id == value) {
          elList[i].className = 'tab-index-item tabactive'
        }
        if (elList[i].id != value) {
          elList[i].className = 'tab-index-item'
        }
      }

      this.site_ready()
    },

    //层级选择器下拉事件
    handleChange_tree (value) {
      for (var num in value) {
        //输出最后一个value信息
        this.place_id = value[num];
      }
      //根据地区id查询中心坐标点
      Axios.post('/api/SelectSiteList', {
        "place_id": this.place_id
      }).then(Response => {
        this.centerPoint = new BMap.Point(Response[0]["lng"], Response[0]["lat"]);
        this.map.centerAndZoom(this.centerPoint, 15)
      });
      this.site_ready();
    },

    //地区表树形结构规划
    place_ready (place_id) {
      Axios.post('/api/PlaceTreeList', {
        "place_id": place_id
      }).then(Response => {
        this.tree_options = Response["place_detail"];
        this.father_show = Response["place_father_show"];
        // console.log(Response);
        if (this.father_show != '') {
          this.spinning = false;
        }
      });
    },

    //切换气体数据类型
    changeDataTypeShort (select_data_type, select_air_name, select_decimal_num) {
      this.data_type = select_data_type;
      this.table_show_name = select_air_name;
      this.getShowDateBySiteId();
    },

    //时间初始化方法
    get_time () {
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var pre_month = date.getMonth(); //查询过去1个月时间
      var day = date.getDate();
      var pre_day = date.getDate() - 1;
      var hour = date.getHours();
      var pre_hour = date.getHours() - 1;
      var minute = date.getMinutes();
      var second = date.getSeconds();
      // now_time: '',//全局变量-当前时间
      // pre_now_hour: '',//全局变量-前一小时
      // pre_now_day: '',//全局变量-前一天aqi
      // pre_now_month: '',//全局变量-前一月
      this.now_time = date;
      var now_time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
      this.pre_now_hour = year + '-' + month + '-' + day + ' ' + pre_hour + ':' + minute + ':' + second;
      var pre_now_day = year + '-' + month + '-' + pre_day + ' ' + hour + ':' + minute + ':' + second;
      var pre_now_month = year + '-' + pre_month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
      this.start_time = pre_now_day;
      this.end_time = now_time;
    },

    //地区选择
    SelectPlaceId () {
      this.site_ready();
    },

    //获取站点数据
    site_ready () {
      var queryParam = {
        "place_id": this.place_id,
        "site_type": this.site_type,
        "air_type": this.air_type,
        "start_time": moment(this.now_time.getTime() - 3600 * 1000 * 1.5).format('YYYY-MM-DD HH:mm:ss'),
        "end_time": moment(this.now_time.getTime()).format('YYYY-MM-DD HH:mm:ss'),
      }
      Axios.post('/api/SelectSiteIdNameBySiteType', queryParam).then(Response => {
        // console.log("站点加载成功")
        // console.log(Response)
        //加载前清除所有点
        // if(!this.map){
        //   console.info(this.map)
        //  }
        this.map.clearOverlays();

        for (var num in Response) {
          if (this.ShowSiteDeatail != null && this.ShowSiteDeatail != '') {
            this.addMarker(this.ShowSiteDeatail, Response[num]["type_value"], Response[num]["lng"], Response[num]
            ['lat'], Response[num]['site_name'], Response[num]['site_id'], Response[num]['site_type'])
          } else {
            var ShowSiteDeatail = document.getElementById('site_detail')
            this.addMarker(ShowSiteDeatail, Response[num]["type_value"], Response[num]["lng"], Response[num][
              'lat'
            ], Response[num]['site_name'], Response[num]['site_id'], Response[num]['site_type'])
          }
          //赋值
        }
      });
    },

    addMarker (ShowSiteDeatail, type_value, lng, lat, site_name, site_id, site_type) {
      var point = new BMap.Point(lng, lat);
      // console.log(site_type)
      var marker = "";
      var myIcon1 = new BMap.Icon(require("../../../../public/image/grid.png"), new BMap.Size(30, 35));
      var myIcon = new BMap.Icon(require("../../../../public/image/label.png"), new BMap.Size(30, 35));
      if (site_type == 4) {
        marker = new BMap.Marker(point, {
          icon: myIcon1
        });
      } else {
        marker = new BMap.Marker(point, {
          icon: myIcon
        });
      }

      var label = new BMap.Label(site_name, {
        offset: new BMap.Size(-30, 30)
      });
      label.setStyle({
        backgroundColor: "#FFFFFF",
        width: 50,
        "color": "black",
        "text-align": "center",
        border: 0
      });
      //设置文字标签
      // marker.setLabel(label);
      if (type_value != undefined) {
        var label_value = new BMap.Label(type_value, {
          offset: new BMap.Size(20, -10)
        }); //距离坐标图片左上角,xy轴偏移单位
        var data = parseInt(type_value)
        if (this.air_type == 'pm25') {
          // console.log("转换int后:" + data)
          if (data > 0 && data < 35) {
            label_value.setStyle({
              backgroundColor: "#58c750",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 35 && data < 75) {
            label_value.setStyle({
              backgroundColor: "#e3ca55",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 75 && data < 115) {
            label_value.setStyle({
              backgroundColor: "#d99157",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 115 && data < 150) {
            label_value.setStyle({
              backgroundColor: "#cf4641",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 150 && data < 250) {
            label_value.setStyle({
              backgroundColor: "#a753cf",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 250 && data < 500) {
            label_value.setStyle({
              backgroundColor: "#6e1313",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          }
        } else if (this.air_type == 'pm10') {
          if (data > 0 && data < 50) {
            label_value.setStyle({
              backgroundColor: "#58c750",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 50 && data < 150) {
            label_value.setStyle({
              backgroundColor: "#e3ca55",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 150 && data < 250) {
            label_value.setStyle({
              backgroundColor: "#d99157",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 250 && data < 350) {
            label_value.setStyle({
              backgroundColor: "#cf4641",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 350 && data < 420) {
            label_value.setStyle({
              backgroundColor: "#a753cf",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 420 && data < 600) {
            label_value.setStyle({
              backgroundColor: "#6e1313",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          }
        } else if (this.air_type == 'so2') {
          if (data > 0 && data < 150) {
            label_value.setStyle({
              backgroundColor: "#58c750",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 150 && data < 500) {
            label_value.setStyle({
              backgroundColor: "#e3ca55",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 500 && data < 600) {
            label_value.setStyle({
              backgroundColor: "#d99157",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 600 && data < 800) {
            label_value.setStyle({
              backgroundColor: "#cf4641",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          }
        } else if (this.air_type == 'no2') {
          if (data > 0 && data < 100) {
            label_value.setStyle({
              backgroundColor: "#58c750",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 100 && data < 200) {
            label_value.setStyle({
              backgroundColor: "#e3ca55",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 200 && data < 700) {
            label_value.setStyle({
              backgroundColor: "#d99157",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 700 && data < 1200) {
            label_value.setStyle({
              backgroundColor: "#cf4641",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 1200 && data < 2340) {
            label_value.setStyle({
              backgroundColor: "#a753cf",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 2340 && data < 3840) {
            label_value.setStyle({
              backgroundColor: "#6e1313",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          }
        } else if (this.air_type == 'co') {
          if (type_value > 0 && type_value < 5) {
            label_value.setStyle({
              backgroundColor: "#58c750",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (type_value > 5 && type_value < 10) {
            label_value.setStyle({
              backgroundColor: "#e3ca55",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (type_value > 10 && type_value < 35) {
            label_value.setStyle({
              backgroundColor: "#d99157",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (type_value > 35 && type_value < 60) {
            label_value.setStyle({
              backgroundColor: "#cf4641",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (type_value > 60 && type_value < 90) {
            label_value.setStyle({
              backgroundColor: "#a753cf",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (type_value > 90 && type_value < 150) {
            label_value.setStyle({
              backgroundColor: "#6e1313",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          }
        } else if (this.air_type == 'o3') {
          if (data > 0 && data < 160) {
            label_value.setStyle({
              backgroundColor: "#58c750",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 160 && data < 200) {
            label_value.setStyle({
              backgroundColor: "#e3ca55",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 200 && data < 300) {
            label_value.setStyle({
              backgroundColor: "#d99157",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 300 && data < 400) {
            label_value.setStyle({
              backgroundColor: "#cf4641",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 400 && data < 800) {
            label_value.setStyle({
              backgroundColor: "#a753cf",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 800 && data < 1200) {
            label_value.setStyle({
              backgroundColor: "#6e1313",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          }
        } else if (this.air_type == 'aqi') {
          if (data > 0 && data < 50) {
            label_value.setStyle({
              backgroundColor: "#58c750",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 50 && data < 100) {
            label_value.setStyle({
              backgroundColor: "#e3ca55",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 100 && data < 150) {
            label_value.setStyle({
              backgroundColor: "#d99157",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 150 && data < 200) {
            label_value.setStyle({
              backgroundColor: "#cf4641",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 200 && data < 300) {
            label_value.setStyle({
              backgroundColor: "#a753cf",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 300 && data < 500) {
            label_value.setStyle({
              backgroundColor: "#6e1313",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          }
        } else if (this.air_type == 'voc') {
          if (data > 0 && data < 60) {
            label_value.setStyle({
              backgroundColor: "#58c750",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 60 && data < 100) {
            label_value.setStyle({
              backgroundColor: "#e3ca55",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 100 && data < 200) {
            label_value.setStyle({
              backgroundColor: "#d99157",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 200 && data < 300) {
            label_value.setStyle({
              backgroundColor: "#cf4641",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          } else if (data > 300 && data < 500) {
            label_value.setStyle({
              backgroundColor: "#a753cf",
              width: "50px",
              "color": "#FFFFFF",
              "text-align": "center",
              border: 0
            });
          }
        }
      }
      //设置文字标签
      marker.setLabel(label_value);
      //设置鼠标悬浮显示站点信息
      marker.setTitle(site_name)
      var optss = {
        offset: new BMap.Size(2, 400)
      }
      this.map.addControl(new BMap.NavigationControl(optss));
      this.map.addOverlay(marker);
      // 将标注添加到地图中
      const that = this
      // console.log("点击前" + site_name);

      marker.addEventListener("click", function () {
        // console.log("您点击了标注" + site_name);
        var opts = {
          width: 400, // 信息窗口宽度
          height: 500, // 信息窗口高度
          title: site_name + "信息" // 信息窗口标题 
        }
        var infoWindow = new BMap.InfoWindow(ShowSiteDeatail, opts); // 创建信息窗口对象
        //赋值给默认属性 防止点击右侧悬浮后再点击站点弹窗失效问题
        that.ShowSiteDeatail = ShowSiteDeatail;
        that.map.openInfoWindow(infoWindow, point); // 在此站点上打开信息窗口
        that.site_id = site_id;
        that.getShowDateBySiteId();

      });
    },

    initMap () {
      MP('SxStCg9e15wDd3a1s6ECPwA0pHHm1TlC').then(() => {
        this.map = new BMap.Map("map-container", {
          enableMapClick: false
        }) //新建地图实例，enableMapClick:false ：禁用地图默认点击弹框
        this.map.setMapStyle({
          styleJson: styleJson.styleJsonjs
        });
        this.map.addControl(new BMap.MapTypeControl({
          mapTypes: [
            BMAP_NORMAL_MAP,
            BMAP_HYBRID_MAP
          ]
        }));
        if (BMap) {
          console.log("开始加载地图...")
          this.site_ready()
        }
        //支持滚轮缩放
        this.map.enableScrollWheelZoom(true);

        //根据地区id查询中心坐标点
        Axios.post('/api/SelectSiteList', {
          "place_id": this.place_id
        }).then(Response => {
          this.centerPoint = new BMap.Point(Response[0]["lng"], Response[0]["lat"]);
          this.map.centerAndZoom(this.centerPoint, 15)
        });
      })
      // this.map = new BMap.Map("map-container", {
      //   enableMapClick: false
      // }) //新建地图实例，enableMapClick:false ：禁用地图默认点击弹框
      // this.map.setMapStyle({
      //   styleJson: styleJson.styleJsonjs
      // });
      // this.map.addControl(new BMap.MapTypeControl({
      //   mapTypes: [
      //     BMAP_NORMAL_MAP,
      //     BMAP_HYBRID_MAP
      //   ]
      // }));
      // //支持滚轮缩放
      // this.map.enableScrollWheelZoom(true);

      // //根据地区id查询中心坐标点
      // Axios.post('/api/SelectSiteList', {
      //   "place_id": this.place_id
      // }).then(Response => {
      //   this.centerPoint = new BMap.Point(Response[0]["lng"], Response[0]["lat"]);
      //   this.map.centerAndZoom(this.centerPoint, 15)
      // });


    },

    //获取站点的数据根据站点id
    getShowDateBySiteId () {
      this.queryParam = {
        "data_type": this.data_type,
        "site_id": this.site_id, //全局变量-地区id,石家庄地区place_id为3
        "start_time": moment(this.now_time.getTime() - 3600 * 1000 * 24).format('YYYY-MM-DD HH:mm:ss'), //查询过去24小时数据
        "end_time": moment(this.now_time.getTime()).format('YYYY-MM-DD HH:mm:ss')
      }
      this.spinning_table = true;
      // console.log("查询此站点的数据");
      Axios.post('/api/getDateBySiteId', this.queryParam).then(Response => {
        // console.log(Response);
        this.spinning_table = false;
        this.init_echart(Response);
      });


      // console.log("查询此站点最后一条数据");
      Axios.post('/api/getLastSiteDataBySiteid', {
        site_id: this.site_id
      }).then(Response => {
        // console.log(Response);
        this.aqi_value = Response.aqi
        this.pm25_value = Response.pm25
        this.pm10_value = Response.pm10
        this.so2_value = Response.so2
        this.no2_value = Response.no2
        this.co_value = Response.co
        this.o3_value = Response.o3
      });



    },

    init_echart (list_data) {
      var data_name = new Array();
      var data_value = new Array();
      // console.log(list); //输出信息显示
      for (var num in list_data) {
        //显示柱状图信息
        data_name.push(list_data[num]["record_time"])
        data_value.push(list_data[num]['type_value'])
      }
      // console.log("进入初始化图表"); //输出信息显示
      var myChart = this.$echarts.init(document.getElementById('myChart'));
      // 指定图表的配置项和数据
      var option = {
        tooltip: {
          trigger: 'none',
          axisPointer: {
            type: 'cross'
          }
        },
        xAxis: {
          type: 'category',
          data: data_name
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: data_value,
          type: 'line'
        }]
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    },

  },
  //  created(){
  //     this.dataRefreh();
  // },
  // destroyed(){
  //     // 在页面销毁后，清除计时器
  //     this.clear();
  // }
}
</script>

<style scoped>
.color-bar {
  display: flex;
}

article,
aside,
blockquote,
body,
code,
dd,
details,
div,
dl,
dt,
fieldset,
figcaption,
figure,
footer,
form,
h1,
h2,
h3,
h4,
h5,
h6,
header,
hgroup,
hr,
input,
legend,
menu,
nav,
ol,
p,
pre,
section,
td,
textarea,
th,
ul {
  margin: 0;
  padding: 0;
}

/*右边悬浮按钮*/
.tab-xfc {
  position: absolute;
  right: 5px;
  top: 60px;
  text-align: right;
  float: right;
  width: 80px;
  height: auto;
  z-index: 9999;
  background: #000000;
  border-radius: 10px;
}

/**
 * 下拉div
 */
.tabxfc1 {
  position: absolute;
  left: 10px;
  top: 20px;
  text-align: left;
  float: left;
  width: 500px;
  height: auto;
  z-index: 99999;
  border-radius: 10px;
}

.tab-block-title {
  font-size: 18px;
  color: #3e9de5;
}

.tab-block {
  width: 80px;
  height: 22px;
  text-align: center;
  line-height: 22px;
}

.tab-index-item {
  cursor: pointer;
  margin: 6px 0;
  width: 80px;
  height: 22px;
  margin-top: 10px;
  text-align: center;
  line-height: 22px;
}
.tab-index-item1 {
  cursor: pointer;
  margin: 6px 0;
  width: 80px;
  height: 22px;
  margin-top: 10px;
  text-align: center;
  line-height: 22px;
}

.tabactive {
  background: #3e9de5;
}
.tabactive1 {
  background: #3e9de5;
}

.color-item {
  width: 53px;
  height: 15px;
}

/*图例*/
.bottom-bar {
  height: 70px;
  position: fixed;
  bottom: 10px;
  right: 0;
  margin-right: 25px;
  display: flex;
  z-index: 99;
}

/**
   * 图例文字颜色
   */
.color-name {
  text-align: center;
  color: #000000;
  font-size: 14px;
  width: 53px;
  height: 46px;
  line-height: 46px;
}

.color-bar-box {
  width: 318px;
  height: auto;
  background: rgba(51, 51, 51, 0.5);
  /*position: absolute;
    bottom: 0;
    right: 0;*/
}

.color-name-box {
  display: flex;
  height: 46px;
  width: 100%;
}

*,
:after,
:before {
  box-sizing: border-box;
}

.c-green {
  background: #58c750;
}

.c-yellow {
  background: #e3ca55;
}

.c-orange {
  background: #d99157;
}

.c-red {
  background: #cf4641;
}

.c-purple {
  background: #a753cf;
}

.c-brown {
  background: #6e1313;
}
</style>
