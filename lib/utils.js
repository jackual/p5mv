import fs from 'fs-extra';
import path from 'path';
import currentModulePaths from 'current-module-paths'

const { __filename, __dirname } = currentModulePaths(import.meta.url)

export function read(filePath) {
    return fs.readFileSync(path.join(__dirname, "..", ...filePath.split("/")), 'utf8');
}