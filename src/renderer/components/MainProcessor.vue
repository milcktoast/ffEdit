<template>
  <div class="main-processor" :style="mainStyle">
    <div class="main-processor__tool-bar" />
    <processor-status class="main-processor__status-bar"
      :activeVideo="activeVideo"
      :videos="videos"
      :selectedVideos="selectedVideos"
      :enabledVideos="enabledVideos"
      :output="output" />
    <video-list class="main-processor__video-list"
      :selectVideo="selectVideo"
      :selectToVideo="selectToVideo"
      :removeSelectedVideos="removeSelectedVideos"
      :createVideoItem="createVideoItem"
      :videos="videos" />
    <video-editor class="main-processor__video-editor"
      :targetAspect="outputAspect"
      :video="activeVideo" />
    <video-output class="main-processor__video-output"
      :processVideos="processVideos"
      :processVideosCancel="processVideosCancel"
      :processor="processor"
      :output="output" />
  </div>
</template>

<script>
import { loadVideo } from '@/utils/resource'
import { processVideo } from '@/utils/video'

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
      videos: [],
      output: {
        format: 'mp4',
        destination: {
          path: '~/Downloads/'
        },
        size: {
          width: 512,
          height: 512
        }
      },
      processor: {
        isRunning: false,
        shouldCancel: false,
        active: 0,
        complete: 0,
        total: 0
      }
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
    },

    enabledVideos () {
      let { videos } = this
      return videos.filter((video) => video.state.shouldEncode)
    },

    outputAspect () {
      let { width, height } = this.output.size
      return width / height
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

    createVideoItem (meta, bounds) {
      let element = this.createVideoElement(meta.path)
      let size = {
        width: 0,
        height: 0
      }
      let state = {
        isSelected: false,
        isActive: false,
        shouldEncode: true
      }

      loadVideo(element.src).then(() => {
        size.width = element.videoWidth
        size.height = element.videoHeight
      })

      return {
        meta,
        size,
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
    },

    processVideos () {
      let videos = this.enabledVideos
      let { output, processor } = this
      if (processor.isRunning) return

      processor.isRunning = true
      processor.shouldCancel = false
      processor.complete = 0
      processor.total = videos.length

      let index = 0
      const processUntilDone = () => {
        let nextVideo = videos[index]
        if (!nextVideo || processor.shouldCancel) {
          return Promise.resolve()
        }

        processor.active = index + 1
        let activeEncoder = this._activeEncoder = processVideo(nextVideo, output)
        return activeEncoder.then(() => {
          index++
          processor.complete++
          return processUntilDone()
        })
      }

      return processUntilDone().then(() => {
        this._activeEncoder = null
        processor.isRunning = false
      })
    },

    processVideosCancel () {
      let { processor } = this

      processor.isRunning = false
      processor.shouldCancel = true
      this._activeEncoder.kill()
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
