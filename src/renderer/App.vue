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
  color: #fff;
  font: 13px/1 'Fira Sans', 'Helvetica', sans-serif;
}

* {
  box-sizing: border-box;
}

button {
  border: 1px solid rgba(#fff, 0.2);
  border-radius: 4px;
  background: #676767;
}

input {
  margin: 4px;
  border: 1px solid rgba(#fff, 0.2);
  border-radius: 2px;
  background: #111;
  padding: 2px 4px;
  display: inline-block;
  color: #fff;
  font: 13px/1 'Fira Mono', 'Monaco', monospace;
}

select {
  margin: 4px;
  outline: none;
  border: 1px solid rgba(#fff, 0.2);
  border-radius: 2px;
  background: #111;
  padding: 2px 4px;
  display: inline-block;
  color: #fff;
  font: 13px/1 'Fira Mono', 'Monaco', monospace;
}
</style>
