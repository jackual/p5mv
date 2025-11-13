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
import { beatsToFrameDuration } from "@/lib/timeUtils";
import arrayEqual from "array-equal";

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
                        name: region.name,
                        inputs: region.inputs.map(input => input.exportForRender(project))
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
                throw new Error(`Failed to render region "${region.name}": ${errorData.error || response.statusText}`);
            }

            const result = await response.json();

            // Mark current region as complete
            project.render.currentRegion[0] = project.render.currentRegion[1];

            // Increment completed regions counter
            project.render.renderRegions[0] += 1;

            console.log(`Successfully rendered region: ${region.name}`);

        } catch (error) {
            console.error(`Error rendering region "${region.name}":`, error);
            throw error; // Re-throw to be caught by renderChain
        }
    }
}

const renderChain = async (project) => {
    // Initialize render state
    project.render.status = "rendering";
    project.render.renderRegions = [0, 0];
    project.render.currentRegion = [0, 0];
    project.render.encode = [0, 0];

    try {
        console.log(`Starting render of ${project.render.queue.length} regions...`);

        // Step 1: Render all regions
        await renderEachRegion(project);

        console.log("All regions rendered successfully");

        // Step 2: Encode video
        project.render.encode = [0, 1];
        console.log("Starting video encoding...");

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
            throw new Error(`Failed to encode video: ${errorData.error || encodeResponse.statusText}`);
        }

        const encodeResult = await encodeResponse.json();
        console.log("Video encoding complete:", encodeResult.videoPath);

        // All steps completed successfully
        project.render.status = "done";
        project.render.finishedQueue = project.render.queue
        console.log("Render chain completed successfully!");

    } catch (error) {
        project.render.status = "error";
        console.error("Render chain failed:", error);

        // Reset progress on error
        project.render.currentRegion = [0, 0];

        // Optionally show user-friendly error message
        if (error.message.includes('Failed to render region')) {
            console.error("Region rendering failed. Check scene files and project settings.");
        } else if (error.message.includes('HTTP error')) {
            console.error("Network error during rendering. Please try again.");
        } else {
            console.error("An unexpected error occurred during rendering.");
        }
    }
}

export default function Render({ project, snap }) {
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
                    case 'region_start':
                        console.log('Region started:', data.regionName);
                        break;
                    case 'region_progress':
                        // Update current region progress
                        const progressValue = Math.floor((data.currentFrame / data.totalFrames) * 100);
                        project.render.currentRegion = [data.currentFrame, data.totalFrames];
                        console.log(`${data.regionName}: ${progressValue}% (${data.currentFrame}/${data.totalFrames})`);
                        break;
                    case 'region_complete':
                        console.log('Region completed:', data.regionName);
                        break;
                    case 'encoding_start':
                        console.log('Encoding started:', data.message);
                        project.render.encode = [0, 1];
                        break;
                    case 'encoding_progress':
                        // Update encoding progress
                        const encodeProgress = Math.floor(data.progress);
                        project.render.encode = [data.currentFrame, data.totalFrames];
                        console.log(`Encoding: ${encodeProgress}% (${data.currentFrame}/${data.totalFrames})`);
                        break;
                    case 'encoding_complete':
                        console.log('Encoding completed:', data.message);
                        project.render.encode[0] = project.render.encode[1];
                        break;
                    case 'error':
                        console.error('Render error:', data.message);
                        // Don't set status here - let renderChain handle it
                        break;
                }
            };

            window.renderProgressSource.onerror = (error) => {
                console.error('Progress stream error:', error);
            };
        }
    };

    // Setup progress listener when component mounts
    if (typeof window !== 'undefined') {
        setupProgressListener();
    }
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
                <IconText as="button" disabled icon={RepeatIcon} onClick={() => {
                }}>Set task to cycle region</IconText>
                <IconText as="button" disabled icon={FilmStripIcon} onClick={() => {
                }}>Set task to whole project</IconText>
                <IconText as="button" disabled={!snap.render.queue.length} icon={XIcon} onClick={() => {
                    project.render.queue = []
                }}>Clear tasks</IconText>
            </div>
            <h4>Progress</h4>
            <p>Regions</p>
            <progress value={snap.render.renderRegions[0]} max={snap.render.renderRegions[1]} />
            <p>Current Region</p>
            <progress value={snap.render.currentRegion[0]} max={snap.render.currentRegion[1]} />
            <p>Encode</p>
            <progress value={snap.render.encode[0]} max={snap.render.encode[1]} />
            <IconText id="start-button" as="button" disabled={!canStart} icon={PlayIcon} onClick={() => renderChain(project)}><h3>Render</h3></IconText>
            {snap.render.status === "done" &&
                <video src="/output.mp4" controls />
            }
        </div>
    )
}