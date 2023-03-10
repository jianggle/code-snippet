<template>
  <div>
    <p style="text-align:center;margin-top:40px;">
      <button @click="openCascaderPicker()">open picker</button>
    </p>
    <cascader-picker
      ref="refCascaderPicker"
      title="请选择所在地区"
      v-model="cascaderValue"
      :visible.sync="showCascader"
      :options="cascaderOptions"
      :field-names="cascaderFieldNames"
      @finish="onCascaderPickerFinish"
      @change="onCascaderPickerChange"
    />
  </div>
</template>

<script>
import CascaderPicker from './CascaderPicker.vue'
export default {
  components: {
    CascaderPicker,
  },
  data() {
    return {
      showCascader: false,
      cascaderValue: '',
      // cascaderValue: '1-1',
      // cascaderValue: '2-2-2',
      // cascaderValue: '3-2-3-2',
      cascaderOptions: [],
      cascaderFieldNames: {
        text: 'name',
        value: 'id',
        children: 'children'
      }
    }
  },
  methods: {
    openCascaderPicker() {
      // this.$refs['refCascaderPicker'].resetPicker()
      this.showCascader = true
    },
    onCascaderPickerFinish({ value, selectedOptions, tabIndex }) {
      console.log(value)
      console.log(selectedOptions.map(item => item[this.cascaderFieldNames.value]))
      console.log(selectedOptions.map(item => item[this.cascaderFieldNames.text]))
      console.log(selectedOptions)
      this.showCascader = false
    },
    onCascaderPickerChange({ value, selectedOptions, tabIndex }) {
      console.log(value)
      console.log(selectedOptions)
      console.log(tabIndex)
    }
  },
  created() {
    this.cascaderOptions = new Array(6).fill(null).map((item,index) => {
      return {
        name: `第1级-${index}${index%2==0 ? '-含子级' : ''}`,
        id: `1-${index}`,
        children: new Array(index%2==0 ? 15 : 0).fill(null).map((item2,index2) => {
          return {
            name: `第2级-${index}-${index2}${index2%3==0 ? '-含子级' : ''}`,
            id: `2-${index}-${index2}`,
            children: new Array(index2%3==0 ? 20 : 0).fill(null).map((item3,index3) => {
              return {
                name: `第3级-${index}-${index2}-${index3}`,
                id: `3-${index}-${index2}-${index3}`,
              }
            })
          }
        })
      }
    })
  }
}
</script>
