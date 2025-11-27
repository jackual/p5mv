const { app } = require('electron');
const express = require('express');
const path = require('path');

const server = express();

// Middleware
server.use(express.json());

// Example API route
server.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Electron backend!' });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});

// Ensure Electron app lifecycle is managed
app.on('ready', () => {
    console.log('Electron app is ready.');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});