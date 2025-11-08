"use client";

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
    language: string;
    code: string;
    inline: boolean;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-4 rounded-lg overflow-hidden border border-slate-600">
            {/* Language label and copy button */}
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800/90 border-b border-slate-600">
                {language && (
                    <div className="text-xs text-slate-400 font-mono uppercase">
                        {language}
                    </div>
                )}
                <button
                    onClick={handleCopy}
                    className="ml-auto text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-600 p-1.5 rounded transition-colors flex items-center gap-1.5 text-xs"
                    aria-label="Copy code"
                    title="Copy code"
                >
                    {copied ? (
                        <>
                            <Check size={14} />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={14} />
                            <span className="hidden sm:inline">Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code content with custom styling */}
            <pre className="p-4 bg-slate-900/90 overflow-x-auto">
                <code className="text-slate-200 text-sm font-mono leading-relaxed">
                    {code}
                </code>
            </pre>
        </div>
    );
}
