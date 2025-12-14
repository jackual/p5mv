import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { captureFrames } from './lib/render/capture.js';
import { compositeFromData } from './lib/composer/composer.js';
import { encodeFramesToVideo } from './lib/render/encoder.js';

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

// IPC Handlers
ipcMain.handle('render-capture', async (event, { region, project }) => {
  try {
    // Merge project data into region as expected by captureFrames
    const regionWithProject = {
      ...region,
      project: project,
      // Add progress callback to transmit region progress to UI
      onProgress: (currentFrame, totalFrames) => {
        broadcastProgress({
          type: 'region_progress',
          currentFrame: currentFrame,
          totalFrames: totalFrames,
          progress: (currentFrame / totalFrames) * 100
        });
      }
    };
    const result = await captureFrames(regionWithProject, broadcastProgress);
    return { success: true, result };
  } catch (error) {
    console.error('Capture error:', error);
    return { success: false, error: error.message, stack: error.stack };
  }
});

ipcMain.handle('render-composer', async (event, { regions, project }) => {
  try {
    console.log('Composer called with:', {
      regionsCount: regions?.length,
      width: project.meta.width,
      height: project.meta.height,
      totalFrames: project.meta.totalFrames,
      regionsData: regions
    });

    const result = await compositeFromData(
      regions,
      project.meta.width,
      project.meta.height,
      project.meta.totalFrames
    );
    return { success: true, result };
  } catch (error) {
    console.error('Composer error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      regionsCount: regions?.length,
      totalFrames: project.meta.totalFrames
    });
    return { success: false, error: error.message, stack: error.stack };
  }
});

ipcMain.handle('render-encoder', async (event, { inputPattern, outputPath, project }) => {
  try {
    const videosDir = app.getPath('videos');
    const result = await encodeFramesToVideo({
      frameDir: path.dirname(inputPattern),
      outputVideoPath: outputPath,
      videosDir: videosDir,
      fps: project.meta.fps,
      onProgress: (current, total, message) => {
        broadcastProgress({
          type: 'encoding_progress',
          currentFrame: current,
          totalFrames: total,
          progress: (current / total) * 100,
          message
        });
      }
    });
    return { success: true, result };
  } catch (error) {
    console.error('Encoder error:', error);
    return { success: false, error: error.message, stack: error.stack };
  }
});

// Send initial connection status
ipcMain.on('progress-connect', (event) => {
  broadcastProgress({ type: 'connected' });
});

// Get video file path
ipcMain.handle('get-video-path', async () => {
  // Return custom protocol URL instead of file path
  return 'p5mv://output.mp4';
});

app.whenReady().then(() => {
  // Register custom protocol for local videos
  protocol.registerFileProtocol('p5mv', (request, callback) => {
    const url = request.url.substr(7); // Remove 'p5mv://'
    const videosDir = app.getPath('videos');
    const filePath = path.join(videosDir, 'p5mv Videos', url);
    callback({ path: filePath });
  });

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
