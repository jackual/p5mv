import { useEffect, useRef, useState } from 'react';

const CACHE_KEY = 'p5editor_last_url';
const DEFAULT_URL = 'https://editor.p5js.org/login';

export default function Editor({ onNavigateAway }) {
    const webviewRef = useRef(null);
    const [currentUrl, setCurrentUrl] = useState(DEFAULT_URL);
    const [initialUrl] = useState(() => {
        // Load cached URL on mount
        try {
            return localStorage.getItem(CACHE_KEY) || DEFAULT_URL;
        } catch (error) {
            console.error('Failed to load cached URL:', error);
            return DEFAULT_URL;
        }
    });

    useEffect(() => {
        const webview = webviewRef.current;
        if (!webview) return;

        const handleDidFinishLoad = () => {
            console.log('P5 editor loaded');
        };

        const handleConsoleMessage = (e) => {
            console.log('P5 editor console:', e.message);
        };

        const handleDidNavigate = (e) => {
            // Cache the URL when user navigates
            const url = e.url;
            if (url && url.startsWith('https://editor.p5js.org/')) {
                try {
                    localStorage.setItem(CACHE_KEY, url);
                    setCurrentUrl(url);
                    console.log('Cached P5 editor URL:', url);
                } catch (error) {
                    console.error('Failed to cache URL:', error);
                }
            }
        };

        const handleDidNavigateInPage = (e) => {
            // Also cache for in-page navigation (e.g., hash changes)
            if (!e.isMainFrame) return;
            const url = e.url;
            if (url && url.startsWith('https://editor.p5js.org/')) {
                try {
                    localStorage.setItem(CACHE_KEY, url);
                    setCurrentUrl(url);
                    console.log('Cached P5 editor URL (in-page):', url);
                } catch (error) {
                    console.error('Failed to cache URL:', error);
                }
            }
        };

        webview.addEventListener('did-finish-load', handleDidFinishLoad);
        webview.addEventListener('console-message', handleConsoleMessage);
        webview.addEventListener('did-navigate', handleDidNavigate);
        webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage);

        return () => {
            webview.removeEventListener('did-finish-load', handleDidFinishLoad);
            webview.removeEventListener('console-message', handleConsoleMessage);
            webview.removeEventListener('did-navigate', handleDidNavigate);
            webview.removeEventListener('did-navigate-in-page', handleDidNavigateInPage);
        };
    }, []);

    // Notify parent about navigation blocking state
    useEffect(() => {
        if (onNavigateAway) {
            // Register the check function - wrap in another function for setState
            const checkFunction = () => {
                // Check if we're on the login page
                const isLoginPage = currentUrl.includes('/login') || currentUrl === DEFAULT_URL;
                if (isLoginPage) {
                    return true; // Allow navigation without confirmation
                }
                return window.confirm(
                    'You may have unsaved changes in the p5.js editor. Are you sure you want to leave this page?'
                );
            };
            onNavigateAway(() => checkFunction);
        }
    }, [currentUrl, onNavigateAway]);

    useEffect(() => {
        // Listen for download events from main process
        const handleDownloadStarted = (event, data) => {
            console.log('Download started:', data.filename);
        };

        const handleDownloadCompleted = (event, data) => {
            console.log('Download completed:', data.filename, 'at', data.savePath);
        };

        const handleDownloadFailed = (event, data) => {
            console.error('Download failed:', data.filename, data.state);
        };

        window.electronAPI = window.electronAPI || {};
        window.addEventListener('message', (e) => {
            if (e.data.type === 'webview-download-started') handleDownloadStarted(null, e.data.payload);
            if (e.data.type === 'webview-download-completed') handleDownloadCompleted(null, e.data.payload);
            if (e.data.type === 'webview-download-failed') handleDownloadFailed(null, e.data.payload);
        });

        // Use IPC if available
        if (window.electron?.ipcRenderer) {
            window.electron.ipcRenderer.on('webview-download-started', handleDownloadStarted);
            window.electron.ipcRenderer.on('webview-download-completed', handleDownloadCompleted);
            window.electron.ipcRenderer.on('webview-download-failed', handleDownloadFailed);

            return () => {
                window.electron.ipcRenderer.removeListener('webview-download-started', handleDownloadStarted);
                window.electron.ipcRenderer.removeListener('webview-download-completed', handleDownloadCompleted);
                window.electron.ipcRenderer.removeListener('webview-download-failed', handleDownloadFailed);
            };
        }
    }, []);

    return (
        <webview
            ref={webviewRef}
            src={initialUrl}
            style={{ width: '100%' }}
        />
    );
}