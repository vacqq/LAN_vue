


<template>
  <baidu-map class="map" :center="{lng: 115.404, lat: 39.915}" :zoom="13" :scroll-wheel-zoom="true"
    :mapStyle="mapStyle">
    <bm-marker :position="{lng: 115.404, lat: 39.915}" :dragging="true" @click="infoWindowOpen">
      <bm-label content="我爱北京天安门" :labelStyle="{color: 'black', fontSize : '15px'}"
        :offset="{width: -35, height: 30}" />
      <bm-info-window :show="show" @close="infoWindowClose" @open="infoWindowOpen">我爱北京天安门</bm-info-window>
    </bm-marker>
    <bm-point-collection :points="points" shape="BMAP_POINT_SHAPE_WATERDROP" color="red" size="BMAP_POINT_SIZE_HUGE"
      @click="clickHandler"></bm-point-collection>
  </baidu-map>
</template>
<script>
import styleJsonjs from './mapStyle'

export default {
  data () {
    return {

      //地图样式
      mapStyle: {
        styleJson: styleJsonjs.styleJsonjs
      },
      //显示属性
      show: false,
      //站点集合
      points: []
    }
  },
  mounted: function () {
    //海量点开启
    this.addPoints();
  },
  methods: {
    infoWindowClose () {
      this.show = false
    },
    infoWindowOpen () {
      this.show = true
    },
    clickHandler (e) {
      alert(`单击点的坐标为：${e.point.lng}, ${e.point.lat}`);
    },
    addPoints () {
      const points = [];
      for (var i = 0; i < 1000; i++) {
        const position = { lng: Math.random() * 40 + 85, lat: Math.random() * 30 + 21 }
        points.push(position)
      }
      this.points = points
    }
  }
}
</script>
<style scoped>
.map {
  width: 100%;
  height: 600px;
}
</style>
