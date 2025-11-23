"use client";

import { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import { getSubmissionCode } from '../../app/problems/[slug]/action';

interface SubmissionCodeModalProps {
    submissionId: string;
    language: string;
    onClose: () => void;
}

export function SubmissionCodeModal({ submissionId, language, onClose }: SubmissionCodeModalProps) {
    const [code, setCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchCode = async () => {
            try {
                const result = await getSubmissionCode(submissionId);
                
                if (!result.success) {
                    throw new Error(result.error || 'Failed to fetch code');
                }
                
                setCode(result.code || null);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchCode();
    }, [submissionId]);

    const handleCopy = async () => {
        if (!code) return;
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-700 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/95">
                    <div className="flex items-center gap-3">
                        <h3 id="modal-title" className="text-lg font-semibold text-white">
                            Submission Code
                        </h3>
                        <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                            {language}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {code && (
                            <button
                                onClick={handleCopy}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                aria-label={copied ? "Copied!" : "Copy code"}
                                title={copied ? "Copied!" : "Copy code"}
                            >
                                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            aria-label="Close modal"
                            title="Close (Esc)"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 bg-slate-900/50">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <p className="text-sm">Loading code...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
                            <p className="font-semibold mb-1">Failed to load code</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {code && (
                        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                            <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                                <code className="text-slate-200 font-mono">
                                    {code}
                                </code>
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
