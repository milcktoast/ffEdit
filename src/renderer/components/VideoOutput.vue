<template>
  <div class="video-output">
    <h2 class="video-output__title">
      Output
    </h2>
  </div>
</template>

<script>
export default {
  props: {
    output: Object
  }
}
</script>

<style lang="scss">
.video-output {
  position: relative;

  &__title {
    margin: 0;
    padding: 10px 20px;
    font-weight: normal;
  }
}
</style>
