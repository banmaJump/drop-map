interface ImportMetaEnv {
    readonly VITE_BACKEND_BASE_URL: string;
    // 他の環境変数があればここに追加
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }  