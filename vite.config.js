import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
const { resolve } = require('path');

export default defineConfig({
    plugins: [reactRefresh()],
    build: {
        rollupOptions: {
            input: {
                FreeDraw: resolve(__dirname, 'public_pages/freeDraw/index.html'),
                FreeDrawReflection: resolve(
                    __dirname,
                    'public_pages/freeDrawReflection/index.html'
                ),
                FreeDrawRotation: resolve(__dirname, 'public_pages/freeDrawRotation/index.html'),
                FreeDrawTranslation: resolve(
                    __dirname,
                    'public_pages/freeDrawTranslation/index.html'
                ),
                GraphDraw: resolve(__dirname, 'public_pages/graphDraw/index.html'),
                GraphDrawReflection: resolve(
                    __dirname,
                    'public_pages/graphDrawReflection/index.html'
                ),
                GraphDrawRotation: resolve(__dirname, 'public_pages/graphDrawRotation/index.html'),
                GraphDrawTranslation: resolve(
                    __dirname,
                    'public_pages/graphDrawTranslation/index.html'
                )
            },
            output: {
                dir: 'dist'
            }
        }
    },
    optimizeDeps: {
        include: ['jotai/utils']
    },
    server: {
        watch: {
            usePolling: true
        },
        hmr: {
            protocol: 'ws',
            host: 'localhost'
        }
    }
});
