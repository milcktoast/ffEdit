<template>
  <div class="video-list">
    <h2 class="video-list__title">
      Input
    </h2>
    <ul class="video-list__items">
      <li class="video-list__item"
        v-for="(video, index) in videos"
        :class="`${(video.state.isActive ? 'active' : '')}
          ${(video.state.isSelected ? 'selected' : '')}`"
        :title="video.meta.path"
        @click="(event) => clickVideoItem(video, index, event)">
        {{ video.meta.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    selectVideo: Function,
    selectToVideo: Function,
    activeVideoIndex: Number,
    videos: Array
  },

  methods: {
    clickVideoItem (video, index, event) {
      if (event.shiftKey) {
        this.selectToVideo(index)
      } else {
        this.selectVideo(index)
      }
      event.preventDefault()
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
  }
}
</style>
