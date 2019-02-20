<template>
  <div class="video-editor">
    <div v-if="isVideoLoaded" class="video-editor__viewer">
      <video class="video-editor__viewer__element"
        :src="video.element.src" :muted="muted" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    video: Object
  },

  data () {
    return {
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

    videoElementStyle () {
      if (!this.isVideoLoaded) return null
      let { videoWidth, videoHeight } = this.video.element
      return {
        width: `${videoWidth}px`,
        height: `${videoHeight}px`
      }
    }
  }
}
</script>

<style lang="scss">
.video-editor {
  position: relative;

  &__viewer {
    position: absolute;
    width: 100%;
    height: 100%;

    &__element {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }
  }
}
</style>
