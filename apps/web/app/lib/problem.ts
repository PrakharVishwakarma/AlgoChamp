import fs from "fs";

type SUPPORTED_LANGS = "cpp" | "js" | "rs";

interface Problem {
    id: string;
    fullBoilerPlateCode: string;
    inputs: string[];
    outputs: string[];
}

const MOUNT_PATH = process.env.MOUNT_PATH ?? "/home/ubuntu/codechef-clone/app/problems";

export const getProblems = async (
    problemId: string,
    languageId: SUPPORTED_LANGS
): Promise<Problem> => {
    const fullBoilerPlateCode = await getProblemFullBoilerPlateCode(problemId, languageId);
    const inputs = await getProblemInputs(problemId);
    const outputs = await getProblemOutputs(problemId);

    return {
        id: problemId,
        fullBoilerPlateCode,
        inputs,
        outputs,
    };
}


async function getProblemFullBoilerPlateCode(
    problemId: string,
    languageId: SUPPORTED_LANGS
): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(`${MOUNT_PATH}/${problemId}/${languageId}/boilerplate-full/function.${languageId}`, { encoding: "utf8" }, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}


async function getProblemInputs(problemId: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(`${MOUNT_PATH}/${problemId}/tests/inputs`, async (err, files) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const data = await Promise.all(
                        files.map((file) => {
                            return new Promise<string>((resolve, reject) => {
                                fs.readFile(`${MOUNT_PATH}/${problemId}/tests/inputs/${file}`, { encoding: "utf8" }, (err, data) => {
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

async function getProblemOutputs(problemId: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(`${MOUNT_PATH}/${problemId}/tests/outputs`, async (err, files) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const data = await Promise.all(
                        files.map((file) => {
                            return new Promise<string>((resolve, reject) => {
                                fs.readFile(`${MOUNT_PATH}/${problemId}/tests/outputs/${file}`, { encoding: "utf8" }, (err, data) => {
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
