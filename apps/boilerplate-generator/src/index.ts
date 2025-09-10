// /apps/boilerplate-generator/src/index.ts

import fs from "fs";
import path from "path";

import { ProblemDefinitionParser } from "./ProblemDefinitionGenerator"

import { FullProblemDefinitionGenerator, } from "./FullProblemDefinitionGenerator"

console.log("Path for the folder where the boilerplate code will be generated: ", process.env.GENERATOR_FILE_PATH);

function generatePartialBoilerPlate(generatorFilePath: string) {
    try {

        const inputFilePath = path.join(__dirname, generatorFilePath, "Structure.md");
        console.log("\nInput file path: ", inputFilePath);
        const boilerPlatePath = path.join(__dirname, generatorFilePath, "boilerplate");
        console.log("\nBoilerplate path: ", boilerPlatePath);

        // Read the input file
        const inputFileContent = fs.readFileSync(inputFilePath, "utf-8");
        console.log("\nInput file content: ", inputFileContent);

        // Parse the input 
        const parser = new ProblemDefinitionParser();
        parser.parse(inputFileContent);

        // Generate the boilerplate code 
        const cppCode = parser.generateCpp();
        console.log("\nPartial CPP Boilerplate Code: ", cppCode);
        const jsCode = parser.generateJs();
        console.log("\nPartial JS Boilerplate Code: ", jsCode);
        const rustCode = parser.generateRust();
        console.log("\nPartial Rust Boilerplate Code: ", rustCode);

        // Ensure the boilerplate directory exsist
        if (!fs.existsSync(boilerPlatePath)) {
            fs.mkdirSync(
                boilerPlatePath,
                { recursive: true }
            );
        }

        // Write the boilerplate code to respective files
        fs.writeFileSync(path.join(boilerPlatePath, "function.cpp"), cppCode);
        fs.writeFileSync(path.join(boilerPlatePath, "function.js"), jsCode);
        fs.writeFileSync(path.join(boilerPlatePath, "function.rs"), rustCode);

        console.log("\n✅ Partial Boilerplate Code generated successfully!");
    } catch (error) {
        console.error("\n❌ Error generating partial boilerplate code:", error);
        process.exit(1);
    }
}

function generateFullBoilerPlate(generatorFilePath: string) {
    try {

        const inputFilePath = path.join(__dirname, generatorFilePath, "Structure.md")

        const boilerPlatePath = path.join(__dirname, generatorFilePath, "boilerplate-full");

        // Read the input file
        const input = fs.readFileSync(inputFilePath, "utf-8");

        // Parse the input 
        const parser = new FullProblemDefinitionGenerator();
        parser.parse(input);

        // Generate the boilerplate directory exsist 
        const cppCode = parser.generateCpp();
        console.log("\nFull CPP Boilerplate Code: ", cppCode);
        const jsCode = parser.generateJs();
        console.log("\nFull JS Boilerplate Code: ", jsCode);
        const rustCode = parser.generateRust();
        console.log("\nFull Rust Boilerplate Code: ", rustCode);

        // Ensure the boilerplate directory exsist
        if (!fs.existsSync(boilerPlatePath)) {
            fs.mkdirSync(
                boilerPlatePath,
                { recursive: true }
            );
        }

        // Write the boilerplate code to respective files
        fs.writeFileSync(path.join(boilerPlatePath, "function.cpp"), cppCode);
        fs.writeFileSync(path.join(boilerPlatePath, "function.js"), jsCode);
        fs.writeFileSync(path.join(boilerPlatePath, "function.rs"), rustCode);

        console.log("Full Boilerplate Code generated successfully!");
    } catch (error) {
        console.error("\n❌ Error generating full boilerplate code:", error);
        process.exit(1);
    }
}

generatePartialBoilerPlate(process.env.GENERATOR_FILE_PATH ?? "");
generateFullBoilerPlate(process.env.GENERATOR_FILE_PATH ?? "");