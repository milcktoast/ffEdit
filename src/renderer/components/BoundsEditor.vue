<template>
  <div class="bounds-editor">
    <canvas ref="canvas" class="bounds-editor__canvas"
      :width="canvasSize.width" :height="canvasSize.height" />
    <div v-for="handle in handles" class="bounds-editor__handle"
      :class="`bounds-editor__handle--${handle.name}`"
      :style="handle.style" />
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
      pxRatio: window.devicePixelRatio,
      handles: [{
        name: 'top-left',
        position: [0, 0],
        style: ''
      }, {
        name: 'top-right',
        position: [1, 0],
        style: ''
      }, {
        name: 'bottom-left',
        position: [0, 1],
        style: ''
      }, {
        name: 'bottom-right',
        position: [1, 1],
        style: ''
      }]
    }
  },

  mounted () {
    this.createContext()
    this.updateUI()
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

    computeHandleStyle (handle) {
      let { position } = handle
      return {
        top: `${position[1] * 100}%`,
        left: `${position[0] * 100}%`
      }
    },

    updateUI () {
      this.updateHandles()
      this.drawUI()
    },

    updateHandles () {
      let { handles, bounds } = this

      handles.forEach((handle) => {
        this.updateHandlePosition(handle, bounds)
        handle.style = this.computeHandleStyle(handle)
      })
    },

    updateHandlePosition (handle, bounds) {
      let { name, position } = handle
      let { top, left, bottom, right } = bounds

      switch (name) {
        case 'top-left':
          position[0] = left
          position[1] = top
          break
        case 'top-right':
          position[0] = 1 - right
          position[1] = top
          break
        case 'bottom-left':
          position[0] = left
          position[1] = 1 - bottom
          break
        case 'bottom-right':
          position[0] = 1 - right
          position[1] = 1 - bottom
          break
      }
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

      ctx.lineWidth = 1
      ctx.strokeStyle = '#fff'

      ctx.beginPath()
      ctx.rect(
        width * left,
        height * top,
        width * (1 - (left + right)),
        height * (1 - (top + bottom)))
      ctx.stroke()
    }
  },

  watch: {
    'viewSize.width' (val) {
      this.updateUI()
    },

    'viewSize.height' (val) {
      this.updateUI()
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

  &__handle {
    position: absolute;
    width: 20px;
    height: 20px;
    transform: translate(-50%, -50%);

    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;

      box-sizing: border-box;
      border: 1px solid #fff;
      background: rgba(#fff, 0.1);
      width: 8px;
      height: 8px;
      transform: translate(-50%, -50%);
    }

    &--top-left { cursor: nwse-resize; }
    &--top-right { cursor: nesw-resize; }
    &--bottom-left { cursor: nesw-resize; }
    &--bottom-right { cursor: nwse-resize; }
  }
}
</style>
