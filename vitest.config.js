import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        // Exclude file system heavy tests by default for CI
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            // Exclude tests that create/convert files and projects
            '**/generateThumbnail.test.js',
            '**/sceneMethods.test.js',
            '**/isp5.test.js',
        ],
    },
})
