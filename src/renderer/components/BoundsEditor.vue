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
import * as vec2 from 'gl-vec2'

import { clamp } from '@/utils/math'

export default {
  props: {
    aspect: Number,
    targetAspect: Number,
    bounds: Object,
    displayBounds: Object
  },

  data () {
    return {
      pxRatio: window.devicePixelRatio,
      handles: [{
        name: 'center',
        position: [0.5, 0.5],
        axis: null,
        style: ''
      }, {
        name: 'top-left',
        position: [0, 0],
        axis: [1, 1],
        style: ''
      }, {
        name: 'top-right',
        position: [1, 0],
        axis: [1, -1],
        style: ''
      }, {
        name: 'bottom-left',
        position: [0, 1],
        axis: [1, -1],
        style: ''
      }, {
        name: 'bottom-right',
        position: [1, 1],
        axis: [-1, -1],
        style: ''
      }]
    }
  },

  created () {
    this.dragPositions = {}
    this.fitBoundsToAspect()
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

      let offsetX = (move[0] - start[0]) / width
      let offsetY = (move[1] - start[1]) / height

      let offset = [offsetX, offsetY]
      let handlePosition = handle.axis
        ? this.projectHandlePosition(handle, pos, offset)
        : this.translateHandlePosition(handle, pos, offset)

      this.updateBoundsFromHandle(name, handlePosition)
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

    // OPTIM: Cleanup array usage
    projectHandlePosition (handle, origin, offset) {
      let { aspect, targetAspect } = this
      let { axis } = handle

      let axisAspect = axis
      if (targetAspect > aspect) {
        axisAspect = [
          axis[0],
          axis[1] / targetAspect * aspect
        ]
      } else if (targetAspect < aspect) {
        axisAspect = [
          axis[0] * targetAspect / aspect,
          axis[1]
        ]
      }

      let ab = offset
      let acu = vec2.normalize([], axisAspect)

      let pt = acu[0] * ab[0] + acu[1] * ab[1]
      let ap = [acu[0] * pt, acu[1] * pt]
      let out = vec2.add([], origin, ap)

      let ssx = (out[0] > 1 || out[0] < 0)
        ? (clamp(out[0], 0, 1) - origin[0]) / (out[0] - origin[0])
        : 1
      let ssy = (out[1] > 1 || out[1] < 0)
        ? (clamp(out[1], 0, 1) - origin[1]) / (out[1] - origin[1])
        : 1

      let ss = Math.min(ssx, ssy)
      vec2.scaleAndAdd(out, origin, ap, ss)

      return out
    },

    translateHandlePosition (handle, origin, offset) {
      let { width, height } = this.bounds
      let out = vec2.add([], origin, offset)

      let w2 = width / 2
      let h2 = height / 2

      let x0 = out[0] - w2
      let x1 = out[0] + w2
      let y0 = out[1] - h2
      let y1 = out[1] + h2

      if (x0 < 0) out[0] = w2
      if (x1 > 1) out[0] = 1 - w2
      if (y0 < 0) out[1] = h2
      if (y1 > 1) out[1] = 1 - h2

      return out
    },

    fitBoundsToAspect () {
      let { aspect, targetAspect, bounds } = this
      let { top, left, width, height } = bounds
      let boundsAspect = width / height * aspect
      if (Math.abs(boundsAspect - targetAspect) < 0.0001) return

      let targetWidth = width
      let targetHeight = height
      if (targetAspect > boundsAspect) {
        targetWidth = width
        targetHeight = targetWidth / targetAspect * aspect
      } else if (targetAspect < boundsAspect) {
        targetHeight = height
        targetWidth = targetHeight * targetAspect / aspect
      }

      let w2 = targetWidth / 2
      let h2 = targetHeight / 2
      let cx = left + width / 2
      let cy = top + height / 2

      bounds.top = cy - h2
      bounds.bottom = 1 - (cy + h2)
      bounds.left = cx - w2
      bounds.right = 1 - (cx + w2)
      bounds.width = targetWidth
      bounds.height = targetHeight
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
        case 'center':
          position[0] = left + (1 - right - left) / 2
          position[1] = top + (1 - bottom - top) / 2
          break
      }
    },

    updateBoundsFromHandle (handleName, handlePosition) {
      let { bounds } = this

      switch (handleName) {
        case 'top-left':
          bounds.top = handlePosition[1]
          bounds.left = handlePosition[0]
          break
        case 'top-right':
          bounds.top = handlePosition[1]
          bounds.right = 1 - handlePosition[0]
          break
        case 'bottom-left':
          bounds.bottom = 1 - handlePosition[1]
          bounds.left = handlePosition[0]
          break
        case 'bottom-right':
          bounds.bottom = 1 - handlePosition[1]
          bounds.right = 1 - handlePosition[0]
          break
        case 'center':
          let h2 = bounds.height / 2
          let w2 = bounds.width / 2
          bounds.top = handlePosition[1] - h2
          bounds.bottom = 1 - (handlePosition[1] + h2)
          bounds.left = handlePosition[0] - w2
          bounds.right = 1 - (handlePosition[0] + w2)
          break
      }

      bounds.width = 1 - (bounds.left + bounds.right)
      bounds.height = 1 - (bounds.top + bounds.bottom)
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
      ctx.lineWidth = 1
      ctx.fillStyle = '#000'
      ctx.strokeStyle = '#fff'

      // Shaded crop region
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, width, height)
      ctx.rect(
        width * left,
        height * top,
        width * (1 - (left + right)),
        height * (1 - (top + bottom)))
      ctx.clip('evenodd')
      ctx.fill()
      ctx.restore()

      // Crop border
      ctx.beginPath()
      ctx.rect(
        width * left,
        height * top,
        width * (1 - (left + right)),
        height * (1 - (top + bottom)))
      ctx.stroke()

      // Center guides
      ctx.globalAlpha = 0.4
      ctx.translate(
        width * (left + (1 - (left + right)) / 2),
        height * (top + (1 - (top + bottom)) / 2))

      ctx.beginPath()
      ctx.moveTo(0, -10)
      ctx.lineTo(0, 10)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-10, 0)
      ctx.lineTo(10, 0)
      ctx.stroke()

      ctx.restore()
    }
  },

  watch: {
    'aspect' () {
      this.fitBoundsToAspect()
      this.updateUI()
    },

    'targetAspect' () {
      this.fitBoundsToAspect()
      this.updateUI()
    },

    'bounds': {
      deep: true,
      handler () {
        this.fitBoundsToAspect()
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

    &--center {
      width: 60px;
      height: 60px;
      cursor: move;

      &:before { content: none; }
    }

    &--top-left { cursor: nwse-resize; }
    &--top-right { cursor: nesw-resize; }
    &--bottom-left { cursor: nesw-resize; }
    &--bottom-right { cursor: nwse-resize; }
  }
}
</style>
