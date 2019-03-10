import path from 'path'
import { exec } from 'child_process'
import mkdirp from 'mkdirp'
import log from 'electron-log'

const ffmpeg = '/usr/local/bin/ffmpeg'

export function processVideo (video, output, onData) {
  let encoder = createVideoEncodeStream(video, output)
  let res = new Promise((resolve, reject) => {
    encoder.stderr.on('data', (data) => {
      let dataStr = `${data}`
      onData(dataStr)
    })

    encoder.stderr.on('end', (code) => {
      resolve(video)
    })
  })

  return {
    kill: () => encoder.kill(),
    then: (fn) => res.then(fn)
  }
}

export function createVideoEncodeStream (video, output) {
  let { meta, size, bounds, seek } = video

  let crop = computeCrop(size, bounds)
  let trim = computeSeekTrim(seek)
  let cropStr = `${crop.width}:${crop.height}:${crop.left}:${crop.top}`
  let scaleStr = `${output.size.width}:${output.size.height}`

  let src = meta.path
  let flags = output.flags.replace(/\n+/g, ' ')

  let destBasePath = output.destination.path
    .replace('~', process.env['HOME'])
  let dest = path.resolve(
    destBasePath,
    `./${meta.name}.${output.format}`)

  let args = [
    '-vf', `crop=${cropStr},scale=${scaleStr}:flags=neighbor`,
    '-ss', `${trim.start}`,
    '-t', `${trim.duration}`
  ]

  let command = `${ffmpeg} ` +
    `-i ${src} ${args.join(' ')} ${flags} ` +
    `-y ${dest}`

  mkdirp.sync(destBasePath)
  log.info(command)

  return exec(command)
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
