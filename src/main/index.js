'use strict'

import {
  app,
  dialog,
  ipcMain,
  BrowserWindow,
  Menu
} from 'electron'
import Store from 'electron-store'
import windowStateKeeper from 'electron-window-state'

import {
  readFile,
  writeFile
} from 'fs-extra'
import {
  basename
} from 'path'

import { createMenuTemplate } from './ui/menu'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const appWindows = {}
const appMenus = {}
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const store = new Store()

function createMainWindow () {
  if (appWindows.main != null) return

  let mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 600
  })

  let main = appWindows.main = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    backgroundColor: '#111',
    minWidth: 900,
    minHeight: 400,
    titleBarStyle: 'hidden',
    useContentSize: true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      experimentalFeatures: true
    }
  })

  mainWindowState.manage(main)
  main.loadURL(winURL)
  // setMenuState('create-project', 'enabled', false)

  main.on('closed', () => {
    appWindows.main = null
    setMenuState('create-project', 'enabled', true)
  })
}

function createAppActions () {
  let fileTypeFilters = [{
    name: 'ffEdit Project',
    extensions: ['ffedit']
  }]

  return {
    createNewProject () {
      store.set('openProjectPath', null)
      createMainWindow()
    },

    openProject () {
      dialog.showOpenDialog(null, {
        openDirectory: false,
        multiSelections: false,
        filters: fileTypeFilters
      }, (fileNames) => {
        if (!(fileNames && fileNames.length)) return
        const fileName = fileNames[0]
        store.set('openProjectPath', fileName)
        openProjectFile(fileName)
      })
    },

    saveProject (useOpenScene) {
      let openProjectPath = store.get('openProjectPath')
      if (useOpenScene && openProjectPath) {
        saveProjectFile(openProjectPath)
        return
      }
      dialog.showSaveDialog(null, {
        filters: fileTypeFilters
      }, (fileName) => {
        if (!fileName) return
        store.set('openProjectPath', fileName)
        saveProjectFile(fileName)
      })
    }
  }
}

function createMainMenu () {
  if (appMenus.main != null) return

  let actions = createAppActions()
  let template = createMenuTemplate(app, actions)
  let menu = appMenus.main = Menu.buildFromTemplate(template)

  Menu.setApplicationMenu(menu)
}

function setMenuState (name, key, value) {
  let item = appMenus.main.getMenuItemById(name)
  if (!item) {
    throw new Error(`Menu item ${name} does not exist`)
  }
  item[key] = value
}

function openProjectFile (path) {
  createMainWindow()
  readFile(path, { encoding: 'utf8' })
    .then((data) => {
      setWindowFilePath('main', path)
      sendWindowMessage('main', 'deserialize-project', data)
    })
    .catch((err) => {
      console.error(err)
    })
}

function saveProjectFile (path) {
  requestWindowResponse('main', 'serialize-project', null)
    .then((data) => JSON.stringify(data))
    .then((buf) => writeFile(path, buf))
    .then(() => {
      setWindowFilePath('main', path)
      console.log(`Saved project to ${path}.`)
    })
    .catch((err) => {
      console.error(err)
    })
}

function sendWindowMessage (name, messageKey, messageData) {
  let win = appWindows[name]
  if (!win) return
  win.send(messageKey, messageData)
  return win
}

function requestWindowResponse (name, messageKey, messageData) {
  let win = sendWindowMessage(name, messageKey, messageData)
  if (!win) {
    return Promise.reject(
      new Error(`window ${name} does not exist`))
  }
  return new Promise((resolve, reject) => {
    ipcMain.once(`${messageKey}--response`, (event, data) => {
      resolve(data)
    })
  })
}

function setWindowFilePath (name, fullPath) {
  let win = appWindows[name]
  if (!win) return
  let fileName = basename(fullPath)
  sendWindowMessage('main', 'message', {
    type: 'UPDATE_FILE_PATH',
    fullPath,
    fileName
  })
  win.setTitle(fileName)
  win.setRepresentedFilename(fullPath)
}

createMainMenu()
app.on('ready', createMainWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (appWindows.main === null) {
    createMainMenu()
    createMainWindow()
  }
})

ipcMain.on('main-ready', () => {
  let openProjectPath = store.get('openProjectPath')
  if (!openProjectPath) return
  openProjectFile(openProjectPath)
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
