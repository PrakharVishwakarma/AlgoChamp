// /packages/db/prisma/updateQuestion.ts 

// import { LANGUAGE_MAPPING } from '../../common/src/language';

import fs from 'fs';

import { db } from '../src/index';

const MOUNT_PATH = process.env.MOUNT_PATH ?? "../../apps/problems";

const LANGUAGE_MAPPING: Record<string, { name: string; judge0: number; internal: string }> = {
    // 🔹 Add string-based mappings for clarity
    "cpp": { name: "C++", judge0: 54, internal: "1" },
    "js": { name: "JavaScript", judge0: 63, internal: "5" },
    "rs": { name: "Rust", judge0: 73, internal: "8" }
};

function promisifiedReadFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

async function mainFunc(problemSlug: string, problemTitle: string) {
    try {
        await db.$transaction(async (tx) => {
            console.log(`\nSyncing problem: ${problemTitle} (${problemSlug})`);

            const problemStatement = await promisifiedReadFile(`${MOUNT_PATH}/${problemSlug}/Problem.md`);

            const problem = await tx.problem.upsert({
                where: {
                    slug: problemSlug
                },
                create: {
                    title: problemTitle,
                    slug: problemSlug,
                    description: problemStatement
                },
                update: {
                    description: problemStatement
                }
            });

            await Promise.all(
                Object.keys(LANGUAGE_MAPPING).map(async (language) => {
                    const code = await promisifiedReadFile(`${MOUNT_PATH}/${problemSlug}/boilerplate/function.${language}`);

                    await tx.defaultCode.upsert({
                        where: {
                            problemId_languageId: {
                                problemId: problem.id,
                                languageId: LANGUAGE_MAPPING[language]!.internal,
                            }
                        },
                        create: {
                            problemId: problem.id,
                            languageId: LANGUAGE_MAPPING[language]!.internal,
                            code: code,
                        },
                        update: {
                            code: code
                        }
                    });
                })
            );
            console.log(`✅ Upserted boilerplate code for all languages successfully.`);

        });
    } catch (error) {
        console.error(`\n❌ Failed to sync problem '${problemTitle}'.`);
        if (error instanceof Error) {
            console.error("   Error:", error.message);
        } else {
            console.error("   An unknown error occurred.");
        }
        process.exit(1);
    }
}

if (!process.env.PROBLEM_SLUG || !process.env.PROBLEM_TITLE) {
    console.error("❌ Error: Please provide PROBLEM_SLUG and PROBLEM_TITLE environment variables.");
    process.exit(1);
}

mainFunc(process.env.PROBLEM_SLUG, process.env.PROBLEM_TITLE);