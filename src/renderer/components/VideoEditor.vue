<template>
  <div class="video-editor">
    <div ref="viewer" class="video-editor__viewer">
      <div class="video-editor__viewer__inner"
        :style="videoInnerStyle">
        <div v-if="isVideoLoaded">
          <video class="video-editor__viewer__element"
            :src="video.element.src" :muted="muted" />
          <bounds-editor
            :aspect="videoAspect" :targetAspect="targetAspect"
            :bounds="video.bounds" :displayBounds="videoDisplayBounds" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BoundsEditor from '@/components/BoundsEditor'

export default {
  components: {
    BoundsEditor
  },

  props: {
    targetAspect: Number,
    video: Object
  },

  mounted () {
    this.updateViewerSize()
    window.addEventListener('resize', this.handleResize.bind(this))
  },

  data () {
    return {
      viewerSize: {
        width: 0,
        height: 0
      },
      muted: true
    }
  },

  computed: {
    isVideoLoaded () {
      return this.video && this.video.element && this.video.element.videoWidth > 0
    },

    videoAspect () {
      if (!this.isVideoLoaded) return 0
      let { videoWidth, videoHeight } = this.video.element
      return videoWidth / videoHeight
    },

    videoDisplayBounds () {
      if (!this.isVideoLoaded) return
      let { viewerSize } = this
      let { videoWidth, videoHeight } = this.video.element

      let viewerAspect = viewerSize.width / viewerSize.height
      let videoAspect = videoWidth / videoHeight

      let displayTop = 0
      let displayLeft = 0
      let displayWidth, displayHeight
      if (viewerAspect > videoAspect) {
        displayHeight = viewerSize.height
        displayWidth = Math.round(displayHeight * videoAspect)
        displayLeft = Math.round((viewerSize.width - displayWidth) / 2)
      } else {
        displayWidth = viewerSize.width
        displayHeight = Math.round(displayWidth / videoAspect)
        displayTop = Math.round((viewerSize.height - displayHeight) / 2)
      }

      return {
        top: displayTop,
        left: displayLeft,
        width: displayWidth,
        height: displayHeight
      }
    },

    videoInnerStyle () {
      if (!this.isVideoLoaded) return null
      let { top, left, width, height } = this.videoDisplayBounds

      return {
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`
      }
    }
  },

  methods: {
    handleResize (event) {
      this.updateViewerSize()
    },

    updateViewerSize () {
      let { viewer } = this.$refs
      if (!viewer) return
      let { viewerSize } = this
      let { width, height } = viewer.getBoundingClientRect()

      viewerSize.width = width
      viewerSize.height = height
    }
  }
}
</script>

<style lang="scss">
.video-editor {
  position: relative;

  &__viewer {
    position: absolute;
    top: 8px;
    left: 8px;
    width: calc(100% - 16px);
    height: calc(100% - 16px);

    &__inner {
      position: relative;
    }

    &__element {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
