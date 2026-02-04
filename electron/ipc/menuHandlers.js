import { ipcMain } from 'electron';
import { updateMenu } from '../menu.js';

let currentPage = 'timeline';
let currentSnap = 0.25;

export function registerMenuHandlers() {
    // Update menu when page changes
    ipcMain.on('update-menu-page', (event, page) => {
        currentPage = page;
        updateMenu(currentPage, currentSnap);
    });

    // Update menu when snap changes
    ipcMain.on('update-menu-snap', (event, snap) => {
        currentSnap = snap;
        updateMenu(currentPage, currentSnap);
    });
}
