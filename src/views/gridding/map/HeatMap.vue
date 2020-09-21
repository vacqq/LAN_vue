<template>
  <page-header-wrapper>
    <a-spin :spinning="spinning" size="small">
      <div id="map" style="margin:0 auto;width: 100%;height: 800px;"></div>
      <div class="tabxfc1">
        <el-date-picker v-model="now_time" type="datetime" @change="SelectPlaceId()" placeholder="选择日期时间" align="right"
          :picker-options="pickerOptions">
        </el-date-picker>
        <el-select v-model="air_type" placeholder="请选择" @change="SelectPlaceId()">
          <el-option v-for="item in air_type_options" :key="item.air_type" :label="item.label" :value="item.air_type">
          </el-option>
        </el-select>
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
        <div class="tab-index-item1" @click="addStyleFX('FX',$event)" id="FX" style="cursor: pointer;color: #ffffff">风向
        </div>
        <!-- <div class="tab-index-item" @click="addDatas('voc',$event)" id="voc" style="cursor: pointer;color: #ffffff">VOC
      </div> -->
      </div>
    </a-spin>
  </page-header-wrapper>
</template>

<script>
import HeatmapOverlay from 'heatmap.js/plugins/leaflet-heatmap'
import L from 'leaflet'
import moment from 'moment'
import Axios from '@/utils/request'
import 'leaflet-velocity/dist/leaflet-velocity.css'
import 'leaflet-velocity/dist/leaflet-velocity'
//引入Jquery
import $ from 'jquery'

export default {
  name: 'gis-population-density',
  data () {
    return {
      heatmapLayer: null,
      map: null,
      spinning: false, //加载中动画
      //下拉搜索气体类型
      air_type_options: [{
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
      start_time: '', //全局变量-搜索开始时间
      end_time: '', //全局变量-搜索结束时间
      now_time: '', //全局变量-当前时间
      site_id: '', //全局变量-站点id,为空值时为默认什么也不选择
      place_id: '21', //全局变量-站点类型,国控站为4,固定站为3
      site_type: '3', //全局变量-站点类型,国控站为4,固定站为3
      air_type: 'pm25', //全局变量-气体参数
      data_type: 'pm25', //全局变量-气体局部参数
      order_type: 'asc', //全局变量-倒序正序
      table_show_name: 'AQI', //全局变量-展示搜做哪个
      decimal_num: '0', //全局变量-展示搜做哪个
      styleType: '0',
      styleType1: '0',
      fxkg: '0',
      datas: null,
      //地图数据
      Maptable: []
    }
  },
  mounted () {
    this.get_time();
    this.site_ready();
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
    addStyleFX (value, event) {
      if (value == "FX" && this.fxkg != '1') {
        console.log("1")
        this.fxkg = '1';
        var elList = document.querySelectorAll(".tab-index-item1")
        for (var i = 0; i < elList.length; i++) {
          if (elList[i].id == value) {
            elList[i].className = 'tab-index-item1 tabactive1'
            break;
          }
        }
        this.datas = require('../gfs.json');
        this.site_ready()
      } else if (value == "FX" && this.fxkg != '0') {
        console.log("2")
        this.fxkg = '0';
        var elList = document.querySelectorAll(".tab-index-item1")
        for (var i = 0; i < elList.length; i++) {
          if (elList[i].id == value) {
            elList[i].className = 'tab-index-item1'
            break;
          }
        }
        this.datas = null;
        this.site_ready()
      }
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
    //类型选择
    SelectPlaceId () {
      //document.getElementById('map').html("");
      //document.getElementById('map').html("<div id='map' style='margin:0 auto;width: 100%;height: 800px;'></div>");
      this.site_ready();
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
        "place_id": this.place_id,
        "site_type": this.site_type,
        "air_type": this.air_type,
        "start_time": moment(this.now_time.getTime() - 3600 * 1000 * 1.5).format('YYYY-MM-DD HH:mm:ss'),
        "end_time": moment(this.now_time.getTime()).format('YYYY-MM-DD HH:mm:ss'),
      }
      Axios.post('/api/SelectHeatMapDataList', queryParam).then(Response => {
        console.log("站点加载成功")
        console.log(Response)
        //加载前清除所有点
        this.Maptable = Response
        /* if(this.flag!='1'){
          console.log("1111111111111111111111111111")
        } */
        this.initmap();
      });
    },

    initmap () {
      /*********解决点击下拉导致控制台报错 地图容器已初始化问题 start ***************/
      if (document.querySelector('#map').children.length > 0) {
        var velocityLayer = null;
        var testData = {
          max: 1000,
          data: this.Maptable
        }
        this.heatmapLayer.setData(testData);
        if (this.datas != null) {
          console.log("this.datas: " + this.datas)
          velocityLayer = L.velocityLayer({
            displayValues: false,
            data: this.datas,
            minVelocity: 0, //Velocity：速率
            maxVelocity: 10,
            velocityScale: 0.005,
            particleMultiplier: 1 / 1000,//粒子的数量
            lineWidth: 2,//粒子的粗细
            frameRate: 15,//定义每秒执行的次数
            colorScale: ["rgb(70,166,70)", "rgb(70,166,70)", "rgb(70,166,70)", "rgb(70,166,70)", "rgb(70,166,70)"]
          });
          velocityLayer.addTo(this.map)// 添加到图上
        } else {
          this.initmap1();
        }
        return;
      }
      /*********解决点击下拉导致控制台报错 地图容器已初始化问题 end ***************/
      // 数据赋值
      var testData = {
        max: 1000,
        data: this.Maptable
      }
      // 配置
      var cfg = {
        'radius': 0.006,
        'maxOpacity': 0.4,
        blur: 0.95,
        'scaleRadius': true,
        'useLocalExtrema': true,
        latField: 'lat',
        lngField: 'lng',
        valueField: 'count'
      }
      this.heatmapLayer = new HeatmapOverlay(cfg)

      // 图层
      let baseLayer = L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Haut-Gis-Org © OpenStreetMap'
      }
      )
      //风场引用
      var Esri_DarkGreyCanvas = L.tileLayer(
        "http://{s}.sm.mapstack.stamen.com/" +
        "(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/" +
        "{z}/{x}/{y}.png",
      );
      //风场配置项
      var velocityLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: 'GBR Wind',
          displayPosition: 'bottomleft',
          displayEmptyString: 'No wind data'
        },
        data: this.datas,
        minVelocity: 0, //Velocity：速率
        maxVelocity: 10,
        velocityScale: 0.005,
        particleMultiplier: 1 / 1200,//粒子的数量
        lineWidth: 5,                     //粒子的粗细
        frameRate: 15,                      //定义每秒执行的次数
        colorScale: ["rgb(47,112,47)", "rgb(47,112,47)", "rgb(47,112,47)", "rgb(47,112,47)", "rgb(47,112,47)"]
      });
      //添加风场样式至地图中
      this.map = L.map('map', {
        center: [38.065, 114.610],
        zoom: 13,
        layers: [Esri_DarkGreyCanvas]
      })
      // 风场实例添加到地图上
      velocityLayer.addTo(this.map)
      baseLayer.addTo(this.map)
      this.heatmapLayer.addTo(this.map)
      this.heatmapLayer.setData(testData)

      L.control.scale({ maxWidth: 200, metric: true, imperial: false }).addTo(this.map)

      let baseLayers = {
        'heatmapLayer': this.heatmapLayer,
      }
      L.control.layers(baseLayers).addTo(this.map)

    },
    initmap1 () {
      //先删除地图在重新加载地图 未找到不删除地图清空风场的方法
      this.map.remove();
      console.log("清空风场数据...........")
      this.map = L.map('map', {
        center: [38.065, 114.610],
        zoom: 13
      })
      var cfg = {
        'radius': 0.6,
        'maxOpacity': 0.4,
        blur: 0.95,
        'scaleRadius': true,
        'useLocalExtrema': true,
        latField: 'lat',
        lngField: 'lng',
        valueField: 'count'
      }
      this.heatmapLayer = new HeatmapOverlay(cfg)
      // 图层
      let baseLayer = L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Haut-Gis-Org © OpenStreetMap'
      }
      )
      var testData = {
        max: 1000,
        data: this.Maptable
      }
      baseLayer.addTo(this.map)
      this.heatmapLayer.addTo(this.map)
      this.heatmapLayer.setData(testData)
      L.control.scale({ maxWidth: 200, metric: true, imperial: false }).addTo(this.map)
      let baseLayers = {
        'heatmapLayer': this.heatmapLayer,
      }
      L.control.layers(baseLayers).addTo(this.map)
    }
  }
}
</script>

<style scoped>
@import 'https://unpkg.com/leaflet@1.0.3/dist/leaflet.css';
.tab-xfc {
  position: absolute;
  right: 25px;
  top: 60px;
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
.tabactive {
  background: #3e9de5;
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
.tabactive1 {
  background: #3e9de5;
}
.tabxfc1 {
  position: absolute;
  left: 50px;
  top: 15px;
  text-align: left;
  float: left;
  width: 1500px;
  height: auto;
  z-index: 99999;
  border-radius: 10px;
}
</style>