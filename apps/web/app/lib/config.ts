// apps/web/app/lib/config.ts

// ✅ BEST PRACTICE: Use environment variables instead of hardcoded values
// This file is kept for reference but should use process.env values

export const getJudge0Url = () => {
    const url = process.env.JUDGE0_URL;
    if (!url) {
        throw new Error("JUDGE0_URL environment variable is required");
    }
    return url;
};

export const getJudge0CallbackUrl = () => {
    return process.env.JUDGE0_CALLBACK_URL ?? "http://localhost:3000/api/submission/callback";
};

// Example usage:
// const judge0Url = getJudge0Url(); // Throws error if not set
// const callbackUrl = getJudge0CallbackUrl(); // Has sensible default