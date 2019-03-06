<template>
  <div class="trim-editor">
    <vue-slider class="trim-editor__slider" v-model="trimValue"
      :min="0" :max="duration"
      :dotSize="20" :duration="0">
      <template v-slot:tooltip="{ value }">
        <div class="trim-editor__slider__tooltip">
          {{ (value / 1000).toFixed(1) }} s
        </div>
      </template>
    </vue-slider>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component'
import debounce from 'debounce'

export default {
  components: {
    VueSlider
  },

  props: {
    trim: Array,
    duration: Number
  },

  data () {
    return {
      trimValue: [0, 1]
    }
  },

  created () {
    this.pushTrim = debounce(this.pushTrim.bind(this), 500)
    this.syncTrim()
  },

  methods: {
    syncTrim () {
      let { trim, trimValue } = this

      trimValue[0] = trim[0]
      trimValue[1] = trim[1]
    },

    pushTrim () {
      let { trim, trimValue } = this

      trim[0] = trimValue[0]
      trim[1] = trimValue[1]
    }
  },

  watch: {
    'trim': {
      deep: false,
      handler () {
        this.syncTrim()
      }
    },

    'trimValue': {
      deep: true,
      handler () {
        this.pushTrim()
      }
    }
  }
}
</script>

<style lang="scss">
.trim-editor {
  &__slider {
    &__tooltip {
      border-radius: 3px;
      background: rgba(#111, 0.8);
      padding: 4px 6px;
      white-space: nowrap;
      transform: translateY(-4px);
    }
  }

  .vue-slider-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .vue-slider-rail {
    background-color: rgba(#fff, 0.1);
    border-radius: 15px;
  }

  .vue-slider-process {
    background-color: #F8CC48;
    border-radius: 15px;
  }

  .vue-slider-mark {
    z-index: 4;
  }
  .vue-slider-mark:first-child .vue-slider-mark-step, .vue-slider-mark:last-child .vue-slider-mark-step {
    display: none;
  }
  .vue-slider-mark-step {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.16);
  }
  .vue-slider-mark-label {
    font-size: 14px;
    white-space: nowrap;
  }
  .vue-slider-dot-handle {
    position: absolute;
    left: 5px;
    width: 10px;
    height: 100%;
    border-radius: 2px;
    background-color: #F8CC48;
    box-sizing: border-box;
    box-shadow: 0.5px 0.5px 2px 1px rgba(#111, 0.32);
  }
  .vue-slider-dot-handle-focus {
    box-shadow: 0px 0px 1px 2px rgba(#fff, 0.36);
  }

  .vue-slider-dot-handle-disabled {
    cursor: not-allowed;
    background-color: #ccc;
  }

  .vue-slider-dot-tooltip-wrapper {
    opacity: 0;
  }
  .vue-slider-dot-tooltip-wrapper-show {
    opacity: 1;
  }
}
</style>
