// /apps/boilerplate-generator/src/FullProblemDefinitionGenerator.ts

import { ProblemDefinitionParser } from "./ProblemDefinitionGenerator";

// Extend the original parser to inherit all parsing logic
export class FullProblemDefinitionGenerator extends ProblemDefinitionParser {

    generateCpp(): string {
        const inputRead = this.inputFields.map((field) => {
            if (field.type.startsWith("list<")) {
                return `int size_${field.name};\n\t\tcin >> size_${field.name};\n\t\t${this.mapTypeToCpp(field.type)} ${field.name}(size_${field.name});\n\t\tfor(int i = 0; i < size_${field.name}; i++) {\n\t\t\tcin >> ${field.name}[i];\n\t\t}\n`;
            } else {
                return `\t${this.mapTypeToCpp(field.type)} ${field.name};\n\tcin >> ${field.name};\n`;
            }
        }).join("\n\t");

        const outputType = this.mapTypeToCpp(this.outputFields[0].type);
        const functionCall = `${outputType} result = ${this.functionName}(${this.inputFields.map(field => field.name).join(", ")});`;
        const outputWrite = `cout << result << endl;`;

        return (
            `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <iterator>
#include <climits>

using namespace std;

##USER_CODE_HERE##

int main() {
\t${inputRead}
\t${functionCall}
\t${outputWrite}
\treturn 0;
}`
        );
    }

    generateJs(): string {
        const inputRead = this.inputFields.map((field) => {
            const isNumericList = field.type.startsWith("list<") && field.type !== "list<string>";
            const conversionMap = isNumericList ? ".map(Number)" : "";

            if (field.type.startsWith("list<")) {
                return `const size_${field.name} = parseInt(input.shift());\nconst ${field.name} = input.splice(0, size_${field.name})${conversionMap};`;
            } else {
                return `const ${field.name} = parseInt(input.shift());`;
            }
        }).join("\n");

        const functionCall = `const result = ${this.functionName}(${this.inputFields.map(field => field.name).join(", ")});`;
        const outputWrite = `console.log(result);`;

        return (
            `
##USER_CODE_HERE##

const input = require("fs").readFileSync('/dev/stdin', 'utf8').trim().split("\\n").join(" ").split(" ");
        
${inputRead}
${functionCall}
${outputWrite}
`
        );
    }

    generateRust(): string {
        const inputRead = this.inputFields.map((field) => {
            if (field.type.startsWith("list<")) {
                return `let size_${field.name}: usize = input.next().unwrap().parse().unwrap();\n\tlet ${field.name}: ${this.mapTypeToRust(field.type)} = input.take(size_${field.name}).map(|s| s.parse().unwrap()).collect();`;
            } else {
                return `let ${field.name}: ${this.mapTypeToRust(field.type)} = input.next().unwrap().parse().unwrap();`;
            }
        }).join("\n\t");

        const functionCall = `let result = ${this.functionName}(${this.inputFields.map(field => field.name).join(", ")});`;
        const outputWrite = `println!("{}", result);`;

        return (
            `use std::io::{self, BufRead};
use std::str::FromStr;

##USER_CODE_HERE##

fn main() {
\tlet stdin = io::stdin();
\tlet mut input = stdin.lock().lines().map(|l| l.unwrap());
\t${inputRead}
\t${functionCall}
\t${outputWrite}
}`
        );
    }
}