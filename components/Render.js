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
    WarningIcon
} from "@phosphor-icons/react";
import IconText from "./IconText";
import { FolderIcon } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { beatsToFrameDuration } from "@/lib/timeUtils";
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

            // Call API endpoint to render region
            const response = await fetch('/api/render/capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    region: {
                        sceneId: region.sceneId,
                        length: region.length,
                        position: region.position,
                        code: project.render.queue.length === 1 ? 'frames' : region.code,
                        inputs: region.inputs.map(input => input.exportForRender(project)),
                        progressIndex: project.render.renderRegions[0]
                    },
                    project: {
                        meta: project.meta,
                        render: {
                            outputFolder: project.render.outputFolder
                        }
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                const detail = [errorData.error || response.statusText, errorData.stack].filter(Boolean).join('\n');
                throw new Error(`Failed to render region: ${detail}`);
            }

            const result = await response.json();

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

            // Call API endpoint to composite frames
            const compositeResponse = await fetch('/api/render/composer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: project.exportForComposer(),
                    width: project.meta.width,
                    height: project.meta.height,
                    totalFrames: totalFrames
                })
            });

            if (!compositeResponse.ok) {
                const errorData = await compositeResponse.json().catch(() => ({ error: 'Unknown error' }));
                const detail = [errorData.error || compositeResponse.statusText, errorData.stack].filter(Boolean).join('\n');
                throw new Error(`Failed to composite frames: ${detail}`);
            }

            const compositeResult = await compositeResponse.json();
            updateRenderProgress(`Frame composition complete: ${compositeResult.processedFrames} frames`);
        } else {
            updateRenderProgress("Skipping composition (single region)");
        }

        // Step 3: Encode video
        project.render.encode = [0, 1];
        updateRenderProgress("Starting video encoding...");

        // Call API endpoint to encode video
        const encodeResponse = await fetch('/api/render/encode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fps: project.meta.fps,
                outputFilename: 'output.mp4'
            })
        });

        if (!encodeResponse.ok) {
            const errorData = await encodeResponse.json().catch(() => ({ error: 'Unknown error' }));
            const detail = [errorData.error || encodeResponse.statusText, errorData.stack].filter(Boolean).join('\n');
            throw new Error(`Failed to encode video: ${detail}`);
        }

        const encodeResult = await encodeResponse.json();
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

    // Don't override status here - let it be managed by the render chain
    let statusIndicator, canStart = false

    if (snap.render.status == "done") {
        if (!arrayEqual(project.render.finishedQueue, project.render.queue)) {
            project.render.status = "idle"
        }
    }

    // Setup Server-Sent Events for progress updates
    const setupProgressListener = () => {
        if (typeof window !== 'undefined' && !window.renderProgressSource) {
            window.renderProgressSource = new EventSource('/api/render/progress');

            window.renderProgressSource.onmessage = (event) => {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'connected':
                        setSseReady(true);
                        updateRenderProgress('Renderer online');
                        break;
                    case 'capture_stage':
                        // High-level stages from capture.js (cleanup, browser setup, canvas ready, etc.)
                        updateRenderProgress(data.message || data.stage || 'Working…');
                        break;
                    case 'region_start':
                        updateRenderProgress(`Region started: ${data.message || data.regionName || ''}`);
                        break;
                    case 'region_progress':
                        // Update current region progress
                        const progressValue = Math.floor((data.currentFrame / data.totalFrames) * 100);
                        project.render.currentRegion = [data.currentFrame, data.totalFrames];
                        updateRenderProgress(`Region: ${progressValue}% (${data.currentFrame}/${data.totalFrames})`);
                        break;
                    case 'region_complete':
                        updateRenderProgress('Region completed');
                        break;
                    case 'composition_start':
                        updateRenderProgress(data.message || 'Composition started');
                        project.render.composite = [0, data.totalFrames || 1];
                        break;
                    case 'composition_progress':
                        // Update composition progress
                        const compositeProgress = Math.floor(data.progress);
                        project.render.composite = [data.currentFrame, data.totalFrames];
                        updateRenderProgress(`Compositing: ${compositeProgress}% (${data.currentFrame}/${data.totalFrames})`);
                        break;
                    case 'composition_complete':
                        updateRenderProgress(data.message || 'Composition completed');
                        project.render.composite[0] = project.render.composite[1];
                        break;
                    case 'encoding_start':
                        updateRenderProgress(data.message || 'Encoding started');
                        project.render.encode = [0, 1];
                        break;
                    case 'encoding_progress':
                        // Update encoding progress
                        const encodeProgress = Math.floor(data.progress);
                        project.render.encode = [data.currentFrame, data.totalFrames];
                        updateRenderProgress(`Encoding: ${encodeProgress}% (${data.currentFrame}/${data.totalFrames})`);
                        break;
                    case 'encoding_complete':
                        updateRenderProgress(data.message || 'Encoding completed');
                        project.render.encode[0] = project.render.encode[1];
                        break;
                    case 'error':
                        updateRenderProgress(`Render error: ${data.message}${data.stack ? `\n${data.stack}` : ''}`);
                        // Don't set status here - let renderChain handle it
                        break;
                }
            };

            window.renderProgressSource.onerror = (error) => {
                updateRenderProgress(`Progress stream error: ${error?.message || error}`);
            };
        }
    };

    // Setup progress listener when component mounts
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setupProgressListener();
        }
    }, []);
    if (!project.render.queue.length)
        project.render.queue = project.tracks.map(i => i.regions).flat()
    switch (snap.render.status) {
        case "idle":
            if (snap.render.queue.length === 0) {
                statusIndicator = <IconText as="div" icon={WarningIcon}>Idle: Render queue is empty</IconText>
            }
            else {
                statusIndicator = <IconText as="h3" icon={ListIcon}>{snap.render.queue.length} tasks in queue</IconText>
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
            <div className="actions">
                {/* <IconText as="button" disabled icon={RepeatIcon} onClick={() => {
                }}>Set task to cycle region</IconText>
                <IconText as="button" icon={FilmStripIcon} onClick={() => {
                    project.render.queue = project.tracks.map(i => i.regions).flat()
                }}>Set task to whole project</IconText>
                <IconText as="button" disabled={!snap.render.queue.length} icon={XIcon} onClick={() => {
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
            <p>Composition</p>
            <progress value={snap.render.composite[0]} max={snap.render.composite[1]} />
            <p>Encode</p>
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
            {snap.render.status === "done" &&
                <video src="/output.mp4" controls />
            }
        </div>
    )
}