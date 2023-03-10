# CascaderPicker 级联选择器

### 介绍

级联选择框，用于多层级数据的选择，典型场景为省市区选择。

## 代码演示

### 基础用法

```html
<cascader-picker
  v-model="cascaderValue"
  :visible.sync="show"
  title="请选择所在地区"
  :options="options"
  @finish="onFinish"
/>
```

```js
export default {
  data() {
    return {
      show: false,
      fieldValue: '',
      cascaderValue: '',
      // 选项列表，children 代表子选项，支持多级嵌套
      options: [
        {
          text: '四川省',
          value: '510000',
          children: [{ text: '成都市', value: '510100' }],
        },
        {
          text: '云南省',
          value: '530000',
          children: [{ text: '昆明市', value: '530100' }],
        },
      ],
    };
  },
  methods: {
    // 全部选项选择完毕后，会触发 finish 事件
    onFinish(selectedOptions) {
      this.show = false;
      this.fieldValue = selectedOptions.map((option) => option.text).join('/');
    },
  },
};
```

### 自定义颜色

通过 `active-color` 属性来设置选中状态的高亮颜色。

```html
<cascader-picker
  v-model="cascaderValue"
  :visible.sync="show"
  title="请选择所在地区"
  :options="options"
  active-color="#1989fa"
  @finish="onFinish"
/>
```

### 自定义字段名

通过 `field-names` 属性可以自定义 `options` 里的字段名称。

```html
<van-cascader
  v-model="cascaderValue"
  :visible.sync="show"
  title="请选择所在地区"
  :options="options"
  :field-names="fieldNames"
/>
```

```js
export default {
  data() {
    return {
      show: false,
      cascaderValue: '',
      fieldNames: {
        text: 'name',
        value: 'code',
        children: 'items',
      },
      options: [
        {
          name: '浙江省',
          code: '330000',
          items: [{ name: '杭州市', code: '330100' }],
        },
        {
          name: '江苏省',
          code: '320000',
          items: [{ name: '南京市', code: '320100' }],
        },
      ],
    };
  },
};
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ---- |
| visible | 是否显示选择器 | _boolean_ | `false` |
| title | 顶部标题 | _string_ | - |
| value | 选中项的值 | _string \| number_ | - |
| options | 可选项数据源 | _Option[]_ | `[]` |
| placeholder | 未选中时的提示文案 | _string_ | `请选择` |
| active-color | 选中状态的高亮颜色 | _string_ | `#ee0a24` |
| z-index | 配置本组件的z-index层级 | _number_ | `9999` |
| level | 自定义最大可选择层级数 | _number_ | `3` |
| closeable | 是否显示关闭图标 | _boolean_ | `true` |
| show-header | 是否展示标题栏 | _boolean_ | `true` |
| close-on-click-mask | 是否可以通过点击mask遮罩关闭 | _boolean_ | `true` |
| field-names | 自定义 `options` 结构中的字段 | _object_ | `{ text: 'text', value: 'value', children: 'children' }` |

### Events

| 事件 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| input | 全部选项选择完成后触发 | `最末级选中项的value值` |
| finish | 全部选项选择完成后触发 | `selectedOptions` |
| close | 点击关闭图标时触发 | - |

### Methods

| 方法名 | 说明 | 参数 |
| ---- | ---- | ---- |
| resetPicker | 重置为初始状态 | - |
