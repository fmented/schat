/// <reference types="vite/client" />

interface ImportMetaEnv{
    readonly NODE_ENV: 'development' | 'production' | 'test'
    readonly VITE_USERNAME: string
    readonly VITE_PASSWORD: string
    readonly VITE_JWT_SECRET: string
    readonly VITE_CLUSTER_URL: string
    readonly VITE_DB_NAME: string
    readonly VITE_PUBLIC_KEY: string
    readonly VITE_PRIVATE_KEY: string
    readonly VITE_SUBJECT: string
}

interface ImportMeta{
    readonly env: ImportMetaEnv
}