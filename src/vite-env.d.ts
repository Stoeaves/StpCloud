/// <reference types="vite/client" />

declare const __API_URL__: string;
declare const __CHUNK_SIZE__: number;

declare const cocoMessage: any;
declare const swal: any;

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
