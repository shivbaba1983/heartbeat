/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STOCK_API_URL: string;
  readonly VITE_STOCKNEWS_KEY: string;
  // add more env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
