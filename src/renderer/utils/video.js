import path from 'path'
import { exec } from 'child_process'
import mkdirp from 'mkdirp'
import log from 'electron-log'

const ffmpeg = '/usr/local/bin/ffmpeg'

export function processVideo (video, output, onData) {
  return createEncoder('video', output, video, onData)
}

function createEncoder (outputTarget, output, video, onData) {
  let encoder = createEncodeStream(outputTarget, output, video)

  let res = new Promise((resolve, reject) => {
    let stream = encoder.run()

    stream.stderr.on('data', (data) => {
      let dataStr = `${data}`
      onData(dataStr)
    })

    stream.stderr.on('end', (code) => {
      resolve(video)
    })
  })

  return {
    kill: () => encoder.kill(),
    then: (fn) => res.then(fn)
  }
}

export function createEncodeStream (outputTarget, output, video) {
  let { meta, size, bounds, seek } = video

  let crop = computeCrop(size, bounds)
  let trim = computeSeekTrim(seek)
  let cropStr = `${crop.width}:${crop.height}:${crop.left}:${crop.top}`
  let scaleStr = `${output.size.width}:${output.size.height}`

  let { flags, format } = output[outputTarget]
  let src = meta.path

  let destBasePath = output.destination.path
    .replace('~', process.env['HOME'])
  let dest = path.resolve(
    destBasePath,
    `./${meta.index}_${meta.name}.${format}`)

  let args = [
    '-vf', `crop=${cropStr},scale=${scaleStr}:flags=neighbor`,
    '-ss', `${trim.start}`,
    '-t', `${trim.duration}`
  ]

  let commandFlags = flags.replace(/\n+/g, ' ')
  let command = `${ffmpeg} ` +
    `-i ${src} ${args.join(' ')} ${commandFlags} ` +
    `-y ${dest}`

  let stream = null
  function run () {
    mkdirp.sync(destBasePath)
    log.info(command)
    stream = exec(command)
    return stream
  }

  function kill () {
    if (stream) stream.kill()
  }

  return {
    run,
    kill
  }
}

export function computeSeekTrim (seek) {
  let { trim } = seek
  let start = trim.start / 1000
  let end = trim.end / 1000
  let duration = end - start

  return {
    start,
    end,
    duration
  }
}

export function computeCrop (size, bounds) {
  return {
    top: Math.round(bounds.top * size.height),
    left: Math.round(bounds.left * size.width),
    width: Math.round(bounds.width * size.width / 2) * 2,
    height: Math.round(bounds.height * size.height / 2) * 2
  }
}
