import { XIcon, CopyIcon, CheckIcon, MagicWandIcon } from '@phosphor-icons/react'
import ScenePropertyEditor from './ScenePropertyEditor'
import IconText from './IconText'
import { useState } from 'react'

export default function MetadataWizard({ onClose }) {
    // Extract title from webview's document.title (format: "p5.js Web Editor | sketch_name")
    const getInitialTitle = () => {
        const webview = document.querySelector('webview')
        if (webview) {
            try {
                const title = webview.getTitle()
                if (title && title.includes(' | ')) {
                    return title.split(' | ')[1].trim()
                }
            } catch (error) {
                console.error('Failed to get webview title:', error)
            }
        }
        return 'My Scene'
    }

    const [sceneInfo, setSceneInfo] = useState({
        name: getInitialTitle(),
        thumb: 'thumb.jpg',
        inputs: []
    })
    const [copied, setCopied] = useState(false)

    const handleUpdate = (updatedInfo) => {
        setSceneInfo(updatedInfo)
    }

    const handleCopyToClipboard = async () => {
        const fullTag = `<script id="p5mv-json" type="application/json">\n${JSON.stringify(sceneInfo, null, 2)}\n</script>`
        try {
            await navigator.clipboard.writeText(fullTag)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const json = JSON.stringify(sceneInfo, null, 2)
    const fullTag = `<script id="p5mv-json" type="application/json">\n${json}\n</script>`

    return (
        <div className="metadata-wizard-overlay">
            <div className="metadata-wizard-container">
                <div className="metadata-wizard-header">
                    <IconText as="h2" icon={MagicWandIcon}>Metadata Wizard</IconText>
                    <button className="metadata-wizard-close" onClick={onClose}>
                        <XIcon size={24} weight="bold" />
                    </button>
                </div>

                <div className="metadata-wizard-content">
                    <div className="metadata-wizard-left">
                        <ScenePropertyEditor
                            sceneInfo={sceneInfo}
                            onUpdate={handleUpdate}
                            readOnly={false}
                            showTitle={true}
                        />
                    </div>

                    <div className="metadata-wizard-right">
                        <div className="metadata-wizard-code-header">
                            <h3>HTML Output</h3>
                            <p>Add this to the <code>&lt;head&gt;</code> section of your sketch's HTML file</p>
                        </div>
                        <pre className="metadata-wizard-code">
                            <code>{fullTag}</code>
                        </pre>
                    </div>
                </div>

                <div className="metadata-wizard-footer">
                    <button className="metadata-wizard-button" onClick={handleCopyToClipboard}>
                        {copied ? <CheckIcon size={18} weight="bold" /> : <CopyIcon size={18} weight="regular" />}
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                    <button className="metadata-wizard-button metadata-wizard-button-primary" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
