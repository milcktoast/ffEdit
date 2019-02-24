export function createMenuTemplate (app, actions) {
  let template = [
    {
      label: 'File',
      submenu: [
        {
          id: 'create-project',
          label: 'New Project',
          accelerator: 'Cmd+N',
          enabled: false,
          click () {
            actions.createNewProject()
          }
        },
        {
          id: 'open-project',
          label: 'Open...',
          accelerator: 'Cmd+O',
          click () {
            actions.openProject()
          }
        },
        {
          label: 'Save',
          accelerator: 'Cmd+S',
          click () {
            actions.saveProject(true)
          }
        },
        {
          label: 'Save As...',
          accelerator: 'Cmd+Shift+S',
          click () {
            actions.saveProject(false)
          }
        }
      ]
    },

    {
      label: 'Window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    })

    // Window menu
    template[2].submenu = [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ]
  }

  return template
}
