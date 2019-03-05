<template>
  <div class="trim-editor">
    <vue-slider v-model="trimValue" :min="0" :max="duration">
      <template v-slot:tooltip="{ value }">
        <div class="trim-editor__slider__tooltip">
          {{ value / 1000 }}
        </div>
      </template>
    </vue-slider>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component'
import debounce from 'debounce'
import 'vue-slider-component/theme/default.css'

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
}
</style>
