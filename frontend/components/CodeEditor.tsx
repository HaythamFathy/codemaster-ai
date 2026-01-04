"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useRef } from "react";

interface CodeEditorProps {
    initialCode?: string;
    language?: string;
    onChange?: (value: string | undefined) => void;
    readOnly?: boolean;
}

export function CodeEditor({
    initialCode = "# Write your code here\nprint('Hello World')",
    language = "python",
    onChange,
    readOnly = false
}: CodeEditorProps) {
    const editorRef = useRef(null);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        // @ts-ignore
        editorRef.current = editor;
    };

    return (
        <div className="h-full w-full overflow-hidden rounded-md border border-gray-200 bg-[#1e1e1e] shadow-inner">
            <Editor
                height="100%"
                defaultLanguage={language}
                defaultValue={initialCode}
                theme="vs-dark"
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    readOnly: readOnly,
                    automaticLayout: true,
                }}
            />
        </div>
    );
}
