let cache = {}

export function getImage (src) {
  if (cache[src]) return cache[src]

  let image = document.createElement('img')
  image.src = src

  cache[src] = image
  return image
}

export function getVideo (src) {
  if (cache[src]) return cache[src]

  let video = document.createElement('video')
  video.setAttribute('playsinline', 'playsinline')
  video.setAttribute('muted', 'muted')
  video.setAttribute('loop', 'loop')
  video.src = src

  cache[src] = video
  return video
}

export function loadImage (src) {
  return new Promise((resolve) => {
    let image = getImage(src)

    if (image.naturalWidth > 0) {
      didLoad()
    } else {
      image.addEventListener('load', didLoad, { once: true })
    }

    function didLoad () {
      resolve({
        resource: image
      })
    }
  })
}

export function loadVideo (src) {
  return new Promise((resolve) => {
    let video = getVideo(src)

    if (video.readyState > 3) {
      didLoad()
    } else {
      video.addEventListener('canplaythrough', didLoad, { once: true })
    }

    function didLoad () {
      setTimeout(() => {
        resolve({
          resource: video
        })
      }, 100)
    }
  })
}
