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
  </div>
</template>

<script>
import debounce from 'debounce'

export default {
  props: {
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
    this.updateSize = debounce(this.updateSize.bind(this), 500)
    Object.assign(this.size, this.output.size)
  },

  methods: {
    updateSize () {
      let { size, output } = this
      let { width, height } = size
      if (!width || !height) return

      Object.assign(output.size, size)
    }
  },

  watch: {
    'size': {
      deep: true,
      handler () {
        this.updateSize()
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

    &__label {
      display: block;
    }

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

  &__format {
    &__input {
      margin: 2px 8px 2px 0;
      width: 70px;
    }
  }
}
</style>
