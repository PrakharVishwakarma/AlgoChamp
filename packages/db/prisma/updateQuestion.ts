import { LANGUAGE_MAPPING } from '@repo/common/language'

import fs from 'fs';

import { db } from '../index';

const MOUNT_PATH = process.env.MOUNT_PATH ?? "../../apps/problems";

function promisifiedReadFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

async function mainFunc(problemSlug: string, problemTitle: string) {
    const problemStatement = await promisifiedReadFile(`${MOUNT_PATH}/${problemSlug}/Problem.md`);

    const problem = await db.problem.upsert({
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

            await db.defaultCode.upsert({
                where: {
                    problemId_languageId: {
                        problemId: problem.id,
                        languageId: LANGUAGE_MAPPING[language].internal,
                    }
                },
                create: {
                    problemId: problem.id,
                    languageId: LANGUAGE_MAPPING[language].internal,
                    code: code,
                },
                update: {
                    code: code
                }
            });
        })
    );
}

mainFunc(process.env.PROBLEM_SLUG ?? "", process.env.PROBLEM_TITLE ?? "");