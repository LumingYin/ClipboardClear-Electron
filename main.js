const electron = require('electron')
// Module to control application life.
const app = electron.app
const {Tray, Menu, MenuItem, clipboard, Notification, ipcMain} = require('electron')
const notify = require('electron-main-notification')
var AutoLaunch = require('auto-launch');
const Store = require('electron-store');
const store = new Store();
const menu = new Menu()

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
var launchAtLoginMenuItem;
var lrSwapMenuItem;
var clipboardClearAutoLauncher = new AutoLaunch({
  name: 'ClipboardClear',
});
var userdefaultsLRSwap = store.get('swap_leftRight');

let tray = null
app.on('ready', () => {
  // createWindow ()
  tray = new Tray('clipboard.png')
  
  menu.append(new MenuItem({label: 'Clear Clipboard Text Format', click() {
    clearClipboard();
  }}))
  menu.append(new MenuItem({type: 'separator'}))

  launchAtLoginMenuItem = new MenuItem({label: 'Launch at Login', type: 'checkbox', checked: true, click() {
    toggleAutoLaunch();
  }});
  updateAutoLaunchToggleUI();
  menu.append(launchAtLoginMenuItem)
  userdefaultsLRSwap = store.get('swap_leftRight');
  
  if (userdefaultsLRSwap == undefined) {
    console.log("No preference for L/R swap, defaulting to left clear, right menu");
    userdefaultsLRSwap = false;
    store.set('swap_leftRight', false);
  }

  lrSwapMenuItem = new MenuItem({label: 'Clear With Right Click', type: 'checkbox', checked: userdefaultsLRSwap, click() {
    toggleLRSwap()
  }})
  menu.append(lrSwapMenuItem)
  menu.append(new MenuItem({type: 'separator'}))
  menu.append(new MenuItem({label: 'Quit', click() {
    app.quit();
  }}))
  tray.setToolTip('Clear Clipboard Text Format')
  // tray.setContextMenu(menu)
  tray.on('click', (event, bounds, position) => {
    // console.log("click event! \n" + event)
    leftClicked();
  })
  tray.on('right-click', (event, bounds) => {
    // console.log("right click event! \n" + event)
    rightClicked();
  })

})

function leftClicked() {
  if (userdefaultsLRSwap == true) {
    tray.popUpContextMenu(menu)
  } else {
    clearClipboard();
  }
}

function rightClicked() {
  if (userdefaultsLRSwap == true) {
    clearClipboard();
  } else {
    tray.popUpContextMenu(menu)
  }
}


// function showMenu() {
//   menu.showMenu()
// }

function toggleLRSwap() {
  if (userdefaultsLRSwap == true) {
    userdefaultsLRSwap = false;
    store.set('swap_leftRight', false);
    tray.displayBalloon({
      title: "Clear format with left click enabled.",
      content: "To access app menu and options, right click on the taskbar icon."
    });
  } else {
    userdefaultsLRSwap = true;
    store.set('swap_leftRight', true);
    tray.displayBalloon({
      title: "Clear format with right click enabled.",
      content: "To access app menu and options, left click on the taskbar icon."
    });
  }
}

function updateAutoLaunchToggleUI() {
  clipboardClearAutoLauncher.isEnabled().then(function(isEnabled) {
    if (isEnabled) {
      launchAtLoginMenuItem.checked = true;
    } else {
      launchAtLoginMenuItem.checked = false;      
    }
  }).catch(function(err) {
    console.log("Failed to query whether auto launch is configured");
  });
}

function toggleAutoLaunch() {

  clipboardClearAutoLauncher.isEnabled().then(function(isEnabled) {
    if (isEnabled) {
      clipboardClearAutoLauncher.disable();
      console.log("Disabling auto launch with startup!");
    } else {
      clipboardClearAutoLauncher.enable();
      console.log("Enabling auto launch with startup!");
    }
  }).catch(function(err) {
    console.log("Failed to query whether auto launch is configured");
  });
}

function clearClipboard() {
  var text = clipboard.readText();
  clipboard.writeText(text);
  tray.displayBalloon({
    title: "Format cleared!",
    content: "Successfully cleared the format of your clipboard text."
  });
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
