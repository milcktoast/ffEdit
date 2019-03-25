import path from 'path'
import { exec } from 'child_process'
import mkdirp from 'mkdirp'
import log from 'electron-log'

const ffmpeg = '/usr/local/bin/ffmpeg'

export function processVideo (output, video, onData) {
  return createEncoder('video', output, video, onData)
}

export function processPoster (output, video, onData) {
  return createEncoder('poster', output, video, onData)
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

  let argsUser = flags.replace(/\n+/g, ' ')
    .trim()
    .split(' ')

  let vFiltersUser = spliceArg(argsUser, '-vf')
  let vFilters = [
    `crop=${cropStr},scale=${scaleStr}:flags=neighbor`,
    vFiltersUser
  ].filter(Boolean).join(',')

  let args = [
    '-vf', vFilters,
    '-ss', `${trim.start}`,
    '-t', `${trim.duration}`
  ]

  let command = `${ffmpeg} ` +
    `-i ${src} ${args.join(' ')} ${argsUser.join(' ')} ` +
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

function spliceArg (args, key) {
  let index = args.indexOf(key)
  if (index === -1) return null

  return args.splice(index, 2)[1]
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
