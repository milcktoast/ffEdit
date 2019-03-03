<template>
  <div class="processor-status">
    <div class="processor-status__item">
      {{ selectionDescriptor }}
    </div>
    <div class="processor-status__item">
      {{ activeVideoDescriptor }} <span>•</span> {{ sizeDescriptor }}
    </div>
    <div class="processor-status__item">
      {{ outputDescriptor }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    activeVideo: Object,
    videos: Array,
    selectedVideos: Array,
    output: Object
  },

  computed: {
    selectionDescriptor () {
      let { videos, selectedVideos } = this
      return `${selectedVideos.length} of ${videos.length} selected`
    },

    activeVideoDescriptor () {
      let { activeVideo } = this
      if (!activeVideo) return null

      let { bounds } = activeVideo
      let boundsDesc = ['left', 'top', 'width', 'height']
        .map((n) => Math.abs(bounds[n]).toFixed(2))
        .join(', ')

      return `[ ${boundsDesc} ]`
    },

    sizeDescriptor () {
      let { activeVideo, output } = this
      if (!activeVideo) return null

      let { width, height } = output.size
      let sizeDesc = [width, height].join(' x ')

      return `[ ${sizeDesc} ]`
    },

    outputDescriptor () {
      let { videos, output } = this
      let { format } = output
      let { path } = output.destination

      return `${videos.length} videos to ${path}[name].${format}`
    }
  }
}
</script>

<style lang="scss">
.processor-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 20px;

  &__item {
    padding: 0 8px;

    > span {
      padding: 0 4px;
    }
  }
}
</style>
