import { app, BrowserWindow, dialog } from "electron";
import path from "path";

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // for easier access to Node APIs
    },
  });

  mainWindow.loadFile(path.join(__dirname, "dist/index.html"));

  // Optional: open dev tools
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null!;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Handle exit from renderer
import { ipcMain } from "electron";

ipcMain.handle("exit-app", async () => {
  const choice = dialog.showMessageBoxSync(mainWindow, {
    type: "question",
    buttons: ["Cancel", "Exit"],
    defaultId: 1,
    cancelId: 0,
    title: "Confirm Exit",
    message: "Are you sure you want to exit REALM//?",
  });
  if (choice === 1) app.quit();
});
