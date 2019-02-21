<template>
  <div class="bounds-editor">
    <canvas ref="canvas" class="bounds-editor__canvas"
      :width="canvasSize.width" :height="canvasSize.height" />
    <div v-for="handle in handles" class="bounds-editor__handle"
      :class="`bounds-editor__handle--${handle.name}`"
      :style="handle.style"
      @mousedown="(event) => handleMouseDown(handle, event)" />
  </div>
</template>

<script>
function clamp (x, min, max) {
  return Math.max(Math.min(x, max), min)
}

export default {
  props: {
    bounds: Object,
    displayBounds: Object
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

  created () {
    this.dragPositions = {}
  },

  mounted () {
    this.createContext()
    this.updateUI()
  },

  computed: {
    canvasSize () {
      let { pxRatio } = this
      let { width, height } = this.displayBounds

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

    handleMouseDown (handle, event) {
      let { clientX, clientY } = event
      let { name } = handle

      let dragPosition = this.dragPositions[name]
      if (!dragPosition) {
        dragPosition = this.dragPositions[name] = {
          pos: [0, 0],
          start: [0, 0],
          move: [0, 0],
          end: [0, 0]
        }
      }

      let { start, pos } = dragPosition
      pos[0] = handle.position[0]
      pos[1] = handle.position[1]
      start[0] = clientX
      start[1] = clientY

      event.preventDefault()
      dragPosition._boundMove = this.handleMouseMove.bind(null, handle)
      dragPosition._boundUp = this.handleMouseUp.bind(null, handle)
      document.addEventListener('mousemove', dragPosition._boundMove, { passive: false })
      document.addEventListener('mouseup', dragPosition._boundUp, { passive: false })
    },

    handleMouseMove (handle, event) {
      let { clientX, clientY } = event
      let { name } = handle
      let { width, height } = this.displayBounds

      let dragPosition = this.dragPositions[name]
      let { start, move, pos } = dragPosition

      move[0] = clientX
      move[1] = clientY

      let handleX = clamp(pos[0] + (move[0] - start[0]) / width, 0, 1)
      let handleY = clamp(pos[1] + (move[1] - start[1]) / height, 0, 1)

      this.updateBoundsFromHandle(handle, handleX, handleY)
      event.preventDefault()
    },

    handleMouseUp (handle, event) {
      let { clientX, clientY } = event
      let { name } = handle
      let dragPosition = this.dragPositions[name]

      dragPosition.end[0] = clientX
      dragPosition.end[1] = clientY

      event.preventDefault()
      document.removeEventListener('mousemove', dragPosition._boundMove, { passive: false })
      document.removeEventListener('mouseup', dragPosition._boundUp, { passive: false })
    },

    computeHandleStyle (handle) {
      let { position } = handle
      return {
        top: `${position[1] * 100}%`,
        left: `${position[0] * 100}%`
      }
    },

    updateUI () {
      requestAnimationFrame(() => {
        this.updateHandles()
        this.drawUI()
      })
    },

    updateHandles () {
      let { handles, bounds } = this

      handles.forEach((handle) => {
        this.updateHandlePosition(handle, bounds)
        handle.style = this.computeHandleStyle(handle, bounds)
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

    updateBoundsFromHandle (handle, handleX, handleY) {
      let { name } = handle
      let { bounds } = this

      switch (name) {
        case 'top-left':
          bounds.top = handleY
          bounds.left = handleX
          break
        case 'top-right':
          bounds.top = handleY
          bounds.right = 1 - handleX
          break
        case 'bottom-left':
          bounds.bottom = 1 - handleY
          bounds.left = handleX
          break
        case 'bottom-right':
          bounds.bottom = 1 - handleY
          bounds.right = 1 - handleX
          break
      }
    },

    drawUI () {
      let { ctx, canvasSize, pxRatio, displayBounds, bounds } = this
      let { width, height } = displayBounds
      let { top, left, bottom, right } = bounds

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)

      ctx.save()
      ctx.scale(pxRatio, pxRatio)

      ctx.globalAlpha = 0.7

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
      ctx.restore()
    }
  },

  watch: {
    'bounds': {
      deep: true,
      handler () {
        this.updateUI()
      }
    },

    'displayBounds': {
      deep: true,
      handler () {
        this.updateUI()
      }
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
