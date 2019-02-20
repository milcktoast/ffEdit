<template>
  <div class="video-editor">
    <div v-if="video != null">
      {{ video.name }} – {{ video.path }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    video: Object
  }
}
</script>

<style lang="scss">
</style>
