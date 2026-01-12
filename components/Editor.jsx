import { useEffect, useRef, useState } from 'react';

const CACHE_KEY = 'p5editor_last_url';
const DEFAULT_URL = 'https://editor.p5js.org/login';

export default function Editor({ onNavigateAway }) {
    const webviewRef = useRef(null);
    const [currentUrl, setCurrentUrl] = useState(DEFAULT_URL);
    const [isImporting, setIsImporting] = useState(false);
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
            const checkFunction = async () => {
                // Check if we're on the login page
                const isLoginPage = currentUrl.includes('/login') || currentUrl === DEFAULT_URL;
                if (isLoginPage) {
                    return true; // Allow navigation without confirmation
                }
                return await window.showConfirm(
                    'You may have unsaved changes in the p5.js editor. Are you sure you want to leave this page?',
                    'Unsaved Changes'
                );
            };
            onNavigateAway(() => checkFunction);
        }
    }, [currentUrl, onNavigateAway]);

    useEffect(() => {
        // Listen for download events from main process
        const handleDownloadStarted = (event, data) => {
            console.log('Download started:', data.filename);
            setIsImporting(true);
        };

        const handleDownloadCompleted = async (event, data) => {
            console.log('Download completed:', data);

            if (!data || !data.savePath) {
                console.error('No save path in download data:', data);
                setIsImporting(false);
                return;
            }

            // Import the downloaded scene
            const ipcRenderer = window.require?.('electron')?.ipcRenderer;
            if (ipcRenderer) {
                try {
                    const result = await ipcRenderer.invoke('import-downloaded-scene', {
                        filePath: data.savePath
                    });
                    console.log('Import result:', result);
                    if (!result.success) {
                        console.error('Import failed:', result.error);
                    }
                } catch (error) {
                    console.error('Failed to import downloaded scene:', error);
                    setIsImporting(false);
                }
            }
        };

        const handleDownloadFailed = (event, data) => {
            console.error('Download failed:', data.filename, data.state);
            setIsImporting(false);
        };

        window.electronAPI = window.electronAPI || {};
        window.addEventListener('message', (e) => {
            if (e.data.type === 'webview-download-started') handleDownloadStarted(null, e.data.payload);
            if (e.data.type === 'webview-download-completed') handleDownloadCompleted(null, e.data.payload);
            if (e.data.type === 'webview-download-failed') handleDownloadFailed(null, e.data.payload);
        });

        // Use IPC if available
        const ipcRenderer = window.require?.('electron')?.ipcRenderer;
        if (ipcRenderer) {
            const handleImportProgress = (event, { status }) => {
                if (status === 'importing') {
                    setIsImporting(true);
                } else if (status === 'complete') {
                    setIsImporting(false);
                    window.showAlert('Sketch successfully imported to your project!', 'Success');
                } else if (status === 'error') {
                    setIsImporting(false);
                    window.showAlert('Failed to import sketch. Please try again.', 'Import Failed');
                }
            };

            ipcRenderer.on('webview-download-started', handleDownloadStarted);
            ipcRenderer.on('webview-download-completed', handleDownloadCompleted);
            ipcRenderer.on('webview-download-failed', handleDownloadFailed);
            ipcRenderer.on('scene-import-progress', handleImportProgress);

            return () => {
                ipcRenderer.removeListener('webview-download-started', handleDownloadStarted);
                ipcRenderer.removeListener('webview-download-completed', handleDownloadCompleted);
                ipcRenderer.removeListener('webview-download-failed', handleDownloadFailed);
                ipcRenderer.removeListener('scene-import-progress', handleImportProgress);
            };
        }
    }, []);

    return (
        <>
            {isImporting && (
                <div className="import-overlay">
                    <div className="import-message">
                        <p>Downloading project...</p>
                        <p className="import-detail">Generating thumbnail and preparing scene</p>
                    </div>
                </div>
            )}
            <webview
                ref={webviewRef}
                src={initialUrl}
                style={{ width: '100%' }}
                allowpopups="true"
                partition="persist:p5editor"
            />
        </>
    );
}