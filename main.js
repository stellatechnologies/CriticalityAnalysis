const { app, BrowserWindow } = require('electron'); 
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,  
        webPreferences: {
            nodeIntegration: true, 
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    mainWindow.loadFile('index.html');

    

    // Debug Dev Tools enabled 
    // mainWindow.webContents.openDevTools();

}
 
app.whenReady().then(createWindow);

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
 