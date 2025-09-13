/// <reference types="vite/client" />

declare const __API_URL__: string

declare const cocoMessage: any

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
