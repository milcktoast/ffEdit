<template>
  <div class="main-processor" :style="mainStyle"
    v-on:dragover="handleDragOver"
    v-on:drop="handleDrop">
    <div class="main-processor__tool-bar" />
    <div class="main-processor__status-bar" />
    <video-list class="main-processor__video-list"
      :setActiveVideo="setActiveVideo"
      :activeVideoIndex="activeVideoIndex"
      :videos="videos" />
    <video-editor class="main-processor__video-editor"
      :video="activeVideo" />
  </div>
</template>

<script>
import VideoList from '@/components/VideoList'
import VideoEditor from '@/components/VideoEditor'

export default {
  components: {
    VideoList,
    VideoEditor
  },

  data () {
    return {
      willDropVideos: false,
      activeVideoIndex: -1,
      videos: []
    }
  },

  computed: {
    mainStyle () {
      let { willDropVideos } = this

      return {
        cursor: willDropVideos ? 'copy' : 'default'
      }
    },

    activeVideo () {
      let { activeVideoIndex, videos } = this
      let activeVideo = activeVideoIndex < 0 ? null : videos[activeVideoIndex]
      return activeVideo
    }
  },

  methods: {
    handleDragOver (event) {
      let { find } = Array.prototype
      let { items } = event.dataTransfer
      let willDropVideos = items.length &&
        find.call(items, (item) => item.type.match('video') != null) != null

      event.preventDefault()
      this.willDropVideos = !!willDropVideos
    },

    handleDrop (event) {
      let { map } = Array.prototype
      let { files } = event.dataTransfer

      let nextVideos = map.call(files, (file) => {
        let { name, path, size, type, lastModified } = file

        let element = this.createVideo(path)
        let bounds = {
          top: 0.2,
          left: 0.15,
          right: 0.1,
          bottom: 0.1
        }
        let meta = {
          name, path, size, type, lastModified
        }

        return {
          meta,
          bounds,
          element
        }
      })

      event.preventDefault()
      this.willDropVideos = false
      this.videos.push(...nextVideos)
    },

    createVideo (src) {
      let video = document.createElement('video')
      video.src = `file://${src}`
      return video
    },

    setActiveVideo (video, index) {
      this.activeVideoIndex = index
    }
  }
}
</script>

<style lang="scss">
.main-processor {
  $tool-height: 56px;
  $status-height: 24px;

  position: absolute;
  top: 0;
  left: 0;

  overflow: hidden;
  display: flex;
  width: 100%;
  height: 100%;
  color: #fff;

  &__tool-bar {
    position: absolute;
    top: 0;
    left: 0;
    border-bottom: 1px solid #000;
    background: #3b3b3b;
    width: 100%;
    height: $tool-height;
    -webkit-app-region: drag;
  }

  &__status-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid #000;
    background: #3b3b3b;
    width: 100%;
    height: $status-height;
  }

  &__video-list {
    top: $tool-height;
    border-right: 1px solid #000;
    background: #212121;
    width: 240px;
    height: calc(100% - #{($tool-height + $status-height)});
  }

  &__video-editor {
    top: $tool-height;
    flex: 1;
    background: #181818;
    height: calc(100% - #{($tool-height + $status-height)});
  }
}
</style>
