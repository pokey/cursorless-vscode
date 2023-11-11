#!/usr/bin/env node
// @ts-check
/*eslint-env node*/
// This script runs a TypeScript file using Node.js by first bundling it with
// esbuild.
import { spawn } from "cross-spawn";
import { existsSync, mkdirSync, rmdirSync } from "fs";
import { join } from "path";

/**
 * Run a command with arguments and return a child process
 * @param {string} command
 * @param {string[]} args
 */
function runCommand(command, args) {
  return spawn(command, args, {
    stdio: "inherit",
  });
}

/**
 * Create a temporary directory and return its path
 * @param {string} baseDir
 */
function createTempDirectory(baseDir) {
  const tempDir = join(baseDir, "out/my-ts-node-tmp");
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

/**
 * Clean up the temporary directory
 * @param {import("fs").PathLike} tempDir
 */
function cleanupTempDirectory(tempDir) {
  if (existsSync(tempDir)) {
    rmdirSync(tempDir, { recursive: true });
  }
}

// Main function to execute the script
function main() {
  const args = process.argv.slice(2);

  // Check if the input file is specified
  if (args.length === 0) {
    console.error("Error: No input file specified.");
    console.error("Usage: my-ts-node <file.ts> [script args...]");
    process.exit(1);
  }

  const [fileToRun, ...childArgs] = args;

  // Note that the temporary directory must be in the workspace root, otherwise
  // VSCode will ignore the source maps, and breakpoints will not work.
  const tempDir = createTempDirectory(process.cwd());
  const outFile = join(tempDir, "out.cjs");

  // Set up cleanup for when the script exits
  process.on("exit", () => cleanupTempDirectory(tempDir));
  process.on("SIGINT", () => cleanupTempDirectory(tempDir));
  process.on("SIGTERM", () => cleanupTempDirectory(tempDir));

  // Run esbuild to bundle the TypeScript file
  const esbuildProcess = runCommand("esbuild", [
    "--sourcemap",
    "--log-level=warning",
    "--conditions=cursorless:bundler",
    "--bundle",
    "--format=cjs",
    "--platform=node",
    fileToRun,
    "--outfile=" + outFile,
  ]);

  esbuildProcess.on("close", (code) => {
    if (code === 0) {
      // Execute the bundled file with Node, passing any additional arguments
      const nodeProcess = runCommand(process.execPath, [
        "--enable-source-maps",
        outFile,
        ...childArgs,
      ]);
      nodeProcess.on("close", (code) => process.exit(code ?? undefined));
    } else {
      console.error(`esbuild failed with code ${code}`);
      process.exit(code ?? undefined);
    }
  });
}

main();
