<template>
  <div class="processor-status">
    <div class="processor-status__item">
      {{ selectionDescriptor }}
    </div>
    <div class="processor-status__item">
      {{ activeVideoDescriptor }} {{ sizeDescriptor }}
    </div>
    <div class="processor-status__item" :title="output.destination.path">
      {{ outputDescriptor }}
    </div>
  </div>
</template>

<script>
import { basename as pathBasename } from 'path'
import { computeSeekTrim, computeCrop } from '@/utils/video'

export default {
  props: {
    activeVideo: Object,
    videos: Array,
    enabledVideos: Array,
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

      let { size, bounds, seek } = activeVideo
      let trim = computeSeekTrim(seek)
      let crop = computeCrop(size, bounds)

      let trimDesc = ['start', 'end', 'duration']
        .map((n) => trim[n].toFixed(1))
        .join(', ')
      let cropDesc = ['left', 'top', 'width', 'height']
        .map((n) => Math.abs(crop[n]))
        .join(', ')

      return `[ ${trimDesc} ] [ ${cropDesc} ]`
    },

    sizeDescriptor () {
      let { activeVideo, output } = this
      if (!activeVideo) return null

      let { width, height } = output.size
      let sizeDesc = [width, height].join(' x ')

      return `[ ${sizeDesc} ]`
    },

    outputDescriptor () {
      let { enabledVideos, output } = this
      let { format } = output
      let { path } = output.destination
      let truncatedPath = pathBasename(path)

      return `${enabledVideos.length} videos to .../${truncatedPath}/[name].${format}`
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
