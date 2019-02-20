<template>
  <div class="video-list">
    <ul class="video-list__items">
      <li class="video-list__item"
        v-for="(video, index) in videos"
        v-on:click="selectVideo(video, index)"
        :class="(index === activeVideoIndex ? 'active' : '')"
        :title="video.meta.path">
        {{ video.meta.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    setActiveVideo: Function,
    activeVideoIndex: Number,
    videos: Array
  },

  methods: {
    selectVideo (video, index) {
      this.setActiveVideo(video, index)
    }
  }
}
</script>

<style lang="scss">
.video-list {
  position: relative;

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

    &.active {
      background: rgba(#000, 0.2);
    }
  }
}
</style>
