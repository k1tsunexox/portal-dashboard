/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN: string
  // Add other env variables here as you need them
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
