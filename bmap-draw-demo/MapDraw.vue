<template>
  <div class="area-box-map">
    <div class="map-tools" v-if="enableEdit">
      <el-button plain type="danger" @click="handleRedraw()">重新绘制</el-button>
      <el-button v-if="resPoints.length && isEditMode" plain type="danger" @click="quitModify()">退出编辑</el-button>
      <el-button v-if="resPoints.length && !isEditMode" plain type="danger" @click="openModify()">编辑</el-button>
    </div>
    <div ref="mapRef" style="width:100%;height:100%;position:relative;"></div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DrawScene,
  PolylineDraw,
  PolylineEdit,
  PolygonDraw,
  PolygonEdit,
  OperateEventType,
} from 'bmap-draw'
import { bd09mc2bd09, getCenterPoint } from './mapUtils'

const mapRef = ref()
const myMap = ref()
const scene = ref(null)
const sceneDrawStatus = ref(null)
const isEditMode = ref(false)

const enableEdit = ref(false)
const isAreaMode = ref(false)
const resPoints = ref([])

const emit = defineEmits(['complete'])
watch(() => resPoints.value, (val) => {
  emit('complete', val)
})

const initMap = (centerPoint, callback) => {
  myMap.value = new BMapGL.Map(mapRef.value)
  myMap.value.centerAndZoom(new BMapGL.Point(centerPoint.lng, centerPoint.lat), 18)
  myMap.value.enableScrollWheelZoom(true)
  callback()
}

const AREA_OPTIONS = {
  strokeColor: '#f00', // 边线颜色
  strokeWeight: 3, // 边线的宽度，以像素为单位
  strokeOpacity: 1, // 边线透明度，取值范围0 - 1
  strokeStyle: 'solid', // 边线的样式，solid或dashed
  fillColor: '#ff0', // 线填充颜色
  fillOpacity: 0.3, // 填充的透明度，取值范围0 - 1
}

const handleView = (points) => {
  const arrPoints = []
  points.forEach(item => {
    arrPoints.push(new BMapGL.Point(item.lng, item.lat))
  })
  let overlay = null;
  if (isAreaMode.value) {
    overlay = new BMapGL.Polygon(arrPoints, AREA_OPTIONS);
  } else {
    overlay = new BMapGL.Polyline(arrPoints, AREA_OPTIONS);
  }
  myMap.value.addOverlay(overlay);
}

const handleAdd = () => {
  const drawOpts = {
    hideTip: false, // 隐藏绘制提示
    isSeries: false, // 是否开启批量绘制
    isOpen: true, // 是否开启绘制状态
    baseOpts: AREA_OPTIONS,
  }
  isEditMode.value = true
  scene.value = new DrawScene(myMap.value)
  if (isAreaMode.value) {
    sceneDrawStatus.value = new PolygonDraw(scene.value, drawOpts)
  } else {
    sceneDrawStatus.value = new PolylineDraw(scene.value, drawOpts)
  }
  sceneDrawStatus.value.addEventListener(OperateEventType.COMPLETE, (e) => {
    isEditMode.value = false
    resPoints.value = []
    for (let item of e.target.overlay.points) {
      const [lng, lat] = bd09mc2bd09(item.lng, item.lat)
      resPoints.value.push({ lng, lat })
    }
  });
  sceneDrawStatus.value.addEventListener(OperateEventType.CANCEL, (e) => {
    isEditMode.value = false
  });
}

const handleEdit = (reshow) => {
  const arrPoints = []
  reshow.forEach(item => {
    arrPoints.push(new BMapGL.Point(item.lng, item.lat))
  })
  let overlay = null;
  if (isAreaMode.value) {
    overlay = new BMapGL.Polygon(arrPoints, AREA_OPTIONS);
  } else {
    overlay = new BMapGL.Polyline(arrPoints, AREA_OPTIONS);
  }

  myMap.value.addOverlay(overlay);
  scene.value = new DrawScene(myMap.value);
  scene.value.instances.push(overlay);

  const sline = isAreaMode.value ? new PolygonEdit(scene.value) : new PolylineEdit(scene.value);
  sline.open(overlay);
  sline.addEventListener(OperateEventType.COMPLETE, (e) => {
    isEditMode.value = false
    resPoints.value = []
    for (let item of e.target.overlay.points) {
      const [lng, lat] = bd09mc2bd09(item.lng, item.lat)
      resPoints.value.push({ lng, lat })
    }
  });
  sline.addEventListener(OperateEventType.CANCEL, (e) => {
    isEditMode.value = false
  });

  sceneDrawStatus.value = sline
  isEditMode.value = true
}

const handleRedraw = () => {
  if (isEditMode.value) {
    return ElMessage.warning('请先完成当前绘制')
  }

  myMap.value?.clearOverlays()
  scene.value?.clearData()
  sceneDrawStatus.value = null
  resPoints.value = []

  handleAdd()
}

const openModify = () => {
  myMap.value?.clearOverlays()
  scene.value?.clearData()
  sceneDrawStatus.value = null
  handleEdit(resPoints.value)
}
const quitModify = () => {
  sceneDrawStatus.value?.close()
  isEditMode.value = false
}

const initMapDraw = (data) => {
  enableEdit.value = data.enableEdit
  isAreaMode.value = data.drawType === 'area'
  resPoints.value = data.initPoints

  const reshowPoints = JSON.parse(JSON.stringify(data.initPoints))
  const centerPoint = {
    lng: '121.829792',
    lat: '39.058703'
  }
  if (reshowPoints.length) {
    const [cLng, cLat] = getCenterPoint(reshowPoints)
    centerPoint.lng = cLng
    centerPoint.lat = cLat
  }

  initMap(centerPoint, () => {
    if (!enableEdit.value) {
      if (reshowPoints.length) {
        handleView(reshowPoints)
      }
    } else {
      if (reshowPoints.length) {
        handleEdit(reshowPoints)
      } else {
        handleAdd()
      }
    }
  })
}

const validateMapDraw = () => {
  return new Promise((resolve, reject) => {
    if (isEditMode.value) {
      return reject('请先完成绘制')
    }
    if (isAreaMode.value && resPoints.value.length < 4) {
      return reject('请绘制正确的区域')
    }
    if (!isAreaMode.value && resPoints.value.length < 2) {
      return reject('请绘制正确的路线')
    }
    resolve()
  })
}

const resetMapDraw = () => {
  myMap.value?.destroy()
  scene.value = null
  sceneDrawStatus.value = null
  isEditMode.value = false
  resPoints.value = []
}

onBeforeUnmount(() => {
  resetMapDraw()
})

defineExpose({
  init: initMapDraw,
  validate: validateMapDraw,
})
</script>

<style lang="scss">
.area-box-map {
  position: relative;
  width: 100%;
  height: 640px;
  >.map-tools {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 9;
  }
}
</style>
