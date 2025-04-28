import path from "path";
import { normalizePath, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
export default defineConfig({
    base: "./",
    esbuild: {
        //include: /\.[jt]sx?$/,
        exclude: [],
        loader: "jsx",
        include: [
            // Add this for business-as-usual behaviour for .jsx and .tsx files
            "src/**/*.jsx",
            "src/**/*.tsx",
            "node_modules/**/*.jsx",
            "node_modules/**/*.tsx",

            // Add the specific files you want to allow JSX syntax in
            "src/LocalJsxInJsComponent.js",
            "node_modules/bad-jsx-in-js-component/index.js",
            "node_modules/bad-jsx-in-js-component/js/BadJSXinJS.js",
            "node_modules/bad-jsx-in-js-component/ts/index.ts",
            "node_modules/bad-jsx-in-js-component/ts/BadTSXinTS.ts",

            // --- OR ---

            // Add these lines to allow all .js files to contain JSX
            "src/**/*.js",
            "node_modules/**/*.js",

            // Add these lines to allow all .ts files to contain JSX
            "src/**/*.ts",
            "node_modules/**/*.ts",
        ],
    },
    optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },

    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: "./src/assets/Sankul1.jpeg",
                    dest: "assets",
                },
                {
                    src: "./Web.config",
                    dest: "./",
                },
                {
                    src: path.resolve(__dirname, "./static") + "/[!.]*",
                    dest: "./",
                }
            ]
        })
    ],
    resolve: {
        alias: {
            "@": normalizePath(path.resolve(__dirname, "./src")),
        }
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
              target: 'https://shivbaba1983.github.io/',
              changeOrigin: true
            }
          },
        allowedHosts: [
            'all',
            'https://07tps3arid.execute-api.us-east-1.amazonaws.com',
            '07tps3arid.execute-api.us-east-1.amazonaws.com',
            'https://07tps3arid.execute-api.us-east-1.amazonaws.com',
            '07tps3arid.execute-api.us-east-1.amazonaws.com',
            'https://gj9yjr3b68.execute-api.us-east-1.amazonaws.com/dev',
            'https://wfmjtmplb7.execute-api.us-east-1.amazonaws.com/myTestStage/myREsource',
            'wfmjtmplb7.execute-api.us-east-1.amazonaws.com/myTestStage/myREsource',
            'gj9yjr3b68.execute-api.us-east-1.amazonaws.com',
            '5a7c-2600-1700-6cb0-2a20-8439-c155-b916-3e9a.ngrok-free.app',
            'b6a9-2600-1700-6cb0-2a20-6899-3054-f454-356b.ngrok-free.app',
            'https://main.d1rin969pdam05.amplifyapp.com/',
            'main.d1rin969pdam05.amplifyapp.com/',
            'https://58d8-2600-1700-6cb0-2a20-d4cc-706-4ef1-778c.ngrok-free.app',
            '58d8-2600-1700-6cb0-2a20-d4cc-706-4ef1-778c.ngrok-free.app',
            'https://shivbaba1983.github.io/heartbeat/',
            'https://shivbaba1983.github.io',
            'shivbaba1983.github.io/heartbeat/',
            'https://ad7c-2600-1700-6cb0-2a20-5914-66a1-1a7a-435e.ngrok-free.app',
            'ad7c-2600-1700-6cb0-2a20-5914-66a1-1a7a-435e.ngrok-free.app',
            '*'
          ],
          cors: {
            origin: '*',        // Allow all origins
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            //allowedHeaders: ['Content-Type', 'Authorization']
          }
    },
    build: {
        target: "esnext",
        rollupOptions: {
            output: {}
        }
    }
})