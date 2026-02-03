import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        // Run ALL tests including file system heavy ones
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
        ],
    },
})
