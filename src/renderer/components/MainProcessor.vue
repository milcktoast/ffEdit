<template>
  <div class="main-processor" :style="mainStyle">
    <div class="main-processor__tool-bar">
      <div v-if="projectFileName" class="main-processor__tool-bar__project-name">
        {{ projectFileName }}
      </div>
    </div>
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
    <div v-if="(processor.isRunning || processor.shouldShowLog)"
      class="main-processor__log">
      <div class="main-processor__log__inner">
        <pre class="main-processor__log__data">
          {{ processor.log }}
        </pre>
      </div>
    </div>
  </div>
</template>

<script>
import { loadVideo } from '@/utils/resource'
import { processVideo, processPoster } from '@/utils/video'

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
      projectFileName: null,
      videos: [],
      output: {
        video: {
          enabled: true,
          format: 'mp4',
          flags: ''
        },
        poster: {
          enabled: true,
          format: 'jpg',
          flags: ''
        },
        destination: {
          path: '~/Documents/Videos/'
        },
        size: {
          width: 1920,
          height: 1080
        }
      },
      processor: {
        isRunning: false,
        shouldCancel: false,
        shouldShowLog: false,
        active: 0,
        complete: 0,
        total: 0,
        log: ''
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
      ipcRenderer.on('message', this.handleMessage.bind(this))
      ipcRenderer.on('serialize-project', this.serialize.bind(this))
      ipcRenderer.on('deserialize-project', this.deserialize.bind(this))
    },

    handleMessage (event, data) {
      switch (data.type) {
        case 'UPDATE_FILE_PATH':
          this.updateFilePath(data)
          break
      }
    },

    triggerReady () {
      let { ipcRenderer } = this.$electron
      ipcRenderer.send('main-ready')
    },

    createVideoItem ({ meta, size, bounds, seek }) {
      let element = this.createVideoElement(meta.path)
      let state = {
        isSelected: false,
        isActive: false,
        shouldEncode: true
      }

      // TODO: Cleanup setting initial seek
      loadVideo(element.src).then(() => {
        let { videoWidth, videoHeight, duration } = element
        let durationMs = Math.floor(duration * 1000)

        size.width = videoWidth
        size.height = videoHeight

        if (!seek.duration) {
          seek.duration = durationMs
          seek.trim.end = durationMs
        }
      })

      return {
        meta,
        size,
        bounds,
        seek,
        element,
        state
      }
    },

    createVideoElement (src) {
      let video = document.createElement('video')
      video.src = `file://${src}`
      return video
    },

    updateFilePath ({ fileName }) {
      this.projectFileName = fileName
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

      let { output } = this
      let videos = this.videos.map((video) => {
        let { meta, size, bounds, seek } = video
        return {
          meta, size, bounds, seek
        }
      })
      let data = {
        output,
        videos
      }

      ipcRenderer.send('serialize-project--response', data)
    },

    deserialize (event, json) {
      let data = JSON.parse(json)
      let { output } = data
      let videos = data.videos.map((video) => {
        let { meta, size, bounds, seek } = video
        return this.createVideoItem({ meta, size, bounds, seek })
      })

      this.output = output
      this.videos = videos
    },

    processVideos () {
      let videos = this.enabledVideos
      let { output, processor } = this
      if (processor.isRunning) return

      let index = 0
      processor.isRunning = true
      processor.shouldCancel = false
      processor.complete = 0
      processor.total = videos.length
      processor.log = ''

      const onData = (data) => {
        processor.log += data + '\n'
      }

      const processMedia = (nextVideo) => {
        processor.active = index + 1

        let videoEncoder = output.video.enabled
          ? processVideo(output, nextVideo, onData)
          : Promise.resolve()
        this._activeEncoder = videoEncoder

        return videoEncoder.then(() => {
          if (processor.shouldCancel) return

          let posterEncoder = output.poster.enabled
            ? processPoster(output, nextVideo, onData)
            : Promise.resolve()
          this._activeEncoder = posterEncoder

          return posterEncoder
        })
      }

      const processUntilDone = () => {
        let nextVideo = videos[index]
        if (!nextVideo || processor.shouldCancel) {
          return Promise.resolve()
        }

        return processMedia(nextVideo)
          .then(() => {
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
  user-select: none;

  &__tool-bar {
    position: absolute;
    top: 0;
    left: 0;
    border-bottom: 1px solid #000;
    background: #3b3b3b;
    width: 100%;
    height: $tool-height;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      -webkit-app-region: drag;
    }

    &__project-name {
      position: absolute;
      top: 6px;
      left: 30%;
      width: 40%;
      color: #ddd;
      text-align: center;
    }
  }

  &__status-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid #000;
    background: #3b3b3b;
    width: 100%;
    height: $status-height;
    -webkit-app-region: drag;
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

  &__log {
    position: absolute;
    z-index: 10;
    top: $tool-height;
    left: 0;
    display: flex;
    justify-content: flex-end;

    background: rgba(#111, 0.4);
    padding: 0;
    width: 100%;
    height: calc(100% - #{($tool-height + $status-height)});
    backdrop-filter: blur(2px);

    &__inner {
      position: relative;
      background: rgba(#111, 0.7);
      padding: 0;
      width: 100%;
      max-width: calc(100% - 240px);
    }

    &__data {
      overflow: auto;
      margin: 0;
      padding: 40px 20px;
      width: 100%;
      height: 100%;

      color: #fff;
      font: 13px/1 'Fira Mono', 'Monaco', monospace;
      white-space: pre-wrap;
    }
  }
}
</style>
