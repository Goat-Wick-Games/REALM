import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: ['pixi.js'],
    },
    resolve: {
        alias: {
            '@realm/core': path.resolve(__dirname, '../../packages/core/src'),
            '@realm/board': path.resolve(__dirname, '../../packages/board/src'),
            '@realm/storage': path.resolve(__dirname, '../../packages/storage/src'),
            '@realm/content': path.resolve(__dirname, '../../packages/content/src'),
            '@realm/net': path.resolve(__dirname, '../../packages/net/src'),
        },
    },
});
