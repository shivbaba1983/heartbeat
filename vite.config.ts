import path from "path";
import { normalizePath, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
    base: "./",
    esbuild: {
        //include: /\.[jt]sx?$/,
        exclude: [],
loader:"jsx",
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
      optimizeDeps: { esbuildOptions: { loader:{ '.js': 'jsx' } } },

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
        port: 8086,
    },
    build: {
        target: "esnext",
        rollupOptions: {
            output: {}
        }
    }
})