<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'ffmpeg-gui'
  }
</script>

<style lang="scss">
body {
  background: #212121;
  font: 13px/1 'Fira Sans', 'Helvetica', sans-serif;
}

* {
  box-sizing: border-box;
}
</style>
