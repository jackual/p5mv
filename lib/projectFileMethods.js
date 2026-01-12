import Project from '@/lib/classes/Project'

const getIpcRenderer = () => {
    if (typeof window === 'undefined' || typeof window.require !== 'function') {
        console.warn('ipcRenderer unavailable: window.require is not accessible')
        return null
    }

    try {
        const { ipcRenderer } = window.require('electron')
        return ipcRenderer
    } catch (error) {
        console.error('Failed to access ipcRenderer:', error)
        return null
    }
}

const replaceProjectState = (project, nextProject) => {
    Object.keys(project).forEach(key => {
        delete project[key]
    })

    Object.assign(project, nextProject)
}

export const newFile = async (project) => {
    const ipcRenderer = getIpcRenderer()
    if (ipcRenderer) {
        try {
            await ipcRenderer.invoke('project-init-temp')
            await ipcRenderer.invoke('project-mark-saved')
        } catch (error) {
            console.error('Failed to initialize project temp directory:', error)
        }
    }

    const newProject = new Project('{}')
    replaceProjectState(project, newProject)
}

export const openFile = async (project) => {
    const ipcRenderer = getIpcRenderer()
    if (!ipcRenderer) {
        window.showAlert('Project loading is unavailable in this environment.', 'Error')
        return
    }

    try {
        const result = await ipcRenderer.invoke('project-open')

        if (!result || result.canceled) {
            return
        }

        if (!result.success) {
            window.showAlert('Error loading project: ' + (result.error || 'Unknown error'), 'Error')
            return
        }

        const loadedProject = new Project(result.projectJson)
        replaceProjectState(project, loadedProject)

        // Mark as saved since we just loaded it
        await ipcRenderer.invoke('project-mark-saved')
    } catch (error) {
        console.error('Error loading project via IPC:', error)
        window.showAlert('Error loading project: ' + error.message, 'Error')
    }
}

export const saveFile = async (project) => {
    const ipcRenderer = getIpcRenderer()
    if (!ipcRenderer) {
        window.showAlert('Project saving is unavailable in this environment.', 'Error')
        return
    }

    try {
        const result = await ipcRenderer.invoke('project-save', {
            projectData: JSON.stringify(project.export(), null, 2)
        })

        if (!result || result.canceled) {
            return
        }

        if (!result.success) {
            window.showAlert('Error saving project: ' + (result.error || 'Unknown error'), 'Error')
            return
        }

        // Mark as saved after successful save
        await ipcRenderer.invoke('project-mark-saved')
    } catch (error) {
        console.error('Error saving project via IPC:', error)
        window.showAlert('Error saving project: ' + error.message, 'Error')
    }
}
