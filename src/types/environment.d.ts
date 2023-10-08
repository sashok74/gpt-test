declare global {
  namespace NodeJS {
    interface ProcessEnv{
      PORT: number;
      SERVER: string;
      MONGODB_SERVER: string;
      MONGODB_USER: string;
      MONGODB_PASSWORD: string;
      MONGODB_BASE: string;
      APIKEY: string;
      MAX_TOKENS: number;
    }
  }
}
export {};
