<template>
  <div class="main-processor" :style="mainStyle"
    v-on:dragover="handleDragOver"
    v-on:drop="handleDrop">
    <div class="main-processor__tool-bar" />
    <processor-status class="main-processor__status-bar"
      :activeVideo="activeVideo"
      :videos="videos"
      :selectedVideos="selectedVideos" />
    <video-list class="main-processor__video-list"
      :selectVideo="selectVideo"
      :selectToVideo="selectToVideo"
      :removeSelectedVideos="removeSelectedVideos"
      :videos="videos" />
    <video-editor class="main-processor__video-editor"
      :video="activeVideo" />
    <video-output class="main-processor__video-output" />
  </div>
</template>

<script>
import VideoList from '@/components/VideoList'
import VideoOutput from '@/components/VideoOutput'
import VideoEditor from '@/components/VideoEditor'
import ProcessorStatus from '@/components/ProcessorStatus'

export default {
  components: {
    VideoList,
    VideoOutput,
    VideoEditor,
    ProcessorStatus
  },

  data () {
    return {
      willDropVideos: false,
      activeVideoIndex: -1,
      videos: []
    }
  },

  created () {
    this.bindAppEvents()
    this.triggerReady()
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
    },

    selectedVideos () {
      let { videos } = this
      return videos.filter((video) => video.state.isSelected)
    }
  },

  methods: {
    bindAppEvents () {
      let { ipcRenderer } = this.$electron
      ipcRenderer.on('serialize-project', this.serialize.bind(this))
      ipcRenderer.on('deserialize-project', this.deserialize.bind(this))
    },

    triggerReady () {
      let { ipcRenderer } = this.$electron
      ipcRenderer.send('main-ready')
    },

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

        let bounds = {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: 1,
          height: 1
        }
        let meta = {
          name, path, size, type, lastModified
        }

        return this.createVideoItem(meta, bounds)
      })

      event.preventDefault()
      this.willDropVideos = false
      this.videos.push(...nextVideos)
    },

    createVideoItem (meta, bounds) {
      let element = this.createVideoElement(meta.path)
      let state = {
        isSelected: false,
        isActive: false
      }

      return {
        meta,
        bounds,
        element,
        state
      }
    },

    createVideoElement (src) {
      let video = document.createElement('video')
      video.src = `file://${src}`
      return video
    },

    selectVideo (index) {
      let { videos } = this

      this.activeVideoIndex = index
      videos.forEach((video, i) => {
        let isActive = i === index
        video.state.isActive = isActive
        video.state.isSelected = isActive
      })
    },

    selectToVideo (index) {
      let { activeVideoIndex, videos } = this
      let start = Math.min(activeVideoIndex, index)
      let end = Math.max(activeVideoIndex, index)

      videos.forEach((video, i) => {
        let isSelected = i >= start && i <= end
        videos[i].state.isSelected = isSelected
      })
    },

    removeSelectedVideos () {
      let { videos } = this

      for (var i = videos.length - 1; i >= 0; i--) {
        let video = videos[i]
        if (video.state.isSelected) {
          videos.splice(i, 1)
        }
      }
      this.activeVideoIndex = -1
    },

    serialize () {
      let { ipcRenderer } = this.$electron
      let videos = this.videos.map((video) => {
        let { meta, bounds } = video
        return {
          meta, bounds
        }
      })
      let data = {
        videos
      }

      ipcRenderer.send('serialize-project--response', data)
    },

    deserialize (event, json) {
      let data = JSON.parse(json)
      let videos = data.videos.map((video) => {
        let { meta, bounds } = video
        return this.createVideoItem(meta, bounds)
      })

      this.videos = videos
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
    border-right: 1px solid rgba(#000, 0.5);
    background: #212121;
    width: 240px;
    height: calc(100% - #{($tool-height + $status-height)});
  }

  &__video-editor {
    top: $tool-height;
    flex: 1;
    background: #111;
    height: calc(100% - #{($tool-height + $status-height)});
  }

  &__video-output {
    top: $tool-height;
    border-left: 1px solid rgba(#000, 0.5);
    background: #212121;
    width: 240px;
    height: calc(100% - #{($tool-height + $status-height)});
  }
}
</style>
