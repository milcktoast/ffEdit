<template>
  <div class="main-processor" :style="mainStyle"
    v-on:dragover="handleDragOver"
    v-on:drop="handleDrop">
    <div class="main-processor__tool-bar" />
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
        let meta = {
          name, path, size, type, lastModified
        }

        return {
          meta,
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
    width: 100%;
    height: 40px;
    -webkit-app-region: drag;
  }

  &__video-list {
    background: #212121;
    padding-top: 40px;
    width: 20%;
    height: 100%;
  }

  &__video-editor {
    flex: 1;
    background: #181818;
    height: 100%;
  }
}
</style>
