import { XIcon, CopyIcon, CheckIcon, MagicWandIcon } from '@phosphor-icons/react'
import ScenePropertyEditor from './ScenePropertyEditor'
import IconText from './IconText'
import { useState } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import htmlbars from 'react-syntax-highlighter/dist/esm/languages/hljs/htmlbars'
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import PropertyTypes from '@/data/PropertyTypes'

SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('html', htmlbars)

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
        const formattedInfo = formatSceneInfo(sceneInfo)
        const fullTag = `<script id="p5mv-json" type="application/json">\n${JSON.stringify(formattedInfo, null, 2)}\n</script>`
        try {
            await navigator.clipboard.writeText(fullTag)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    // Format scene info using PropertyTypes to get proper value types
    const formatSceneInfo = (info) => {
        const formatted = {
            name: info.name,
            thumb: info.thumb
        }

        if (info.inputs && info.inputs.length > 0) {
            formatted.inputs = info.inputs.map(input => {
                const propertyType = PropertyTypes[input.type]
                let defaultValue = input.default

                // Use PropertyTypes.set to convert the value properly (except for colours)
                if (input.type !== 'colour' && propertyType && propertyType.set && defaultValue !== undefined && defaultValue !== '') {
                    try {
                        defaultValue = propertyType.set(defaultValue)
                    } catch (e) {
                        // Keep original value if conversion fails
                    }
                }

                return {
                    id: input.id,
                    label: input.label,
                    type: input.type,
                    default: defaultValue
                }
            })
        }

        return formatted
    }

    const formattedInfo = formatSceneInfo(sceneInfo)
    const json = JSON.stringify(formattedInfo, null, 2)
    const fullTag = `<script id="p5mv-json" type="application/json">\n${json}\n</script>\n<script src="https://cdn.jsdelivr.net/gh/jackual/music-tl@dev/p5mv.js"></script>`

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
                            <p>Add this to the <code>&lt;body&gt;</code> section of your sketch's HTML file before your sketch</p>
                        </div>
                        <SyntaxHighlighter
                            language="html"
                            style={vs2015}
                            customStyle={{
                                margin: 0,
                                borderRadius: '8px',
                                flex: 1,
                                fontSize: '13px',
                                lineHeight: '1.5',
                                fontFamily: "'Roboto Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
                            }}
                            wrapLongLines={false}
                            PreTag="pre"
                            CodeTag="code"
                        >
                            {fullTag}
                        </SyntaxHighlighter>
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
