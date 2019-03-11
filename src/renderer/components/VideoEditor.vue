<template>
  <div class="video-editor">
    <div ref="viewer" class="video-editor__viewer">
      <div class="video-editor__viewer__inner"
        :style="videoInnerStyle">
        <div v-if="isVideoLoaded">
          <video ref="viewerVideo" class="video-editor__viewer__element"
            :src="video.element.src" :muted="muted" />
          <div v-if="(editMode === 'crop')">
            <bounds-editor class="video-editor__bounds"
              :aspect="videoAspect" :targetAspect="targetAspect"
              :bounds="video.bounds" :displayBounds="videoDisplayBounds" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="isVideoLoaded && (editMode === 'trim')">
      <trim-editor class="video-editor__trim"
        :trim="video.seek.trim" :duration="video.seek.duration" />
    </div>
    <div class="video-editor__actions">
      <button title="Trim"
        :class="(editMode === 'trim' ? 'active' : '')"
        @click="setEditMode('trim')">
        <span class="icon-scissors" />
      </button>
      <button title="Crop"
        :class="(editMode === 'crop' ? 'active' : '')"
        @click="setEditMode('crop')">
        <span class="icon-crop" />
      </button>
    </div>
  </div>
</template>

<script>
import BoundsEditor from '@/components/BoundsEditor'
import TrimEditor from '@/components/TrimEditor'

// FIXME: Compute video bounds without activating bounds editor
export default {
  components: {
    BoundsEditor,
    TrimEditor
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
      editMode: '',
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
    setEditMode (mode) {
      if (this.editMode === mode) {
        this.editMode = ''
      } else {
        this.editMode = mode
      }
    },

    seekVideo (time) {
      let { viewerVideo } = this.$refs
      if (!viewerVideo) return

      let timeSeconds = time / 1000
      viewerVideo.currentTime = timeSeconds
    },

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
  },

  watch: {
    'video.seek.trim.start' () {
      let { start } = this.video.seek.trim
      this.seekVideo(start)
    },

    'video.seek.trim.end' () {
      let { end } = this.video.seek.trim
      this.seekVideo(end)
    }
  }
}
</script>

<style lang="scss">
.video-editor {
  position: relative;

  &__viewer {
    position: absolute;
    top: 6px;
    left: 6px;
    width: calc(100% - 12px);
    height: calc(100% - 12px);

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

  &__trim {
    position: absolute;
    left: 10%;
    bottom: 12px;

    background: rgba(#111, 0.6);
    border-radius: 8px;
    padding: 6px;
    width: 80%;
    height: 36px;
  }

  &__actions {
    position: absolute;
    top: -36px;
    left: 0;
    padding: 6px 20px;
    width: 100%;
    height: 32px;
  }
}
</style>
