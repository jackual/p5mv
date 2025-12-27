import Project from '@/lib/classes/Project'

export const newFile = (project) => {
    const newProject = new Project('{}')

    // Clear all existing properties
    Object.keys(project).forEach(key => {
        delete project[key]
    })

    // Add all new project properties
    Object.assign(project, newProject)
}

export const openFile = (project) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.p5mvProject'
    input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const loadedProject = new Project(event.target.result)

                // Clear all existing properties
                Object.keys(project).forEach(key => {
                    delete project[key]
                })

                // Add all loaded project properties
                Object.assign(project, loadedProject)
            } catch (error) {
                alert('Error loading project: ' + error.message)
            }
        }
        reader.readAsText(file)
    }
    input.click()
}

export const saveFile = (project) => {
    const saveData = JSON.stringify(project.export())
    function downloadObjectAsJson(exportObj, exportName) {
        // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", exportName);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
    downloadObjectAsJson(project.export(), project.meta.title + ".p5mvProject")
}
