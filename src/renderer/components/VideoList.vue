<template>
  <div class="video-list"
    v-on:dragover="handleDragOver"
    v-on:drop="handleDrop">
    <h2 class="video-list__title">
      Input
    </h2>
    <ul class="video-list__items">
      <li class="video-list__item"
        v-for="(video, index) in videos"
        :class="`${(video.state.isActive ? 'active' : '')}
          ${(video.state.isSelected ? 'selected' : '')}`"
        :title="video.meta.path">
        <div class="video-list__item__name"
          @click="(event) => clickVideoItem(video, index, event)">
          {{ video.meta.name }}
        </div>
        <label class="video-list__item__encode-toggle">
          <input type="checkbox" v-model="video.state.shouldEncode" />
        </label>
      </li>
    </ul>
    <div class="video-list__actions">
      <button @click="removeSelectedVideos"
        title="Remove selected videos">
        –
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    selectVideo: Function,
    selectToVideo: Function,
    activeVideoIndex: Number,
    removeSelectedVideos: Function,
    createVideoItem: Function,
    videos: Array
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
        let { path, size, type, lastModified } = file
        let [name, format] = file.name.split('.')

        let bounds = {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: 1,
          height: 1
        }
        let seek = {
          duration: 0,
          trim: {
            start: 0,
            end: 0
          }
        }
        let meta = {
          name, format, path, size, type, lastModified
        }

        return this.createVideoItem(meta, bounds, seek)
      })

      event.preventDefault()
      this.willDropVideos = false
      this.videos.push(...nextVideos)
    },

    clickVideoItem (video, index, event) {
      event.preventDefault()
      if (event.shiftKey) {
        this.selectToVideo(index)
      } else {
        this.selectVideo(index)
      }
    }
  }
}
</script>

<style lang="scss">
.video-list {
  position: relative;

  &__title {
    margin: 0;
    padding: 10px 20px;
    font-weight: normal;
  }

  &__items {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__item {
    position: relative;
    overflow: hidden;
    padding: 6px 20px;
    width: 100%;
    text-overflow: ellipsis;
    cursor: default;
    user-select: none;

    &.selected {
      background: rgba(#000, 0.2);
    }

    &.active {
      background: rgba(#000, 0.4);
    }

    &__name {
    }

    &__encode-toggle {
      position: absolute;
      top: 0;
      right: 4px;

      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 100%;

      > input {
        border: none;
      }
    }
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
