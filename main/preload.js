/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-26 14:54:40
 */

global.electron = require('electron');
window.ipcRenderer = require('electron').ipcRenderer;
window.ipcMain = require('electron').ipcMain;
window.remote = require('electron').remote;

console.log('window.ipcMain', window.ipcMain);
