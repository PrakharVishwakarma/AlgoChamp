// /apps/web/app/lib/problem.ts

import fs from "fs";

type SUPPORTED_LANGS = "cpp" | "js" | "rs";

interface Problem {
    id: string;
    fullBoilerPlateCode: string;
    inputs: string[];
    outputs: string[];
}

const MOUNT_PATH = process.env.MOUNT_PATH ?? "../../../problems";

export const getProblems = async (
    problemSlug: string,
    languageId: SUPPORTED_LANGS
): Promise<Problem> => {
    const fullBoilerPlateCode = await getProblemFullBoilerPlateCode(problemSlug, languageId);
    const inputs = await getProblemInputs(problemSlug);
    const outputs = await getProblemOutputs(problemSlug);

    return {
        id: problemSlug,
        fullBoilerPlateCode,
        inputs,
        outputs,
    };
}


async function getProblemFullBoilerPlateCode(
    problemSlug: string,
    languageId: SUPPORTED_LANGS
): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(`${MOUNT_PATH}/${problemSlug}/boilerplate-full/function.${languageId}`, { encoding: "utf8" }, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}


async function getProblemInputs(problemSlug: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(`${MOUNT_PATH}/${problemSlug}/tests/inputs`, async (err, files) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const data = await Promise.all(
                        files.map((file) => {
                            return new Promise<string>((resolve, reject) => {
                                fs.readFile(`${MOUNT_PATH}/${problemSlug}/tests/inputs/${file}`, { encoding: "utf8" }, (err, data) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(data);
                                    }
                                });
                            });
                        })
                    );
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}

async function getProblemOutputs(problemSlug: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(`${MOUNT_PATH}/${problemSlug}/tests/outputs`, async (err, files) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const data = await Promise.all(
                        files.map((file) => {
                            return new Promise<string>((resolve, reject) => {
                                fs.readFile(`${MOUNT_PATH}/${problemSlug}/tests/outputs/${file}`, { encoding: "utf8" }, (err, data) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(data);
                                    }
                                });
                            });
                        })
                    );
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}
