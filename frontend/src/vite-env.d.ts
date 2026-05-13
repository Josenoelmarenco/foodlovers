/// <reference types="vite/client" />

// Custom env vars used by the app. Strongly typed for autocomplete.
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
