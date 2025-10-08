// apps/web/components/demo/FlashMessageDemo.tsx

"use client";

import { useFlashMessageActions } from "../../context/FlashMessageContext";

export const FlashMessageDemo = () => {
    const { showFlashMessage, clearAllFlashMessages } = useFlashMessageActions();

    const handleShowSuccess = () => {
        showFlashMessage("success", "Operation completed successfully! Your changes have been saved.");
    };

    const handleShowError = () => {
        showFlashMessage("error", "Failed to save changes. Please try again or contact support if the issue persists.");
    };

    const handleShowInfo = () => {
        showFlashMessage("info", "New feature available! Check out our improved code editor with syntax highlighting.");
    };

    const handleShowWarning = () => {
        showFlashMessage("warn", "Your session will expire in 5 minutes. Please save your work to avoid losing progress.");
    };

    const handleShowPersistent = () => {
        showFlashMessage("info", "This message will stay until manually dismissed.", 0); // 0 = no auto-dismiss
    };

    return (
        <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Flash Message Demo</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                    onClick={handleShowSuccess}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors duration-200"
                >
                    Success
                </button>
                <button
                    onClick={handleShowError}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200"
                >
                    Error
                </button>
                <button
                    onClick={handleShowInfo}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors duration-200"
                >
                    Info
                </button>
                <button
                    onClick={handleShowWarning}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors duration-200"
                >
                    Warning
                </button>
                <button
                    onClick={handleShowPersistent}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors duration-200"
                >
                    Persistent
                </button>
                <button
                    onClick={clearAllFlashMessages}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200"
                >
                    Clear All
                </button>
            </div>
        </div>
    );
};