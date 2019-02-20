<template>
  <div class="video-list">
    <ul class="video-list__items">
      <li class="video-list__item"
        v-for="(item, index) in videos"
        v-on:click="selectVideo(item, index)"
        :class="(index === activeVideoIndex ? 'active' : '')">
        {{ item.name }}
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
    selectVideo (item, index) {
      this.setActiveVideo(item, index)
    }
  }
}
</script>

<style lang="scss">
.video-list {
  &__items {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__item {
    padding: 6px 20px;

    &.active {
      background: rgba(#000, 0.2);
    }
  }
}
</style>
