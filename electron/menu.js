import { app, Menu, shell } from 'electron';

const isMac = process.platform === 'darwin';

const buildMenuTemplate = (currentPage = 'timeline') => [
    // { role: 'appMenu' }
    ...(isMac
        ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' },
            ],
        }]
        : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
            {
                label: 'New Project',
                accelerator: 'CmdOrCtrl+N',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-new-project');
                    }
                },
            },
            {
                label: 'Open Project...',
                accelerator: 'CmdOrCtrl+O',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-open-project');
                    }
                },
            },
            {
                label: 'Save Project',
                accelerator: 'CmdOrCtrl+S',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-save-project');
                    }
                },
            },
            { type: 'separator' },
            isMac ? { role: 'close' } : { role: 'quit' },
        ],
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-edit-cut');
                    }
                },
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-edit-copy');
                    }
                },
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-edit-paste');
                    }
                },
            },
            ...(isMac
                ? [
                    { role: 'pasteAndMatchStyle' },
                    {
                        label: 'Delete',
                        accelerator: 'Backspace',
                        click: (menuItem, browserWindow) => {
                            if (browserWindow) {
                                browserWindow.webContents.send('menu-edit-delete');
                            }
                        },
                    },
                    {
                        label: 'Select All',
                        accelerator: 'CmdOrCtrl+A',
                        click: (menuItem, browserWindow) => {
                            if (browserWindow) {
                                browserWindow.webContents.send('menu-edit-select-all');
                            }
                        },
                    },
                    { type: 'separator' },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startSpeaking' },
                            { role: 'stopSpeaking' },
                        ],
                    },
                ]
                : [
                    {
                        label: 'Delete',
                        accelerator: 'Delete',
                        click: (menuItem, browserWindow) => {
                            if (browserWindow) {
                                browserWindow.webContents.send('menu-edit-delete');
                            }
                        },
                    },
                    { type: 'separator' },
                    {
                        label: 'Select All',
                        accelerator: 'CmdOrCtrl+A',
                        click: (menuItem, browserWindow) => {
                            if (browserWindow) {
                                browserWindow.webContents.send('menu-edit-select-all');
                            }
                        },
                    },
                ]),
        ],
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            {
                label: 'Timeline',
                type: 'radio',
                checked: currentPage === 'timeline',
                accelerator: 'CmdOrCtrl+1',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-view-page', 'timeline');
                    }
                },
            },
            {
                label: 'Scenes',
                type: 'radio',
                checked: currentPage === 'scenes',
                accelerator: 'CmdOrCtrl+2',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-view-page', 'scenes');
                    }
                },
            },
            {
                label: 'Editor',
                type: 'radio',
                checked: currentPage === 'editor',
                accelerator: 'CmdOrCtrl+3',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-view-page', 'editor');
                    }
                },
            },
            {
                label: 'Render',
                type: 'radio',
                checked: currentPage === 'render',
                accelerator: 'CmdOrCtrl+4',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-view-page', 'render');
                    }
                },
            },
            {
                label: 'Help',
                type: 'radio',
                checked: currentPage === 'help',
                accelerator: 'CmdOrCtrl+5',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-view-page', 'help');
                    }
                },
            },
            { type: 'separator' },
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            {
                label: 'Zoom UI In',
                accelerator: 'CmdOrCtrl+Shift+=',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.setZoomLevel(browserWindow.webContents.getZoomLevel() + 1);
                    }
                },
            },
            {
                label: 'Zoom UI Out',
                accelerator: 'CmdOrCtrl+Shift+-',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.setZoomLevel(browserWindow.webContents.getZoomLevel() - 1);
                    }
                },
            },
            {
                label: 'Reset UI Zoom',
                accelerator: 'CmdOrCtrl+0',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.setZoomLevel(0);
                    }
                },
            },
            { type: 'separator' },
            { role: 'togglefullscreen' },
        ],
    },
    // Timeline menu
    {
        label: 'Timeline',
        submenu: [
            {
                label: 'Zoom In',
                accelerator: 'CmdOrCtrl+=',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-timeline-zoom-in');
                    }
                },
            },
            {
                label: 'Zoom Out',
                accelerator: 'CmdOrCtrl+-',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-timeline-zoom-out');
                    }
                },
            },
            { type: 'separator' },
            {
                label: 'Deselect All',
                accelerator: 'Escape',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-timeline-deselect-all');
                    }
                },
            },
            { type: 'separator' },
            {
                label: 'Move Playhead to Start',
                accelerator: 'Home',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-timeline-move-to-start');
                    }
                },
            },
            {
                label: 'Move Playhead Left',
                accelerator: 'Left',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-timeline-move-left');
                    }
                },
            },
            {
                label: 'Move Playhead Right',
                accelerator: 'Right',
                click: (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-timeline-move-right');
                    }
                },
            },
        ],
    },
    // { role: 'windowMenu' }
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(isMac
                ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' },
                ]
                : [
                    { role: 'close' },
                ]),
        ],
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Github Repository',
                click: async () => {
                    await shell.openExternal('https://github.com/jackual/p5mv');
                },
            },
        ],
    },
];

export function setupMenu(currentPage = 'timeline') {
    const menu = Menu.buildFromTemplate(buildMenuTemplate(currentPage));
    Menu.setApplicationMenu(menu);
}

export function updateMenu(currentPage) {
    setupMenu(currentPage);
}
