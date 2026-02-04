import { ipcMain } from 'electron';
import { updateMenu } from '../menu.js';

export function registerMenuHandlers() {
    // Update menu when page changes
    ipcMain.on('update-menu-page', (event, page) => {
        updateMenu(page);
    });
}
