import path from 'path'
import { spawn } from 'child_process'
import mkdirp from 'mkdirp'
import log from 'electron-log'

const LOG_FFMPEG = false
const ffmpeg = '/usr/local/bin/ffmpeg'

export function processVideo (video, output) {
  let encoder = createVideoEncodeStream(video, output)
  let res = new Promise((resolve, reject) => {
    if (LOG_FFMPEG) {
      encoder.stderr.on('data', (data) => {
        log.info(`${data}`)
      })
    }
    encoder.stderr.on('end', () => {
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
  let destBasePath = output.destination.path
    .replace('~', process.env['HOME'])
  let dest = path.resolve(
    destBasePath,
    `./${meta.name}.${output.format}`)

  let args = [
    '-i', src,
    '-vf', `crop=${cropStr},scale=${scaleStr}:flags=neighbor`,
    '-ss', `${trim.start}`,
    '-t', `${trim.duration}`,
    '-y', dest
  ]

  mkdirp.sync(destBasePath)

  return spawn(ffmpeg, args)
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
