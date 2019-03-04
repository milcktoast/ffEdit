import path from 'path'
import { spawn } from 'child_process'

const ffmpeg = '/usr/local/bin/ffmpeg'

export function processVideo (video, output) {
  let encoder = createVideoEncodeStream(video, output)
  let res = new Promise((resolve, reject) => {
    encoder.stderr.pipe(process.stdout)
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
  let { meta, size, bounds } = video

  let crop = computeCrop(size, bounds)
  let cropStr = `${crop.width}:${crop.height}:${crop.top}:${crop.left}`
  let scaleStr = `${output.size.width}:${output.size.height}`

  let src = meta.path
  let destBasePath = output.destination.path
    .replace('~', process.env['HOME'])
  let dest = path.resolve(
    destBasePath,
    `${meta.name}.${output.format}`)

  let args = [
    '-i', src,
    '-vf', `crop=${cropStr},scale=${scaleStr}:flags=neighbor`,
    '-y', dest
  ]

  return spawn(ffmpeg, args, { cwd: __dirname })
}

export function computeCrop (size, bounds) {
  return {
    top: Math.round(bounds.top * size.height),
    left: Math.round(bounds.left * size.width),
    width: Math.round(bounds.width * size.width / 2) * 2,
    height: Math.round(bounds.height * size.height / 2) * 2
  }
}
