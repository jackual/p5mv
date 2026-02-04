// Helper to check if text input is focused
const isTextInputFocused = () => {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.contentEditable === 'true'
    );
};

// Create menu handlers with necessary dependencies
export const createMenuHandlers = (project, projectFileMethods, page, setPage) => {
    return {
        handleOpenFile: (event, fileData) => {
            try {
                const Project = project.constructor;
                const loadedProject = new Project(fileData);

                // Clear all existing properties
                Object.keys(project).forEach(key => {
                    delete project[key];
                });

                // Add all loaded project properties
                Object.assign(project, loadedProject);
            } catch (error) {
                alert('Error loading project: ' + error.message);
            }
        },

        handleMenuNewProject: async () => {
            const confirmed = await window.showConfirm('Are you sure you want to create a new project?', 'New Project');
            if (confirmed) {
                projectFileMethods.newFile();
            }
        },

        handleMenuOpenProject: () => {
            projectFileMethods.openFile();
        },

        handleMenuSaveProject: () => {
            projectFileMethods.saveFile();
        },

        // Edit menu handlers - context-aware (text or regions)
        handleEditCut: () => {
            if (isTextInputFocused()) {
                document.execCommand('cut');
            }
            // No region cut operation currently
        },

        handleEditCopy: () => {
            if (isTextInputFocused()) {
                document.execCommand('copy');
            } else if (page === 'timeline') {
                project.copy();
            }
        },

        handleEditPaste: () => {
            if (isTextInputFocused()) {
                document.execCommand('paste');
            } else if (page === 'timeline') {
                project.paste();
            }
        },

        handleEditDelete: () => {
            if (isTextInputFocused()) {
                document.execCommand('delete');
            } else if (page === 'timeline') {
                project.selected.forEach(region => region.del());
            }
        },

        handleEditSelectAll: () => {
            if (isTextInputFocused()) {
                document.execCommand('selectAll');
            } else if (page === 'timeline') {
                project.selectAll();
            }
        },

        // Timeline-specific menu handlers
        handleTimelineDeselectAll: () => {
            if (page === 'timeline') {
                project.deselectAll();
            }
        },

        handleTimelineMoveToStart: () => {
            if (page === 'timeline') project.moveToStart();
        },

        handleTimelineMoveLeft: () => {
            if (page === 'timeline') {
                project.playhead = Math.max(0, project.playhead - project.snap);
            }
        },

        handleTimelineMoveRight: () => {
            if (page === 'timeline') {
                project.playhead = project.playhead + project.snap;
            }
        },

        handleTimelineZoomIn: () => {
            if (page === 'timeline') project.zoomIn();
        },

        handleTimelineZoomOut: () => {
            if (page === 'timeline') project.zoomOut();
        },

        handleViewPage: (event, pageName) => {
            setPage(pageName);
        }
    };
};
