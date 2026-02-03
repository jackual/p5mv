import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupMenu } from './electron/menu.js';
import { registerIpcHandlers } from './electron/ipc.js';
import { registerProtocols } from './electron/protocols.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let fileToOpen = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Point Electron at Vite's dev server when developing, otherwise load the built bundle
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // If a file was requested to be opened before window was ready, open it now
  if (fileToOpen) {
    mainWindow.webContents.on('did-finish-load', () => {
      const fileData = fs.readFileSync(fileToOpen, 'utf-8');
      mainWindow.webContents.send('open-project-file', fileData);
      fileToOpen = null;
    });
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

// Handle opening files on macOS (double-click .p5mvProject)
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  
  if (mainWindow && !mainWindow.isDestroyed()) {
    // Window exists, send file data directly
    const fileData = fs.readFileSync(filePath, 'utf-8');
    mainWindow.webContents.send('open-project-file', fileData);
  } else {
    // Window doesn't exist yet, store for later
    fileToOpen = filePath;
  }
});
