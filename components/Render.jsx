'use client'

import {
    ExportIcon,
    RepeatIcon,
    FilmStripIcon,
    XIcon,
    PlayIcon,
    WarningOctagonIcon,
    CircleNotchIcon,
    CircleWavyCheckIcon,
    ListIcon,
    WarningIcon,
    ArrowsClockwiseIcon,
    Queue
} from "@phosphor-icons/react";
import IconText from "./IconText";
import { FolderIcon } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { beatsToFrameDuration } from "../lib/timeUtils";
import arrayEqual from "array-equal";

// Simple helper to write messages into the #render-progress element
function updateRenderProgress(message) {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('render-progress');
    if (el) el.textContent = String(message ?? '');
}

async function renderEachRegion(project) {
    project.render.renderRegions = [0, project.render.queue.length]

    for (const region of project.render.queue) {
        try {
            // Reset current region progress using correct frame calculation
            const totalFrames = beatsToFrameDuration(region.length, project.meta.bpm, project.meta.fps);
            project.render.currentRegion = [0, totalFrames];

            // Call IPC for capture instead of API
            const { ipcRenderer } = window.require('electron');

            // Serialize inputs data safely
            const serializedInputs = region.inputs.map(input => {
                try {
                    return JSON.parse(JSON.stringify(input.exportForRender(project))); //colour variable serialisation fix
                } catch (error) {
                    console.warn('Failed to export input for render:', error);
                    return null;
                }
            }).filter(Boolean);

            const result = await ipcRenderer.invoke('render-capture', {
                region: {
                    sceneId: region.sceneId,
                    length: region.length,
                    position: region.position,
                    code: project.render.queue.length === 1 ? 'frames' : region.code,
                    inputs: serializedInputs,
                    progressIndex: project.render.renderRegions[0]
                },
                project: {
                    meta: {
                        width: project.meta.width,
                        height: project.meta.height,
                        bpm: project.meta.bpm,
                        fps: project.meta.fps
                    }
                }
            });

            if (!result.success) {
                const detail = [result.error, result.stack].filter(Boolean).join('\n');
                throw new Error(`Failed to render region: ${detail}`);
            }

            // Mark current region as complete
            project.render.currentRegion[0] = project.render.currentRegion[1];

            // Increment completed regions counter
            project.render.renderRegions[0] += 1;

            updateRenderProgress(`Region rendered: ${region.name}`);

        } catch (error) {
            console.error(`Error rendering region":`, error);
            throw error; // Re-throw to be caught by renderChain
        }
    }
}

const renderChain = async (project) => {
    // Initialize render state
    project.render.status = "rendering";
    project.render.renderRegions = [0, 0];
    project.render.currentRegion = [0, 0];
    project.render.composite = [0, 0];
    project.render.encode = [0, 0];

    try {
        updateRenderProgress(`Starting render of ${project.render.queue.length} region(s)...`);

        // Step 1: Render all regions
        await renderEachRegion(project);

        updateRenderProgress("All regions rendered successfully");

        // Step 2: Composite frames (only if multiple regions)
        if (project.render.queue.length > 1) {
            project.render.composite = [0, 1];
            updateRenderProgress("Starting frame composition...");

            // Calculate total frames for the project
            const projectDuration = Math.max(...project.render.queue.map(region =>
                region.position + region.length
            ));
            const totalFrames = beatsToFrameDuration(projectDuration, project.meta.bpm, project.meta.fps);

            // Call IPC for composer
            const { ipcRenderer } = window.require('electron');

            // Serialize composer data safely
            let composerData;
            try {
                // Create a serializable version of the composer data
                composerData = project.tracks.map((track, trackIndex) => {
                    console.log(`Processing track ${trackIndex} with ${track.regions.length} regions`);
                    return track.regions
                        .filter(region => region != null)
                        .map((region, regionIndex) => {
                            try {
                                const code = String(region.code || 'unknown');
                                const position = Number(region.position ? beatsToFrameDuration(region.position, project.meta.bpm, project.meta.fps) : 0);
                                const length = Number(region.length ? beatsToFrameDuration(region.length, project.meta.bpm, project.meta.fps) : 0);
                                const opacity = Number(region.blend?.opacity ?? 1);
                                const mode = String(region.blend?.mode ?? 'source-over');

                                const result = [code, position, length, opacity, mode];
                                console.log(`Track ${trackIndex}, Region ${regionIndex}:`, result);
                                return result;
                            } catch (regionError) {
                                console.error(`Error processing region ${regionIndex} in track ${trackIndex}:`, regionError);
                                return ['unknown', 0, 0, 1, 'source-over'];
                            }
                        });
                });
                console.log('Final composer data:', composerData);
            } catch (error) {
                console.warn('Failed to export for composer:', error);
                composerData = [];
            }

            const compositeResult = await ipcRenderer.invoke('render-composer', {
                regions: composerData,
                project: {
                    meta: {
                        width: project.meta.width,
                        height: project.meta.height,
                        totalFrames: totalFrames
                    }
                }
            });

            if (!compositeResult.success) {
                const detail = [compositeResult.error, compositeResult.stack].filter(Boolean).join('\n');
                throw new Error(`Failed to composite frames: ${detail}`);
            }
            updateRenderProgress(`Frame composition complete: ${compositeResult.processedFrames} frames`);
        } else {
            updateRenderProgress("Skipping composition (single region)");
        }

        // Step 3: Encode video
        project.render.encode = [0, 1];
        updateRenderProgress("Starting video encoding...");

        // Call IPC for encoder
        const { ipcRenderer } = window.require('electron');
        const hasComposite = project.render.queue.length > 1;
        const singleRegionCode = hasComposite ? null : (project.render.queue.length === 1 ? 'frames' : project.render.queue[0].code);

        const encodeResult = await ipcRenderer.invoke('render-encoder', {
            hasComposite: hasComposite,
            singleRegionCode: singleRegionCode,
            project: {
                meta: {
                    fps: project.meta.fps
                }
            }
        });

        if (!encodeResult.success) {
            const detail = [encodeResult.error, encodeResult.stack].filter(Boolean).join('\n');
            throw new Error(`Failed to encode video: ${detail}`);
        }
        updateRenderProgress(`Video encoding complete: ${encodeResult.videoPath}`);

        // All steps completed successfully
        project.render.status = "done";
        project.render.finishedQueue = project.render.queue
        updateRenderProgress("Render chain completed successfully!");

    } catch (error) {
        project.render.status = "error";
        const detail = [error.message, error?.stack].filter(Boolean).join('\n');
        updateRenderProgress(`Render chain failed:\n${detail}`);

        // Reset progress on error
        project.render.currentRegion = [0, 0];

        // Optionally show user-friendly error message
        if (error.message.includes('Failed to render region')) {
            updateRenderProgress("Region rendering failed. Check scene files and project settings.");
        } else if (error.message.includes('HTTP error')) {
            updateRenderProgress("Network error during rendering. Please try again.");
        } else {
            updateRenderProgress("An unexpected error occurred during rendering.");
        }
    }
}

export default function Render({ project, snap }) {
    // Track whether the SSE progress stream is connected
    const [sseReady, setSseReady] = useState(false);
    const [videoPath, setVideoPath] = useState('');
    const progressSourceRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // Get video path from main process
    useEffect(() => {
        const getVideoPath = async () => {
            try {
                const { ipcRenderer } = window.require('electron');
                const path = await ipcRenderer.invoke('get-video-path');
                console.log('Received video path from IPC:', path);
                setVideoPath(path); // Use path directly, no need for file:// prefix
            } catch (error) {
                console.warn('Could not get video path:', error);
            }
        };
        getVideoPath();
    }, []);

    // Don't override status here - let it be managed by the render chain
    let statusIndicator, canStart = false

    // if (snap.render.status == "done") {
    //     if (!arrayEqual(project.render.finishedQueue, project.render.queue)) {
    //         project.render.status = "idle"
    //     }
    // }

    const handleProgressEvent = (data) => {
        switch (data.type) {
            case 'connected':
                setSseReady(true);
                updateRenderProgress('Renderer online');
                break;
            case 'capture_stage':
                updateRenderProgress(data.message || data.stage || 'Working…');
                break;
            case 'region_start':
                updateRenderProgress(`Region started: ${data.message || data.regionName || ''}`);
                break;
            case 'region_progress': {
                const progressValue = Math.floor((data.currentFrame / data.totalFrames) * 100);
                project.render.currentRegion = [data.currentFrame, data.totalFrames];
                updateRenderProgress(`Region: ${progressValue}% (${data.currentFrame}/${data.totalFrames})`);
                break;
            }
            case 'region_complete':
                updateRenderProgress('Region completed');
                break;
            case 'composition_start':
                updateRenderProgress(data.message || 'Composition started');
                project.render.composite = [0, data.totalFrames || 1];
                break;
            case 'composition_progress': {
                const compositeProgress = Math.floor(data.progress);
                project.render.composite = [data.currentFrame, data.totalFrames];
                updateRenderProgress(`Compositing: ${compositeProgress}% (${data.currentFrame}/${data.totalFrames})`);
                break;
            }
            case 'composition_complete':
                updateRenderProgress(data.message || 'Composition completed');
                project.render.composite[0] = project.render.composite[1];
                break;
            case 'encoding_start':
                updateRenderProgress(data.message || 'Encoding started');
                project.render.encode = [0, 1];
                break;
            case 'encoding_progress': {
                const encodeProgress = Math.floor(data.progress);
                project.render.encode = [data.currentFrame, data.totalFrames];
                updateRenderProgress(`Encoding: ${encodeProgress}% (${data.currentFrame}/${data.totalFrames})`);
                break;
            }
            case 'encoding_complete':
                updateRenderProgress(data.message || 'Encoding completed');
                project.render.encode[0] = project.render.encode[1];
                break;
            case 'error':
                updateRenderProgress(`Render error: ${data.message}${data.stack ? `\n${data.stack}` : ''}`);
                break;
        }
    };

    // Setup progress listener when component mounts
    useEffect(() => {
        if (typeof window === 'undefined' || !window.require) return;

        const { ipcRenderer } = window.require('electron');

        // Set up IPC listener for progress events
        const progressHandler = (event, data) => {
            handleProgressEvent(data);
        };

        // Listen for progress events from main process
        ipcRenderer.on('render-progress', progressHandler);

        // Send initial connection message to main process
        ipcRenderer.send('progress-connect');
        setSseReady(true);
        updateRenderProgress('Renderer online');

        return () => {
            // Clean up listener
            ipcRenderer.removeListener('render-progress', progressHandler);
        };
    }, []);

    const queueProject = () => {
        project.render.queue = project.tracks.map(i => i.regions).flat()
    }

    if (!project.render.queue.length)
        queueProject()

    switch (snap.render.status) {
        case "idle":
            if (snap.render.queue.length === 0) {
                statusIndicator = <IconText as="div" icon={WarningIcon}>Idle: Render queue is empty</IconText>
            }
            else {
                statusIndicator = <IconText as="h3" icon={ListIcon}>{snap.render.queue.length} regions in queue</IconText>
                canStart = true
            }
            break
        case "rendering":
            statusIndicator = <IconText spin as="h3" icon={CircleNotchIcon}>Rendering...</IconText>
            break
        case "done":
            statusIndicator = <IconText as="h3" iconProps={{ weight: "fill" }} icon={CircleWavyCheckIcon}>Render complete!</IconText>
            break
        case "error":
            statusIndicator = <IconText as="h3" iconProps={{ weight: "fill" }} icon={WarningOctagonIcon}>Render error occurred</IconText>
            canStart = true
            break
    }
    return (
        <div className="render-page">
            <IconText as="h1" icon={ExportIcon}>Render to video</IconText>
            <span className={`status-indicator ${snap.render.status}`}>{statusIndicator}</span>
            {snap.render.status !== "done" ? (
                <>
                    <div className="actions">
                        {/* <IconText as="button" disabled icon={RepeatIcon} onClick={() => {
                        }}>Set task to cycle region</IconText> */}
                        {snap.render.queue.length === 1 &&
                            <IconText as="button" icon={FilmStripIcon} onClick={queueProject}>Set task to whole project</IconText>}
                        {/* <IconText as="button" disabled={!snap.render.queue.length} icon={XIcon} onClick={() => {
                            project.render.queue = []
                        }}>Clear tasks</IconText> */}
                    </div>
                    <h4>Progress</h4>
                    {!sseReady && <p>Renderer offline</p>}
                    <p id="render-progress"></p>
                    <p>Regions</p>
                    <progress value={snap.render.renderRegions[0]} max={snap.render.renderRegions[1]} />
                    <p>Current Region</p>
                    <progress value={snap.render.currentRegion[0]} max={snap.render.currentRegion[1]} />
                    <p>Compositing</p>
                    <progress value={snap.render.composite[0]} max={snap.render.composite[1]} />
                    <p>Encoding</p>
                    <progress value={snap.render.encode[0]} max={snap.render.encode[1]} />
                    <IconText
                        type="button"
                        id="start-button"
                        as="button"
                        disabled={!canStart || !sseReady}
                        icon={PlayIcon}
                        onClick={e => {
                            e.preventDefault();
                            if (!sseReady) {
                                updateRenderProgress('Waiting for progress stream to connect…');
                                return;
                            }
                            renderChain(project);
                        }}
                    >
                        <h3>Render</h3>
                    </IconText>
                </>
            ) : (
                <>
                    <IconText as="button" icon={ArrowsClockwiseIcon} onClick={() => {
                        queueProject()
                        project.render.status = "idle"
                    }}>
                        <h3>Set queue to project</h3>
                    </IconText>
                    {videoPath && <video src={videoPath} controls />}
                </>
            )}
        </div>
    )
}