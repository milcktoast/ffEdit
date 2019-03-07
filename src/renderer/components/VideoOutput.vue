<template>
  <div class="video-output">
    <h2 class="video-output__title">
      Output
    </h2>
    <div class="video-output__controls">
      <div class="video-output__size">
        <h3 class="video-output__section-title">
          Size
        </h3>
        <label class="video-output__size__label">
          <input class="video-output__size__input"
            type="number" step="1"
            v-model="size.width" />
          width
        </label>
        <label class="video-output__size__label">
          <input class="video-output__size__input"
            type="number" step="1"
            v-model="size.height" />
          height
        </label>
      </div>
      <div class="video-output__flags">
        <h3 class="video-output__section-title">
          Flags
        </h3>
        <label>
          <textarea class="video-output__flags__input"
            v-model="output.flags" />
        </label>
      </div>
      <div class="video-output__dest">
        <h3 class="video-output__section-title">
          Destination
        </h3>
        <label>
          <!-- TODO: Select destination directory with dialog -->
          <input class="video-output__dest__input"
            type="text"
            v-model="output.destination.path" />
        </label>
        <label>
          <select class="video-output__format__input"
            v-model="output.format">
            <option value="mp4">mp4</option>
            <option value="webm">webm</option>
          </select>
          format
        </label>
      </div>
    </div>
    <div class="video-output__actions">
      <button v-if="!processor.isRunning" @click="processVideos">
        Encode
      </button>
      <button v-if="processor.isRunning" @click="processVideosCancel">
        Cancel
      </button>
    </div>
    <div v-if="processor.isRunning" class="video-output__status">
      <div class="video-output__status__progress">
        {{ processor.active }} of {{ processor.total }}
      </div>
      <div class="video-output__status__spinner" />
    </div>
  </div>
</template>

<script>
import debounce from 'debounce'

export default {
  props: {
    processVideos: Function,
    processVideosCancel: Function,
    processor: Object,
    output: Object
  },

  data () {
    return {
      size: {
        width: 512,
        height: 512
      }
    }
  },

  created () {
    this.pushSize = debounce(this.pushSize.bind(this), 500)
    this.syncSize()
  },

  methods: {
    syncSize () {
      let { size, output } = this
      let { width, height } = output.size
      if (!width || !height) return

      size.width = parseInt(width, 10)
      size.height = parseInt(height, 10)
    },

    pushSize () {
      let { size, output } = this
      let { width, height } = size
      if (!width || !height) return

      output.size.width = parseInt(width, 10)
      output.size.height = parseInt(height, 10)
    }
  },

  watch: {
    'output.size': {
      deep: false,
      handler () {
        this.syncSize()
      }
    },

    'size': {
      deep: true,
      handler () {
        this.pushSize()
      }
    }
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

  &__controls {
    margin: 0;
    padding: 8px 20px;
  }

  &__section-title {
    margin: 0 0 8px;
    padding: 0;
    font-weight: normal;
  }

  &__size {
    margin-bottom: 20px;

    &__input {
      margin: 2px 8px 2px 0;
      width: 70px;
    }
  }

  &__flags {
    margin-bottom: 20px;

    &__input {
      margin: 2px 8px 2px 0;
      width: 100%;
      min-height: 60px;
    }
  }

  &__dest {
    &__input {
      margin: 2px 8px 2px 0;
      width: 100%;
    }
  }

  &__format {
    &__input {
      margin: 2px 8px 2px 0;
      width: 70px;
    }
  }

  &__actions {
    position: absolute;
    top: -36px;
    left: 0;
    padding: 6px 20px;
    width: 50%;
    height: 32px;
  }

  &__status {
    position: absolute;
    top: -36px;
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
