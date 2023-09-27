<template>
  <div ref="chartRef" style="width:100%;height:100%;"></div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
// 按需引入可参考 https://echarts.apache.org/handbook/zh/basics/import/
import * as echarts from "echarts"
import "echarts-gl"

const props = defineProps({
  data: {
    type: Array,
    default: () => {
      return [
        {name: 'example01', value: '500'},
        {name: 'example02', value: '300'},
        {name: 'example03', value: '200'},
      ]
    }
  },
  colors: {
    type: Array,
    default: () => {
      return [
        '#397CF4','#02D4AA','#7DC470','#DD8352','#D5D53D',
        '#11C1C8','#00B2FF','#EA8315',
        '#3D7FDB','#546CE5','#0CB786','#FFBB4A','#95D075',
      ]
    }
  },
  /**是否使用间隙 */
  isGap: {
    type: Boolean,
    default: false,
  },
  /**内径占比 */
  internalDiameterRatio: {
    type: Number,
    default: 0.7
  },
  /**视角距离主体的距离(距离中心原点的距离) */
  distance: {
    type: Number,
    default: 200
  },
  /**旋转角度 */
  angle: {
    type: Number,
    default: 30
  },
  /**立体的高度 */
  pieHeight: {
    type: Number,
    default: 26
  },
  /**透明度 */
  opacity: {
    type: Number,
    default: 0.5
  }
})

const chartRef = ref()

watch(() => props.data, (val) => {
  setChart()
}, {
  deep: true,
  immediate: false
})

let chartInstance = null
const options = ref({})

onMounted(() => {
  setChart()
})

onBeforeUnmount(() => {
  chartInstance?.dispose()
})

function setChart() {
  if (!chartRef.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const baseData = props.data.map((item, index) => {
    return {
      name: item.name,
      value: item.value*1 || 0,
      itemStyle: {
        color: props.colors[index]
      }
    }
  })
  // 从大到小进行排序
  baseData.sort((a, b) => b.value - a.value);

  // 计算出合理的间隙值
  const sumWhole = baseData.reduce((total, cur) => {
    return total + (cur.value*1 || 0);
  }, 0);
  const gapValue = !baseData.length ? 1 : parseInt(sumWhole/baseData.length*0.08);

  // 如果使用间隙，需要注入间隙区域的数据
  const optionData = []
  baseData.forEach(item => {
    optionData.push(item)
    if (props.isGap) {
      optionData.push({
        value: gapValue,
        itemStyle: {
          color: "rgba(0, 0, 0, 0)",
        },
      })
    }
  })

  // 传入数据生成 option, 构建3d饼状图
  options.value = getPie3dOptions(optionData, props.internalDiameterRatio, props.distance, props.angle, props.pieHeight, props.opacity)
  chartInstance.setOption(options.value)
  bindListen()
}

// 监听鼠标事件，实现饼图选中效果（单选），近似实现高亮（放大）效果
function bindListen() {
  let hoveredIndex = ''
  // 监听 mouseover，近似实现高亮（放大）效果
  chartInstance.on('mouseover', (params) => {
    // 准备重新渲染扇形所需的参数
    let isSelected = null
    let isHovered = null
    let startRatio = null
    let endRatio = null
    let k = null
    // 如果触发 mouseover 的扇形当前已高亮，则不做操作
    // 否则进行高亮及必要的取消高亮操作
    if (hoveredIndex !== params.seriesIndex) {
      // 如果当前有高亮的扇形，取消其高亮状态（对 option 更新）
      if (hoveredIndex !== '') {
        // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 false。
        let hoverItem = options.value.series[hoveredIndex]
        isSelected = hoverItem.pieStatus.selected
        isHovered = false
        startRatio = hoverItem.pieData.startRatio
        endRatio = hoverItem.pieData.endRatio
        k = hoverItem.pieStatus.k
        // 对当前点击的扇形，执行取消高亮操作（对 option 更新）
        hoverItem.parametricEquation = getParametricEquation(startRatio, endRatio, isSelected, isHovered, k, hoverItem.pieData.value)
        hoverItem.pieStatus.hovered = isHovered
        // 将此前记录的上次选中的扇形对应的系列号 seriesIndex 清空
        hoveredIndex = ''
      }
      // 如果触发 mouseover 的扇形不是透明圆环，将其高亮（对 option 更新）
      if ((params.seriesName !== 'mouseoutSeries') && (params.seriesName !== 'pie2d')) {
        // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 true。
        let item = options.value.series[params.seriesIndex]
        isSelected = item.pieStatus.selected
        isHovered = true
        startRatio = item.pieData.startRatio
        endRatio = item.pieData.endRatio
        k = item.pieStatus.k
        // 对当前点击的扇形，执行高亮操作（对 option 更新）
        item.parametricEquation = getParametricEquation(startRatio, endRatio, isSelected, isHovered, k, item.pieData.value + 60)
        item.pieStatus.hovered = isHovered
        // 记录上次高亮的扇形对应的系列号 seriesIndex
        hoveredIndex = params.seriesIndex
      }
      // 重新渲染图表
      chartInstance.setOption(options.value)
    }
  })
  // 修正取消高亮失败的 bug
  chartInstance.on('globalout', () => {
    // 准备重新渲染扇形所需的参数
    let isSelected = null
    let isHovered = null
    let startRatio = null
    let endRatio = null
    let k = null
    // 如果当前有高亮的扇形，取消其高亮状态（对 option 更新）
    if (hoveredIndex !== '') {
      // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 false。
      let hoverItem = options.value.series[hoveredIndex]
      isSelected = hoverItem.pieStatus.selected
      isHovered = false
      startRatio = hoverItem.pieData.startRatio
      endRatio = hoverItem.pieData.endRatio
      k = hoverItem.pieStatus.k
      // 对当前点击的扇形，执行取消高亮操作（对 option 更新）
      hoverItem.parametricEquation = getParametricEquation(startRatio, endRatio, isSelected, isHovered, k, hoverItem.pieData.value)
      hoverItem.pieStatus.hovered = isHovered
      // 将此前记录的上次选中的扇形对应的系列号 seriesIndex 清空
      hoveredIndex = ''
    }
    // 使用更新后的 option，渲染图表
    chartInstance.setOption(options.value)
  })
}

/**
 * 绘制3d图
 * @param dataArr 总数据
 * @param internalDiameterRatio:透明的空心占比
 * @param distance 视角到主体的距离
 * @param alpha 旋转角度
 * @param pieHeight 立体的高度
 * @param opacity 饼或者环的透明度
 */
function getPie3dOptions(dataArr, internalDiameterRatio, distance, alpha, pieHeight, opacity = 1) {
  const series = [];
  let sumValue = 0;
  let startValue = 0;
  let endValue = 0;
  const k = 1 - internalDiameterRatio
  // 将每一条数据生成一个曲面
  // 配置项：https://echarts.apache.org/zh/option-gl.html#series-surface.type
  for (let i = 0; i < dataArr.length; i++) {
    sumValue += dataArr[i].value
    const seriesItem = {
      name: !dataArr[i].name ? `series${i}` : dataArr[i].name,
      type: 'surface',
      parametric: true,
      wireframe: {
        show: false
      },
      pieData: {
        ...dataArr[i]
      },
      pieStatus: {
        selected: false,
        hovered: false,
        k: k
      },
      center: ['10%', '50%']
    }
    seriesItem.itemStyle = {
      color: dataArr[i].itemStyle?.color,
      opacity: dataArr[i].itemStyle?.opacity || opacity,
    }
    series.push(seriesItem)
  }

  // 实现每一个扇形
  for (let i = 0; i < series.length; i++) {
    endValue = startValue + series[i].pieData.value
    let sRatio = startValue / sumValue
    let eRatio = endValue / sumValue
    series[i].pieData.startRatio = sRatio
    series[i].pieData.endRatio = eRatio
    series[i].parametricEquation = getParametricEquation(sRatio, eRatio, false, false, k, series[i].pieData.value)
    startValue = endValue
  }
  // 设定3d饼/环的高度，单位是px
  const boxHeight = getHeight3D(series, pieHeight)
  // 返回配置项
  return {
    series: series,
    legend: {
      show: false,
    },
    tooltip: {
      show: true,
      backgroundColor: '#033b77',
      borderColor: '#21f2c4',
      textStyle: {
        color: '#fff',
        fontSize: 13
      },
      formatter: function(params) {
        let name = params.seriesName
        if ((name !== 'mouseoutSeries') && (name !== 'pie2d') && name.indexOf('series')<0) {
          let curData = series[params.seriesIndex].pieData
          return (
            `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>` +
            `${name}&nbsp;&nbsp;${curData.value}`
          )
        }
      }
    },
    xAxis3D: {
      min: -1,
      max: 1
    },
    yAxis3D: {
      min: -1,
      max: 1
    },
    zAxis3D: {
      min: -1,
      max: 1
    },
    grid3D: {
      show: false,
      boxHeight: boxHeight, // 圆环的高度
      viewControl: { // 3d效果
        alpha, // 角度
        distance, // 调整视角到主体的距离，类似调整zoom
        rotateSensitivity: 0, // 设置为0无法旋转
        zoomSensitivity: 0, // 设置为0无法缩放
        panSensitivity: 0, // 设置为0无法平移
        autoRotate: false // 自动旋转
      }
    },
  }
}

// 生成扇形的曲面参数方程
function getParametricEquation(startRatio, endRatio, isSelected, isHovered, k, h) {
  const midRatio = (startRatio + endRatio) / 2
  const startRadian = startRatio * Math.PI * 2
  const endRadian = endRatio * Math.PI * 2
  const midRadian = midRatio * Math.PI * 2
  // 如果只有一个扇形，则不实现选中效果。
  if (startRatio === 0 && endRatio === 1) {
    isSelected = false
  }
  // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
  k = k || 1 / 3
  // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
  const offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0
  const offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0
  // 计算高亮效果的放大比例（未高亮，则比例为 1）
  const hoverRate = isHovered ? 1.05 : 1
  // 返回曲面参数方程
  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32
    },
    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 20
    },
    x: function (u, v) {
      if (u < startRadian) {
        return (
          offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        )
      }
      if (u > endRadian) {
        return (
          offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        )
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate
    },
    y: function (u, v) {
      if (u < startRadian) {
        return (
          offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        )
      }
      if (u > endRadian) {
        return (
          offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        )
      }
      return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate
    },
    z: function (u, v) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u)
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u) * h * 0.1
      }
      return Math.sin(v) > 0 ? 1 * h * 0.1 : -1
    }
  }
}

// 获取3d饼图的最高扇区的高度
function getHeight3D(series, height) {
  if (!series.length) return 0;
  series.sort((a, b) => b.pieData.value - a.pieData.value)
  return (height * 25) / series[0].pieData.value
}
</script>
