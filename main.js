const { app, BrowserWindow } = require('electron'); // Importing the necessary modules from Electron
const path = require('path'); // Importing the path module from Node.js

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,  
        webPreferences: {
            nodeIntegration: true, // Allowing the use of Node.js APIs in the renderer process
            contextIsolation: false, // Disabling context isolation for easier access to Node.js APIs
            enableRemoteModule: true // Enabling the remote module to access Electron APIs in the renderer process
        }
    });

    mainWindow.loadFile('index.html'); // Loading the index.html file in the main window

}
 
app.whenReady().then(createWindow); // Creating the main window when the app is ready

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') { // Checking if the platform is not macOS
        app.quit(); // Quitting the app when all windows are closed (except on macOS)
    }
});
 
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) { // Checking if there are no open windows
        createWindow(); // Creating a new window when the app is activated (e.g., clicking on the dock icon on macOS)
    }
});
 