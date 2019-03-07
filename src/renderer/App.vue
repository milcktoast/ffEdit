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

input,
textarea,
select,
button {
  outline: none;
  border: 1px solid rgba(#fff, 0.2);
  border-radius: 2px;
  display: inline-block;
  color: #fff;
}

input,
textarea,
select {
  margin: 4px;
  background: #111;
  padding: 2px 4px;
  font: 13px/1 'Fira Mono', 'Monaco', monospace;
}

button {
  margin: 0;
  background: #444;
  padding: 3px 8px;
  font-size: 14px;
  line-height: 1;

  &.active {
    background: rgba(#fff, 0.8);
    color: #3b3b3b;
  }
}
</style>
