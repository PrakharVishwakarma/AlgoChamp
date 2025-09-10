// /apps/boilerplate-generator/src/ProblemDefinitionGenerator.ts

export class ProblemDefinitionParser {
    problemName: string = "";
    functionName: string = "";
    inputFields: { type: string, name: string }[] = [];
    outputFields: { type: string, name: string }[] = [];

    parse(input: string): void {
        const lines = input.split("\n").map(line => line.trim());

        let currentSection: string | null = null;

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


    validate() {
        if (!this.functionName) {
            throw new Error("Parsing Error: 'Function Name' not found in Structure.md.");
        }
        if (this.outputFields.length === 0) {
            throw new Error("Parsing Error: At least one 'Output Field' is required in Structure.md.");
        }
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

        return `${this.mapTypeToCpp(this.outputFields[0].type)} ${this.functionName}(${inputs}) {\n    // Write your code here\n   return result;\n}`;
    }

    generateJs(): string {
        const inputs = this.inputFields.map(field => `${field.name}`).join(", ");

        return `function ${this.functionName}(${inputs}) {\n    // Write your code here\n   return result;\n}`;
    }

    generateRust(): string {
        const inputs = this.inputFields.map(field => `${field.name}: ${this.mapTypeToRust(field.type)}`).join(", ");

        const outputType = this.mapTypeToRust(this.outputFields[0].type);

        return `fn ${this.functionName}(${inputs}) -> ${outputType} {\n    // Write your code here\n   return result;\n}`;
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