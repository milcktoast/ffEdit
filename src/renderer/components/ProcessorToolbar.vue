<template>
  <div class="processor-toolbar">
    <div v-if="projectFileName" class="processor-toolbar__project-name">
      {{ projectFileName }}
    </div>

    <div class="processor-toolbar__actions">
      <div class="processor-toolbar__input">
        <button title="Remove selected videos"
          @click="removeSelectedVideos">
          <span class="icon-minus" />
        </button>
      </div>

      <div class="processor-toolbar__tools">
        <button title="Trim"
          :class="(editMode === 'trim' ? 'active' : '')"
          @click="setEditMode('trim')">
          <span class="icon-scissors" />
        </button>
        <button title="Crop"
          :class="(editMode === 'crop' ? 'active' : '')"
          @click="setEditMode('crop')">
          <span class="icon-crop" />
        </button>
      </div>

      <div class="processor-toolbar__output">
        <button v-if="!processor.isRunning" title="Encode"
          @click="processVideos">
          <span class="icon-play" />
        </button>
        <button v-if="processor.isRunning" title="Stop"
          @click="processVideosCancel">
          <span class="icon-stop" />
        </button>
        <button title="Log"
          :class="((processor.isRunning || processor.shouldShowLog) ? 'active' : '')"
          @click="toggleLog">
          <span class="icon-file-text" />
        </button>
        <div v-if="processor.isRunning" class="processor-toolbar__status">
          <div class="processor-toolbar__status__progress">
            {{ processor.active }} of {{ processor.total }}
          </div>
          <div class="processor-toolbar__status__spinner" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    removeSelectedVideos: Function,
    setEditMode: Function,
    processVideos: Function,
    processVideosCancel: Function,
    projectFileName: String,
    editMode: String,
    processor: Object,
    output: Object
  },

  methods: {
    toggleLog () {
      let { processor } = this
      processor.shouldShowLog = !processor.shouldShowLog
    }
  }
}
</script>

<style lang="scss">
.processor-toolbar {
  &__project-name {
    position: absolute;
    top: 6px;
    left: 30%;
    width: 40%;
    color: #ddd;
    text-align: center;
  }

  &__actions {
    position: absolute;
    left: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  &__input {
    padding: 6px 20px;
    width: 240px;

    [class^="icon-"], [class*=" icon-"] {
      font-size: 10px;
    }
  }

  &__tools {
    padding: 6px 20px;
    flex: 1;
  }

  &__output {
    padding: 6px 20px;
    width: 240px;
  }

  &__status {
    position: absolute;
    top: 0;
    right: 0;

    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 6px 20px;
    width: 50%;
    height: 32px;

    &__progress {
      white-space: nowrap;
    }

    &__spinner {
      position: relative;
      margin: 0 0 0 8px;
      width: 6px;
      height: 100%;

      &:before {
        content: '';
        position: absolute;
        top: 50%;
        right: 0;

        margin: -2px 0 0 -2px;
        background: #fff;
        border-radius: 2px;
        width: 4px;
        height: 4px;

        animation: 500ms ease-in-out 0s infinite alternate progress;
      }
    }
  }

  label {
    display: block;
  }

  @keyframes progress {
    0%   { top: 30%; }
    50%  { top: 70%; }
    100% { top: 30%; }
  }

}
</style>
