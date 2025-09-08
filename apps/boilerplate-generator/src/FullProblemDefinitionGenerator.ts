// /apps/boilerplate-generator/src/FullProblemDefinitionGenerator.ts

export class FullProblemDefinitionGenerator {
    problemName: string = "";
    functionName: string = "";
    inputFields: { type: string, name: string }[] = [];
    outputFields: { type: string, name: string }[] = [];

    parse(input: string): void {
        const lines = input.split("\n").map(line => line.trim());

        let currentSection: string | null = "";

        lines.forEach(line => {
            if (line.startsWith("Problem Name:")) {
                this.problemName = this.extractQuotedValue(line);
            } else if (line.startsWith("Function Name:")) {
                this.functionName = this.extractValue(line);
            } else if (line.startsWith("Input Structure:")) {
                currentSection = "input";
            } else if (line.startsWith("Output Structure:")) {
                currentSection = "output";
            } else if (line.startsWith("Input Field:")) {
                if (currentSection === "input") {
                    const field = this.extractField(line);
                    if (field) {
                        this.inputFields.push(field);
                    }
                }
            } else if (line.startsWith("Output Field:")) {
                if (currentSection === "output") {
                    const field = this.extractField(line);
                    if (field) {
                        this.outputFields.push(field);
                    }
                }
            }
        })
    }

    extractQuotedValue(line: string): string {
        const match = line.match(/: "(.*)"$/);
        return match ? match[1] : "";
    }

    extractValue(line: string): string {
        const match = line.match(/: (\w+)$/);
        return match ? match[1] : "";
    }

    extractField(line: string): { type: string, name: string } | null {
        const match = line.match(/Field: (\w+(?:<\w+>)?) (\w+)$/);
        return match ? { type: match[1], name: match[2] } : null;
    }

    generateCpp(): string {
        const inputs = this.inputFields.map(field => `${this.mapTypeToCpp(field.type)} ${field.name}`).join(", ");

        const inputRead = this.inputFields.map((field) => {
            if (field.type.startsWith("list<")) {
                return `int size_${field.name};\n
                std::cin >> size_${field.name};\n
                ${this.mapTypeToCpp(field.type)} ${field.name}(size_${field.name});\n
                for(int i = 0; i < size_${field.name}; i++) {
                    std::cin >> ${field.name}[i];
                }\n`
            } else {
                return `\t${this.mapTypeToCpp(field.type)} ${field.name};\n\tstd::cin >> ${field.name};\n`
            }
        }).join("\n ");

        const outputType = this.outputFields[0].type;
        const functionCall = `${outputType} result = ${this.functionName}(${this.inputFields.map(field => field.name).join(", ")});\n`;
        const outputWrite = `std::cout << result << std::endl;\n`;

        return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <iterator>

##USER_CODE_HERE##

int main() {
    ${inputRead}
    ${functionCall}
    ${outputWrite}
    return 0;
}
        `;
    }

    generateJs(): string {
        const inputs = this.inputFields.map(field => field.name).join(", ");

        const inputRead = this.inputFields.map((field) => {
            if (field.type.startsWith("list<")) {
                return `const size_${field.name} = parseInt(input.shift());\n
                const ${field.name} = input.splice(0, size_${field.name}).map(Number);\n`
            } else {
                return `const ${field.name} = parseInt(input.shift());\n`
            }
        }).join("\n ");

        const functionCall = `const result = ${this.functionName}(${this.inputFields.map(field => field.name).join(", ")});\n`;
        const outputWrite = `console.log(result);\n`;

        return `
##USER_CODE_HERE##

const input = require("fs").readFileSync('/dev/stdin', 'utf8').trim().split("\\n").join(" ").split(" ");
        
${inputRead}
${functionCall}
${outputWrite}
        `;
    }

    generateRust(): string {
        const inputs = this.inputFields.map(field => `${field.name} : ${this.mapTypeToRust(field.type)}`).join(", ");

        const inputRead = this.inputFields.map((field) => {
            if (field.type.startsWith("list<")) {
                return `let size_${field.name}: usize = input.next().unwrap().parse().unwrap();\nlet ${field.name}: ${this.mapTypeToRust(field.type)} = input.take(size_${field.name}).map(|s| s.parse().unwrap()).collect();\n`
            } else {
                return `let ${field.name}: ${this.mapTypeToRust(field.type)} = input.next().unwrap().parse().unwrap();\n`
            }
        }).join("\n ");

        const functionCall = `let result = ${this.functionName}(${this.inputFields.map(field => field.name).join(", ")});\n`;
        const outputWrite = `println!("{}", result);\n`;

        return `
use std::io::{self, BufRead};
use std::str::FromStr;

##USER_CODE_HERE##

fn main() {
    let stdin = io::stdin();
    let mut input = stdin.lock().lines().map(|l| l.unwrap());
    ${inputRead}
    ${functionCall}
    ${outputWrite}
}
        `
    }

    mapTypeToCpp(type: string): string {
        switch (type) {
            case "int":
                return "int";
            case "float":
                return "double";
            case "long":
                return "long";
            case "double":
                return "double";
            case "string":
                return "string";
            case "char":
                return "char";
            case "bool":
                return "bool";
            case "list<int>":
                return "vector<int>";
            case "list<float>":
                return "vector<double>";
            case "list<long>":
                return "vector<long>";
            case "list<double>":
                return "vector<double>";
            case "list<string>":
                return "vector<string>";
            case "list<char>":
                return "vector<char>";
            case "list<bool>":
                return "vector<bool>";
            default:
                return "unknown";
        }
    }

    mapTypeToRust(type: string): string {
        switch (type) {
            case "int":
                return "i32";
            case "float":
                return "f64";
            case "long":
                return "i64";
            case "double":
                return "f64";
            case "string":
                return "String";
            case "char":
                return "char";
            case "bool":
                return "bool";
            case "list<int>":
                return "Vec<i32>";
            case "list<float>":
                return "Vec<f64>";
            case "list<long>":
                return "Vec<i64>";
            case "list<double>":
                return "Vec<f64>";
            case "list<string>":
                return "Vec<String>";
            case "list<char>":
                return "Vec<char>";
            case "list<bool>":
                return "Vec<bool>";
            default:
                return "unknown";
        }
    }
}
