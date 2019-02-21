<template>
  <div class="bounds-editor">
    <canvas ref="canvas" class="bounds-editor__canvas"
      :width="canvasSize.width" :height="canvasSize.height" />
  </div>
</template>

<script>
export default {
  props: {
    viewSize: Object,
    bounds: Object
  },

  data () {
    return {
      pxRatio: window.devicePixelRatio
    }
  },

  mounted () {
    this.createContext()
    this.drawUI()
  },

  computed: {
    canvasSize () {
      let { pxRatio } = this
      let { width, height } = this.viewSize

      return {
        width: width * pxRatio,
        height: height * pxRatio
      }
    }
  },

  methods: {
    createContext () {
      let { canvas } = this.$refs
      this.ctx = canvas.getContext('2d')
    },

    drawUI () {
      let { ctx, canvasSize, pxRatio, viewSize, bounds } = this
      let { width, height } = viewSize
      let { top, left, bottom, right } = bounds

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
      ctx.scale(pxRatio, pxRatio)

      ctx.globalAlpha = 0.5

      ctx.beginPath()
      ctx.rect(0, 0, width, height)
      ctx.rect(
        width * left,
        height * top,
        width * (1 - (left + right)),
        height * (1 - (top + bottom)))

      ctx.clip('evenodd')
      ctx.fill()
    }
  },

  watch: {
    'viewSize.width' (val) {
      this.drawUI()
    },

    'viewSize.height' (val) {
      this.drawUI()
    }
  }
}
</script>

<style lang="scss">
.bounds-editor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  &__canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
