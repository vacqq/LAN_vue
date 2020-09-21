<template>
  <a-spin :spinning="spinning" size="large">
    <div class="tabxfc1">
      <el-date-picker v-model="now_time" type="datetime" @change="SelectPlaceId()" placeholder="选择日期时间" align="right"
        :picker-options="pickerOptions">
      </el-date-picker>
    </div>
    <!-- <el-select v-model="air_type" placeholder="请选择" @change="SelectPlaceId()">
      <el-option v-for="item in air_type_options" :key="item.air_type" :label="item.label" :value="item.air_type">
      </el-option>
    </el-select> -->
    <div id="map-container" style="width:100%;height:800px;"></div>
    <div>
      <el-dialog title="站点24小时内数据列表" :visible.sync="dialogTableVisible" width="1000px">
        <el-table :data="gridData">
          <el-table-column property="record_time" label="时间"></el-table-column>
          <el-table-column property="site_name" label="站点名称"></el-table-column>
          <!-- <el-table-column property="aqi" label="AQI" width="80"></el-table-column> -->
          <el-table-column property="pm25" label="PM2.5" width="80"></el-table-column>
          <el-table-column property="pm10" label="PM10" width="80"></el-table-column>
          <el-table-column property="so2" label="SO2" width="80"></el-table-column>
          <el-table-column property="no2" label="NO2" width="80"></el-table-column>
          <el-table-column property="co" label="CO" width="80"></el-table-column>
          <el-table-column property="o3" label="O3" width="80"></el-table-column>
        </el-table>
      </el-dialog>
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
      <div class="tab-index-item" @click="addDatas('co',$event)" id="co" style="cursor: pointer;color: #ffffff">CO</div>
      <div class="tab-index-item" @click="addDatas('o3',$event)" id="o3" style="cursor: pointer;color: #ffffff">
        O <sub>3</sub>
      </div>
      <div class="tab-index-item1 tabactive1" @click="addStyleType('3',$event)" id="3"
        style="cursor: pointer;color: #ffffff">固定站
      </div>
      <div class="tab-index-item1" @click="addStyleType('4',$event)" id="4" style="cursor: pointer;color: #ffffff">省控站
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
  </a-spin>
</template>

<script>
// 按需引入点聚合
import { BmlMarkerClusterer } from 'vue-baidu-map'
// 引入marker
import BmMarker from 'vue-baidu-map/components/overlays/Marker'
import moment from 'moment'
import styleJson from './mapStyle'
import Axios from '@/utils/request'
import BMapLib from 'bmaplib.markerclusterer'
import { MP } from '../../../map'

export default {
  name: 'gridMap',
  components: {
    BmlMarkerClusterer,
    BmMarker
  },
  data () {
    return {

      mapStyle: {
        styleJson: styleJson.styleJsonjs
      },

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

      spinning: true,//加载中动画
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
      site_id: '49',//全局变量-站点id,为空值时为默认什么也不选择
      place_id: this.$store.getters.userInfo.place_id,//全局变量-站点类型,国控站为4,固定站为3
      site_type: '3',//全局变量-站点类型,国控站为4,固定站为3
      air_type: 'pm25',//全局变量-气体参数
      data_type: 'pm25',//全局变量-气体局部参数
      order_type: 'asc',//全局变量-倒序正序
      table_show_name: 'AQI',//全局变量-展示搜做哪个
      decimal_num: '0',//全局变量-展示搜做哪个
      styleType: '0',
      styleType1: '0',

      //查询时间选择
      value_date_time: [(new Date().getTime() - 3600 * 1000 * 24), new Date()],
      pre_now_hour: '',//全局变量-前一小时
      start_time: '',//全局变量-搜索开始时间
      end_time: '',//全局变量-搜索结束时间
      now_time: '',//全局变量-当前时间

      //需要平均值功能

      //站点点数组
      markers: [],

      BMap: '',
      map: '',
      show: false,

      gridData: [],
      dialogTableVisible: false,
    }
  },
  created () {

  },

  mounted () {
    this.get_time();
    this.initMap();
    //this.site_ready();
  },

  methods: {

    addStyleType (value, event) {
      if (value == 3 && this.styleType != '1') {
        this.site_type = '4';
        this.styleType = '1';
        var elList = document.querySelectorAll(".tab-index-item1")
        console.log(elList.length)
        for (var i = 0; i < elList.length; i++) {
          if (elList[i].id == value) {
            console.log("进.........")
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
        this.site_type = '';
        this.styleType1 = '1';
        var elList = document.querySelectorAll(".tab-index-item1")
        for (var i = 0; i < elList.length; i++) {
          if (elList[i].id == value) {
            elList[i].className = 'tab-index-item1 tabactive1'
            break;
          }
        }
      } else if (value == 4 && this.styleType1 != '0') {
        this.site_type = '3';
        this.styleType1 = '0';
        var elList = document.querySelectorAll(".tab-index-item1")
        for (var i = 0; i < elList.length; i++) {
          if (elList[i].id == value) {
            elList[i].className = 'tab-index-item1'
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
    //地区选择
    SelectPlaceId () {
      this.site_ready();
    },

    //时间初始化方法
    get_time () {
      var date = new Date();
      var year = (new Date).getFullYear();
      var month = (new Date).getMonth() + 1;
      var pre_month = (new Date).getMonth();//查询过去1个月时间
      var day = (new Date).getDate();
      var pre_day = (new Date).getDate() - 1;
      var hour = (new Date).getHours();
      var pre_hour = (new Date).getHours() - 1;
      var minute = (new Date).getMinutes();
      var second = (new Date).getSeconds();
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

    //获取站点数据
    site_ready () {

      var queryParam = {
        "site_type": this.site_type,
        "air_type": this.air_type,
        "start_time": moment(this.now_time.getTime() - 3600 * 1000 * 1.5).format('YYYY-MM-DD HH:mm:ss'),
        "end_time": moment(this.now_time.getTime()).format('YYYY-MM-DD HH:mm:ss'),
      }
      Axios.post('/api/SelectSiteIdNameBySiteType', queryParam).then(Response => {
        console.log("站点加载成功")
        //加载前清除所有点
        this.map.clearOverlays();
        this.markers = [];
        for (var num in Response) {
          const type_value = Response[num]["type_value"]
          if (type_value == undefined) {
            type_value = '0';
          }
          console.log("Response:)" + Response[num]["type_value"])
          this.addMarker(Response[num]["lng"], Response[num]["lat"], Response[num]["site_name"], Response[num]["site_id"], type_value, Response[num]['site_type']);
        }
        //最简单的用法，生成一个marker数组，然后调用markerClusterer类即可。最简单的用法，生成一个marker数组，然后调用markerClusterer类即可。
        var markerClusterer = new BMapLib(this.map, { markers: this.markers });
        this.spinning = false;
      });
    },

    addMarker (lng, lat, site_name, site_id, type_value, site_type, air_type) {
      //赋值
      var myIcon = new BMap.Icon(require("../../../../public/image/优.png"), new BMap.Size(30, 30));
      var marker = new BMap.Marker(new BMap.Point(lng, lat), { icon: myIcon });
      //站点显示数值以及展示在
      var label = new BMap.Label(type_value, { offset: new BMap.Size(7, 8) });//左右偏移数值显示

      label.setStyle({
        backgroundColor: "#1DBD10",//站点lable展示
        "color": "#000000",//字体颜色
        "text-align": "center",
        "value_id": this.air_type, //尝试传值可以传id值 --lcz 5.12
        "type_value": type_value,
        border: 0
      });
      //转换为that
      const that = this
      marker.setLabel(label);
      marker.addEventListener("click", function () {
        console.log("您点击了标注" + site_name);
        that.infoWindowOpen(site_id);
      });
      this.markers.push(marker)
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
    },

    // 如果在 bm-info-window 上写了 @open 在点击marker时会触发两次infoWindowOpen函数，而且可以很明显的看到有延时
    infoWindowOpen (site_id) {
      this.dialogTableVisible = true

      this.queryParam = {
        "data_type": this.data_type,
        "site_id": site_id,//全局变量-地区id,石家庄地区place_id为3
        "start_time": moment(this.now_time.getTime() - 3600 * 1000 * 24).format('YYYY-MM-DD HH:mm:ss'),//查询过去24小时数据
        "end_time": moment(this.now_time.getTime()).format('YYYY-MM-DD HH:mm:ss')
      }
      Axios.post('/api/getDateBySiteId', this.queryParam).then(Response => {
        this.gridData = Response;
        console.log(Response);
      });

    }
  }
}
</script>
<style scoped>
.map {
  height: 800px;
}
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
.color-item {
  width: 53px;
  height: 15px;
}
.tabxfc1 {
  position: absolute;
  left: 10px;
  top: 20px;
  text-align: left;
  float: left;
  width: 1500px;
  height: auto;
  z-index: 99999;
  border-radius: 10px;
}
/*右边悬浮按钮*/
.tab-xfc {
  position: absolute;
  right: 30px;
  top: 80px;
  text-align: right;
  float: right;
  width: 80px;
  height: auto;
  z-index: 9999;
  background: #000000;
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
  height: 61px;
  position: fixed;
  bottom: 0;
  right: 0;
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