<template>
  <div ref="chartRef" style="width:100%;height:100%;"></div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from "echarts"

const props = defineProps({
  data: {
    type: Array,
    default: () => {
      return []
    }
  },
  colors: {
    type: Array,
    default: () => {
      return [
        "#FF9B1A", "#D8A0FE", "#75F8C9",
        "#FD644F", "#A0E99A", "#80E6FF"
      ]
    }
  },
  /**圆环尺寸 */
  size: {
    type: Number,
    default: 120
  },
  /**开启自动切换 */
  autoPlay: {
    type: Boolean,
    default: false
  },
  /**自动切换间隙时间(毫秒) */
  interval: {
    type: Number,
    default: 1500
  }
})

const chartRef = ref()

let pieTimer = null;
const clearTimer = () => {
  pieTimer && clearInterval(pieTimer)
}

let chartInstance = null;
const setChart = () => {
  if (!chartRef.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
  }

  const pieData = props.data;
  const sumWhole = pieData.reduce((total, cur) => {
    return total + (cur.value*1 || 0);
  }, 0);
  const gapValue = !pieData.length ? 1 : parseInt(sumWhole/pieData.length*0.06);
  const gapName = 'gap';

  let seriesData = [];
  pieData.forEach(item => {
    seriesData.push(item);
    seriesData.push({
      name: gapName,
      value: gapValue,
      tooltip: { show: false },
      itemStyle: {
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        color: "rgba(0, 0, 0, 0)",
        borderColor: "rgba(0, 0, 0, 0)",
        borderWidth: 0,
      },
      emphasis: {
        disabled: true,
        label: {
          show: false
        }
      }
    });
  });

  const pieSize = props.size;
  const pieCenter = ["50%", "50%"];
  const options = {
    color: props.colors,
    tooltip: {
      show: false,
    },
    legend: {
      show: true,
      icon: "rect",
      orient: "horizontal",
      left: pieSize + 20,
      top: "middle",
      selectedMode: false,
      width: "0",
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: "#fff",
        fontSize: 12,
      },
      data: pieData.map(item => item.name),
    },
    series: [
      {
        name: "",
        type: "pie",
        selectedMode: false,
        width: pieSize,
        height: pieSize,
        radius: ["70%", "88%"],
        center: pieCenter,
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
          color: "#fff",
          formatter: params => {
            const { data } = params;
            return data.name ? `{value|${data.value}}\n{label|${data.name}}` : "";
          },
          rich: {
            value: {
              fontSize: 18,
            },
            label: {
              fontSize: 11,
              padding: [4, 0, 0, 0]
            }
          }
        },
        itemStyle: {
          borderColor: "transparent",
        },
        emphasis: {
          scaleSize: 6,
          label: {
            show: true,
          }
        },
        data: seriesData,
      },
      {
        zlevel: 4,
        name: "阴影圈",
        type: "pie",
        width: pieSize,
        height: pieSize,
        radius: ["0", "60%"],
        center: pieCenter,
        emphasis: {
          scale: false,
        },
        tooltip: {
          show: false,
        },
        itemStyle: {
          color: "rgba(204,225,255, 0.05)",
        },
        labelLine: {
          show: false,
        },
        data: [100],
      },
      {
        zlevel: 4,
        name: "阴影圈",
        type: "pie",
        width: pieSize,
        height: pieSize,
        radius: ["0", "50%"],
        center: pieCenter,
        emphasis: {
          scale: false,
        },
        tooltip: {
          show: false,
        },
        itemStyle: {
          color: "rgba(204,225,255, 0.07)",
        },
        labelLine: {
          show: false,
        },
        data: [100],
      },
    ],
  };

  chartInstance.setOption(options);

  // 默认高亮第一个
  let activePieIndex = 0;

  function highlightPie() {
    // 遍历饼图数据，取消所有图形的高亮效果
    for (let idx in seriesData) {
      chartInstance.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: idx
      })
    }
    // 高亮当前图形
    chartInstance.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: activePieIndex
    })
  }

  function selectNextPie() {
    const len = seriesData.length
    activePieIndex = (activePieIndex + 2) % len
    highlightPie()
  }

  highlightPie();

  if (props.autoPlay) {
    pieTimer = setInterval(selectNextPie, props.interval)
    chartInstance.on('mouseout', (params) => {
      clearTimer()
      pieTimer = setInterval(selectNextPie, props.interval)
    })
  }

  chartInstance.on('mouseover', (params) => {
    clearTimer()
    if (params.name !== gapName) {
      activePieIndex = params.dataIndex
      highlightPie()
    }
  })
}

watch(() => props.data, (val) => {
  clearTimer()
  setChart()
}, {
  deep: true,
  immediate: false
})

onMounted(() => {
  setChart()
})

onBeforeUnmount(() => {
  chartInstance?.dispose()
  clearTimer()
})
</script>
