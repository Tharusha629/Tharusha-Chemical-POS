const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("printerAPI", {
  printBill: (data) =>
    ipcRenderer.invoke("print-bill", data),
});