<template>
  <div
    class="cascader-picker"
    :style="`--cascader-picker-active-olor:${activeColor};z-index:${visible ? zIndex : -1*zIndex};`"
  >
    <transition name="cascader-mask-fade">
      <div v-show="visible" class="cascader-picker__mask" @click="onMaskClick" />
    </transition>
    <transition name="cascader-box-slide-up">
      <div v-show="visible" class="cascader-picker__box">
        <div v-if="showHeader" class="cascader-picker__header">
          <h3 class="cascader-picker__title">{{title}}</h3>
          <span v-if="closeable" class="cascader-picker__cancel" @click="closePicker">✖</span>
        </div>
        <div class="cascader-picker__tab">
          <div class="cascader-picker__tab-list">
            <div
              v-for="(item, index) in tabListLen"
              :key="index"
              :class="formatNavClass(index)"
              @click="changeTab(index)"
            >
              <span>{{formatNavText(index)}}</span>
            </div>
          </div>
        </div>
        <div class="cascader-picker__main" >
          <div class="cascader-picker__main-track" :style="translateStyle">
            <ul
              class="cascader-picker__options"
              ref="selectListRefs"
              v-for="(parentItem, parentIndex) in pickerDataArr"
              :key="parentIndex"
            >
              <li
                v-for="(sonItem, sonIndex) in parentItem"
                :key="`${parentIndex}-${sonIndex}`"
                :class="formatOptionClass(sonItem)"
                @click="onSelect(sonItem, parentIndex)"
              >
                <span>{{sonItem[textKey]}}</span>
                <i v-if="checkOptionActive(sonItem)">✔</i>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'CascaderPicker',
  props: {
    value: [Number, String],
    // 是否显示级联选择器，支持 .sync 修饰符
    visible: {
      type: Boolean,
      default: false
    },
    // 可选项数据源
    options: {
      type: Array,
      default: () => []
    },
    // 顶部标题
    title: {
      type: String,
      default: ''
    },
    // 未选中时的提示文案
    placeholder: {
      type: String,
      default: '请选择'
    },
    // 自定义选择层级数
    level: {
      type: Number,
      default: 3
    },
    // 自定义options结构中的字段
    fieldNames: Object,
    // 是否显示关闭按钮
    closeable: {
      type: Boolean,
      default: true
    },
    // 是否可以通过点击mask遮罩关闭
    closeOnClickMask: {
      type: Boolean,
      default: true
    },
    // 配置本组件的z-index层级
    zIndex: {
      type: Number,
      default: 9999
    },
    // 选中状态的高亮颜色
    activeColor: {
      type: String,
      default: '#ee0a24'
    },
    // 是否展示标题栏
    showHeader: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      activeTab: 0,
      selectedOptions: [],
      pickerDataArr: [],
      finishedFlag: false,
    }
  },
  watch: {
    visible(val) {
      this.lockScroll(val)
    },
    options: {
      deep: true,
      handler: 'updateTabs',
    },
    value(value) {
      if (value || value === 0) {
        const values = this.selectedOptions.map((item) => item[this.valueKey]);
        if (values.indexOf(value) !== -1) {
          return;
        }
      }
      this.updateTabs();
    },
  },
  computed: {
    textKey() {
      return this.fieldNames?.text || 'text';
    },
    valueKey() {
      return this.fieldNames?.value || 'value';
    },
    childrenKey() {
      return this.fieldNames?.children || 'children';
    },
    tabListLen () {
      return !this.finishedFlag && this.selectedOptions.length < this.level ? this.selectedOptions.length + 1 : this.selectedOptions.length
    },
    translateStyle () {
      return {
        transform: `translateX(-${this.activeTab * 100}%)`,
        transitionDuration: '0.3s',
      }
    },
  },
  created () {
    this.updateTabs()
  },
  methods: {
    getSelectedOptionsByValue(options, value) {
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (option[this.valueKey] === value) {
          return [option];
        }
        if (option[this.childrenKey]) {
          const selectedOptions = this.getSelectedOptionsByValue(option[this.childrenKey], value);
          if (selectedOptions) {
            return [option, ...selectedOptions];
          }
        }
      }
    },
    updateTabs() {
      if (this.value || this.value === 0) {
        const selectedRes = this.getSelectedOptionsByValue(this.options, this.value);
        this.selectedOptions = selectedRes || []
        if (selectedRes) {
          const optionListArr = [this.options]
          const validArr = selectedRes.slice(0, selectedRes.length-1)
          validArr.forEach(item => {
            if (item[this.childrenKey]) {
              optionListArr.push(item[this.childrenKey])
            }
          })
          this.finishedFlag = true
          this.pickerDataArr = optionListArr
          this.$nextTick(() => {
            this.activeTab = this.selectedOptions.length - 1;
          });
          return;
        }
      }
      this.pickerDataArr = [this.options]
    },
    formatNavText(index) {
      const obj = this.selectedOptions[index]
      return (obj && obj[this.textKey]) || this.placeholder
    },
    formatNavClass(index) {
      return [
        'cascader-picker__tab-item',
        {
          'cascader-picker__tab-item--active': index === this.activeTab,
          'cascader-picker__tab-item--unselected': this.placeholder === this.formatNavText(index),
        }
      ]
    },
    checkOptionActive(item) {
      return this.selectedOptions.includes(item)
    },
    formatOptionClass(item) {
      return [
        'cascader-picker__option',
        {
          'cascader-picker__option--selected': this.checkOptionActive(item)
        }
      ]
    },
    changeTab(index) {
      if (!this.visible) return
      this.activeTab = index
    },
    onSelect(item, tabIndex) {
      if (!this.visible || tabIndex !== this.activeTab) return
      this.finishedFlag = false
      this.selectedOptions.splice(this.activeTab, this.selectedOptions.length, item)
      if (!(item[this.childrenKey] && item[this.childrenKey].length) || this.activeTab + 1 >= this.level) {
        this.finishedFlag = true
        this.$emit('input', this.selectedOptions[this.selectedOptions.length - 1][this.valueKey])
        this.$emit('finish', this.selectedOptions)
        return
      }
      this.$refs['selectListRefs'].forEach((ele, index) => {
        if (index > this.activeTab) {
          ele.scrollTop = 0
        }
      })
      this.activeTab++
      this.pickerDataArr.splice(this.activeTab, this.pickerDataArr.length, item[this.childrenKey])
    },
    onMaskClick() {
      if (this.closeOnClickMask) {
        this.closePicker()
      }
    },
    closePicker() {
      this.$emit('close')
      this.$emit('update:visible', false)
    },
    resetPicker() {
      this.activeTab = 0
      this.finishedFlag = false
      this.selectedOptions = []
      this.pickerDataArr = [this.options]
      this.$nextTick(() => {
        if(this.$refs['selectListRefs'][0]) {
          this.$refs['selectListRefs'][0].scrollTop = 0
        }
      })
    },
    lockScroll(ifLock) {
      document.querySelector('body').style.overflow = ifLock ? 'hidden' : null
    }
  },
  beforeDestroy() {
    this.lockScroll(false)
  }
}
</script>

<style lang="scss">
.cascader-picker {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  @keyframes cascader-mask-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes cascader-mask-fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  .cascader-mask-fade {
    &-enter-active {
      animation: 0.3s cascader-mask-fade-in both ease-out;
    }
    &-leave-active {
      animation: 0.3s cascader-mask-fade-out both ease-in;
    }
  }

  @keyframes cascader-box-slide-up-enter {
    from {
      transform: translate3d(0, 100%, 0);
    }
  }
  @keyframes cascader-box-slide-up-leave {
    to {
      transform: translate3d(0, 100%, 0);
    }
  }
  .cascader-box-slide-up {
    &-enter-active {
      animation: cascader-box-slide-up-enter 0.3s both ease-out;
    }
    &-leave-active {
      animation: cascader-box-slide-up-leave 0.3s both ease-in;
    }
  }

  &__mask {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
  }

  &__box {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80%;
    background-color: #fff;
    border-radius: 16px 16px 0 0;
    display: flex;
    flex-direction: column;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 0 16px;
  }
  &__title {
    font-weight: 500;
    font-size: 16px;
  }
  &__cancel {
    color: #c8c9cc;
    font-size: 22px;
    user-select: none;
    cursor: pointer;
    &:active {
      color: #969799;
    }
  }

  &__tab {
    height: 48px;
    overflow: hidden;
  }
  &__tab-list {
    display: flex;
    padding: 0 6px;
    box-sizing: content-box;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
  }
  &__tab-item {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 0 10px;
    font-size: 14px;
    color: #323233;
    font-weight: 500;
    cursor: pointer;
    user-select: none;
  }
  &__tab-item--active {
    position: relative;
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      transition-duration: 0.3s;
      bottom: 0;
      display: block;
      width: calc(100% - 20px);
      height: 3px;
      background-color: var(--cascader-picker-active-olor);
      border-radius: 3px;
    }
  }
  &__tab-item--unselected {
    color: #969799;
    font-weight: normal;
  }

  &__main {
    flex: 1;
    overflow: hidden;
  }
  &__main-track {
    width: 100%;
    height: 100%;
    display: flex;
  }

  &__options {
    flex: 0 0 100%;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding-top: 6px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  &__option {
    padding: 10px 16px;
    font-size: 14px;
    line-height: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
    &:active {
      background-color: #f2f3f5;
    }
    > i {
      flex: none;
      font-size: 18px;
      color: var(--cascader-picker-active-olor);
    }
  }
  &__option--selected {
    color: var(--cascader-picker-active-olor);
    font-weight: 500;
  }
}
</style>
