// /packages/common/language.ts

export const LANGUAGE_MAPPING: Record<string, { name: string; judge0: number; internal: string }> = {
    // 🔹 Add string-based mappings for clarity
    "cpp": { name: "C++", judge0: 54, internal: "1" },
    "js": { name: "JavaScript", judge0: 63, internal: "5" },
    "rs": { name: "Rust", judge0: 73, internal: "8" }
};
