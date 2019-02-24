<template>
  <div class="processor-status">
    <div class="processor-status__item">
      {{ selectionDescriptor }}
    </div>
    <div class="processor-status__item">
      {{ activeVideoDescriptor }}
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
    selectedVideos: Array
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

    outputDescriptor () {
      return null
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
}
</style>
