import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const monoFont = "'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
const oneDarkNoFont = {
    ...oneDark,
};
if (oneDarkNoFont['pre[class*="language-"]']) {
    oneDarkNoFont['pre[class*="language-"]'] = {
        ...oneDarkNoFont['pre[class*="language-"]'],
    };
    delete oneDarkNoFont['pre[class*="language-"]'].fontFamily;
}
if (oneDarkNoFont['code[class*="language-"]']) {
    oneDarkNoFont['code[class*="language-"]'] = {
        ...oneDarkNoFont['code[class*="language-"]'],
    };
    delete oneDarkNoFont['code[class*="language-"]'].fontFamily;
}

import introMd from '../docs/intro.md?raw';
import installationMd from '../docs/installation.md?raw';
import workflowMd from '../docs/workflow.md?raw';
import keyframesMd from '../docs/keyframes.md?raw';
import renderingMd from '../docs/rendering.md?raw';
import customScenesMd from '../docs/custom-scenes.md?raw';
import shortcutsMd from '../docs/shortcuts.md?raw';

const docs = {
    intro: {
        title: 'Introduction',
        content: introMd,
    },
    installation: {
        title: 'Installation',
        content: installationMd,
    },
    workflow: {
        title: 'Layout & Workflow',
        content: workflowMd,
    },
    keyframes: {
        title: 'Keyframes & Animation',
        content: keyframesMd,
    },
    rendering: {
        title: 'Rendering to Video',
        content: renderingMd,
    },
    'custom-scenes': {
        title: 'Adding Custom Scenes',
        content: customScenesMd,
    },
    shortcuts: {
        title: 'Keyboard Shortcuts',
        content: shortcutsMd,
    },
};

export default function Help() {
    const [currentDoc, setCurrentDoc] = useState('intro');

    const doc = docs[currentDoc];

    return (
        <div className="help-page">
            <aside className="help-nav">
                <h2>Documentation</h2>
                <ul>
                    {Object.entries(docs).map(([id, { title }]) => (
                        <li
                            key={id}
                            className={id === currentDoc ? 'selected' : ''}
                            onClick={() => setCurrentDoc(id)}
                        >
                            {title}
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="help-content">
                <ReactMarkdown
                    components={{
                        p({ node, children, ...props }) {
                            return <p {...props}>{children}</p>;
                        },
                        pre({ node, children }) {
                            return <>{children}</>;
                        },
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            if (match) {
                                return (
                                    <SyntaxHighlighter
                                        style={oneDarkNoFont}
                                        language={match[1] || 'bash'}
                                        PreTag="pre"
                                        customStyle={{
                                            background: '#111827',
                                            fontFamily: monoFont,
                                            padding: '12px 14px',
                                            borderRadius: '6px',
                                            margin: '12px 0',
                                        }}
                                        codeTagProps={{
                                            style: {
                                                fontFamily: monoFont,
                                            },
                                        }}
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                );
                            }
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {doc.content}
                </ReactMarkdown>
            </main>
        </div>
    );
}