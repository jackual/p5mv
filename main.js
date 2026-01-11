import { app, BrowserWindow, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { setupMenu } from './electron/menu.js';
import { registerIpcHandlers } from './electron/ipc.js';
import { registerProtocols } from './electron/protocols.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true, // Enable webview tag
    },
  });

  // Point Electron at Vite's dev server when developing, otherwise load the built bundle
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

// Progress broadcasting function
function broadcastProgress(data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('render-progress', data);
  }
}
app.whenReady().then(() => {
  // Ensure common Homebrew paths are available when launched from Finder
  if (process.platform === 'darwin' && app.isPackaged) {
    const extraPaths = ['/usr/local/bin'];
    const current = (process.env.PATH || '').split(path.delimiter);
    const merged = Array.from(new Set([...current, ...extraPaths]));
    process.env.PATH = merged.join(path.delimiter);
  }

  setupMenu();
  registerProtocols();
  registerIpcHandlers(broadcastProgress);
  createWindow();

  // Set up download handler for both main session and webview partition
  const setupDownloadHandler = (session) => {
    session.on('will-download', (event, item, webContents) => {
      console.log('Download initiated:', item.getFilename(), 'from', item.getURL());

      // Set download path to temp directory
      const downloadPath = path.join(app.getPath('temp'), 'scene-temp-dl');
      fs.ensureDirSync(downloadPath);

      const savePath = path.join(downloadPath, item.getFilename());
      item.setSavePath(savePath);

      // Send notification to renderer process
      mainWindow.webContents.send('webview-download-started', {
        filename: item.getFilename(),
        totalBytes: item.getTotalBytes(),
        url: item.getURL()
      });

      item.on('updated', (event, state) => {
        if (state === 'progressing') {
          mainWindow.webContents.send('webview-download-progress', {
            filename: item.getFilename(),
            receivedBytes: item.getReceivedBytes(),
            totalBytes: item.getTotalBytes()
          });
        }
      });

      item.once('done', (event, state) => {
        if (state === 'completed') {
          mainWindow.webContents.send('webview-download-completed', {
            filename: item.getFilename(),
            savePath: item.getSavePath()
          });
        } else {
          mainWindow.webContents.send('webview-download-failed', {
            filename: item.getFilename(),
            state
          });
        }
      });
    });
  };

  // Set up for main session
  setupDownloadHandler(mainWindow.webContents.session);

  // Set up for webview partition
  const webviewSession = session.fromPartition('persist:p5editor');
  setupDownloadHandler(webviewSession);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
