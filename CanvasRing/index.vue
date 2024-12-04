<template>
  <canvas ref="canvasRef"></canvas>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';

// 定义 props 的类型
interface RatioItem {
  ratio: number;
  color: string;
}

const props = defineProps<{
  size?: number; // 画布大小
  storkWidth?: number; // 环的宽度
  ratioList?: RatioItem[]; // 比例列表
}>();

// 默认值
const defaultSize = 100; // 默认画布宽高
const defaultStorkWidth = 4;
const defaultRatioList: RatioItem[] = [{ ratio: 1, color: '#C4C9CF4D' }];

// canvas DOM 和上下文
const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

// 动态计算 canvas 的中心点和半径
const size = computed(() => props.size || defaultSize);
const center = computed(() => ({
  x: size.value / 2,
  y: size.value / 2
}));
const radius = computed(() => size.value / 2 - (props.storkWidth || defaultStorkWidth));

// 通用绘制函数
const drawCircle = ({
  ctx,
  x,
  y,
  radius,
  lineWidth,
  color,
  startAngle,
  endAngle
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  radius: number;
  lineWidth: number;
  color: string;
  startAngle: number;
  endAngle: number;
}) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, startAngle, endAngle);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
};

/**初始化 canvas */
const initCanvas = () => {
  const dom = canvasRef.value;
  if (!dom) return;

  ctx = dom.getContext('2d');
  if (!ctx) return;

  dom.width = size.value;
  dom.height = size.value;

  drawBackgroundCircle();
  drawDataRings();
};

/**绘制背景圆环 */
const drawBackgroundCircle = () => {
  if (!ctx) return;
  drawCircle({
    ctx,
    x: center.value.x,
    y: center.value.y,
    radius: radius.value,
    lineWidth: props.storkWidth || defaultStorkWidth,
    color: '#C4C9CF4D',
    startAngle: -Math.PI / 2,
    endAngle: Math.PI * 1.5
  });
};

/**绘制数据圆环 */
const drawDataRings = () => {
  if (!ctx) return;
  const { ratioList = defaultRatioList } = props;
  let startAngle = -Math.PI / 2;
  ratioList.forEach(({ ratio, color }) => {
    const endAngle = startAngle + ratio * Math.PI * 2;
    drawCircle({
      ctx,
      x: center.value.x,
      y: center.value.y,
      radius: radius.value,
      lineWidth: props.storkWidth || defaultStorkWidth,
      color,
      startAngle,
      endAngle
    });
    startAngle = endAngle;
  });
};

watchEffect(() => {
  initCanvas();
});

onMounted(() => {
  initCanvas();
});
</script>
