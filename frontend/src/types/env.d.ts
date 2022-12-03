declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_ANON_KEY: string;
      REACT_APP_API_URL: string;
    }
  }
}
export {}