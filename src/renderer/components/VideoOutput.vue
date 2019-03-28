<template>
  <div class="video-output">
    <h2 class="video-output__title">
      Output
    </h2>
    <div class="video-output__controls">
      <!-- Size -->
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

      <!-- Video -->
      <div class="video-output__format">
        <h3 class="video-output__section-title">
          Video format + flags
        </h3>
        <label>
          <select class="video-output__format__input"
            v-model="output.video.format">
            <option value="mp4">mp4</option>
            <option value="webm">webm</option>
          </select>
          <input type="checkbox" v-model="output.video.enabled" />
        </label>
        <label>
          <textarea class="video-output__flags__input"
            v-model="output.video.flags" />
        </label>
      </div>

      <!-- Poster -->
      <div class="video-output__format">
        <h3 class="video-output__section-title">
          Poster format + flags
        </h3>
        <label>
          <select class="video-output__format__input"
            v-model="output.poster.format">
            <option value="jpg">jpg</option>
            <option value="png">png</option>
          </select>
          <input type="checkbox" v-model="output.poster.enabled" />
        </label>
        <label>
          <textarea class="video-output__flags__input"
            v-model="output.poster.flags" />
        </label>
      </div>

      <!-- Destination -->
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
      </div>
    </div>

    <!-- Actions -->
    <div class="video-output__actions">
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
    },

    toggleLog () {
      let { processor } = this
      processor.shouldShowLog = !processor.shouldShowLog
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
  overflow: auto;

  &__title {
    position: sticky;
    z-index: 1;
    top: 0;
    left: 0;
    margin: 0;
    background: rgba(#212121, 0.8);
    padding: 10px 20px;
    width: 100%;
    font-weight: normal;
    backdrop-filter: blur(2px);
  }

  &__controls {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: 48px 20px 18px;
    width: 100%;
    height: 100%;
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
      max-width: 100%;
      min-width: 100%;
      min-height: 60px;
    }
  }

  &__format {
    margin-bottom: 20px;

    &__input {
      margin: 2px 8px 2px 0;
      width: 70px;
    }
  }

  &__dest {
    &__input {
      margin: 2px 8px 2px 0;
      width: 100%;
    }
  }

  &__actions {
    position: absolute;
    top: -36px;
    left: 0;
    padding: 6px 20px;
    width: 80%;
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
