declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      SERVER: string;
      APIKEY: string;
    }
  }
}
export {};
