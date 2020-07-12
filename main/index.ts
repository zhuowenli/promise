/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-08 11:28:34
 */

import { autoUpdater } from 'electron-updater';
import { app, BrowserWindow, globalShortcut } from 'electron';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow: BrowserWindow | null;
const winURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9090'
    : `file://${__dirname}/index.html`;


function createWindow() {
    mainWindow = new BrowserWindow({
        x: 0,
        y: 300,
        height: 800,
        useContentSize: true,
        width: 1000,
        titleBarStyle: 'hidden',
        vibrancy: 'sidebar',
        transparent: true,
        frame: false,
        show: false,
    });

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.on('ready-to-show', () => {
        mainWindow?.setVibrancy?.('popover');
        mainWindow?.show();
    });

    globalShortcut.register('CommandOrControl+Shift+X', () => {
        mainWindow?.setVibrancy('popover');
        mainWindow?.show();
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */
autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
});

app.on('ready', () => {
    if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates();
});
