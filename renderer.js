// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron')

const {ipcRenderer, Notification, ipcMain} = require('electron')

mainWindow.once('did-finish-load', () => {
    ipc.on('should-display-notification', function(event, arg) {
        console.log("we care: got arg " + arg);
        console.log("we care: got event " + event);
    })
    
    // Send Message
 })