import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
const { resolve } = require('path');

export default defineConfig({
    plugins: [reactRefresh()],
    build: {
        rollupOptions: {
            input: {
                freeDraw: resolve(__dirname, 'public_pages/freeDraw/index.html'),
                freeDrawReflection: resolve(
                    __dirname,
                    'public_pages/freeDrawReflection/index.html'
                ),
                freeDrawRotation: resolve(__dirname, 'public_pages/freeDrawRotation/index.html'),
                freeDrawTranslation: resolve(
                    __dirname,
                    'public_pages/freeDrawTranslation/index.html'
                ),
                graphDraw: resolve(__dirname, 'public_pages/graphDraw/index.html'),
                graphDrawReflection: resolve(
                    __dirname,
                    'public_pages/graphDrawReflection/index.html'
                ),
                graphDrawRotation: resolve(__dirname, 'public_pages/graphDrawRotation/index.html'),
                graphDrawTranslation: resolve(
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
